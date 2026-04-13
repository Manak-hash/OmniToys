import { useState } from 'react'
import type { TransitionCallbacks } from './types'

/**
 * Hook to trigger transitions from anywhere in the app
 *
 * Usage:
 * ```tsx
 * const { triggerTransition } = useTransition()
 *
 * <button onClick={() => triggerTransition('/omniflow')}>
 *   Go to OmniFlow
 * </button>
 * ```
 */
export function useTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const triggerTransition = (
    targetUrl: string,
    callbacks?: Omit<TransitionCallbacks, 'onPhaseChange'>
  ) => {
    setIsTransitioning(true)
    void targetUrl
    void callbacks

    // Create a portal to render the transition
    const root = document.getElementById('transition-root') || document.body
    const container = document.createElement('div')
    container.id = 'transition-container'
    root.appendChild(container)

    // Render will be handled by React, we just set state
    // The actual Transition component should be rendered in App.tsx based on this state
  }

  return { isTransitioning, triggerTransition }
}
