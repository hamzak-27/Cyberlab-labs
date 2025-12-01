import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, Terminal, Globe, Clock, Flag, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import api from '../../lib/api'

export default function ActiveLabSession({ session, lab, onTerminate }) {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [userFlag, setUserFlag] = useState('')
  const [rootFlag, setRootFlag] = useState('')
  const [flagStatus, setFlagStatus] = useState({
    user: { submitted: false, correct: null, message: '', points: 0 },
    root: { submitted: false, correct: null, message: '', points: 0 }
  })
  const [submitting, setSubmitting] = useState({ user: false, root: false })
  const [terminating, setTerminating] = useState(false)

  // Live countdown timer
  useEffect(() => {
    const calculateRemaining = () => {
      const remaining = Math.max(0, new Date(session.expiresAt) - new Date())
      setTimeRemaining(remaining)
      if (remaining === 0) {
        alert('Session expired!')
        onTerminate()
      }
    }

    calculateRemaining()
    const interval = setInterval(calculateRemaining, 1000)
    return () => clearInterval(interval)
  }, [session.expiresAt, onTerminate])

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copied to clipboard!`)
  }

  const downloadVPN = async () => {
    try {
      const response = await api.get(`/api/sessions/${session.sessionId}/vpn-config`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `cyberlabs-${session.sessionId.slice(0, 8)}.ovpn`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download VPN config:', error)
      alert('Failed to download VPN configuration')
    }
  }

  const submitFlag = async (flagType) => {
    const flagValue = flagType === 'user' ? userFlag : rootFlag
    
    if (!flagValue.trim()) {
      alert('Please enter a flag')
      return
    }

    setSubmitting(prev => ({ ...prev, [flagType]: true }))

    try {
      const { data } = await api.post(`/api/sessions/${session.sessionId}/flags`, {
        flagName: flagType,
        flag: flagValue.trim()
      })

      if (data.data.success) {
        setFlagStatus(prev => ({
          ...prev,
          [flagType]: {
            submitted: true,
            correct: true,
            message: data.data.message || 'Correct!',
            points: data.data.points || 0
          }
        }))
        if (flagType === 'user') setUserFlag('')
        if (flagType === 'root') setRootFlag('')
      } else {
        setFlagStatus(prev => ({
          ...prev,
          [flagType]: {
            submitted: true,
            correct: false,
            message: data.data.message || 'Incorrect flag',
            points: 0
          }
        }))
      }
    } catch (error) {
      console.error('Failed to submit flag:', error)
      alert(error.response?.data?.message || 'Failed to submit flag')
    } finally {
      setSubmitting(prev => ({ ...prev, [flagType]: false }))
    }
  }

  const terminateSession = async () => {
    if (!confirm('Are you sure you want to terminate this session?')) return
    
    setTerminating(true)
    try {
      await api.post(`/api/sessions/${session.sessionId}/stop`)
      onTerminate()
    } catch (error) {
      console.error('Failed to terminate session:', error)
      alert('Failed to terminate session')
      setTerminating(false)
    }
  }

  const vmIP = session.connectionInfo?.ipAddress || 'N/A'
  const sshCommand = session.connectionInfo?.sshCommand || `ssh user@${vmIP}`
  const webUrl = session.connectionInfo?.webUrl || `http://${vmIP}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Target Machine Card */}
      <Card gradient={true}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              {lab.name} - Active Session
            </h2>
            <p className="text-gray-400">Target machine is running</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            timeRemaining < 600000 ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
          }`}>
            <Clock className="w-4 h-4 inline mr-2" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* VM IP Display - HackTheBox Style */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Target IP Address</p>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-mono font-bold text-white">{vmIP}</span>
                <button
                  onClick={() => copyToClipboard(vmIP, 'IP Address')}
                  className="p-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl transition-colors"
                  title="Copy IP"
                >
                  <Copy className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
            </div>
            <div className="text-6xl">
              🎯
            </div>
          </div>
        </div>

        {/* VPN Required Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-400 mb-1">VPN Connection Required</h4>
              <p className="text-yellow-300 text-sm mb-3">
                You must connect to the VPN to access this lab machine. Download the configuration file and connect using OpenVPN.
              </p>
              <Button
                onClick={downloadVPN}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-300"
              >
                Download VPN Config (.ovpn)
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Connection Methods Card */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Terminal className="w-6 h-6" />
          Connection Methods
        </h3>
        
        <div className="space-y-4">
          {/* SSH */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">SSH Access</span>
              <button
                onClick={() => copyToClipboard(sshCommand, 'SSH Command')}
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <code className="text-white font-mono text-sm block bg-gray-900/50 px-4 py-2 rounded-lg">
              {sshCommand}
            </code>
          </div>

          {/* Web */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Web Interface
              </span>
              <button
                onClick={() => copyToClipboard(webUrl, 'Web URL')}
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <code className="text-white font-mono text-sm block bg-gray-900/50 px-4 py-2 rounded-lg">
              {webUrl}
            </code>
          </div>
        </div>
      </Card>

      {/* Flag Submission Card */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Flag className="w-6 h-6" />
          Flag Submission
        </h3>

        <div className="space-y-6">
          {/* User Flag */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-300 font-medium">
                User Flag <span className="text-cyan-400">({lab.flags?.user?.points || 25} points)</span>
              </label>
              {flagStatus.user.submitted && (
                <span className={`flex items-center gap-2 text-sm ${
                  flagStatus.user.correct ? 'text-green-400' : 'text-red-400'
                }`}>
                  {flagStatus.user.correct ? (
                    <><CheckCircle className="w-4 h-4" /> Correct! +{flagStatus.user.points}</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Incorrect</>
                  )}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Input
                value={userFlag}
                onChange={(e) => setUserFlag(e.target.value)}
                placeholder="FLAG{...}"
                disabled={flagStatus.user.correct}
                className="flex-1 font-mono"
              />
              <Button
                onClick={() => submitFlag('user')}
                disabled={submitting.user || flagStatus.user.correct || !userFlag.trim()}
                icon="🎯"
              >
                {submitting.user ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Root Flag */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-300 font-medium">
                Root Flag <span className="text-cyan-400">({lab.flags?.root?.points || 50} points)</span>
              </label>
              {flagStatus.root.submitted && (
                <span className={`flex items-center gap-2 text-sm ${
                  flagStatus.root.correct ? 'text-green-400' : 'text-red-400'
                }`}>
                  {flagStatus.root.correct ? (
                    <><CheckCircle className="w-4 h-4" /> Correct! +{flagStatus.root.points}</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Incorrect</>
                  )}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Input
                value={rootFlag}
                onChange={(e) => setRootFlag(e.target.value)}
                placeholder="FLAG{...}"
                disabled={flagStatus.root.correct}
                className="flex-1 font-mono"
              />
              <Button
                onClick={() => submitFlag('root')}
                disabled={submitting.root || flagStatus.root.correct || !rootFlag.trim()}
                icon="🎯"
              >
                {submitting.root ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-4">
            Flags are usually in the format: <code className="text-cyan-400 font-mono">FLAG{'{'}...{'}'}</code>
          </p>
        </div>
      </Card>

      {/* Terminate Session Button */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white mb-1">Session Control</h4>
            <p className="text-gray-400 text-sm">Terminate this session when you're done</p>
          </div>
          <Button
            onClick={terminateSession}
            disabled={terminating}
            variant="secondary"
            className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400"
            icon="🛑"
          >
            {terminating ? 'Terminating...' : 'Terminate Session'}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
