import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { useThemeStore } from './store/useThemeStore'
import { AuthProvider } from "./context/AuthContext";

// initialize theme from localStorage
const initialTheme = localStorage.getItem('clp_theme') || 'light'
document.documentElement.classList.add(initialTheme === 'dark' ? 'dark' : 'light')
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
