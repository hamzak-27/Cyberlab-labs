import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, Zap, TrendingUp, Play, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

// Dummy cybersecurity courses data
const cybersecurityCourses = [
  {
    _id: "1",
    title: "Ethical Hacking Fundamentals",
    detail: "Learn the basics of ethical hacking, penetration testing, and security assessment. Master tools like Metasploit, Nmap, and Wireshark.",
    complexity: "Fundamental",
    hours: 12,
    tag: ["Hacking", "Penetration Testing", "Kali Linux", "Metasploit"],
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    _id: "2",
    title: "Network Security Mastery",
    detail: "Comprehensive guide to securing networks, firewalls, intrusion detection systems, and VPN configurations.",
    complexity: "Medium",
    hours: 18,
    tag: ["Networking", "Firewalls", "IDS/IPS", "VPN", "Cisco"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
  },
  {
    _id: "3",
    title: "Advanced Threat Intelligence",
    detail: "Deep dive into advanced persistent threats, malware analysis, and cyber threat intelligence frameworks.",
    complexity: "Advanced",
    hours: 24,
    tag: ["Threat Analysis", "Malware", "APTs", "Incident Response"],
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    _id: "4",
    title: "Web Application Security",
    detail: "Master OWASP Top 10 vulnerabilities, secure coding practices, and web application penetration testing.",
    complexity: "Medium",
    hours: 16,
    tag: ["Web Security", "OWASP", "XSS", "SQL Injection", "API Security"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    _id: "5",
    title: "Cloud Security Essentials",
    detail: "Learn to secure cloud infrastructure across AWS, Azure, and GCP. Master IAM, encryption, and compliance.",
    complexity: "Medium",
    hours: 20,
    tag: ["Cloud Security", "AWS", "Azure", "GCP", "IAM"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
  },
  {
    _id: "6",
    title: "Digital Forensics & Incident Response",
    detail: "Become an expert in digital forensics, evidence collection, and incident response procedures.",
    complexity: "Advanced",
    hours: 22,
    tag: ["Forensics", "Incident Response", "Evidence", "Legal"],
    image: "https://images.unsplash.com/photo-1563013541-2d1a36b57597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80"
  }
]

const ModuleCardBeforelogin = ({ module, showActions = true }) => {
  const navigate = useNavigate()

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Fundamental':
        return 'from-green-500 to-emerald-400'
      case 'Medium':
        return 'from-cyan-500 to-blue-500'
      case 'Advanced':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Fundamental':
        return <Zap className="w-3 h-3" />
      case 'Medium':
        return <TrendingUp className="w-3 h-3" />
      case 'Advanced':
        return <Play className="w-3 h-3" />
      default:
        return <Zap className="w-3 h-3" />
    }
  }

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      id={module._id}
      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden h-full flex flex-col hover:border-cyan-500/50 transition-all duration-300"
    >
      {/* Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

      {/* Image Section */}
      {module.image && (
        <div className="w-full h-52 overflow-hidden">
          <img
            src={module.image}
            alt={module.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
        </div>
      )}

      <div className="p-6 flex-1 relative z-10">
        {/* Badge */}
        <div className="flex justify-between items-start mb-4">
          <motion.span 
            className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${getBadgeColor(module.complexity)} text-white shadow-lg flex items-center gap-1.5`}
            whileHover={{ scale: 1.05 }}
          >
            {getBadgeIcon(module.complexity)}
            {module.complexity}
          </motion.span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl mb-3 text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
          {module.title}
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-6 leading-relaxed line-clamp-3">
          {module.detail}
        </p>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-cyan-400 mb-6">
          <Clock className="w-4 h-4" />
          <span>{module.hours} Hours • Complete Guide</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {module.tag?.slice(0, 3).map((t, index) => (
            <motion.span 
              key={index}
              className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-xl text-xs border border-gray-600 group-hover:border-cyan-500/30 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {t}
            </motion.span>
          ))}

          {module.tag?.length > 3 && (
            <span className="px-3 py-1.5 bg-gray-700/50 text-gray-400 rounded-xl text-xs border border-gray-600">
              +{module.tag.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-6 pt-4 bg-gray-800/30 border-t border-gray-700 group-hover:border-cyan-500/30 transition-colors relative z-10">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded-xl font-medium text-sm hover:bg-cyan-500/10 transition-all flex items-center gap-2 flex-1 justify-center"
            >
              <Eye className="w-4 h-4" />
              Free Preview
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Main component with carousel
const CourseCarouselBeforeLogin = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 3 >= cybersecurityCourses.length ? 0 : prevIndex + 3
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 3 < 0 ? cybersecurityCourses.length - 3 : prevIndex - 3
    )
  }

  const visibleCourses = cybersecurityCourses.slice(currentIndex, currentIndex + 3)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2 
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Master Cybersecurity Skills
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Start your journey to becoming a cybersecurity expert with our comprehensive courses
        </motion.p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        <motion.button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-gray-800/80 hover:bg-cyan-600/80 backdrop-blur-sm border border-gray-700 hover:border-cyan-500 rounded-full p-3 transition-all duration-300 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-6 h-6 text-gray-300 group-hover:text-white" />
        </motion.button>

        <motion.button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-gray-800/80 hover:bg-cyan-600/80 backdrop-blur-sm border border-gray-700 hover:border-cyan-500 rounded-full p-3 transition-all duration-300 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-white" />
        </motion.button>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {visibleCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ModuleCardBeforelogin module={course} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {[0, 3].map((position) => (
            <button
              key={position}
              onClick={() => setCurrentIndex(position)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === position 
                  ? 'bg-cyan-500 scale-125' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="text-gray-300 mb-6">
          Join thousands of students already learning cybersecurity with us
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
        >
          Explore All Courses
        </motion.button>
      </motion.div>
    </div>
  )
}

export default CourseCarouselBeforeLogin