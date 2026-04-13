import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  // Lock body overflow when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'bg-[#1a1c1b] rounded-xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-auto',
                'shadow-2xl',
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-omni-text">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-omni-text/60" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className={cn('p-4', !title && 'relative')}>
                {!title && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-omni-text/60" />
                  </button>
                )}
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
