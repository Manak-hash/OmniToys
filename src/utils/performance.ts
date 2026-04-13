/**
 * Performance Monitoring Utility
 * Tracks Web Vitals: LCP, FID, and CLS
 */

export function trackWebVitals(): void {
  // Check if window is available (SSR guard)
  if (typeof window === 'undefined') {
    return
  }

  // Track Largest Contentful Paint (LCP)
  try {
    new PerformanceObserver(() => {
      // LCP entries are tracked but not currently reported
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  } catch {
    // LCP not supported in this browser
  }

  // Track First Input Delay (FID)
  try {
    new PerformanceObserver(() => {
      // FID entries are tracked but not currently reported
    }).observe({ entryTypes: ['first-input'] })
  } catch {
    // FID not supported in this browser
  }

  // Track Cumulative Layout Shift (CLS)
  try {
    new PerformanceObserver(() => {
      // CLS entries are tracked but not currently reported
    }).observe({ entryTypes: ['layout-shift'] })
  } catch {
    // CLS not supported in this browser
  }
}
