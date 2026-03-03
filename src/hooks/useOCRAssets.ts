import { useState, useCallback, useEffect, useRef } from 'react'
import { createWorker, type Worker } from 'tesseract.js'

export type OcrLanguage = 'eng' | 'chi_sim' | 'chi_tra' | 'jpn' | 'kor' | 'fra' | 'deu' | 'spa' | 'rus' | 'ara'

export interface OcrLanguageInfo {
  id: OcrLanguage
  name: string
  size: number // Size in bytes
  nativeName: string
}

export const OCR_LANGUAGES: Record<OcrLanguage, OcrLanguageInfo> = {
  eng: { id: 'eng', name: 'English', size: 4.5 * 1024 * 1024, nativeName: 'English' },
  chi_sim: { id: 'chi_sim', name: 'Chinese (Simplified)', size: 12 * 1024 * 1024, nativeName: '简体中文' },
  chi_tra: { id: 'chi_tra', name: 'Chinese (Traditional)', size: 13 * 1024 * 1024, nativeName: '繁體中文' },
  jpn: { id: 'jpn', name: 'Japanese', size: 8 * 1024 * 1024, nativeName: '日本語' },
  kor: { id: 'kor', name: 'Korean', size: 7 * 1024 * 1024, nativeName: '한국어' },
  fra: { id: 'fra', name: 'French', size: 5 * 1024 * 1024, nativeName: 'Français' },
  deu: { id: 'deu', name: 'German', size: 5 * 1024 * 1024, nativeName: 'Deutsch' },
  spa: { id: 'spa', name: 'Spanish', size: 5 * 1024 * 1024, nativeName: 'Español' },
  rus: { id: 'rus', name: 'Russian', size: 7 * 1024 * 1024, nativeName: 'Русский' },
  ara: { id: 'ara', name: 'Arabic', size: 5 * 1024 * 1024, nativeName: 'العربية' },
}

export interface OcrAssetsState {
  isLoading: boolean
  progress: number
  status: string
  loadedLanguages: Set<OcrLanguage>
  error: string | null
}

export interface OcrAssetsActions {
  loadLanguage: (lang: OcrLanguage) => Promise<void>
  preloadLanguage: (lang: OcrLanguage) => Promise<void>
  getWorker: () => Worker | null
  clearCache: () => Promise<void>
}

export function useOCRAssets(defaultLanguage: OcrLanguage = 'eng'): OcrAssetsState & OcrAssetsActions {
  const [state, setState] = useState<OcrAssetsState>({
    isLoading: false,
    progress: 0,
    status: '',
    loadedLanguages: new Set<OcrLanguage>(),
    error: null,
  })

  const workerRef = useRef<Worker | null>(null)
  const loadingRef = useRef<Set<OcrLanguage>>(new Set())

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  const loadLanguage = useCallback(async (lang: OcrLanguage) => {
    if (state.loadedLanguages.has(lang)) {
      console.log(`[useOCRAssets] Language ${lang} already loaded`)
      return
    }

    if (loadingRef.current.has(lang)) {
      console.log(`[useOCRAssets] Language ${lang} already loading`)
      return
    }

    loadingRef.current.add(lang)
    setState((prev) => ({ ...prev, isLoading: true, progress: 0, status: `Loading ${OCR_LANGUAGES[lang].name} language data...` }))

    try {
      console.log(`[useOCRAssets] Loading language: ${lang}`)

      // Create worker with progress tracking
      const worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            setState((prev) => ({
              ...prev,
              status: 'Loading OCR engine...',
              progress: 10,
            }))
          } else if (m.status === 'initializing tesseract') {
            setState((prev) => ({
              ...prev,
              status: 'Initializing OCR engine...',
              progress: 30,
            }))
          } else if (m.status === 'initializing api') {
            setState((prev) => ({
              ...prev,
              status: 'Loading language data...',
              progress: 50,
            }))
          } else if (m.status === 'recognizing text') {
            setState((prev) => ({
              ...prev,
              status: 'Recognition in progress...',
              progress: 50 + Math.round(m.progress * 50),
            }))
          }
        },
      })

      // Keep reference to worker
      if (workerRef.current) {
        await workerRef.current.terminate()
      }
      workerRef.current = worker

      setState((prev) => ({
        ...prev,
        isLoading: false,
        progress: 100,
        loadedLanguages: new Set([...prev.loadedLanguages, lang]),
        status: `${OCR_LANGUAGES[lang].name} loaded successfully`,
      }))

      console.log(`[useOCRAssets] Language ${lang} loaded successfully`)
    } catch (error) {
      console.error(`[useOCRAssets] Failed to load language ${lang}:`, error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : `Failed to load ${OCR_LANGUAGES[lang].name}`,
      }))
    } finally {
      loadingRef.current.delete(lang)
    }
  }, [state.loadedLanguages])

  const preloadLanguage = useCallback(async (lang: OcrLanguage) => {
    await loadLanguage(lang)
  }, [loadLanguage])

  const getWorker = useCallback((): Worker | null => {
    return workerRef.current
  }, [])

  const clearCache = useCallback(async () => {
    try {
      // Terminate worker
      if (workerRef.current) {
        await workerRef.current.terminate()
        workerRef.current = null
      }

      // Clear IndexedDB cache (Tesseract stores data in IndexedDB)
      const databases = await indexedDB.databases()
      for (const db of databases) {
        if (db.name?.includes('tesseract')) {
          indexedDB.deleteDatabase(db.name)
        }
      }

      setState({
        isLoading: false,
        progress: 0,
        status: 'Cache cleared',
        loadedLanguages: new Set(),
        error: null,
      })

      console.log('[useOCRAssets] Cache cleared')
    } catch (error) {
      console.error('[useOCRAssets] Failed to clear cache:', error)
      setState((prev) => ({
        ...prev,
        error: 'Failed to clear cache',
      }))
    }
  }, [])

  return {
    ...state,
    loadedLanguages: state.loadedLanguages,
    loadLanguage,
    preloadLanguage,
    getWorker,
    clearCache,
  }
}
