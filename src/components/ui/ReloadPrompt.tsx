import { useRegisterSW } from 'virtual:pwa-register/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, X } from 'lucide-react'

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 p-4 bg-omni-bg rounded-lg shadow-xl border border-omni-text/10 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-omni-primary/20 rounded-full">
               {offlineReady ? <Check className="w-5 h-5 text-omni-primary" /> : <RefreshCw className="w-5 h-5 text-omni-primary" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-omni-text">
                {offlineReady ? 'Offline Ready' : 'Update Available'}
              </h3>
              <p className="text-sm text-omni-text/70 mt-1">
                {offlineReady
                  ? 'App ready to work offline.'
                  : 'New content available, click on reload button to update.'}
              </p>
              
              <div className="flex gap-2 mt-3">
                {needRefresh && (
                  <button
                    onClick={() => updateServiceWorker(true)}
                    className="px-3 py-1.5 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Reload
                  </button>
                )}
                <button
                  onClick={close}
                  className="px-3 py-1.5 bg-omni-text/10 hover:bg-omni-text/20 text-omni-text rounded-md text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <button onClick={close} className="text-omni-text/40 hover:text-omni-text">
               <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
