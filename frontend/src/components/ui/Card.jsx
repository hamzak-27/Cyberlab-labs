import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  gradient = false,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={clsx(
        'rounded-2xl p-6 shadow-lg border border-gray-700/50 backdrop-blur-sm',
        gradient 
          ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80' 
          : 'bg-gray-800/50',
        hover && 'hover:border-cyan-500/30 hover:shadow-cyan-500/10',
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}