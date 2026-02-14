import { useEffect, useRef, useCallback } from 'react'

interface KeyboardNavigationOptions {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
  onEnter?: () => void
  onEscape?: () => void
  isEnabled?: boolean
  scope?: HTMLElement | null
}

export function useKeyboardNavigation({
  onNavigate,
  onEnter,
  onEscape,
  isEnabled = true,
  scope = null
}: KeyboardNavigationOptions = {}) {
  const scopeRef = useRef<HTMLElement | null>(scope)

  useEffect(() => {
    scopeRef.current = scope
  }, [scope])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled) return

    // Check if we should handle this event
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
    const scope = scopeRef.current
    const isInScope = scope ? scope.contains(target) : true

    if (!isInScope) return
    if (isInput && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      // Allow arrow keys in inputs only if it's for navigation, not text editing
      return
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        onNavigate?.('up')
        break
      case 'ArrowDown':
        e.preventDefault()
        onNavigate?.('down')
        break
      case 'ArrowLeft':
        e.preventDefault()
        onNavigate?.('left')
        break
      case 'ArrowRight':
        e.preventDefault()
        onNavigate?.('right')
        break
      case 'Enter':
        if (!isInput) {
          e.preventDefault()
          onEnter?.()
        }
        break
      case 'Escape':
        e.preventDefault()
        onEscape?.()
        break
    }
  }, [isEnabled, onNavigate, onEnter, onEscape])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return scopeRef
}

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; isEnabled?: boolean } = {}
) {
  const { ctrlKey = false, metaKey = false, shiftKey = false, isEnabled = true } = options

  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === key &&
        e.ctrlKey === ctrlKey &&
        e.metaKey === metaKey &&
        e.shiftKey === shiftKey
      ) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, ctrlKey, metaKey, shiftKey, isEnabled, handler])
}
