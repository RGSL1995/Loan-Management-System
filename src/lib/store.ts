import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface AppState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  toasts: [],
  addToast: (toast) => 
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { ...toast, id }
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id)
        }))
      }, 5000)

      return { toasts: [...state.toasts, newToast] }
    }),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}))
