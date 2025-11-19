import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Flame } from 'lucide-react'

export default function Dashboard({user}) {

  const [stats, setStats] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [activeView, setActiveView] = useState('overview')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Enhanced demo data
    setStats({
      currentStreak: 7,
      totalHours: 42,
      modulesCompleted: 8,
      labsMastered: 12,
      flagsCaptured: 24,
      weekly: [
        { day: 'Mon', hr: 2, labs: 1 },
        { day: 'Tue', hr: 3, labs: 2 },
        { day: 'Wed', hr: 1, labs: 0 },
        { day: 'Thu', hr: 2, labs: 1 },
        { day: 'Fri', hr: 4, labs: 3 },
        { day: 'Sat', hr: 1, labs: 1 },
        { day: 'Sun', hr: 2, labs: 1 }
      ],
      skills: [
        { name: 'Web Security', value: 75, trend: '+5%' },
        { name: 'Network Defense', value: 60, trend: '+12%' },
        { name: 'Threat Analysis', value: 45, trend: '+8%' },
        { name: 'Incident Response', value: 30, trend: '+15%' }
      ],
      communityRank: 124,
      weeklyGoal: { completed: 4, total: 5 },
      certifications: { earned: 2, inProgress: 3 },
      recentActivity: [
        { type: 'module', title: 'Web Application Security', time: '2 hours ago', status: 'completed' },
        { type: 'lab', title: 'SQL Injection Playground', time: '5 hours ago', status: 'completed' },
        { type: 'achievement', title: 'Bug Hunter Badge', time: '1 day ago', status: 'earned' }
      ]
    })
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const quickStats = [
    {
  label: "Login Streak",
  current: user?.currentStreak || 0,
  max: user?.maxStreak || 0,
  color: "from-purple-600 to-purple-800",
  icon: <Flame className="text-white" />,
},
    { 
      label: 'Modules Completed', 
      value: `${stats?.modulesCompleted || 0}/12`, 
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      progress: ((stats?.modulesCompleted || 0) / 12) * 100
    },
    { 
      label: 'Flags Captured', 
      value: stats?.flagsCaptured || 0, 
      icon: '🚩',
      color: 'from-green-500 to-emerald-500',
      trend: '+5'
    },
    { 
      label: 'Community Rank', 
      value: `#${stats?.communityRank || 124}`, 
      icon: '🏆',
      color: 'from-purple-500 to-pink-500',
      trend: '+3'
    }
  ]

  const recommendedContent = [
    {
      title: "Advanced Penetration Testing",
      description: "Move from exploitation basics to full engagement workflows.",
      level: "Advanced",
      duration: "12 hours",
      progress: 0,
      image: "🛡️"
    },
    {
      title: "Cloud Security Fundamentals",
      description: "Learn to secure AWS/GCP workloads and cloud-native threats.",
      level: "Intermediate",
      duration: "8 hours",
      progress: 0,
      image: "☁️"
    },
    {
      title: "Incident Response Procedures",
      description: "Chain-of-custody, forensics and post-incident hardening.",
      level: "Advanced",
      duration: "10 hours",
      progress: 0,
      image: "🚨"
    }
  ]

  console.log(user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar - Now fixed overlay, not in flex layout */}
      <Sidebar user={user} stats={stats} />

      {/* Main Content */}
      <main className="p-6 pt-[70px] md:pt-6 md:ml-80 overflow-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Welcome back, {user?.name || 'Cyber Warrior'}!
            </h1>
            <p className="text-gray-400 mt-2">Continue your journey to cybersecurity mastery</p>
          </div>
          
          {/* <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={toggleDarkMode}
              icon={darkMode ? '☀️' : '🌙'}
            >
              {darkMode ? 'Light' : 'Dark'}
            </Button>
          </div> */}
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white relative overflow-hidden`}
            >
              <div className="absolute top-4 right-4 text-3xl opacity-20">
                {stat.icon}
              </div>
              <div className="relative z-10">
                <div className="text-sm opacity-90">{stat.label}</div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
               {stat.current !== undefined && (
  <div className="mt-2">
    <div className="text-2xl font-bold">{stat.current} days</div>
    <div className="text-sm opacity-80 mt-1">
      Highest: {stat.max} days
    </div>
  </div>
)}
                {stat.progress && (
                  <div className="mt-3">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${stat.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Progress */}
            <Card hover={true} gradient={true}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Current Learning Path</h3>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                  Web Application Security
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-300">Module Progress</span>
                    <span className="text-green-400 font-semibold">65% Complete</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                    <div className="text-cyan-400 text-lg">🎯</div>
                    <div className="text-white font-semibold mt-1">Next: SQL Injection</div>
                    <div className="text-gray-400 text-sm">Advanced techniques</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                    <div className="text-green-400 text-lg">⏱️</div>
                    <div className="text-white font-semibold mt-1">Est. 3h 20m</div>
                    <div className="text-gray-400 text-sm">Remaining</div>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/modules')}
                  className="w-full"
                  icon="🚀"
                >
                  Resume Learning
                </Button>
              </div>
            </Card>

            {/* Weekly Activity Chart */}
            <Card gradient={true}>
              <h3 className="text-xl font-bold text-white mb-6">Weekly Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.weekly || []}>
                    <XAxis 
                      dataKey="day" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.75rem',
                        color: 'white'
                      }}
                    />
                    <Bar 
                      dataKey="hr" 
                      fill="#22d3ee"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="labs" 
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <Card gradient={true}>
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {stats?.recentActivity?.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.status === 'completed' ? 'bg-green-500/20' : 'bg-cyan-500/20'
                    }`}>
                      <span className="text-lg">
                        {activity.type === 'module' ? '📚' : 
                         activity.type === 'lab' ? '🔬' : '🏆'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">
                        {activity.title}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {activity.time}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      activity.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {activity.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Skill Distribution */}
            <Card gradient={true}>
              <h3 className="text-xl font-bold text-white mb-6">Skill Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats?.skills || []} 
                    layout="vertical"
                    margin={{ left: 0, right: 0 }}
                  >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.75rem'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    >
                      {(stats?.skills || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${210 + index * 30}, 70%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* Recommended Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card gradient={true}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Recommended for You</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {recommendedContent.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-700/30 rounded-xl p-4 border border-gray-600 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="text-4xl mb-3">{item.image}</div>
                  <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.level === 'Advanced' 
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.level}
                    </span>
                    <span className="text-gray-400 text-xs">⏱️ {item.duration}</span>
                  </div>

                  <Button 
                    onClick={() => navigate('/modules')}
                    variant="secondary"
                    className="w-full"
                    size="sm"
                  >
                    Start Learning
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}