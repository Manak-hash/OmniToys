import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  theme: 'dark' | 'light'
  favorites: string[]
  recentTools: string[]
  lowDataMode: boolean
  vibrationEnabled: boolean
  addFavorite: (toolId: string) => void
  removeFavorite: (toolId: string) => void
  clearFavorites: () => void
  addRecentTool: (toolId: string) => void
  clearRecentTools: () => void
  toggleTheme: () => void
  setLowDataMode: (enabled: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'dark',
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
          // Remove if already exists, add to front, keep only 5
          const filtered = state.recentTools.filter((id) => id !== toolId)
          const newRecent = [toolId, ...filtered].slice(0, 5)
          return { recentTools: newRecent }
        }),
      clearRecentTools: () => set({ recentTools: [] }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLowDataMode: (lowDataMode) => set({ lowDataMode }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
    }),
    {
      name: 'omni-preferences',
    }
  )
)
