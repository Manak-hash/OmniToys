import { useCallback } from 'react'
import { toast } from 'sonner'
import { usePreferences } from '@/store/preferences'
import { useHapticFeedback } from './useHapticFeedback'

interface NotificationOptions {
  title?: string
  description?: string
  duration?: number
}

/**
 * Notification system for long-running tasks
 * Respects the user's notification preferences
 */
export function useNotifications() {
  const { lowDataMode } = usePreferences()
  const { success: successHaptic, error: errorHaptic, canVibrate } = useHapticFeedback()

  const notify = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    options?: NotificationOptions
  ) => {
    // Skip notifications in low data mode
    if (lowDataMode) return

    // Trigger haptic feedback based on type
    if (canVibrate) {
      switch (type) {
        case 'success':
          successHaptic()
          break
        case 'error':
          errorHaptic()
          break
        default:
          // No haptic for info
          break
      }
    }

    // Show toast notification
    toast[type](message, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  }, [lowDataMode, canVibrate, successHaptic, errorHaptic])

  /**
   * Success notification with haptic feedback
   */
  const notifySuccess = useCallback((message: string, options?: NotificationOptions) => {
    notify(message, 'success', options)
  }, [notify])

  /**
   * Error notification with haptic feedback
   */
  const notifyError = useCallback((message: string, options?: NotificationOptions) => {
    notify(message, 'error', options)
  }, [notify])

  /**
   * Info notification
   */
  const notifyInfo = useCallback((message: string, options?: NotificationOptions) => {
    notify(message, 'info', options)
  }, [notify])

  /**
   * Notify when a long-running task completes
   */
  const taskComplete = useCallback((
    taskName: string,
    success: boolean,
    result?: string
  ) => {
    if (lowDataMode) return

    if (success) {
      const message = result || `${taskName} completed successfully`
      notify(message, 'success', {
        description: 'Task finished'
      })
    } else {
      notify(`${taskName} failed`, 'error', {
        description: 'Please try again'
      })
    }
  }, [lowDataMode, notify])

  return {
    success: notifySuccess,
    error: notifyError,
    info: notifyInfo,
    taskComplete,
    canNotify: !lowDataMode
  }
}
