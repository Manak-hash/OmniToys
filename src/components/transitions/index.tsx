import { lazy, Suspense, useCallback, useEffect } from 'react'
import { useTransitionStore } from '@/store/transition'
import type { TransitionCallbacks } from './types'

// Lazy load transition components for code splitting
const DiagonalSplitTransition = lazy(() => import('./DiagonalSplitTransition'))
const TimeMachineTransition = lazy(() => import('./TimeMachineTransition/TimeMachineTransition'))

interface TransitionProps {
  /** Called when transition completes successfully */
  onComplete?: () => void
  /** Called when user skips transition */
  onSkip?: () => void
  /** Called if transition encounters error */
  onError?: (error: Error) => void
  /** Target URL to navigate to after transition */
  targetUrl: string
}

/**
 * Main transition component that routes to appropriate transition style
 *
 * Usage:
 * ```tsx
 * <Transition
 *   targetUrl="/omniflow"
 *   onComplete={() => {/* Handle navigation complete *\/}}
 *   onSkip={() => {/* Handle user skip *\/}}
 * />
 * ```
 */
export function Transition({ onComplete, onSkip, onError, targetUrl }: TransitionProps) {
  const style = useTransitionStore((state) => state.style)

  const handlePhaseChange = useCallback(() => {
    // Phase change handled silently
  }, [])

  const handleComplete = useCallback(() => {
    // Record successful usage
    useTransitionStore.getState().recordUsage()

    // Navigate to target
    window.location.href = targetUrl

    onComplete?.()
  }, [targetUrl, onComplete])

  const handleSkip = useCallback(() => {
    // Record skip for analytics
    useTransitionStore.getState().recordSkip()

    // Navigate immediately
    window.location.href = targetUrl

    onSkip?.()
  }, [targetUrl, onSkip])

  const handleError = useCallback((error: Error) => {
    // Fallback: navigate anyway
    window.location.href = targetUrl

    onError?.(error)
  }, [targetUrl, onError])


  // Start transition on mount
  useEffect(() => {
    // Transition starts on mount
    if (style === 'none') {
      // Instant navigation, no transition
      window.location.href = targetUrl
    }
  }, [style, targetUrl])

  // Route to appropriate transition component
  const TransitionComponent = style === 'none' ? null : style === 'time-machine' ? TimeMachineTransition : DiagonalSplitTransition

  if (style === 'none') {
    return null
  }

  const callbacks: TransitionCallbacks = {
    onPhaseChange: handlePhaseChange,
    onComplete: handleComplete,
    onSkip: handleSkip,
    onError: handleError,
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-omni-bg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-omni-primary" />
        </div>
      }
    >
      {TransitionComponent && <TransitionComponent {...callbacks} />}
    </Suspense>
  )
}

/* eslint-disable react-refresh/only-export-components */
// Re-export hook from separate file to avoid fast refresh warning
export { useTransition } from './useTransition'
/* eslint-enable react-refresh/only-export-components */

