import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Clock, Flag, Users, TrendingUp, Zap, Target, Award } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import LabEditor from '../components/labs/LabEditor'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function LabsPage({user}) {
  const [labs, setLabs] = useState([])
  const [activeLab, setActiveLab] = useState(null)
  const [flag, setFlag] = useState('')
  const [filter, setFilter] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState(null)
  const [view, setView] = useState('list') // 'list' or 'detail'

  useEffect(() => {
    // Enhanced demo data
    setLabs([
      { 
        id: 'l1', 
        title: 'Phishing Email Analysis', 
        description: 'Analyze and identify phishing attempts in email headers and content. Learn to spot malicious links and social engineering tactics.',
        difficulty: 'Beginner', 
        time: '30 min',
        category: 'Email Security',
        completed: true,
        flags: 2,
        popularity: 88,
        students: 1200,
        rating: 4.8,
        image: '📧',
        color: 'from-blue-500 to-cyan-500',
        technologies: ['Wireshark', 'Email Headers', 'Social Engineering']
      },
      { 
        id: 'l2', 
        title: 'SQL Injection Playground', 
        description: 'Practice SQL injection techniques on a vulnerable web application. Master UNION attacks, boolean-based blind, and time-based attacks.',
        difficulty: 'Intermediate', 
        time: '45 min',
        category: 'Web Security',
        completed: true,
        flags: 3,
        popularity: 95,
        students: 850,
        rating: 4.9,
        image: '💉',
        color: 'from-red-500 to-pink-500',
        technologies: ['SQLMap', 'Burp Suite', 'Manual Testing']
      },
      { 
        id: 'l3', 
        title: 'Network Traffic Analysis', 
        description: 'Use Wireshark to analyze suspicious network traffic patterns. Detect malware communications and unauthorized data exfiltration.',
        difficulty: 'Intermediate', 
        time: '60 min',
        category: 'Network Security',
        completed: false,
        flags: 4,
        popularity: 82,
        students: 720,
        rating: 4.7,
        image: '🌐',
        color: 'from-green-500 to-emerald-500',
        technologies: ['Wireshark', 'Packet Analysis', 'Network Forensics']
      },
      { 
        id: 'l4', 
        title: 'Buffer Overflow Exploitation', 
        description: 'Learn stack-based buffer overflow attacks on vulnerable binaries. Master shellcode injection and exploit development.',
        difficulty: 'Advanced', 
        time: '90 min',
        category: 'Binary Exploitation',
        completed: false,
        flags: 5,
        popularity: 76,
        students: 450,
        rating: 4.9,
        image: '💥',
        color: 'from-purple-500 to-indigo-500',
        technologies: ['GDB', 'Python', 'Assembly', 'Exploit Development']
      }
    ])

    setStats({
      labsCompleted: 15,
      flagsCaptured: 24,
      averageScore: 87,
      totalLabs: 25,
      weeklyProgress: 4,
      rank: 42
    })
  }, [])

  const filteredLabs = labs.filter(lab => {
    const matchesFilter = filter === 'All' || lab.category === filter
    const matchesDifficulty = difficulty === 'All' || lab.difficulty === difficulty
    const matchesSearch = lab.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesDifficulty && matchesSearch
  })

  const categories = ['All', ...new Set(labs.map(lab => lab.category))]
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const labStats = [
    { label: 'Labs Completed', value: stats?.labsCompleted || 0, total: stats?.totalLabs || 25, icon: Award, color: 'from-cyan-500 to-blue-500' },
    { label: 'Flags Captured', value: stats?.flagsCaptured || 0, icon: Flag, color: 'from-green-500 to-emerald-500' },
    { label: 'Average Score', value: `${stats?.averageScore || 0}%`, icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
    { label: 'Weekly Progress', value: `${stats?.weeklyProgress || 0}/7`, icon: Zap, color: 'from-purple-500 to-pink-500' }
  ]

  const startLab = (lab) => {
    setActiveLab(lab)
    setView('detail')
  }

  const submitFlag = async () => {
    // Flag submission logic
    console.log('Submitting flag:', flag)
    setFlag('')
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: 'from-green-500 to-emerald-500',
      Intermediate: 'from-yellow-500 to-orange-500',
      Advanced: 'from-red-500 to-pink-500'
    }
    return colors[difficulty] || 'from-gray-500 to-gray-600'
  }

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
                Practice Labs
              </motion.h1>
              <motion.p 
                className="text-gray-400 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Apply your cybersecurity skills in realistic, hands-on scenarios
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <Button
                variant="secondary"
                icon="🚀"
                onClick={() => setView(view === 'list' ? 'detail' : 'list')}
              >
                {view === 'list' ? 'Lab View' : 'List View'}
              </Button>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {labStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white relative overflow-hidden`}
                >
                  <div className="absolute top-4 right-4 opacity-20">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                    {stat.total && (
                      <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                        <div 
                          className="h-2 bg-white rounded-full transition-all duration-500"
                          style={{ width: `${(stat.value / stat.total) * 100}%` }}
                        />
                      </div>
                    )}
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
                  placeholder="Search labs, technologies, or categories..."
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
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          filter === category
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-medium">Difficulty:</span>
                  <div className="flex gap-2">
                    {difficulties.map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          difficulty === diff
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredLabs.map((lab, index) => (
                <motion.div
                  key={lab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer"
                  onClick={() => startLab(lab)}
                >
                  {/* Lab Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lab.color} flex items-center justify-center text-2xl`}>
                      {lab.image}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getDifficultyColor(lab.difficulty)} text-white`}>
                        {lab.difficulty}
                      </span>
                      {lab.completed && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lab Info */}
                  <h3 className="text-xl font-bold text-white mb-3">{lab.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{lab.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{lab.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4" />
                        <span>{lab.flags} flags</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{lab.students}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span>⭐</span>
                      <span className="font-semibold">{lab.rating}</span>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {lab.technologies.slice(0, 3).map((tech, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {lab.technologies.length > 3 && (
                      <span className="px-3 py-1 bg-gray-700/30 text-gray-400 rounded-full text-xs">
                        +{lab.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    icon="🚀"
                    variant={lab.completed ? "secondary" : "primary"}
                  >
                    {lab.completed ? 'Review Lab' : 'Start Lab'}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Lab List Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Available Labs</h3>
                  {filteredLabs.map((lab, index) => (
                    <motion.div
                      key={lab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        activeLab?.id === lab.id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/30'
                      }`}
                      onClick={() => startLab(lab)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${lab.color} flex items-center justify-center text-lg`}>
                          {lab.image}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm">{lab.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span>{lab.time}</span>
                            <span>•</span>
                            <span>{lab.flags} flags</span>
                            {lab.completed && (
                              <>
                                <span>•</span>
                                <span className="text-green-400">Completed</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Lab Detail View */}
              <div className="lg:col-span-2">
                {activeLab ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Lab Header */}
                    <Card gradient={true}>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeLab.color} flex items-center justify-center text-3xl`}>
                              {activeLab.image}
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-white">{activeLab.title}</h2>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                                <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(activeLab.difficulty)} text-white font-semibold`}>
                                  {activeLab.difficulty}
                                </span>
                                <span>⏱️ {activeLab.time}</span>
                                <span>📁 {activeLab.category}</span>
                                <span>🚩 {activeLab.flags} flags</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-300 mb-6">{activeLab.description}</p>

                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                            <h4 className="font-semibold text-cyan-400 mb-2">🎯 Lab Objective</h4>
                            <p className="text-cyan-300 text-sm">
                              Capture all {activeLab.flags} flags by exploiting vulnerabilities in the target system. 
                              Use the tools and techniques covered in the modules to complete this challenge.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Lab Environment */}
                    <Card>
                      <h3 className="text-xl font-bold text-white mb-4">Lab Environment</h3>
                      <LabEditor 
                        labTitle={activeLab.title}
                        initialCode={`# ${activeLab.title}\n# Start your exploit code here\n\n# Technologies: ${activeLab.technologies.join(', ')}\n# Difficulty: ${activeLab.difficulty}\n# Estimated time: ${activeLab.time}\n\n# Write your code below this line:`}
                      />
                    </Card>

                    {/* Submission Area */}
                    <Card>
                      <h4 className="font-semibold text-white mb-4">🚩 Submit Flag</h4>
                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter flag (e.g., FLAG{...})"
                          value={flag}
                          onChange={(e) => setFlag(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={submitFlag} icon="🎯">
                          Submit Flag
                        </Button>
                      </div>
                      <p className="text-gray-400 text-sm mt-3">
                        Flags are usually in the format: FLAG{'{'}something_here{'}'}
                      </p>
                    </Card>
                  </motion.div>
                ) : (
                  <Card gradient={true}>
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🔬</div>
                      <h3 className="text-2xl font-semibold text-white mb-4">
                        Select a Lab to Begin
                      </h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Choose from the available labs on the left to start practicing your cybersecurity skills in realistic scenarios.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                        <div>
                          <div className="font-semibold mb-1 text-cyan-400">Real Environments</div>
                          <p>Practice in safe, controlled environments that mimic real-world systems</p>
                        </div>
                        <div>
                          <div className="font-semibold mb-1 text-cyan-400">Instant Feedback</div>
                          <p>Get immediate results and learn from your attempts</p>
                        </div>
                        <div>
                          <div className="font-semibold mb-1 text-cyan-400">Progressive Difficulty</div>
                          <p>Start with beginner labs and work your way up to advanced challenges</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}