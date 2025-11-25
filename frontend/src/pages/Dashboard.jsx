import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import axios from 'axios'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Flame } from 'lucide-react'

/**
 * Dashboard.jsx
 * Refactored Dashboard with API integration (progress endpoint)
 *
 * Expects:
 * - prop user: user object { _id, name, ... }
 * - Sidebar, Card, Button components available
 *
 * API:
 * GET http://localhost:5001/api/progress/user/{userId}
 *  -> { success, summary: { totalEnrolled, completedCount, inProgressCount }, courses: [...] }
 */

const QuickStatCard = ({ label, value, sub, progress, icon, color = 'from-indigo-600 to-indigo-800' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white relative overflow-hidden`}
    >
      <div className="absolute top-4 right-4 text-3xl opacity-20">{icon}</div>
      <div className="relative z-10">
        <div className="text-sm opacity-90">{label}</div>
        <div className="text-2xl font-bold mt-2">{value}</div>
        {sub && <div className="text-xs opacity-80 mt-1">{sub}</div>}
        {typeof progress === 'number' && (
          <div className="mt-3">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const CourseProgressCard = ({ course, onContinue }) => {
  const percent = course?.percentage ?? Math.round(((course?.completedModules || 0) / Math.max(course?.totalModules || 1, 1)) * 100)
  return (
    <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600 my-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-semibold">{course.title}</h4>
        <div className="text-sm text-gray-300 font-medium">{percent}%</div>
      </div>
      <div className="text-gray-300 text-sm mt-2">
        {course.completedModules}/{course.totalModules} Modules Completed
      </div>

      <div className="w-full bg-gray-600 rounded-full h-3 mt-3">
        <div
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onContinue(course.courseId)}
          className="flex-1"
        >
          Continue
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.success('Saved to favorites (demo)')}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export default function Dashboard({ user }) {
  const navigate = useNavigate()
  // Example: assuming your auth store exposes logout
  const logout = useAuthStore?.(state => state?.logout)
  const [stats, setStats] = useState(null) // consolidated stats from API + local
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  // Fetch progress data
  const fetchProgress = useCallback(async (userId) => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      // const res = await fetch(`http://localhost:5001/api/progress/user/${userId}`, {
      //   withCredentials: true
      // })
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/progress/user/${userId}`, {
              withCredentials: true,
            });

      // if (!res.ok) {
      //   const txt = await res.text()
      //   throw new Error(`Network error: ${res.status} ${txt}`)
      // }

      // const data = await res.json()
      // if (!data.success) {
      //   throw new Error('API returned success=false')
      // }

      // Map the API response into the stats object we use in UI
      const apiSummary = res.data.summary || {}
      console.log(res)
      const courses = res.data.courses || []

      const computed = {
        // keep some demo fallback values if you still want to show charts
        currentStreak: user?.currentStreak ?? 0,
        totalHours: user?.totalHours ?? 0,
        modulesCompleted: apiSummary.completedCount ?? 0,
        totalEnrolled: apiSummary.totalEnrolled ?? 0,
        completedCount: apiSummary.completedCount ?? 0,
        inProgressCount: apiSummary.inProgressCount ?? 0,
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
        recentActivity: [
          // you can later map actual user events from another endpoint
          { type: 'module', title: 'Web Application Security', time: '2 hours ago', status: 'completed' },
          { type: 'lab', title: 'SQL Injection Playground', time: '5 hours ago', status: 'completed' },
          { type: 'achievement', title: 'Bug Hunter Badge', time: '1 day ago', status: 'earned' }
        ],
        communityRank: user?.communityRank ?? 124,
        weeklyGoal: { completed: 4, total: 5 },
        certifications: { earned: 2, inProgress: 3 },

        // API courses
        courses
      }

      setStats(computed)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProgress(user?._id)
  }, [user, fetchProgress])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  
  const quickStats = [
    {
      label: "Login Streak",
      current: stats?.currentStreak || 0,
      max: user?.maxStreak || 0,
      icon: <Flame className="text-white" />,
      color: "from-purple-600 to-purple-800"
    },
    {
      label: 'Courses Completed',
      value: `${stats?.completedCount ?? 0}/${stats?.totalEnrolled ?? 0}`,
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      progress: stats?.totalEnrolled ? ((stats?.completedCount ?? 0) / stats?.totalEnrolled) * 100 : 0
    },
    {
      label: 'Flags Captured',
      value: stats?.flagsCaptured ?? 0,
      icon: '🚩',
      color: 'from-green-500 to-emerald-500',
      trend: '+5'
    },
    {
      label: 'Community Rank',
      value: `#${stats?.communityRank ?? 124}`,
      icon: '🏆',
      color: 'from-purple-500 to-pink-500',
      trend: '+3'
    }
  ]

  const onContinueCourse = (courseId) => {
    // open modules list for that course
    navigate(`/courses/${courseId}/modules`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar user={user} stats={stats} />

      <main className="p-3 pt-[70px] md:pt-6 md:ml-80 overflow-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Welcome back, {user?.name || 'Cyber Warrior'}!
            </h1>
            <p className="text-gray-400 mt-2">Continue your journey to cybersecurity mastery</p>
          </div>
         
        </motion.div>

        {loading && (
          <div className="text-center text-gray-300 py-8">Loading dashboard...</div>
        )}

        {error && (
          <div className="text-center text-red-400 py-4">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickStats.map((s, idx) => (
                <QuickStatCard
                  key={s.label}
                  label={s.label}
                  value={s.value ?? s.current ?? 0}
                  sub={s.current !== undefined ? `${s.current} days (best ${s.max})` : undefined}
                  progress={s.progress}
                  icon={s.icon}
                  color={s.color}
                />
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Current Learning Path */}
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
                        <span className="text-gray-300">Course Progress</span>
                        <span className="text-green-400 font-semibold">{Math.round(stats?.modulesCompleted || 0)} Courses</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, Math.round((stats?.modulesCompleted || 0) / Math.max(stats?.totalEnrolled, 1) * 100 || 0))}%` }}
                        />
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

                    <Button onClick={() => navigate('/modules')} className="w-full" icon="🚀">Resume Learning</Button>
                  </div>
                </Card>

                {/* Weekly Activity Chart */}
                <Card gradient={true}>
                  <h3 className="text-xl font-bold text-white mb-6">Weekly Activity</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.weekly || []}>
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '0.75rem',
                          color: 'white'
                        }} />
                        <Bar dataKey="hr" radius={[4, 4, 0, 0]} >
                          {(stats?.weekly || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${200 + index * 10}, 70%, 50%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <Card gradient={true}>
                  <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {stats?.recentActivity?.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.status === 'completed' ? 'bg-green-500/20' : 'bg-cyan-500/20'}`}>
                          <span className="text-lg">{activity.type === 'module' ? '📚' : activity.type === 'lab' ? '🔬' : '🏆'}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">{activity.title}</div>
                          <div className="text-gray-400 text-xs">{activity.time}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${activity.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                          {activity.status}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                <Card gradient={true}>
                  <h3 className="text-xl font-bold text-white mb-6">Skill Distribution</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.skills || []} layout="vertical" margin={{ left: 0, right: 0 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.75rem' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {(stats?.skills || []).map((entry, index) => (
                            <Cell key={`skill-${index}`} fill={`hsl(${210 + index * 30}, 70%, 60%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>

            {/* Recommended / Courses */}
            <div className="mt-8">
              <Card gradient={true}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Your Courses</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>View All</Button>
                </div>

                <div>
                  {stats?.courses?.length ? (
                    stats.courses.map((c) => (
                      <CourseProgressCard key={c.courseId} course={c} onContinue={onContinueCourse} />
                    ))
                  ) : (
                    <div className="text-gray-400 p-4">No enrolled courses yet.</div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
