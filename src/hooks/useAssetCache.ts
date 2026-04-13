import { useState, useEffect, useCallback, useRef } from 'react'
import {
  cacheAsset,
  getCachedAsset,
  deleteCachedAsset,
  formatBytes,
  isServiceWorkerCached,
  type CacheStatus,
} from '@/utils/assetCache'

export interface AssetCacheConfig {
  assetName: string
  assetUrl: string
  version: string
  autoLoad?: boolean
}

export interface UseAssetCacheReturn {
  status: CacheStatus
  progress: number
  cachedSize: string | null
  isFromServiceWorker: boolean
  error: string | null
  download: () => Promise<void>
  clear: () => Promise<void>
  getBlob: () => Promise<Blob | null>
}

export function useAssetCache(config: AssetCacheConfig): UseAssetCacheReturn {
  const { assetName, assetUrl, version, autoLoad = false } = config

  const [status, setStatus] = useState<CacheStatus>('uncached')
  const [progress, setProgress] = useState(0)
  const [cachedSize, setCachedSize] = useState<string | null>(null)
  const [isFromServiceWorker, setIsFromServiceWorker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const autoLoadTriggeredRef = useRef(false)

  // Check cache on mount
  useEffect(() => {
    const checkCache = async () => {
      try {
        // Check IndexedDB first
        const cached = await getCachedAsset(assetName, version)
        if (cached) {
          blobRef.current = cached
          setStatus('cached')
          setCachedSize(formatBytes(cached.size))
          setIsFromServiceWorker(false)
          return
        }

        // Check service worker cache
        const swCached = await isServiceWorkerCached(assetUrl)
        if (swCached) {
          // Download from SW cache and store in IndexedDB
          setStatus('downloading')
          const response = await fetch(assetUrl)
          const blob = await response.blob()

          const cached = await getCachedAsset(assetName, version)
          if (cached) {
            blobRef.current = cached
            setStatus('cached')
            setCachedSize(formatBytes(cached.size))
            setIsFromServiceWorker(true)
          } else {
            blobRef.current = blob
            setStatus('cached')
            setCachedSize(formatBytes(blob.size))
            setIsFromServiceWorker(true)
          }
          return
        }

        setStatus('uncached')
        setCachedSize(null)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to check cache')
      }
    }

    checkCache()
  }, [assetName, assetUrl, version])

  const download = useCallback(async () => {
    if (status === 'cached') {
      return
    }

    if (status === 'downloading') {
      return
    }

    setStatus('downloading')
    setProgress(0)
    setError(null)

    try {
      const blob = await cacheAsset(assetName, assetUrl, version, (prog) => {
        setProgress(prog.progress)
      })

      blobRef.current = blob
      setStatus('cached')
      setCachedSize(formatBytes(blob.size))
      setProgress(100)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Download failed')
      setProgress(0)
    }
  }, [assetName, assetUrl, version, status])

  // Auto-load if enabled
  useEffect(() => {
    if (autoLoad && status === 'uncached' && !autoLoadTriggeredRef.current) {
      autoLoadTriggeredRef.current = true
      download()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, status])

  const clear = useCallback(async () => {
    try {
      await deleteCachedAsset(assetName)
      blobRef.current = null
      setStatus('uncached')
      setCachedSize(null)
      setProgress(0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache')
    }
  }, [assetName])

  const getBlob = useCallback(async (): Promise<Blob | null> => {
    if (blobRef.current) {
      return blobRef.current
    }

    if (status === 'cached') {
      const cached = await getCachedAsset(assetName, version)
      if (cached) {
        blobRef.current = cached
        return cached
      }
    }

    return null
  }, [assetName, version, status])

  return {
    status,
    progress,
    cachedSize,
    isFromServiceWorker,
    error,
    download,
    clear,
    getBlob,
  }
}
