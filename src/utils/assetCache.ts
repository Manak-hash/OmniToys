/**
 * Asset Cache System
 * Provides IndexedDB-backed caching for large assets (models, WASM files, etc.)
 * Falls back to service worker cache when available
 */

const DB_NAME = 'omni-asset-cache'
const DB_VERSION = 1
const STORE_NAME = 'assets'

export interface CachedAsset {
  name: string
  version: string
  size: number
  blob: Blob
  downloadedAt: number
  lastUsed: number
}

export interface CacheProgress {
  progress: number // 0-100
  loaded: number
  total: number
}

export type CacheStatus = 'uncached' | 'downloading' | 'cached' | 'error'

class AssetCacheDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'name' })
          store.createIndex('version', 'version', { unique: false })
          store.createIndex('lastUsed', 'lastUsed', { unique: false })
        }
      }
    })
  }

  async get(name: string, version: string): Promise<CachedAsset | null> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(name)

      request.onsuccess = () => {
        const asset = request.result as CachedAsset | undefined
        if (asset && asset.version === version) {
          // Update lastUsed timestamp
          this.updateLastUsed(name)
          resolve(asset)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async set(asset: CachedAsset): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(asset)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(name: string): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(name)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(): Promise<CachedAsset[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private updateLastUsed(name: string): void {
    if (!this.db) return
    const transaction = this.db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(name)

    request.onsuccess = () => {
      const asset = request.result as CachedAsset | undefined
      if (asset) {
        asset.lastUsed = Date.now()
        store.put(asset)
      }
    }
  }

  async getTotalSize(): Promise<number> {
    const assets = await this.getAll()
    return assets.reduce((total, asset) => total + asset.size, 0)
  }
}

// Singleton instance
const cacheDB = new AssetCacheDB()

/**
 * Download a file with progress tracking
 */
async function downloadWithProgress(
  url: string,
  onProgress?: (progress: CacheProgress) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open('GET', url, true)
    xhr.responseType = 'blob'

    xhr.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          progress: Math.round((event.loaded / event.total) * 100),
          loaded: event.loaded,
          total: event.total,
        })
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response)
      } else {
        reject(new Error(`Download failed: ${xhr.status} ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Download failed: Network error'))
    xhr.ontimeout = () => reject(new Error('Download failed: Timeout'))

    xhr.send()
  })
}

/**
 * Check if asset is cached in service worker
 */
async function checkServiceWorkerCache(url: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return false
  }

  try {
    const cacheNames = await caches.keys()
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const cached = await cache.match(url)
      if (cached) return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Cache asset with retry logic
 */
export async function cacheAsset(
  name: string,
  url: string,
  version: string,
  onProgress?: (progress: CacheProgress) => void,
  maxRetries = 3
): Promise<Blob> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AssetCache] Downloading ${name} (attempt ${attempt}/${maxRetries})`)

      const blob = await downloadWithProgress(url, (progress) => {
        console.log(`[AssetCache] ${name}: ${progress.progress}% (${progress.loaded}/${progress.total})`)
        onProgress?.(progress)
      })

      // Store in IndexedDB
      const asset: CachedAsset = {
        name,
        version,
        size: blob.size,
        blob,
        downloadedAt: Date.now(),
        lastUsed: Date.now(),
      }

      await cacheDB.set(asset)
      console.log(`[AssetCache] Cached ${name} (${formatBytes(blob.size)})`)

      return blob
    } catch (error) {
      lastError = error as Error
      console.error(`[AssetCache] Attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        console.log(`[AssetCache] Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Download failed after multiple attempts')
}

/**
 * Get cached asset
 */
export async function getCachedAsset(name: string, version: string): Promise<Blob | null> {
  try {
    const asset = await cacheDB.get(name, version)
    if (asset) {
      console.log(`[AssetCache] Cache hit: ${name}`)
      return asset.blob
    }
    console.log(`[AssetCache] Cache miss: ${name}`)
    return null
  } catch (error) {
    console.error('[AssetCache] Error getting cached asset:', error)
    return null
  }
}

/**
 * Delete cached asset
 */
export async function deleteCachedAsset(name: string): Promise<void> {
  try {
    await cacheDB.delete(name)
    console.log(`[AssetCache] Deleted: ${name}`)
  } catch (error) {
    console.error('[AssetCache] Error deleting asset:', error)
  }
}

/**
 * Clear all cached assets
 */
export async function clearAllAssets(): Promise<void> {
  try {
    await cacheDB.clear()
    console.log('[AssetCache] Cleared all assets')
  } catch (error) {
    console.error('[AssetCache] Error clearing assets:', error)
  }
}

/**
 * Get all cached assets
 */
export async function getAllCachedAssets(): Promise<CachedAsset[]> {
  try {
    return await cacheDB.getAll()
  } catch (error) {
    console.error('[AssetCache] Error getting all assets:', error)
    return []
  }
}

/**
 * Get total cache size
 */
export async function getTotalCacheSize(): Promise<number> {
  try {
    return await cacheDB.getTotalSize()
  } catch (error) {
    console.error('[AssetCache] Error getting total size:', error)
    return 0
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

/**
 * Check if service worker has asset cached
 */
export async function isServiceWorkerCached(url: string): Promise<boolean> {
  return checkServiceWorkerCache(url)
}
