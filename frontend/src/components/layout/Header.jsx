// src/components/layout/Header.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  const [theme, setTheme] = useState(() =>
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('clp_theme')
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('clp_theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    document.documentElement.classList.toggle('light', newTheme === 'light')
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'modules', label: 'Modules' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className={`w-full fixed top-0 left-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-gray-900/80 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/25">
                  <Shield className="w-5 h-5" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 blur-sm"
                />
              </div>
              <div>
                <div className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  CyberSec Pro
                </div>
                <div className="text-xs text-gray-400">Master Cybersecurity</div>
              </div>
            </div>
          </motion.div>

          {/* Nav (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((n) => (
              <motion.a
                key={n.id}
                href={`#${n.id}`}
                className="text-sm text-gray-300 hover:text-cyan-400 transition-all relative group"
                whileHover={{ y: -1 }}
              >
                {n.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* <motion.button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl hover:bg-gray-800 transition border border-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-cyan-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
            </motion.button> */}

            <Link to="/login" className="text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition text-gray-300 hover:text-cyan-400 border border-gray-700">
              Login
            </Link>

            <Link to="/register" className="inline-block">
              <motion.button 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <motion.button
              onClick={() => {
                const el = document.getElementById('mobile-nav')
                if (el) el.classList.toggle('hidden')
              }}
              className="p-2 rounded-xl hover:bg-gray-800 transition border border-gray-700"
              aria-label="open menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div id="mobile-nav" className="md:hidden hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-700">
        <div className="flex flex-col gap-1 p-4">
          {navItems.map((n) => (
            <motion.a 
              key={n.id} 
              href={`#${n.id}`} 
              className="px-4 py-3 rounded-xl hover:bg-gray-800 text-gray-300 hover:text-cyan-400 transition-all border border-transparent hover:border-gray-600"
              whileHover={{ x: 4 }}
            >
              {n.label}
            </motion.a>
          ))}
          <div className="border-t border-gray-700 mt-2 pt-2">
            <Link to="/login" className="block px-4 py-3 rounded-xl hover:bg-gray-800 text-gray-300 hover:text-cyan-400 transition-all">
              Login
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  )
}