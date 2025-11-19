import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  mode: localStorage.getItem('clp_theme') || 'light',
  toggle: () =>
    set((state) => {
      const newMode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('clp_theme', newMode)
      document.documentElement.classList.toggle('dark', newMode === 'dark')
      document.documentElement.classList.toggle('light', newMode === 'light')
      return { mode: newMode }
    }),
  setMode: (mode) => {
    localStorage.setItem('clp_theme', mode)
    document.documentElement.classList.toggle('dark', mode === 'dark')
    document.documentElement.classList.toggle('light', mode === 'light')
    set({ mode })
  },
}))

