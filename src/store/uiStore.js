import { create } from 'zustand'

export const useUIStore = create((set) => ({
  toast: null,
  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
}))
