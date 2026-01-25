import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  theme: 'dark' | 'light'
  favorites: string[]
  lowDataMode: boolean
  vibrationEnabled: boolean
  addFavorite: (toolId: string) => void
  removeFavorite: (toolId: string) => void
  clearFavorites: () => void
  toggleTheme: () => void
  setLowDataMode: (enabled: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'dark',
      favorites: [],
      lowDataMode: false,
      vibrationEnabled: true,
      addFavorite: (toolId) =>
        set((state) => ({ favorites: [...state.favorites, toolId] })),
      removeFavorite: (toolId) =>
        set((state) => ({ favorites: state.favorites.filter((id) => id !== toolId) })),
      clearFavorites: () => set({ favorites: [] }),
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
