import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext';

import { Shield, BookOpen, FlaskConical, Users, LogOut, Zap, Target, Menu, X } from 'lucide-react'
import axios from 'axios'

const Sidebar = ({ user, stats }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const scrollPositionRef = useRef(0)
  const { setUser } = useAuth();

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      // Lock body scroll
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // Restore scroll position
      const scrollY = scrollPositionRef.current
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      
      // Restore scroll position after a brief delay to ensure styles are reset
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY)
      })
    }

    // Cleanup function
    return () => {
      if (!isMobileOpen) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
      }
    }
  }, [isMobileOpen])

  const navigationItems = [
    { icon: Shield, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/courses' }, // Changed from 'Modules' to 'Courses'
    { icon: FlaskConical, label: 'Practice Labs', path: '/labs' },
    { icon: Users, label: 'Community', path: '/community' },
  ]


  const isActive = (path) => {
    // Check if current path starts with the navigation path
    // This handles nested routes like /courses/:courseId/modules
    return location.pathname.startsWith(path)
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsMobileOpen(false)
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/auth/sign-out",
        {},
        { withCredentials: true }
      );

      // Clear user data
     
      setUser(null)
        toast.success("🔐 You are securely logged out.");

      navigate("/login");
    

    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // Sidebar content component
  const SidebarContent = ({ showCloseButton = false }) => (
    <div className="relative h-full flex flex-col overflow-y-auto scrollbar-hide-desktop">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1)_76%,transparent_77%),linear-gradient(0deg,transparent_24%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1)_76%,transparent_77%)] bg-[length:40px_40px]" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full blur-lg pointer-events-none"></div>

      {/* Close Button - Only on mobile */}
      {showCloseButton && (
        <button
          onClick={toggleMobileMenu}
          className="absolute top-3 right-3 z-20 p-1.5 bg-gray-800/90 backdrop-blur-sm border border-cyan-500/40 rounded-lg shadow-lg hover:bg-gray-700/90 hover:border-cyan-500/60 transition-all duration-200 group md:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-full">
        {/* User Profile Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-4 pb-4 px-4 md:pt-6 md:pb-6 md:px-6 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/25 overflow-hidden">
                <img src={user?.avatar} alt={user?.username || 'User'} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h3 
                className="font-bold text-white truncate text-base md:text-lg"
                whileHover={{ color: "#22d3ee" }}
              >
                {user?.username}
              </motion.h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-400 text-xs md:text-sm font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* User Stats */}
         <div className="grid grid-cols-2 gap-2 md:gap-3 mt-4">
  <div className="text-center p-2 bg-gray-800/50 rounded-lg backdrop-blur-sm">
    <div className="text-cyan-400 font-bold text-base md:text-lg">
      {user?.labsStats?.totalFlagsCaptured || 0}
    </div>
    <div className="text-gray-400 text-xs">Flags</div>
  </div>
  <div className="text-center p-2 bg-gray-800/50 rounded-lg backdrop-blur-sm">
    <div className="text-green-400 font-bold text-base md:text-lg">
      {user?.labsStats?.labsCompleted || 0}
    </div>
    <div className="text-gray-400 text-xs">Labs</div>
  </div>
</div>
        </motion.div>

        {/* Main Navigation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-3 md:p-4"
        >
          <h4 className="text-gray-400 text-sm font-semibold mb-3 px-2">NAVIGATION</h4>
          <nav className="space-y-1">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <motion.button
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 group relative ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-r-2 border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-colors relative z-10 ${
                    active 
                      ? 'bg-cyan-500/20' 
                      : 'bg-gray-800/50 group-hover:bg-cyan-500/10'
                  }`}>
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${active ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                  </div>
                  
                  <span className={`font-medium relative z-10 text-sm md:text-base ${active ? 'text-cyan-400' : ''}`}>
                    {item.label}
                  </span>

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ opacity: 1 }}
                  />
                </motion.button>
              )
            })}
          </nav>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="p-3 md:p-4 border-t border-cyan-500/20 mt-auto"
        >
          <motion.button
            whileHover={{ x: 4, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="font-medium">Log Out</span>
          </motion.button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button - Only visible on mobile when sidebar is closed */}
      {!isMobileOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-[100] p-2.5 bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-xl hover:bg-gray-800/90 hover:border-cyan-500/50 transition-all duration-200 group md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </motion.button>
      )}

      {/* Desktop Sidebar - Always visible, fixed to left */}
      <div className="hidden md:block fixed top-0 left-0 h-screen w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-cyan-500/20 z-40">
        <SidebarContent showCloseButton={false} />
      </div>

      {/* Mobile Sidebar Overlay - Only renders when open */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-black bg-opacity-50 z-[90] md:hidden"
            />
            
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-gray-900 to-gray-800 border-r border-cyan-500/20 shadow-2xl z-[95] md:hidden"
            >
              <SidebarContent showCloseButton={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
