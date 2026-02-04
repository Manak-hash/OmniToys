import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 20, scale: 0.99 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 1.01 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
      }}
      className="w-full h-full pb-20"
    >
      {/* Subtle Digital Glitch on Enter (Optional visual flair) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-omni-primary/5 pointer-events-none z-50 mix-blend-overlay"
      />
      
      {children}
    </motion.div>
  )
}
