// src/components/modules/ModuleTabs.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Play, Code, CheckCircle } from 'lucide-react'

export default function ModuleTabs({ modules, currentModule, courseId }) {
  const location = useLocation()
  const currentView = location.pathname.split('/').pop()

  return (
    <div className="mb-8">
      {/* Scrollable Module Tabs */}
      <div className="relative">
        <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
          {modules.map((module, index) => (
            <Link
              key={module.id}
              to={`/courses/${courseId}/modules/${module.id}/${currentView}`}
              className="flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-6 py-4 rounded-2xl border-2 transition-all ${
                  currentModule.id === module.id
                    ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {/* Completion Indicator */}
                    {module.completion.content && module.completion.video && module.completion.lab ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                    )}
                    
                    <span className="font-medium whitespace-nowrap">{module.title}</span>
                  </div>
                  
                  {/* Content Type Icons */}
                  <div className="flex items-center gap-1">
                    <BookOpen className={`w-4 h-4 ${
                      module.completion.content ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    <Play className={`w-4 h-4 ${
                      module.completion.video ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    <Code className={`w-4 h-4 ${
                      module.completion.lab ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                
                {/* Progress Indicator */}
                <div className="flex gap-1 mt-2">
                  {['content', 'video', 'lab'].map(type => (
                    <div
                      key={type}
                      className={`h-1 flex-1 rounded ${
                        module.completion[type] 
                          ? 'bg-green-400' 
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-700 max-w-md">
        {[
          { id: 'content', label: 'Content', icon: BookOpen },
          { id: 'video', label: 'Video', icon: Play },
          { id: 'lab', label: 'Lab', icon: Code }
        ].map((view) => (
          <Link
            key={view.id}
            to={`/courses/${courseId}/modules/${currentModule.id}/${view.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              currentView === view.id
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <view.icon className="w-4 h-4" />
            {view.label}
          </Link>
        ))}
      </div>
    </div>
  )
}