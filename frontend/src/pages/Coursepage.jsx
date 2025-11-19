import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Star, Clock, Users, TrendingUp, BookOpen, Target } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import ModuleCard from '../components/modules/ModuleCard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import axios from 'axios'

export default function ModulesPage({user}) {
  const [modules, setModules] = useState([])
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Popular')
  const [searchTerm, setSearchTerm] = useState('')
  const [progress, setProgress] = useState({ completed: 3, total: 12 })
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    // Enhanced demo data with more details
     const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/courses", {
          withCredentials: true,
        });
        setModules(res.data.course);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [])

  const filteredModules = modules.filter(module => {
    if (filter === 'All') return true
    return module.badge.toLowerCase() === filter.toLowerCase()
  })

  const sortedModules = [...filteredModules].sort((a, b) => {
    switch (sort) {
      case 'Popular':
        return b.popularity - a.popularity
      case 'Newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      case 'Difficulty':
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 }
        return difficultyOrder[a.badge] - difficultyOrder[b.badge]
      case 'Progress':
        return b.progress - a.progress
      default:
        return 0
    }
  })

  const searchResults = sortedModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const stats = [
    { label: 'Total Courses', value: '12', icon: BookOpen, color: 'blue' },
    { label: 'Completed', value: progress.completed.toString(), icon: Target, color: 'green' },
    { label: 'In Progress', value: '2', icon: TrendingUp, color: 'yellow' },
    { label: 'Hours Learned', value: '42', icon: Clock, color: 'purple' }
  ]

  const filters = ['All', 'Beginner', 'Intermediate', 'Advanced']
  const sortOptions = ['Popular', 'Newest', 'Difficulty', 'Progress']
 console.log(modules)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar - Now fixed overlay, not in flex layout */}
      <Sidebar user={user} />
      
      <main className="p-6 pt-[70px] md:pt-6 md:ml-80 overflow-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Learning Courses
              </motion.h1>
              <motion.p 
                className="text-gray-400 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Master cybersecurity through hands-on modules and real-world scenarios
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              {/* View Toggle */}
              <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-700">
                {['grid', 'list'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {mode === 'grid' ? 'Grid' : 'List'}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = {
                blue: 'from-blue-500 to-cyan-500',
                green: 'from-green-500 to-emerald-500',
                yellow: 'from-yellow-500 to-orange-500',
                purple: 'from-purple-500 to-pink-500'
              }
              
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-gradient-to-br ${colorClasses[stat.color]} rounded-2xl p-6 text-white relative overflow-hidden`}
                >
                  <div className="absolute top-4 right-4 opacity-20">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Search */}
              <div className="flex-1 w-full">
                <Input
                  icon="🔍"
                  placeholder="Search modules, topics, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <div className="flex gap-2">
                    {filters.map((filterOption) => (
                      <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          filter === filterOption
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {filterOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-medium">Sort by:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Modules Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Available Courses {searchResults.length > 0 && `(${searchResults.length})`}
            </h2>
            <div className="text-gray-400 text-sm">
              Showing {searchResults.length} of {modules.length} modules
            </div>
          </div>

          <AnimatePresence mode="wait">
            {searchResults.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
                }
              >
                {searchResults.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <ModuleCard 
                      module={module} 
                      
                      showProgress={true}
                      showActions={true}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-300 mb-4">
                  No modules found
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setFilter('All')
                  }}
                  variant="secondary"
                  icon="🔄"
                >
                  Reset Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Learning Path Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                🎯 Personalized Learning Path
              </h3>
              <p className="text-gray-300 mb-4">
                Based on your progress, we recommend starting with Threat Detection Fundamentals to build a strong foundation.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Recommended for beginners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>8-10 hours to complete</span>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              icon="🚀"
              className="whitespace-nowrap"
            >
              Start Learning Path
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}