import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { installPWA as installPWAUtil } from '@/utils/pwa'

interface PWAContextValue {
  deferredPrompt: any | null
  isInstalled: boolean
  canInstall: boolean
  installPWA: () => Promise<void>
}

const PWAContext = createContext<PWAContextValue | undefined>(undefined)

export function PWAProvider({ children }: { children: ReactNode }) {
  // Initialize installation state
  const getInitialState = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches
    }
    return false
  }

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(getInitialState)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return

    const success = await installPWAUtil(deferredPrompt)

    if (success) {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
  }, [deferredPrompt])

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isInstalled,
        canInstall: !!deferredPrompt,
        installPWA
      }}
    >
      {children}
    </PWAContext.Provider>
  )
}

/* eslint-disable react-refresh/only-export-components */
// Export hook from component file to avoid fast refresh warning
export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider')
  }
  return context
}
/* eslint-enable react-refresh/only-export-components */