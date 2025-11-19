import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  loading = false,
  icon,
  ...props 
}) {
  const base = 'font-semibold rounded-xl px-6 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40',
    secondary: 'border border-cyan-500 text-cyan-400 bg-transparent hover:bg-cyan-500/10 hover:border-cyan-400 backdrop-blur-sm',
    ghost: 'bg-transparent text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/25',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25'
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        base, 
        variants[variant], 
        sizeStyles[props.size] || sizeStyles.md,
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
        />
      )}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </motion.button>
  )
}