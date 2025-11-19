import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search as SearchIcon, 
  Bell, 
  Users, 
  Trophy, 
  MessageCircle, 
  ThumbsUp, 
  Share2, 
  Bookmark,
  TrendingUp,
  Award,
  Calendar,
  Clock
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Community({user}) {
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [studyGroups, setStudyGroups] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState(null)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // mobile sidebar
  const [showSearch, setShowSearch] = useState(false) // mobile search bar

  useEffect(() => {
    // Enhanced demo data
    setPosts([
      { 
        id: 1, 
        user: 'Jane Cooper', 
        role: 'Security Analyst',
        avatar: '👩‍💻',
        text: 'New vulnerability in Windows Server – anyone has resources for mitigation? Found this CVE-2024-12345 that looks critical. Working on a write-up for the techniques used.', 
        votes: 12,
        comments: 8,
        time: '2 hours ago',
        tags: ['vulnerability', 'windows', 'resources', 'CVE'],
        type: 'question',
        userScore: 2450,
        isVerified: true
      },
      { 
        id: 2, 
        user: 'Mike Chen', 
        role: 'CEH Candidate',
        avatar: '👨‍💻',
        text: 'Study Group for CEH exam prep — we meet every Wednesday at 7 PM EST. Focus on module 3 this week! We\'ll be covering network scanning techniques and tools.', 
        votes: 23,
        comments: 15,
        time: '5 hours ago',
        tags: ['study-group', 'ceh', 'exam-prep', 'networking'],
        type: 'announcement',
        userScore: 1870,
        isVerified: false
      },
      { 
        id: 3, 
        user: 'Sarah Johnson', 
        role: 'Senior Pentester',
        avatar: '👩‍🎓',
        text: 'Just completed the Advanced Penetration Testing module! The buffer overflow lab was challenging but super rewarding. Anyone else working on it? Would love to discuss the exploitation techniques!', 
        votes: 45,
        comments: 22,
        time: '1 day ago',
        tags: ['achievement', 'pentesting', 'labs', 'buffer-overflow'],
        type: 'achievement',
        userScore: 3240,
        isVerified: true
      }
    ])

    setStudyGroups([
      {
        id: 1,
        name: 'CEH Certification Prep',
        members: 24,
        active: true,
        lastActivity: '2 hours ago',
        nextMeeting: 'Tomorrow, 7 PM EST',
        category: 'Certification',
        progress: 65
      },
      {
        id: 2,
        name: 'Network Defense Study',
        members: 18,
        active: true,
        lastActivity: '5 hours ago',
        nextMeeting: 'Friday, 6 PM EST',
        category: 'Networking',
        progress: 42
      },
      {
        id: 3,
        name: 'Web App Security',
        members: 32,
        active: false,
        lastActivity: '2 days ago',
        nextMeeting: 'Next week',
        category: 'Web Security',
        progress: 78
      }
    ])

    setLeaderboard([
      { id: 1, name: 'Sarah Johnson', role: 'Senior Pentester', points: 1245, avatar: '👩‍🎓', change: '+2', trend: 'up' },
      { id: 2, name: 'TechDefender', role: 'Bug Bounty Hunter', points: 1187, avatar: '🦸‍♂️', change: '+1', trend: 'up' },
      { id: 3, name: 'Mike Chen', role: 'CEH Candidate', points: 976, avatar: '👨‍💻', change: '+3', trend: 'up' },
      { id: 4, name: 'Jane Cooper', role: 'Security Analyst', points: 845, avatar: '👩‍💻', change: '-1', trend: 'down' },
      { id: 5, name: 'Alex Rivera', role: 'SOC Analyst', points: 789, avatar: '👨‍🔬', change: '+2', trend: 'up' }
    ])

    setNotifications([
      { id: 1, text: 'Mike replied to your post about network security', time: '10 min ago', read: false, type: 'reply' },
      { id: 2, text: 'Your post got 5 upvotes from the community', time: '1 hour ago', read: false, type: 'upvote' },
      { id: 3, text: 'New study group created for Cloud Security', time: '3 hours ago', read: true, type: 'announcement' }
    ])

    setStats({
      communityRank: 42,
      postsMade: 15,
      helpfulVotes: 89,
      groupsJoined: 3,
      reputation: 245
    })
  }, [])

  const createPost = async () => {
    if (!text.trim()) return
    
    const temp = { 
      id: Date.now(), 
      user: 'You', 
      role: 'Member',
      avatar: '👤',
      text, 
      votes: 0,
      comments: 0,
      time: 'Just now',
      tags: [],
      type: 'discussion',
      userScore: stats?.reputation || 0,
      isVerified: false
    }
    
    setPosts((p) => [temp, ...p])
    setText('')
  }

  const upvote = async (id) => {
    setPosts((p) => p.map(x => x.id === id ? {...x, votes: x.votes + 1 } : x))
  }

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true
    return post.type === activeTab
  })

  const unreadNotifications = notifications.filter(n => !n.read).length

  const postTypes = [
    { id: 'all', label: 'All Posts', icon: '💬', color: 'from-blue-500 to-cyan-500' },
    { id: 'question', label: 'Questions', icon: '❓', color: 'from-green-500 to-emerald-500' },
    { id: 'announcement', label: 'Announcements', icon: '📢', color: 'from-purple-500 to-pink-500' },
    { id: 'achievement', label: 'Achievements', icon: '🏆', color: 'from-yellow-500 to-orange-500' }
  ]

  const communityStats = [
    { label: 'Community Rank', value: `#${stats?.communityRank || 42}`, icon: Trophy, color: 'from-cyan-500 to-blue-500' },
    { label: 'Posts Made', value: stats?.postsMade || 15, icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Helpful Votes', value: stats?.helpfulVotes || 89, icon: ThumbsUp, color: 'from-yellow-500 to-orange-500' },
    { label: 'Reputation', value: stats?.reputation || 245, icon: TrendingUp, color: 'from-purple-500 to-pink-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Desktop sidebar always shown via your Sidebar component */}
      <Sidebar user={user} />

      <main className="p-4 md:p-6 pt-[70px] md:pt-6 md:ml-80 overflow-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.h1 
                className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                Cybersecurity Community
              </motion.h1>
              <motion.p 
                className="text-gray-400 text-sm md:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
              >
                Connect, learn, and grow with fellow cybersecurity enthusiasts
              </motion.p>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Desktop search */}
              <div className="hidden md:block w-full md:max-w-md">
                <Input
                  icon={<SearchIcon className="w-4 h-4" />}
                  placeholder="Search discussions, users, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Mobile search toggle */}
              <button
                onClick={() => setShowSearch(true)}
                className="md:hidden p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                aria-label="Open search"
              >
                <SearchIcon className="w-5 h-5 text-gray-200" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  icon={<Bell className="w-4 h-4" />}
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="relative"
                >
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>

                {/* Notification Panel - responsive width */}
                <AnimatePresence>
                  {showNotificationPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      className="absolute right-0 top-12 w-full max-w-xs sm:max-w-sm bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-cyan-500/20 z-50"
                    >
                      <div className="p-3 border-b border-gray-700">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          Notifications
                        </h3>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map(notification => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 border-b border-gray-700/50 ${
                              !notification.read ? 'bg-cyan-500/8' : ''
                            }`}
                          >
                            <p className="text-sm text-white truncate">{notification.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="p-3 text-center border-t border-gray-700">
                        <button className="text-cyan-400 text-sm hover:text-cyan-300 font-medium">
                          Mark all as read
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* New Post button */}
              <Button 
                onClick={() => document.getElementById('post-creator')?.scrollIntoView({ behavior: 'smooth' })}
                icon="📝"
              >
                <span className="hidden md:inline">New Post</span>
              </Button>

              {/* Mobile sidebar toggle */}
              <button
                className="md:hidden p-2 rounded-lg bg-gray-800/50"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open menu"
              >
                <span className="text-white text-lg">☰</span>
              </button>
            </div>
          </div>

          {/* Community Stats - responsive grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-5"
          >
            {communityStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.06 + index * 0.03 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-lg p-4 text-white relative overflow-hidden bg-gradient-to-br ${stat.color}`}
                >
                  <div className="absolute top-3 right-3 opacity-15 pointer-events-none">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-lg md:text-2xl font-bold leading-none">{stat.value}</div>
                    <div className="text-xs md:text-sm opacity-90">{stat.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Mobile search overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 p-4 bg-black/40 md:hidden"
              onClick={() => setShowSearch(false)}
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="mx-auto max-w-lg"
              >
                <Input
                  icon={<SearchIcon className="w-4 h-4" />}
                  placeholder="Search discussions, users, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main column (2/3 on lg) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post creator */}
            <motion.div id="post-creator" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card gradient={true}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    Y
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg">Create a Post</h3>
                        <p className="text-gray-400 text-sm">Share news, ask questions, or celebrate wins with the community</p>
                      </div>
                      <div className="hidden sm:block">
                        <Button onClick={createPost} disabled={!text.trim()} icon="🚀">
                          Publish Post
                        </Button>
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="What's on your mind? Share your cybersecurity insights, questions, or achievements..."
                      className="mt-4 w-full p-3 rounded-lg bg-gray-800/60 border border-gray-700 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />

                    {/* Mobile publish */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span>💡</span>
                        <span className="hidden sm:inline">Be respectful — this is a supportive community</span>
                        <span className="sm:hidden">Be respectful</span>
                      </div>

                      <div className="sm:hidden">
                        <Button onClick={createPost} disabled={!text.trim()} icon="🚀">
                          Publish
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Post filter tabs */}
            <motion.div className="flex overflow-x-auto gap-2 pb-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              {postTypes.map(type => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setActiveTab(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                    activeTab === type.id ? `bg-gradient-to-r ${type.color} text-white` : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-base">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Posts feed */}
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AnimatePresence>
                {filteredPosts.map((post, idx) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} layout>
                    <Card hover gradient={true}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg sm:text-xl">
                              {post.avatar}
                            </div>
                            {post.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white text-sm truncate">{post.user}</h4>
                                <span className="text-xs text-gray-400 hidden sm:inline">{post.role}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                                <span>{post.time}</span>
                                <span>•</span>
                                <span className="text-cyan-400">{post.userScore} pts</span>
                              </div>
                            </div>

                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              post.type === 'question' ? 'bg-blue-500/20 text-blue-400' :
                              post.type === 'announcement' ? 'bg-purple-500/20 text-purple-400' :
                              post.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                            </span>
                          </div>

                          <p className="text-gray-300 mt-3 mb-3 leading-relaxed break-words">{post.text}</p>

                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map((t, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300">#{t}</span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                            <button onClick={() => upvote(post.id)} className="flex items-center gap-2 group">
                              <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-cyan-500/20">
                                <ThumbsUp className="w-4 h-4" />
                              </div>
                              <span className="text-sm">{post.votes} votes</span>
                            </button>

                            <button className="flex items-center gap-2 group">
                              <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-cyan-500/20">
                                <MessageCircle className="w-4 h-4" />
                              </div>
                              <span className="text-sm">{post.comments} comments</span>
                            </button>

                            {/* hide less important on xs */}
                            <div className="hidden sm:flex items-center gap-3">
                              <button className="flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-cyan-500/20">
                                  <Share2 className="w-4 h-4" />
                                </div>
                                <span className="text-sm">Share</span>
                              </button>

                              <button className="flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-cyan-500/20">
                                  <Bookmark className="w-4 h-4" />
                                </div>
                                <span className="text-sm">Save</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredPosts.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts found</h3>
                  <p className="text-gray-400 mb-4 max-w-md mx-auto">Try selecting a different category or be the first to post in this category!</p>
                  <Button onClick={() => setActiveTab('all')} variant="secondary" icon="🔄">Show All Posts</Button>
                </motion.div>
              )}

              <div className="text-center mt-4">
                <Button variant="ghost" icon="📚">Load More Posts</Button>
              </div>
            </motion.div>
          </div>

          {/* Right sidebar (1 column on mobile below main) */}
          <div className="space-y-6">
            {/* Study groups */}
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <Card gradient={true}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Study Groups
                  </h3>
                  <Button variant="ghost" size="sm" icon="➕">Join</Button>
                </div>

                <div className="space-y-3">
                  {studyGroups.map((g, i) => (
                    <div key={g.id} className={`p-3 rounded-xl border ${g.active ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-gray-700 bg-gray-800/30'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white text-sm truncate">{g.name}</h4>
                        {g.active && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">Active</span>}
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{g.members} members</span></div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Last: {g.lastActivity}</span></div>
                        {g.nextMeeting && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Next: {g.nextMeeting}</span></div>}
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Group Progress</span>
                          <span>{g.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${g.progress}%` }} />
                        </div>
                      </div>

                      <div className="mt-3">
                        <Button variant="ghost" size="sm" className="w-full">View Group</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <Card gradient={true}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2"><Trophy className="w-5 h-5" />Top Contributors</h3>
                  <span className="text-sm text-gray-400">This Week</span>
                </div>

                <div className="space-y-2">
                  {leaderboard.map((u, i) => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-700/30 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i===0?'bg-yellow-500/20 text-yellow-400': i===1?'bg-gray-500/20 text-gray-400' : 'bg-gray-700/50 text-gray-400'}`}>#{i+1}</div>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-xl">{u.avatar}</div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm truncate">{u.name}</div>
                          <div className="text-xs text-gray-400 truncate">{u.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-cyan-400 text-sm">{u.points} pts</div>
                        <div className={`text-xs ${u.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{u.change}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-700 text-center">
                  <div className="text-sm text-gray-300 mb-1">Your Ranking</div>
                  <div className="text-xl font-bold text-cyan-400">#{stats?.communityRank || 42}</div>
                  <div className="text-xs text-gray-400 mt-1">{stats?.helpfulVotes || 89} helpful votes this month</div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <Card gradient={true} className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <h4 className="font-bold text-white text-lg mb-3 flex items-center gap-2"><Award className="w-5 h-5" />Get Involved</h4>
                <p className="text-cyan-100 mb-4 text-sm">Help others, share knowledge, and grow together as a cybersecurity community</p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start" icon="🎯">Become a Mentor</Button>
                  <Button variant="secondary" className="w-full justify-start" icon="📅">Host a Session</Button>
                  <Button variant="secondary" className="w-full justify-start" icon="💡">Share Resources</Button>
                </div>
              </Card>
            </motion.div>

            {/* Events */}
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <Card gradient={true}>
                <h4 className="font-bold text-white text-lg mb-3 flex items-center gap-2"><Calendar className="w-5 h-5" />Upcoming Events</h4>
                <div className="space-y-2">
                  {[
                    { title: 'CTF Competition', date: 'Tomorrow', participants: 45 },
                    { title: 'Guest Speaker: Cloud Security', date: 'Friday', participants: 28 },
                    { title: 'Code Review Session', date: 'Next Week', participants: 32 }
                  ].map((event, i) => (
                    <div key={i} className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                      <div className="font-medium text-white text-sm truncate">{event.title}</div>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                        <span>📅 {event.date}</span>
                        <span>👥 {event.participants}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween' }}
                className="fixed right-0 top-0 z-50 h-full w-80 max-w-full bg-gray-900 border-l border-gray-700 overflow-y-auto p-4 md:hidden"
              >
                <div className="flex justify-end mb-4">
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-800">
                    <span className="text-white">✕</span>
                  </button>
                </div>

                {/* replicate important sidebar content for mobile */}
                <div className="space-y-4">
                  <Card gradient={true}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white">Study Groups</h3>
                      <Button variant="ghost" size="sm" icon="➕">Join</Button>
                    </div>
                    <div className="space-y-3">
                      {studyGroups.map(g => (
                        <div key={g.id} className="p-2 rounded-lg border border-gray-700/40">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-white truncate">{g.name}</div>
                            {g.active && <span className="text-xs text-green-400">Active</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card gradient={true}>
                    <h3 className="font-bold text-white mb-2">Top Contributors</h3>
                    <div className="space-y-2">
                      {leaderboard.map(u => (
                        <div key={u.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-lg">{u.avatar}</div>
                            <div className="text-sm text-white truncate">{u.name}</div>
                          </div>
                          <div className="text-sm text-cyan-400">{u.points} pts</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card gradient={true}>
                    <h3 className="font-bold text-white mb-2">Get Involved</h3>
                    <div className="space-y-2">
                      <Button variant="secondary" className="w-full justify-start">Become a Mentor</Button>
                      <Button variant="secondary" className="w-full justify-start">Host a Session</Button>
                    </div>
                  </Card>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
