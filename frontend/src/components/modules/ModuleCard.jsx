// src/components/modules/ModuleCard.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, Zap, TrendingUp, Play, Eye } from 'lucide-react'

const ModuleCard = ({ module, showActions = true }) => {
  const navigate = useNavigate()

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Fundamental':
        return 'from-green-500 to-emerald-400'
      case 'Medium':
        return 'from-cyan-500 to-blue-500'
      case 'Advanced':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Fundamental':
        return <Zap className="w-3 h-3" />
      case 'Medium':
        return <TrendingUp className="w-3 h-3" />
      case 'Advanced':
        return <Play className="w-3 h-3" />
      default:
        return <Zap className="w-3 h-3" />
    }
  }

  const handleStartLearning = () => {
    console.log(module._id)
    navigate(`/courses/${module._id}`)
  }
console.log(module)
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      id={module._id}
      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden h-full flex flex-col hover:border-cyan-500/50 transition-all duration-300"
    >
      {/* Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

      {/* ✅ IMAGE SECTION */}
      {module.image && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={module.image}
            alt={module.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-6 flex-1 relative z-10">

        {/* Badge */}
        <div className="flex justify-between items-start mb-4">
          <motion.span 
            className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${getBadgeColor(module.complexity)} text-white shadow-lg flex items-center gap-1.5`}
            whileHover={{ scale: 1.05 }}
          >
            {getBadgeIcon(module.complexity)}
            {module.complexity}
          </motion.span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl mb-3 text-white group-hover:text-cyan-400 transition-colors">
          {module.title}
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          {module.detail}
        </p>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-cyan-400 mb-6">
          <Clock className="w-4 h-4" />
          <span>{module.hours} Hours</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {module.tag?.slice(0, 3).map((t, index) => (
            <motion.span 
              key={index}
              className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-xl text-xs border border-gray-600 group-hover:border-cyan-500/30 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {t}
            </motion.span>
          ))}

          {module.tag?.length > 3 && (
            <span className="px-3 py-1.5 bg-gray-700/50 text-gray-400 rounded-xl text-xs border border-gray-600">
              +{module.tag.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-6 pt-4 bg-gray-800/30 border-t border-gray-700 group-hover:border-cyan-500/30 transition-colors relative z-10">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartLearning}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded-xl font-medium text-sm hover:bg-cyan-500/10 transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ModuleCard
