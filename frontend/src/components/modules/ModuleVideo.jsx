// src/components/modules/ModuleVideo.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, CheckCircle } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function ModuleVideo({ module, onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(module.completion.video)
  const videoRef = useRef(null)

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`video-${module.id}-progress`)
    if (savedProgress) {
      setProgress(parseFloat(savedProgress))
    }
  }, [module.id])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setProgress((current / total) * 100)
      
      // Save progress to localStorage
      localStorage.setItem(`video-${module.id}-progress`, (current / total).toString())
      
      // Mark as completed if watched 95% of the video
      if (current / total > 0.95 && !hasCompleted) {
        setHasCompleted(true)
        onComplete(true)
      }
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    if (videoRef.current) {
      videoRef.current.currentTime = percent * videoRef.current.duration
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Video Player */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-0 overflow-hidden">
        <div className="relative bg-black aspect-video">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => {
              setIsPlaying(false)
              setHasCompleted(true)
              onComplete(true)
            }}
          >
            <source src={module.video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div 
              className="w-full bg-gray-600 h-2 rounded-full mb-4 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-400 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                
                <div className="text-gray-300 text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {hasCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                <span className="text-gray-300 text-sm">
                  {hasCompleted ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Video Info */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{module.title}</h2>
            <p className="text-gray-400">{module.description}</p>
          </div>
          <div className="text-sm text-gray-300">
            Duration: {module.video.duration}
          </div>
        </div>
      </Card>

      {/* Transcript */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Transcript</h3>
        <div className="space-y-3">
          {module.video.transcript.split('\n').map((line, index) => {
            const [timestamp, ...textParts] = line.split(' - ')
            const text = textParts.join(' - ')
            
            return (
              <div key={index} className="flex gap-4">
                <span className="text-cyan-400 text-sm font-mono flex-shrink-0">
                  {timestamp}
                </span>
                <p className="text-gray-300 flex-1">{text}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}