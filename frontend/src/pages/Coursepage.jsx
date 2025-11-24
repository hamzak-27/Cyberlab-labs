// src/pages/Coursepage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Star, Clock, Users, TrendingUp, BookOpen, Target } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import ModuleCard from '../components/modules/ModuleCardAfterlogin'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import axios from 'axios'
import courseService from '../services/courseService'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'
import api from '../lib/api'

/* ============================
   Helper utilities (unchanged)
   ============================ */

const safeString = (val) => (typeof val === 'string' ? val : '')
const safeNumber = (val, fallback = 0) => (typeof val === 'number' ? val : fallback)
const asArrayOfStrings = (val) => {
  if (!val) return []
  if (Array.isArray(val)) {
    return val
      .map(v => (typeof v === 'string' ? v : (v?.name ?? v?.title ?? String(v) ?? '')))
      .filter(Boolean)
  }
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}
const parseDate = (val) => {
  if (!val && val !== 0) return null
  if (typeof val === 'number') {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
  }
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}
const isWithinDays = (date, days = 30) => {
  if (!date) return false
  const now = Date.now()
  return now - date.getTime() <= days * 24 * 60 * 60 * 1000
}

/* ============================
   ModulesPage component
   ============================ */

export default function ModulesPage({ user }) {
  const [modulesRaw, setModulesRaw] = useState([])
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Popular')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [progress, setProgress] = useState({ completed: 3, total: 12 })
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
const [progressData, setProgressData] = useState(null);
// const [loadingProgress, setLoadingProgress] = useState(false);
const [errorProgress, setErrorProgress] = useState(null);
  // Progress-related state (single GET for user)
  const [enrolledSet, setEnrolledSet] = useState(new Set())
  const [loadingProgress, setLoadingProgress] = useState(false)

  const authUser = useAuthStore((s) => s.user) // uses your store
  const userId = user._id

  console.log('ModulesPage render: userId=', user)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get('http://localhost:5001/api/courses', {
          withCredentials: true,
        })

        const rawList = res?.data?.course ?? res?.data?.courses ?? res?.data ?? []

        if (!Array.isArray(rawList)) {
          console.warn('courses response is not an array — adapt normalization if needed', rawList)
        }

        const normalized = (Array.isArray(rawList) ? rawList : []).map((c, index) => {
          const id = c?.id ?? c?._id ?? c?.courseId ?? `no-id-${index}`
          const title = safeString(c?.title ?? c?.name ?? c?.courseName)
          const description = safeString(c?.description ?? c?.summary ?? '')
          const topics = asArrayOfStrings(c?.topics ?? c?.tags ?? c?.categories ?? c?.skillTags)

          // Normalize complexity/difficulty
          const complexityRaw = safeString(c?.complexity ?? c?.difficulty ?? c?.badge ?? c?.level ?? 'Fundamental').toLowerCase()

          const complexity =
            complexityRaw === 'beginner' ? 'Fundamental' :
            complexityRaw === 'fundamental' ? 'Fundamental' :
            complexityRaw === 'intermediate' ? 'Medium' :
            complexityRaw === 'medium' ? 'Medium' :
            complexityRaw === 'advanced' ? 'Hard' :
            complexityRaw === 'hard' ? 'Hard' :
            'Fundamental'

          const popularity = safeNumber(c?.popularity ?? c?.views ?? c?.likes ?? 0)
          const progressVal = safeNumber(c?.progress ?? c?.userProgress ?? 0)
          const createdAt = parseDate(c?.createdAt ?? c?.publishedAt ?? c?.created_at ?? null)
          const isNewFlag = typeof c?.isNew === 'boolean' ? c.isNew : (createdAt ? isWithinDays(createdAt, 30) : false)

          return {
            ...c,
            id,
            title,
            description,
            topics,
            complexity,
            difficulty: complexity,
            badge: complexity,
            popularity,
            progress: progressVal,
            createdAt,
            isNew: isNewFlag,
          }
        })

        if (!cancelled) setModulesRaw(normalized)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  // Fetch user's progress once (only when userId exists)
  

  /* apply filter -> sort -> search (use complexity for filter/sort) */
  const searchResults = useMemo(() => {
    const modules = Array.isArray(modulesRaw) ? modulesRaw : []

    // Filter: prefer module.complexity
    const filtered = modules.filter((m) => {
      if (filter === 'All') return true
      const comp = safeString(m.complexity ?? m.badge ?? m.difficulty ?? '')
      return comp.toLowerCase() === filter.toLowerCase()
    })

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const aComp = safeString(a.complexity ?? a.badge ?? a.difficulty)
      const bComp = safeString(b.complexity ?? b.badge ?? b.difficulty)

      switch (sort) {
        case 'Popular':
          return (b.popularity ?? 0) - (a.popularity ?? 0)

        case 'Newest': {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
          if (db !== da) return db - da
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
        }

        case 'Difficulty': {
          const difficultyOrder = { fundamental: 1, medium: 2, hard: 3 }
          return (difficultyOrder[aComp.toLowerCase()] || 99) - (difficultyOrder[bComp.toLowerCase()] || 99)
        }

        case 'Progress':
          return (b.progress ?? 0) - (a.progress ?? 0)

        default:
          return 0
      }
    })

    const q = debouncedSearch?.toLowerCase?.() ?? ''
    if (!q) return sorted

    return sorted.filter((m) => {
      const title = safeString(m.title).toLowerCase()
      const desc = safeString(m.description || m.detail || '').toLowerCase()
      const topics = Array.isArray(m.topics) ? m.topics.map(t => safeString(t).toLowerCase()) : []
      return (
        title.includes(q) ||
        desc.includes(q) ||
        topics.some(t => t.includes(q))
      )
    })
  }, [modulesRaw, filter, sort, debouncedSearch])

  
  useEffect(() => {
  if (!userId) return;
  let cancelled = false;

  const fetchProgress = async () => {
    setLoadingProgress(true);
    try {

      const res = await axios.get(`http://localhost:5001/api/progress/user/${userId}`, {
        withCredentials: true,
      });

      if (!cancelled) {
        console.log('Fetched progressData:', res.data);
        setProgressData(res.data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      if (!cancelled) setErrorProgress(err);
    } finally {
      if (!cancelled) setLoadingProgress(false);
    }
  };

  fetchProgress();
  return () => { cancelled = true; };
}, [userId]);

const hoursLearned = useMemo(() => {
  if (!progressData?.courses) return 0;
  // Example: 1 hour per module
  return progressData.courses.reduce((sum, course) => sum + (course.completedModules || 0), 0);
}, [progressData]);
 const stats = [
  { label: 'Total Courses', value: modulesRaw.length.toString() || '0', icon: BookOpen, color: 'blue' },
  { label: 'Completed', value: progressData?.summary?.completedCount?.toString() || '0', icon: Target, color: 'green' },
  { label: 'In Progress', value: progressData?.summary?.inProgressCount?.toString() || '0', icon: TrendingUp, color: 'yellow' },
  { label: 'Hours Learned', value: hoursLearned.toString(), icon: Clock, color: 'purple' }
];

  const filters = ['All', 'Fundamental', 'Medium', 'Hard']
  const sortOptions = ['Popular', 'Newest', 'Difficulty', 'Progress']

  // Helper: check enrollment for a courseId (note: course objects use .id)
  const isCourseEnrolled = useCallback((courseId) => {
    return enrolledSet.has(courseId)
  }, [enrolledSet])

  // Parent handler for start button (enroll once then navigate)
  const handleStart = useCallback(async (module) => {
  const id = module.id || module._id || module.courseId

  // 1) Prefer page-level user prop (you pass `user` into ModulesPage)
  let userIdLocal = null
  try {
    if (user && (user._id || user.id)) {
      userIdLocal = user._id || user.id
      console.log('handleStart: using page prop userId=', userIdLocal)
    }
  } catch {}

  // 2) Fallback: hook from Zustand (if it returns something)
  try {
    if (!userIdLocal) {
      const authFromHook = useAuthStore ? useAuthStore((s) => s.user) : null
      if (authFromHook && (authFromHook._id || authFromHook.id)) {
        userIdLocal = authFromHook._id || authFromHook.id
        console.log('handleStart: using useAuthStore hook userId=', userIdLocal)
      }
    }
  } catch (e) {
    console.warn('handleStart: useAuthStore hook check failed', e)
  }

  // 3) Fallback: sync store getState (if available)
  try {
    if (!userIdLocal && useAuthStore && typeof useAuthStore.getState === 'function') {
      const stateUser = useAuthStore.getState().user
      if (stateUser && (stateUser._id || stateUser.id)) {
        userIdLocal = stateUser._id || stateUser.id
        console.log('handleStart: using useAuthStore.getState userId=', userIdLocal)
      }
    }
  } catch (e) {
    console.warn('handleStart: useAuthStore.getState check failed', e)
  }

  // 4) Fallback: localStorage 'user'
  if (!userIdLocal) {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && (parsed._id || parsed.id)) {
          userIdLocal = parsed._id || parsed.id
          console.log('handleStart: using localStorage userId=', userIdLocal)
        }
      }
    } catch (e) {
      console.warn('handleStart: parse localStorage user failed', e)
    }
  }

  // 5) Fallback: token -> try /me endpoints (lib/api attaches token)
  if (!userIdLocal) {
    const token =
      localStorage.getItem('clp_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      null

    if (token) {
      console.log('handleStart: token found, attempting /me lookup')
      try {
        const tryEndpoints = ['/api/auth/me', '/api/users/me', '/auth/me', '/users/me']
        for (const ep of tryEndpoints) {
          try {
            const res = await api.get(ep).catch(() => null)
            if (res && res.data) {
              const u = res.data.user ?? res.data
              const gotId = u?._id || u?.id || null
              if (gotId) {
                userIdLocal = gotId
                try { localStorage.setItem('user', JSON.stringify(u)) } catch {}
                console.log('handleStart: fetched user from', ep, 'userId=', userIdLocal)
                break
              }
            }
          } catch (innerErr) {
            // ignore and continue
          }
        }
      } catch (err) {
        console.warn('handleStart: error during /me lookup', err)
      }
    } else {
      console.log('handleStart: no token in localStorage')
    }
  }

  // Final check
  if (!userIdLocal) {
    console.log('handleStart: no userId found -> redirect to login')
    const returnTo = encodeURIComponent(window.location.pathname)
    window.location.href = `/login?returnTo=${returnTo}`
    return
  }

  // Proceed to enroll / navigate
  try {
    if (enrolledSet.has(id)) {
      console.log('handleStart: already enrolled -> navigate to course', id)
      window.location.href = `/courses/${id}`
      return
    }

    console.log('handleStart: enrolling userId=', userIdLocal, 'courseId=', id)
    await courseService.enrollCourse({ userId: userIdLocal, courseId: id })

    setEnrolledSet((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    toast.success('Enrolled successfully')
    window.location.href = `/courses/${id}`
  } catch (err) {
    console.error('handleStart: enroll error', err)
    const message = err?.response?.data?.message || err?.message || 'Could not enroll'
    toast.error(String(message))
  }
}, [enrolledSet, user, useAuthStore])


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar user={user} />

      <main className="p-3 pt-[70px] md:pt-6 md:ml-80 overflow-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <motion.h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                Learning Courses
              </motion.h1>
              <motion.p className="text-gray-400 text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                Master cybersecurity through hands-on modules and real-world scenarios
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-4">
              <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-700">
                {['grid', 'list'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === mode ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {mode === 'grid' ? 'Grid' : 'List'}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = {
                blue: 'from-blue-500 to-cyan-500',
                green: 'from-green-500 to-emerald-500',
                yellow: 'from-yellow-500 to-orange-500',
                purple: 'from-purple-500 to-pink-500'
              }
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + index * 0.1 }} whileHover={{ y: -5, scale: 1.02 }} className={`bg-gradient-to-br ${colorClasses[stat.color]} rounded-2xl p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-4 right-4 opacity-20"><Icon className="w-8 h-8" /></div>
                  <div className="relative z-10">
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-3 md:p-6  border border-gray-700/50 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              <div className="flex-1 w-full">
                <Input icon="🔍" placeholder="Search modules, topics, or skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Filter className="w-5  h-5 text-gray-400" />
                  <div className="flex flex-wrap   gap-2">
                    {filters.map((filterOption) => (
                      <button key={filterOption} onClick={() => setFilter(filterOption)} className={`sm:px-4 sm:py-2 px-4 py-1 rounded-xl text-sm sm:flex  sm:text-sm font-medium transition-all ${filter === filterOption ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                        {filterOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-medium">Sort by:</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                    {sortOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Available Courses {searchResults.length > 0 && `(${searchResults.length})`}</h2>
            <div className="text-gray-400 text-sm">Showing {searchResults.length} of {modulesRaw.length} modules</div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-300">Loading courses...</motion.div>
            ) : error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-red-400">Error loading courses. Check console for details.</motion.div>
            ) : searchResults.length > 0 ? (
              <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {searchResults.map((module, index) => (
                  <motion.div key={module.id || module._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} layout>
                    <ModuleCard
                      module={module}
                      showProgress={true}
                      showActions={true}
                      viewMode={viewMode}
                      isEnrolled={isCourseEnrolled(module.id || module._id)}
                      onStart={handleStart}
                      userId={user._id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-300 mb-4">No modules found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">Try adjusting your search terms or filters to find what you're looking for.</p>
                <Button onClick={() => { setSearchTerm(''); setDebouncedSearch(''); setFilter('All') }} variant="secondary" icon="🔄">Reset Filters</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">🎯 Personalized Learning Path</h3>
              <p className="text-gray-300 mb-4">Based on your progress, we recommend starting with Threat Detection Fundamentals to build a strong foundation.</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-full"></div><span>Recommended for beginners</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>8-10 hours to complete</span></div>
              </div>
            </div>
            <Button size="lg" icon="🚀" className="whitespace-nowrap">Start Learning Path</Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
