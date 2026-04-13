import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  theme: string // Theme ID
  themeIntensity: number // 0-100, default = 100
  accessibilityMode: 'normal' | 'high-contrast'
  favorites: string[]
  recentTools: string[]
  lowDataMode: boolean
  vibrationEnabled: boolean
  addFavorite: (toolId: string) => void
  removeFavorite: (toolId: string) => void
  clearFavorites: () => void
  addRecentTool: (toolId: string) => void
  clearRecentTools: () => void
  setTheme: (themeId: string) => void
  setThemeIntensity: (intensity: number) => void
  setAccessibilityMode: (mode: 'normal' | 'high-contrast') => void
  setLowDataMode: (enabled: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void
}

// Constants for limits
const MAX_RECENT_TOOLS = 10

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'cyberpunk-red', // Default theme
      themeIntensity: 100, // Default full intensity
      accessibilityMode: 'normal' as const,
      favorites: [],
      recentTools: [],
      lowDataMode: false,
      vibrationEnabled: true,
      addFavorite: (toolId) =>
        set((state) => ({ favorites: [...state.favorites, toolId] })),
      removeFavorite: (toolId) =>
        set((state) => ({ favorites: state.favorites.filter((id) => id !== toolId) })),
      clearFavorites: () => set({ favorites: [] }),
      addRecentTool: (toolId) =>
        set((state) => {
          // Remove if already exists, add to front, keep only MAX_RECENT_TOOLS
          const filtered = state.recentTools.filter((id) => id !== toolId)
          const newRecent = [toolId, ...filtered].slice(0, MAX_RECENT_TOOLS)
          return { recentTools: newRecent }
        }),
      clearRecentTools: () => set({ recentTools: [] }),
      setTheme: (themeId) => set({ theme: themeId }),
      setThemeIntensity: (themeIntensity) => set({ themeIntensity }),
      setAccessibilityMode: (accessibilityMode) => set({ accessibilityMode }),
      setLowDataMode: (lowDataMode) => set({ lowDataMode }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
    }),
    {
      name: 'omni-preferences',
    }
  )
)
