import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  theme: 'dark' | 'light' // Prepared for future toggle
  favorites: string[]
  addFavorite: (toolId: string) => void
  removeFavorite: (toolId: string) => void
  toggleTheme: () => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'dark',
      favorites: [],
      addFavorite: (toolId) =>
        set((state) => ({ favorites: [...state.favorites, toolId] })),
      removeFavorite: (toolId) =>
        set((state) => ({ favorites: state.favorites.filter((id) => id !== toolId) })),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'omni-preferences',
    }
  )
)
