// src/components/layout/Header.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          {/* Logo - Always visible with text */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/25">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 blur-sm"
                />
              </div>
              {/* Always show logo text, even on mobile */}
              <div>
                <div className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  CyberSec Pro
                </div>
                <div className="text-xs text-gray-400 hidden xs:block">Master Cybersecurity</div>
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

          {/* Right controls - Desktop & Mobile Get Started button */}
          <div className="flex items-center gap-3">
            {/* Get Started button - Always visible */}
            <Link to="/register" className="hidden sm:inline-block">
              <motion.button 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 transition-all text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </Link>

            {/* Login - Desktop only */}
            <Link to="/login" className="hidden md:block text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition text-gray-300 hover:text-cyan-400 border border-gray-700">
              Login
            </Link>

            {/* Mobile Get Started - Compact version */}
            <Link to="/register" className="sm:hidden inline-block">
              <motion.button 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 transition-all text-xs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </Link>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-gray-800 transition border border-gray-700 text-gray-300 ml-2"
                aria-label="Toggle menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav with animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-700 overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navItems.map((n, index) => (
                <motion.a 
                  key={n.id} 
                  href={`#${n.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-gray-800 text-gray-300 hover:text-cyan-400 transition-all border border-transparent hover:border-gray-600 text-base"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {n.label}
                </motion.a>
              ))}
              
              <div className="border-t border-gray-700 mt-2 pt-4">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-gray-800 text-gray-300 hover:text-cyan-400 transition-all border border-gray-600 text-center"
                >
                  Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}