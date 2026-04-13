import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseWasmLoaderOptions {
  modulePath: string  // e.g., '/wasm/omni_native.js'
  moduleName: string  // e.g., 'omni_native'
  exportName?: string // e.g., 'OmniNative' (defaults to moduleName with first letter uppercase)
}

export interface UseWasmLoaderReturn {
  isReady: boolean      // Module loaded and ready to use
  isLoading: boolean    // Currently loading
  error: string | null  // Error message if failed
  retry: () => void     // Retry loading
  module: any | null    // Reference to the loaded module
}

/**
 * Custom React hook for loading WASM modules in a standardized way.
 *
 * Features:
 * - Checks if module already loaded before loading again
 * - Sets up Module with onRuntimeInitialized callback
 * - Creates script tag dynamically with proper error handling
 * - Cleanup on unmount (keeps module for reuse)
 * - Implements retry function
 *
 * @example
 * ```tsx
 * const { isReady, isLoading, error, retry, module } = useWasmLoader({
 *   modulePath: '/wasm/omni_native.js',
 *   moduleName: 'omni_native',
 *   exportName: 'OmniNative'
 * })
 *
 * // Call WASM functions when ready
 * const result = module?.ccall('function_name', 'string', ['string'], [input])
 * ```
 */
export function useWasmLoader(options: UseWasmLoaderOptions): UseWasmLoaderReturn {
  const { modulePath, moduleName, exportName } = options

  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [module, setModule] = useState<any | null>(null)

  const retryCountRef = useRef(0)
  const maxRetries = 3
  const isInitializedRef = useRef(false)

  const getGlobalModuleKey = useCallback(() => {
    // e.g., 'OmniNativeModule' for 'omni_native'
    const capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
    return `${capitalized}Module`
  }, [moduleName])

  const loadModule = useCallback(async () => {
    // Check if module already loaded globally
    const globalKey = getGlobalModuleKey()
    const existingModule = (window as any)[globalKey]

    if (existingModule) {
      setModule(existingModule)
      setIsReady(true)
      setIsLoading(false)
      setError(null)
      return
    }

    // Check if script tag exists
    const scriptId = `wasm-${moduleName}`
    const existingScript = document.getElementById(scriptId)

    if (existingScript && !isInitializedRef.current) {
      setIsLoading(true)
      setError(null)
      return
    }

    if (existingScript) {
      return
    }

    // Load new module
    setIsLoading(true)
    setError(null)

    try {
      // Create script element
      const script = document.createElement('script')
      script.id = scriptId
      script.src = modulePath
      script.async = true

      // Set up module initialization
      const actualExportName = exportName || moduleName.charAt(0).toUpperCase() + moduleName.slice(1)

      script.onload = () => {

        // Small delay to ensure the factory function is available
        setTimeout(async () => {
          try {
            const factory = (window as any)[actualExportName]

            if (typeof factory === 'function') {
              const mod = await factory()

              // Store globally for reuse
              ;(window as any)[globalKey] = mod

              setModule(mod)
              setIsReady(true)
              setIsLoading(false)
              setError(null)
              isInitializedRef.current = true
            } else {
              throw new Error(`${actualExportName} factory function not found on window`)
            }
          } catch (initErr) {
            const errMsg = initErr instanceof Error ? initErr.message : 'Initialization failed'
            console.error(`[WASM] ${moduleName}: Failed to initialize:`, errMsg)
            setError(errMsg)
            setIsLoading(false)
            setIsReady(false)
          }
        }, 100)
      }

      script.onerror = (e) => {
        const errMsg = `Failed to load script: ${modulePath}`
        console.error(`[WASM] ${moduleName}:`, errMsg, e)
        setError(errMsg)
        setIsLoading(false)
        setIsReady(false)
      }

      document.body.appendChild(script)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[WASM] ${moduleName}: Load error:`, errMsg)
      setError(errMsg)
      setIsLoading(false)
      setIsReady(false)
    }
  }, [modulePath, moduleName, exportName, getGlobalModuleKey])

  const retry = useCallback(() => {
    if (retryCountRef.current >= maxRetries) {
      setError(`Maximum retry attempts (${maxRetries}) reached`)
      return
    }

    retryCountRef.current++

    // Reset state
    setIsReady(false)
    setIsLoading(true)
    setError(null)
    setModule(null)
    isInitializedRef.current = false

    // Remove existing script if present
    const scriptId = `wasm-${moduleName}`
    const existingScript = document.getElementById(scriptId)
    if (existingScript) {
      existingScript.remove()
    }

    // Clear global module reference
    const globalKey = getGlobalModuleKey()
    delete (window as any)[globalKey]

    // Reload
    loadModule()
  }, [moduleName, loadModule, getGlobalModuleKey])

  // Initial load
  useEffect(() => {
    if (!isInitializedRef.current && !error) {
      loadModule()
    }
  }, [loadModule, error])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Keep module in memory for potential re-use
    }
  }, [moduleName])

  return {
    isReady,
    isLoading,
    error,
    retry,
    module,
  }
}
