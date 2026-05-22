import { create } from 'zustand'
import { storage } from '../services/storage'

const THEME_KEY = 'trible-theme'

const getSavedTheme = () => {
  const saved = storage.get(THEME_KEY, 'dark')
  return saved === 'light' ? 'light' : 'dark'
}

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('theme-light', theme === 'light')
}

export const useThemeStore = create((set, get) => ({
  theme: getSavedTheme(),

  initTheme: () => {
    applyTheme(get().theme)
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    storage.set(THEME_KEY, next)
    applyTheme(next)
    set({ theme: next })
  },
}))
