// src/components/layout/Footer.jsx
import React from 'react'
import { Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin, Shield, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "CyberSec Pro",
      content: "Master cybersecurity with hands-on labs and real-world challenges. Build the skills that matter in today's digital landscape.",
      links: []
    },
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "#home" },
        { name: "Modules", href: "#modules" },
        { name: "Pricing", href: "#pricing" },
        { name: "Contact", href: "#contact" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Documentation", href: "/docs" },
        { name: "Community", href: "/community" },
        { name: "Status", href: "/status" },
        { name: "Contact Support", href: "/support" }
      ]
    },
    {
      title: "Contact Info",
      details: [
        { icon: Mail, text: "support@cybersecpro.com" },
        { icon: Phone, text: "+1 (555) 123-4567" },
        { icon: MapPin, text: "San Francisco, CA" }
      ]
    }
  ]

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Facebook, href: "#", label: "Facebook" }
  ]

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-gray-900 border-t border-gray-700 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {section.title === "CyberSec Pro" && <Shield className="w-5 h-5 text-cyan-400" />}
                {section.title}
              </h3>
              
              {section.content && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {section.content}
                </p>
              )}
              
              {section.links && section.links.length > 0 && (
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <motion.a
                        href={link.href}
                        className="text-gray-400 hover:text-cyan-400 text-sm transition-all flex items-center gap-2 group"
                        whileHover={{ x: 4 }}
                      >
                        <span className="w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.name}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              )}
              
              {section.details && (
                <div className="space-y-3">
                  {section.details.map((detail, detailIndex) => {
                    const Icon = detail.icon
                    return (
                      <div key={detailIndex} className="flex items-center gap-3 text-gray-400 text-sm">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span>{detail.text}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Social Links & Newsletter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Follow us:</span>
              <div className="flex gap-2">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 border border-gray-700 hover:border-cyan-500/30 transition-all"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  )
                })}
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p className="text-gray-400 text-sm text-center sm:text-left">
                Stay updated with cybersecurity trends
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          {/* Copyright */}
          <div className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} CyberSec Pro. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Cookies
            </Link>
            <Link to="/security" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Security
            </Link>
          </div>

          {/* Trust Badge */}
          <motion.div 
            className="flex items-center gap-2 text-cyan-400 text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <Shield className="w-4 h-4" />
            <span>Secured by CyberSec Pro</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  )
}