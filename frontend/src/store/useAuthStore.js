import { create } from 'zustand'; 
import { jwtDecode } from 'jwt-decode'; 

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('clp_token') || null,
  user: JSON.parse(localStorage.getItem('clp_user')) || null,
  setToken: (token) => {
    localStorage.setItem('clp_token', token)
    try {
      const user = jwtDecode(token)
      localStorage.setItem('clp_user', JSON.stringify(user))
      set({ token, user })
    } catch (e) {
      set({ token, user: null })
    }
  },
  clearAuth: () => {
    localStorage.removeItem('clp_token')
    localStorage.removeItem('clp_user')
    set({ token: null, user: null })
  },
  isAuthenticated: () => !!get().token,
}))
