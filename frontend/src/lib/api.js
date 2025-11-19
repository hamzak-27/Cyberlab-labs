import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clp_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // central error handling: if 401, clear auth
    if (error.response?.status === 401) {
      const { clearAuth } = useAuthStore.getState()
      clearAuth()
    }
    return Promise.reject(error)
  }
)

export default api
