import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Flag, Users, Target, Server, Shield } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../lib/api'
import ActiveLabSession from '../components/labs/ActiveLabSession'

export default function LabDetailsPage({ user }) {
  const { labId } = useParams()
  const navigate = useNavigate()
  const [lab, setLab] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLabAndSession()
  }, [labId])

  const fetchLabAndSession = async () => {
    try {
      setLoading(true)
      
      // Fetch lab details
      const { data: labData } = await api.get(`/api/labs/${labId}`)
      setLab(labData.data || labData)
      
      // Check for active session
      const { data: sessionsData } = await api.get('/api/sessions/active')
      const sessions = sessionsData.data?.sessions || []
      const session = sessions.find(s => s.lab?.id === labId)
      setActiveSession(session)
      
      setError(null)
    } catch (err) {
      console.error('Error fetching lab:', err)
      setError(err.response?.data?.message || 'Failed to load lab')
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    try {
      setStarting(true)
      const { data } = await api.post('/api/sessions/start', { labId })
      setActiveSession(data.data)
      setError(null)
    } catch (err) {
      console.error('Failed to start session:', err)
      alert(err.response?.data?.message || 'Failed to start session')
    } finally {
      setStarting(false)
    }
  }

  const handleTerminate = () => {
    setActiveSession(null)
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'from-green-500 to-emerald-500',
      Medium: 'from-yellow-500 to-orange-500',
      Hard: 'from-red-500 to-pink-500'
    }
    return colors[difficulty] || 'from-gray-500 to-gray-600'
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Web': '🌐',
      'Binary': '💥',
      'Network': '🔌',
      'Crypto': '🔐',
      'Forensics': '🔍',
      'Misc': '🎯'
    }
    return emojis[category] || '🔬'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Sidebar user={user} />
        <main className="p-6 pt-[70px] md:pt-6 md:ml-80">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Loading lab details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Sidebar user={user} />
        <main className="p-6 pt-[70px] md:pt-6 md:ml-80">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Link to="/labs">
              <Button variant="secondary">Back to Labs</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!lab) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar user={user} />
      
      <main className="p-6 pt-[70px] md:pt-6 md:ml-80">
        {/* Back Button */}
        <Link to="/labs">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Labs</span>
          </button>
        </Link>

        {!activeSession ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Lab Header Card */}
            <Card gradient={true}>
              <div className="flex items-start gap-6 mb-8">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getDifficultyColor(lab.difficulty)} flex items-center justify-center text-4xl flex-shrink-0`}>
                  {getCategoryEmoji(lab.category)}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-3">{lab.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${getDifficultyColor(lab.difficulty)} text-white font-semibold`}>
                      {lab.difficulty}
                    </span>
                    <span className="flex items-center gap-2 text-gray-300">
                      <Target className="w-4 h-4" />
                      {lab.category}
                    </span>
                    <span className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      {lab.estimatedSolveTime}
                    </span>
                    <span className="flex items-center gap-2 text-gray-300">
                      <Flag className="w-4 h-4" />
                      {(lab.flags?.user?.points || 25) + (lab.flags?.root?.points || 50)} points
                    </span>
                    <span className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      {lab.stats?.totalSessions || 0} attempts
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{lab.description}</p>
              </div>

              {/* Services */}
              {lab.services && lab.services.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lab.services.map((service, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vulnerabilities */}
              {lab.vulnerabilities && lab.vulnerabilities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Vulnerabilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lab.vulnerabilities.map((vuln, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-sm"
                      >
                        {vuln}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials */}
              {lab.defaultCredentials && (
                <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">🔑 Default Credentials</h4>
                  <p className="text-yellow-300 text-sm">
                    Username: <span className="font-mono font-bold">{lab.defaultCredentials.username}</span>
                  </p>
                </div>
              )}

              {/* Start Lab Button */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
                <h4 className="font-semibold text-cyan-400 mb-3">🎯 Ready to start?</h4>
                <p className="text-cyan-300 text-sm mb-4">
                  This lab will spawn a dedicated VM instance for you. You'll need to connect via VPN to access it.
                </p>
                <Button
                  onClick={startSession}
                  className="w-full"
                  disabled={starting}
                  icon="🚀"
                >
                  {starting ? 'Starting Lab...' : 'Start Lab Session'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <ActiveLabSession 
            session={activeSession} 
            lab={lab}
            onTerminate={handleTerminate}
          />
        )}
      </main>
    </div>
  )
}
