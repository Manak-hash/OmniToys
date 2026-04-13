/**
 * PWA utility functions
 * Separated to avoid fast refresh warnings
 */

export async function installPWA(deferredPrompt: any): Promise<boolean> {
  if (!deferredPrompt) return false

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  return outcome === 'accepted'
}

export function checkIsInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}
