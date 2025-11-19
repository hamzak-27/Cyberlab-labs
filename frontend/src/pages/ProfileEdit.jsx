import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Shield, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  mobile: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"]
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "New passwords must match",
  path: ["confirmPassword"]
})

export default function ProfileEdit({ user }) {
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [avatar, setAvatar] = useState(null)

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { 
      fullName: user?.name || 'Atiq Shaikh', 
      email: user?.email || 'atiq@cyberlearn.com',
      mobile: user?.mobile || '+1 (555) 123-4567'
    }
  })

  const newPassword = watch('newPassword')

  const onSubmit = async (data) => {
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Profile update:', {
        ...data,
        currentPassword: data.currentPassword ? '***HIDDEN***' : undefined,
        newPassword: data.newPassword ? '***HIDDEN***' : undefined
      })
      
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setAvatar(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400">
            Manage your account information and security preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card gradient={true} className="sticky top-6">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 mx-auto">
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt="Avatar" 
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || 'A'
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <h3 className="font-bold text-white text-lg">
                  {user?.name || 'Atiq Shaikh'}
                </h3>
                <p className="text-cyan-400 text-sm">Cyber Security Learner</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-cyan-500/20 text-cyan-400 border-r-2 border-cyan-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Member since</span>
                    <span className="text-white">Jan 2024</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Last active</span>
                    <span className="text-green-400">Just now</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Account status</span>
                    <span className="text-green-400">Verified</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card gradient={true}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <User className="w-5 h-5" />
                        Personal Information
                      </h2>

                      {/* Full Name */}
                      <Input
                        icon={<User className="w-4 h-4" />}
                        label="Full Name"
                        placeholder="Enter your full name"
                        {...register('fullName')}
                        error={errors.fullName?.message}
                      />

                      {/* Email */}
                      <Input
                        icon={<Mail className="w-4 h-4" />}
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email address"
                        {...register('email')}
                        error={errors.email?.message}
                      />

                      {/* Mobile */}
                      <Input
                        icon={<Phone className="w-4 h-4" />}
                        label="Mobile Number"
                        placeholder="Enter your mobile number"
                        {...register('mobile')}
                        error={errors.mobile?.message}
                      />

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          placeholder="Tell us about yourself and your cybersecurity interests..."
                          rows={4}
                          className="w-full p-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'security' && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Shield className="w-5 h-5" />
                        Security Settings
                      </h2>

                      {/* Current Password */}
                      <Input
                        icon={<Lock className="w-4 h-4" />}
                        label="Current Password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        {...register('currentPassword')}
                        error={errors.currentPassword?.message}
                        endAdornment={
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="text-gray-400 hover:text-cyan-400 transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />

                      {/* New Password */}
                      <Input
                        icon={<Lock className="w-4 h-4" />}
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...register('newPassword')}
                        error={errors.newPassword?.message}
                        endAdornment={
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="text-gray-400 hover:text-cyan-400 transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />

                      {/* Confirm New Password */}
                      {newPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <Input
                            icon={<Lock className="w-4 h-4" />}
                            label="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            {...register('confirmPassword')}
                            error={errors.confirmPassword?.message}
                            endAdornment={
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-400 hover:text-cyan-400 transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            }
                          />
                        </motion.div>
                      )}

                      {/* Security Features */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-white">Security Features</h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="bg-gray-800/50 border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white font-medium">Two-Factor Auth</span>
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                Recommended
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              Add an extra layer of security to your account
                            </p>
                            <Button variant="secondary" size="sm">
                              Enable 2FA
                            </Button>
                          </Card>

                          <Card className="bg-gray-800/50 border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white font-medium">Login Sessions</span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                Active
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              Manage your active login sessions
                            </p>
                            <Button variant="secondary" size="sm">
                              View Sessions
                            </Button>
                          </Card>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-4 pt-6 border-t border-gray-700"
                >
                  <Button
                    type="submit"
                    loading={loading}
                    icon={<CheckCircle className="w-4 h-4" />}
                    className="flex-1"
                  >
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                </motion.div>
              </form>
            </Card>

            {/* Danger Zone */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <Card className="border-red-500/20 bg-red-500/5">
                  <h3 className="text-lg font-bold text-white mb-3">Danger Zone</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="danger" size="sm">
                      Delete Account
                    </Button>
                    <Button variant="ghost" size="sm">
                      Export Data
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}