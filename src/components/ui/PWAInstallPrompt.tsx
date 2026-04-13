import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Rocket, Shield } from 'lucide-react'
import { usePWA } from '@/contexts/PWAContext'

export function PWAInstallPrompt() {
  const { deferredPrompt, installPWA } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  // Auto-show after 30 seconds if not dismissed
  useEffect(() => {
    if (deferredPrompt && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 30000)

      return () => clearTimeout(timer)
    }
  }, [deferredPrompt, dismissed])

  const handleInstall = async () => {
    await installPWA()
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-6 left-6 right-6 z-50 sm:left-auto sm:right-6 sm:max-w-md"
      >
        <div className="bg-gradient-to-br from-omni-primary/20 via-omni-accent/10 to-omni-bg backdrop-blur-xl border border-omni-primary/30 rounded-2xl p-5 shadow-2xl shadow-omni-primary/20">
          <div className="flex items-start gap-4">
            {/* Animated Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="p-3 bg-omni-primary/20 rounded-xl flex-shrink-0"
            >
              <Rocket className="w-6 h-6 text-omni-primary" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-omni-text font-mono">
                  Install OmniToys
                </h3>
                <span className="px-2 py-0.5 bg-omni-accent/20 text-omni-accent rounded text-[10px] font-bold uppercase tracking-wider">
                  PWA
                </span>
              </div>
              <p className="text-xs text-omni-text/60 leading-relaxed mb-4">
                Install OmniToys for instant access, offline support, and a native app experience.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-[10px] text-omni-text/50">
                  <Shield className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span>Offline Ready</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-omni-text/50">
                  <Download className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <span>Instant Launch</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-lg hover:shadow-omni-primary/30 flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-omni-text/60 hover:text-omni-text rounded-xl text-xs font-medium transition-all duration-200"
                >
                  Later
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-omni-text/40 hover:text-omni-text"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
