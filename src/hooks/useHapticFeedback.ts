import { useCallback } from 'react'
import { usePreferences } from '@/store/preferences'

/**
 * Provides haptic feedback functionality for supported devices
 * Respects the user's vibrationEnabled preference
 */
export function useHapticFeedback() {
  const { vibrationEnabled, lowDataMode } = usePreferences()

  const haptic = useCallback((
    pattern: number | number[] = 10
  ) => {
    // Don't vibrate if low data mode is on
    if (lowDataMode) return

    // Don't vibrate if user has disabled it
    if (!vibrationEnabled) return

    // Check if vibration API is supported
    if (!('vibrate' in navigator)) return

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }, [vibrationEnabled, lowDataMode])

  /**
   * Light tap feedback (10ms)
   */
  const tap = useCallback(() => {
    haptic(10)
  }, [haptic])

  /**
   * Success feedback (pattern: [50, 50, 50])
   */
  const success = useCallback(() => {
    haptic([50, 50, 50])
  }, [haptic])

  /**
   * Error feedback (pattern: [100, 50, 100])
   */
  const error = useCallback(() => {
    haptic([100, 50, 100])
  }, [haptic])

  /**
   * Warning feedback (pattern: [50, 30, 50])
   */
  const warning = useCallback(() => {
    haptic([50, 30, 50])
  }, [haptic])

  /**
   * Heavy/strong feedback (200ms)
   */
  const heavy = useCallback(() => {
    haptic(200)
  }, [haptic])

  return {
    haptic,
    tap,
    success,
    error,
    warning,
    heavy,
    canVibrate: 'vibrate' in navigator && vibrationEnabled && !lowDataMode
  }
}
