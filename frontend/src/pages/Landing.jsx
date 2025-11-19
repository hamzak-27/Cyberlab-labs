// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ModuleCard from '../components/modules/ModuleCard'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  Layers, 
  Zap, 
  Shield, 
  Users, 
  Target, 
  Star, 
  ArrowRight, 
  Play, 
  Award, 
  TrendingUp, 
  Globe, 
  Lock, 
  Code,
  Lightbulb 
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Area } from 'recharts' 

const featuredModules = [
  {
    id: 'm1',
    badge: 'Beginner Friendly',
    title: 'Threat Detection Fundamentals',
    duration: '8–10 hours',
    description: 'Identify and analyze malware and network threats in real time — the ideal starting point for cybersecurity beginners.',
    topics: ['Malware analysis basics', 'Network monitoring', 'SIEM introduction', 'Incident reporting'],
  },
  {
    id: 'm2',
    badge: 'Most Popular',
    title: 'Web Application Security',
    duration: '12–16 hours',
    description: 'Hands-on web app security: OWASP Top 10, Burp Suite practice, SQLi & XSS exploitation and defense.',
    topics: ['OWASP Top 10', 'Burp Suite', 'SQL Injection', 'Cross Site Scripting'],
  },
  {
    id: 'm3',
    badge: 'Career Track',
    title: 'Network Defense & SOC Ops',
    duration: '10–14 hours',
    description: 'Run a SOC workflow: configure firewalls, detect intrusions, and harden networks under attack.',
    topics: ['Firewall setup', 'IDS/IPS', 'Network forensics', 'Incident response'],
  },
]

// Benefits data for integrated ModuleBenefits section
const benefits = [
  { icon: Clock, title: 'No Waiting Around', text: 'Start practicing immediately in any module' },
  { icon: Layers, title: 'Relevant Skills', text: "Learn what matters most for today's jobs" },
  { icon: Zap, title: 'Flexible Learning', text: 'Mix and match modules based on your goals' },
  { icon: CheckCircle, title: 'Instant Application', text: 'Use new skills immediately in real scenarios' },
]

// Progression data for chart
const progression = [
  { name: 'Week 1', skill: 10 },
  { name: 'Week 2', skill: 28 },
  { name: 'Week 3', skill: 45 },
  { name: 'Week 4', skill: 68 },
  { name: 'Week 5', skill: 82 },
]

// Pricing plans data
const plans = [
  {
    name: "Starter",
    monthly: "Free",
    yearly: "Free",
    features: ["Access to 2 modules", "Community Support", "Basic Labs"],
  },
  {
    name: "Pro",
    monthly: "$29",
    yearly: "$290",
    features: ["All Modules", "Advanced Labs", "Downloadable Certificates"],
  },
  {
    name: "Enterprise",
    monthly: "$99",
    yearly: "$990",
    features: [
      "Team Dashboard",
      "Dedicated Support",
      "Custom Integrations",
    ],
  },
]

// Trusted companies logos
const trustedCompanies = [
  { name: 'TechCorp', icon: Shield },
  { name: 'SecureNet', icon: Lock },
  { name: 'DataGuard', icon: Globe },
  { name: 'CyberShield', icon: Code },
  { name: 'SafeSystems', icon: Users },
]

// Audience segments
const audienceSegments = [
  {
    title: "Beginners & Students",
    description: "Start your cybersecurity journey with guided learning paths",
    icon: Users,
    features: ["Step-by-step tutorials", "Beginner-friendly labs", "Career guidance"],
    cta: "Start Learning",
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Professionals",
    description: "Advance your career with specialized certification paths",
    icon: Target,
    features: ["Advanced certifications", "Real-world scenarios", "Industry recognition"],
    cta: "Level Up",
    color: "from-green-500 to-emerald-400"
  },
  {
    title: "Corporate Teams",
    description: "Build in-house talent with team training and CTFs",
    icon: Shield,
    features: ["Team dashboards", "Custom training", "Progress tracking"],
    cta: "Train Team",
    color: "from-purple-500 to-pink-400"
  }
]

// Animated background component
// const AnimatedBackground = () => {
//   const [dots, setDots] = useState([]);

//   useEffect(() => {
//     const generateDots = () => {
//       const newDots = [];
//       for (let i = 0; i < 50; i++) {
//         newDots.push({
//           id: i,
//           x: Math.random() * 100,
//           y: Math.random() * 100,
//           size: Math.random() * 3 + 1,
//           opacity: Math.random() * 0.3 + 0.1,
//         });
//       }
//       setDots(newDots);
//     };

//     generateDots();
//   }, []);


  const EnhancedAnimatedBackground = () => {
  const [dots, setDots] = useState([]);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const generateElements = () => {
      // Generate floating dots
      const newDots = [];
      for (let i = 0; i < 80; i++) {
        newDots.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.4 + 0.1,
          delay: Math.random() * 5,
          duration: Math.random() * 4 + 3,
        });
      }
      setDots(newDots);

      // Generate connecting lines
      const newLines = [];
      for (let i = 0; i < 15; i++) {
        newLines.push({
          id: i,
          x1: Math.random() * 100,
          y1: Math.random() * 100,
          x2: Math.random() * 100,
          y2: Math.random() * 100,
          opacity: Math.random() * 0.1 + 0.05,
        });
      }
      setLines(newLines);
    };

    generateElements();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1)_76%,transparent_77%),linear-gradient(0deg,transparent_24%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1)_76%,transparent_77%)] bg-[length:50px_50px]" />
      </div>

      {/* Floating dots */}
      {dots.map(dot => (
        <motion.div
          key={dot.id}
          className="absolute bg-cyan-400 rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            opacity: dot.opacity,
          }}
          animate={{
            opacity: [dot.opacity, dot.opacity * 0.3, dot.opacity],
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}

      {/* Connecting lines */}
      {lines.map(line => (
        <motion.div
          key={line.id}
          className="absolute bg-cyan-400 rounded-full"
          style={{
            left: `${Math.min(line.x1, line.x2)}%`,
            top: `${Math.min(line.y1, line.y2)}%`,
            width: `${Math.abs(line.x2 - line.x1)}%`,
            height: `${Math.abs(line.y2 - line.y1)}%`,
            opacity: line.opacity,
            transform: `rotate(${Math.atan2(line.y2 - line.y1, line.x2 - line.x1)}rad)`,
            transformOrigin: '0 0',
          }}
          animate={{
            opacity: [line.opacity, line.opacity * 0.3, line.opacity],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: line.id * 0.2,
          }}
        />
      ))}

      {/* Large floating shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-3/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Pulsing radar effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-cyan-400/30 rounded-full"
        animate={{
          scale: [0.8, 1.5, 0.8],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-blue-400/40 rounded-full"
        animate={{
          scale: [0.5, 1.2, 0.5],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1,
        }}
      />

      {/* Scanning line effect */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{
          top: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default function Landing() {
  const [yearly, setYearly] = useState(false);
  const togglePlans = () => setYearly(!yearly);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0">
        <EnhancedAnimatedBackground />
      </div>


      {/* Additional background elements */}
      <div className="absolute inset-0 z-0">
        {/* Binary code rain effect */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-cyan-400 font-mono text-xs"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
              animate={{
                y: [-20, 1000],
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
            >
              {Math.random().toString(2).substring(2, 12)}
            </motion.div>
          ))}
        </div>
      </div>



      <div className="relative z-10">
        <Header />

        {/* top spacer for fixed header */}
        <div className="h-16" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* ENHANCED HERO SECTION */}
          <section id="home" className="min-h-[80vh] flex items-center justify-center py-20">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/20"
              >
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Trusted by 50,000+ cybersecurity professionals</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
              >
                Master Cybersecurity
                <br />
                <span className="text-white">From Zero to Expert</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              >
                Beat hackers, boost your career with hands-on labs and real-world challenges that prepare you for today's threats
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-3 gap-8 max-w-2xl mx-auto py-6"
              >
                {[
                  { number: '95%', label: 'Job Placement Rate' },
                  { number: '50K+', label: 'Trained Professionals' },
                  { number: '24/7', label: 'Hands-on Lab Access' },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-cyan-400">{stat.number}</div>
                    <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center gap-3"
                >
                  <Shield className="w-5 h-5" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-sm flex items-center gap-3"
                  onClick={() => setIsPlaying(true)}
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Trusted By */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="pt-12"
              >
                <p className="text-gray-400 text-sm mb-6">TRUSTED BY INDUSTRY LEADERS</p>
                <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                  {trustedCompanies.map((company, index) => {
                    const Icon = company.icon;
                    return (
                      <motion.div
                        key={company.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <Icon className="w-6 h-6" />
                        <span className="font-semibold">{company.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </section>

          {/* AUDIENCE SEGMENTATION */}
          <section className="py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                Designed for <span className="text-cyan-400">Every Learner</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Whether you're starting out or leading a team, we have the perfect path for your cybersecurity journey
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {audienceSegments.map((segment, index) => {
                const Icon = segment.icon;
                return (
                  <motion.div
                    key={segment.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ y: -10 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                    <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 group-hover:border-cyan-500/50 transition-all duration-300 h-full">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${segment.color} mb-6`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{segment.title}</h3>
                      <p className="text-gray-300 mb-6">{segment.description}</p>
                      <ul className="space-y-3 mb-8">
                        {segment.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3 text-gray-400">
                            <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-3 rounded-xl font-semibold bg-gradient-to-r ${segment.color} hover:shadow-lg hover:shadow-cyan-500/25 transition-all`}
                      >
                        {segment.cta}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

         {/* ENHANCED PROBLEM VS SOLUTION SECTION */}
<section className="py-20 relative">
  {/* Background Elements */}
  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50" />
  <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl" />
  <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
  
  <div className="relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        The <span className="text-cyan-400">Cyber Security</span> Learning Revolution
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
        Traditional methods leave you unprepared. Our hands-on approach transforms beginners into job-ready professionals.
      </p>
    </motion.div>

    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Problem Side - Traditional Training */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="group relative"
      >
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        
        <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 h-full group-hover:border-red-500/50 transition-all duration-300">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Traditional Training</h3>
              <p className="text-red-400 text-sm mt-1">Why most learners struggle</p>
            </div>
          </div>

          {/* Problem List */}
          <ul className="space-y-4">
            {[
              {
                icon: "📚",
                title: "Outdated Content",
                description: "Learn from materials that don't reflect current cyber threats and attack vectors"
              },
              {
                icon: "🎯",
                title: "No Hands-On Practice",
                description: "Purely theoretical knowledge without real-world application"
              },
              {
                icon: "🚫",
                title: "Slow Career Progress",
                description: "Months of study without clear job-ready skills or portfolio"
              },
              {
                icon: "💸",
                title: "Poor ROI",
                description: "High costs with minimal practical value and career advancement"
              }
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition-all group/item"
              >
                <span className="text-2xl flex-shrink-0 group-hover/item:scale-110 transition-transform">
                  {item.icon}
                </span>
                <div>
                  <h4 className="font-semibold text-white text-lg">{item.title}</h4>
                  <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20"
          >
            <div className="text-center">
              <div className="text-red-400 text-sm font-semibold">Average Outcomes</div>
              <div className="text-white text-2xl font-bold mt-1">28% Job Placement</div>
              <div className="text-gray-400 text-xs mt-1">After 6 months of traditional training</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Solution Side - CyberSec Pro */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="group relative"
      >
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        
        <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-8 h-full group-hover:border-cyan-500/50 transition-all duration-300">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">CyberSec Pro</h3>
              <p className="text-cyan-400 text-sm mt-1">The modern way to master cybersecurity</p>
            </div>
          </div>

          {/* Solution List */}
          <ul className="space-y-4">
            {[
              {
                icon: "🔄",
                title: "Real-Time Content",
                description: "Always updated with the latest threats, tools, and defense techniques"
              },
              {
                icon: "🔧",
                title: "Hands-On Labs",
                description: "Practice in realistic environments with immediate feedback"
              },
              {
                icon: "⚡",
                title: "Accelerated Learning",
                description: "Go from beginner to job-ready in weeks, not months"
              },
              {
                icon: "💼",
                title: "Career-Focused",
                description: "Build a professional portfolio that impresses employers"
              }
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/20 transition-all group/item"
              >
                <span className="text-2xl flex-shrink-0 group-hover/item:scale-110 transition-transform">
                  {item.icon}
                </span>
                <div>
                  <h4 className="font-semibold text-white text-lg">{item.title}</h4>
                  <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20"
          >
            <div className="text-center">
              <div className="text-cyan-400 text-sm font-semibold">Proven Results</div>
              <div className="text-white text-2xl font-bold mt-1">94% Job Placement</div>
              <div className="text-gray-400 text-xs mt-1">Within 3 months of completing our program</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>

    {/* Bottom CTA */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="text-center mt-12"
    >
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-4">
          Ready to Transform Your Cybersecurity Career?
        </h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of successful professionals who chose the practical, hands-on approach to cybersecurity education.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center gap-3 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Start Your Free Trial Today
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-sm flex items-center gap-3 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Watch Success Stories
          </motion.button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>7-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
</section>





          {/* Core Modules */}
          <section id="modules" className="mt-12">
            <motion.h3 
              className="text-3xl text-center font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Modules
            </motion.h3>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {featuredModules.map((m, index) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ModuleCard module={m} />
                </motion.div>
              ))}
            </div>
          </section>







          {/*HOW IT WORKS SECTION */}
<section id="how-it-works" className="py-20 relative overflow-hidden">
  {/* Background Elements */}
  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-60" />
  <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
  <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
  
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-6 py-3 mb-6"
      >
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
          Learning Journey
        </span>
      </motion.div>
      
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Learn by <span className="text-cyan-400">Doing</span>, Not Just Watching
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
        Our hands-on approach transforms theoretical knowledge into practical skills through immersive, 
        real-world cybersecurity challenges.
      </p>
    </motion.div>

    {/* Process Steps */}
    <div className="relative">
      {/* Connecting Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 rounded-full"
      />

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        {[
          {
            step: "01",
            icon: "🎯",
            title: "Choose Your Learning Path",
            description: "Select from specialized modules that match your career goals and skill level. Every path is designed with industry requirements in mind.",
            features: ["Career-focused modules", "Skill assessment", "Personalized roadmap"],
            color: "from-cyan-500 to-blue-500",
            delay: 0.1
          },
          {
            step: "02",
            icon: "🔧",
            title: "Practice in Real Cyber Labs",
            description: "Immerse yourself in our virtual cyber range with realistic scenarios. Get instant feedback and guidance as you tackle real-world challenges.",
            features: ["Live environments", "Instant feedback", "Progressive difficulty"],
            color: "from-blue-500 to-purple-500",
            delay: 0.3
          },
          {
            step: "03",
            title: "Build Professional Skills",
            icon: "🚀",
            description: "Advance through increasingly complex challenges while building a portfolio that demonstrates your expertise to employers.",
            features: ["Portfolio projects", "Skill certifications", "Career readiness"],
            color: "from-purple-500 to-pink-500",
            delay: 0.5
          }
        ].map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: step.delay }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="group relative"
          >
            {/* Gradient Border Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
            
            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 h-full group-hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
              {/* Step Number */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: step.delay + 0.2, type: "spring" }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full border border-gray-700 flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-cyan-400">{step.step}</span>
              </motion.div>

              {/* Step Icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: step.delay + 0.1, type: "spring" }}
                className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-3xl mb-6 shadow-lg`}
              >
                {step.icon}
              </motion.div>

              {/* Step Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: step.delay + 0.3 + featureIndex * 0.1 }}
                      className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-gray-200 transition-colors"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: step.delay + 0.4 + featureIndex * 0.1 }}
                        className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"
                      />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1, delay: step.delay + 0.6, ease: "easeOut" }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-b-2xl"
              />
            </div>

            {/* Mobile Connection Dots */}
            <div className="lg:hidden flex justify-center mt-6 mb-4">
              {index < 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: step.delay + 0.8 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Bottom CTA & Stats */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
      className="mt-16 text-center"
    >
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {[
            { number: "10x", label: "Faster Skill Acquisition", description: "Compared to traditional learning" },
            { number: "94%", label: "Retention Rate", description: "With hands-on practice" },
            { number: "6wks", label: "To Job Ready", description: "Average time for graduates" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">{stat.number}</div>
              <div className="font-semibold text-white mb-1">{stat.label}</div>
              <div className="text-sm text-gray-400">{stat.description}</div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center gap-3 mx-auto transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Your Cybersecurity Journey
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-gray-400 text-sm mt-4 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          No prior experience required • Guided learning path • 7-day free trial
        </motion.p>
      </div>
    </motion.div>
  </div>
</section>








 {/* MODULE BENEFITS SECTION */}
<section id="benefits" className="py-20 relative overflow-hidden">
  {/* Background Elements */}
  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-60" />
  <div className="absolute top-10 left-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
  <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
  
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-6 py-3 mb-6"
      >
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
          Why We're Different
        </span>
      </motion.div>
      
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        The Power of <span className="text-cyan-400">Module-Based</span> Learning
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
        Traditional courses teach theory. Our modular approach builds real skills through targeted, 
        hands-on experiences that stick.
      </p>
    </motion.div>

    <div className="grid lg:grid-cols-3 gap-8 items-start">
      {/* Enhanced Benefits Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 group-hover:border-cyan-500/50 transition-all duration-300 h-full overflow-hidden">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {/* Icon Container */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 shadow-lg shadow-cyan-500/25"
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {benefit.text}
                  </p>
                </div>

                {/* Progress Indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-b-2xl"
                />

                {/* Hover Indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Chart Section */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="group relative"
      >
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        
        <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 group-hover:border-green-500/50 transition-all duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Skill Progression</h3>
              <p className="text-green-400 text-sm">Real growth through hands-on practice</p>
            </div>
          </div>

          {/* Enhanced Chart */}
          <div className="space-y-4">
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progression}>
                  <defs>
                    <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#00ff88" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#4B5563' }}
                    tickLine={{ stroke: '#4B5563' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#4B5563' }}
                    tickLine={{ stroke: '#4B5563' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="skill" 
                    stroke="#00ff88"
                    strokeWidth={3}
                    dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#00ff88' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="skill" 
                    fill="url(#skillGradient)"
                    stroke="none"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">+680%</div>
                <div className="text-xs text-gray-400">Skill Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">5 wks</div>
                <div className="text-xs text-gray-400">To Proficiency</div>
              </div>
            </div>

            {/* Key Insight */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="p-4 bg-green-500/10 rounded-xl border border-green-500/20"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-green-400 text-sm font-semibold">Key Insight</div>
                  <div className="text-gray-300 text-sm mt-1">
                    Hands-on labs accelerate learning 3x faster than traditional methods
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Bottom CTA & Social Proof */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="mt-16 text-center"
    >
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Join 50,000+ Cybersecurity Professionals
          </h3>
          <p className="text-gray-300 mb-6 text-lg">
            Start building practical skills today and transform your career in weeks, not years.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center gap-3 transition-all"
            >
              <Zap className="w-5 h-5" />
              Start Free Trial - No Credit Card
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-sm flex items-center gap-3 transition-all"
            >
              <Users className="w-5 h-5" />
              View Success Stories
            </motion.button>
          </div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full border-2 border-gray-800" />
                ))}
              </div>
              <span>Join 1,200+ active learners</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>4.9/5 from 2,400+ reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-400" />
              <span>94% career advancement rate</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  </div>
</section>







          {/* Testimonials */}
          <section id="testimonials" className="mt-12">
            <motion.h3 
              className="text-3xl text-center font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              What Our Students Say
            </motion.h3>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {[
                {
                  quote: "The Web Application Security module helped me land my first bug bounty within 2 weeks!",
                  author: "Jane, Security Analyst"
                },
                {
                  quote: "I started with zero knowledge. The Threat Detection module made complex concepts totally understandable.",
                  author: "Mike, IT Technician"
                },
                {
                  quote: "The Network Defense labs gave me practical SOC experience I use every day.",
                  author: "Lisa, Junior SOC Analyst"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <blockquote className="italic text-gray-300">"{testimonial.quote}"</blockquote>
                  <div className="mt-3 font-semibold">— {testimonial.author}</div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.a 
                href="/register" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-2xl text-sm md:text-base md:px-6 md:py-2 inline-block max-w-xs md:max-w-none break-words md:break-normal shadow-lg shadow-cyan-500/25"
                whileHover={{ scale: 1.05 }}
              >
                Join thousands of satisfied learners – start your journey
              </motion.a>
            </motion.div>
          </section>
        </main>

        {/* INTEGRATED PRICING SECTION */}
        <section
          id="pricing"
          className="relative py-24 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden"
        >
          {/* Subtle animated background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,136,0.1)_0%,_transparent_70%)] animate-pulse"></div>

          <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold mb-8 text-white"
            >
              Choose Your Learning Plan
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              Flexible pricing options designed to help you start your cybersecurity journey at your own pace
            </motion.p>

            {/* Toggle Switch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center items-center mb-16"
            >
              <span className={`mr-3 text-lg font-medium ${!yearly ? "text-cyan-400" : "text-gray-400"}`}>
                Monthly
              </span>
              <div
                onClick={togglePlans}
                className="w-16 h-8 bg-gray-700 rounded-full p-1 cursor-pointer relative transition-all mx-4"
              >
                <motion.div
                  layout
                  className="w-6 h-6 bg-cyan-400 rounded-full shadow-glow absolute top-1"
                  animate={{ x: yearly ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                ></motion.div>
              </div>
              <span className={`ml-3 text-lg font-medium ${yearly ? "text-cyan-400" : "text-gray-400"}`}>
                Yearly <span className="text-sm text-green-400 ml-1">(Save 17%)</span>
              </span>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 hover:border-cyan-500/50 transition-all relative"
                >
                  {/* Popular Badge for Pro Plan */}
                  {plan.name === "Pro" && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-6">
                    <p className="text-4xl font-extrabold text-white">
                      {yearly ? plan.yearly : plan.monthly}
                    </p>
                    {plan.name !== "Starter" && (
                      <p className="text-gray-400 mt-2">
                        {yearly ? "per year" : "per month"}
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-gray-300">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: (index * 0.1) + (featureIndex * 0.05) }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 rounded-full font-semibold transition-all ${
                      plan.name === "Pro" 
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25" 
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    {plan.name === "Starter" ? "Get Started Free" : "Get Started"}
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 text-center text-gray-400"
            >
              <p>All plans include 14-day money-back guarantee • Cancel anytime</p>
            </motion.div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section
          id="contact"
          className="py-24 bg-gradient-to-t from-gray-800 to-gray-900 relative overflow-hidden"
        >
          {/* Background particles effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,255,136,0.05),transparent_60%)] animate-pulse"></div>

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold mb-4 text-white"
            >
              Get in Touch
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-300 mb-12"
            >
              Have questions or want to collaborate? Let's talk.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg space-y-6 border border-gray-700"
            >
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 focus:ring-2 focus:ring-cyan-500 outline-none transition text-white placeholder-gray-400"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 focus:ring-2 focus:ring-cyan-500 outline-none transition text-white placeholder-gray-400"
              />
              <textarea
                placeholder="Your Message"
                rows="5"
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 focus:ring-2 focus:ring-cyan-500 outline-none transition text-white placeholder-gray-400"
              ></textarea>

              {/* CAPTCHA Section - Added */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <label className="block text-white text-sm font-medium mb-2 text-left">
                  CAPTCHA Verification
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-600 py-2 px-4 rounded text-white font-mono text-lg text-center">
                    3 + 4 = ?
                  </div>
                  <input
                    type="text"
                    placeholder="Enter answer"
                    className="flex-1 p-3 rounded-lg border border-gray-600 bg-gray-700 focus:ring-2 focus:ring-cyan-500 outline-none transition text-white placeholder-gray-400"
                  />
                </div>
                <p className="text-gray-400 text-xs mt-2 text-left">
                  Please solve this simple math problem to verify you're human
                </p>
              </div>
              
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-cyan-500/25 w-full md:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Message
              </motion.button>
            </motion.form>

            {/* Social Icons */}
            <motion.div 
              className="flex justify-center gap-6 mt-12 text-2xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.a href="#" className="hover:text-cyan-400 transition-all" whileHover={{ scale: 1.2 }}>🔗</motion.a>
              <motion.a href="#" className="hover:text-cyan-400 transition-all" whileHover={{ scale: 1.2 }}>💼</motion.a>
              <motion.a href="#" className="hover:text-cyan-400 transition-all" whileHover={{ scale: 1.2 }}>🐦</motion.a>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}