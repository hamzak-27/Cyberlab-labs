import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Bookmark, 
  ChevronRight,
  Star,
  Award,
  Sparkles,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EnhancedCourseProgressCard = ({ course, onContinue, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Calculate progress percentage
  const percent = course?.percentage ?? Math.round(((course?.completedModules || 0) / Math.max(course?.totalModules || 1, 1)) * 100);
  
  // Determine progress color based on percentage
  const getProgressColor = () => {
    if (percent >= 80) return 'from-emerald-400 to-teal-500';
    if (percent >= 50) return 'from-cyan-400 to-blue-500';
    if (percent >= 30) return 'from-amber-400 to-orange-500';
    return 'from-rose-400 to-pink-500';
  };
  
  // Determine course difficulty color
  const getDifficultyColor = () => {
    const difficulty = course?.difficulty?.toLowerCase();
    switch(difficulty) {
      case 'advanced': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'intermediate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'beginner': 
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };
  
  // Generate random stats for demo (you can replace with actual data)
  const estimatedTime = course?.estimatedTime || '8h 30m';
  const lastAccessed = course?.lastAccessed || '2 days ago';
  const difficulty = course?.difficulty || 'Beginner';
  const rating = course?.rating || 4.5;

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(!isSaved ? 'Course saved to favorites!' : 'Course removed from favorites');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ 
        y: -4,
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm 
                 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer"
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-xl transition-opacity duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />

      {/* Save button */}
      <button
        onClick={handleSave}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/80 backdrop-blur-sm 
                   border border-gray-600/50 hover:border-cyan-400/50 hover:bg-gray-700/80 
                   transition-all duration-200 group/save"
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-cyan-400 text-cyan-400' : 'text-gray-400'}`} />
        <div className="absolute -bottom-8 right-0 px-2 py-1 bg-gray-900 rounded-lg opacity-0 group-hover/save:opacity-100 transition-opacity duration-200 whitespace-nowrap text-xs">
          {isSaved ? 'Saved' : 'Save'}
        </div>
      </button>

      {/* Course image/icon */}
      <div className="absolute top-4 left-4 z-10">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 
                        border border-cyan-500/30 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
          {percent === 100 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 
                          rounded-full flex items-center justify-center border-2 border-gray-900">
              <Award className="w-2.5 h-2.5 text-gray-900" />
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-20 relative z-10">
        {/* Course header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors duration-300 line-clamp-1">
              {course.title}
            </h3>
            
            {/* Course meta */}
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor()}`}>
                {difficulty}
              </span>
              
              <div className="flex items-center gap-1.5 text-gray-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{rating}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm">{estimatedTime}</span>
              </div>
            </div>
          </div>
          
          {/* Percentage badge */}
          <div className="relative">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 
                            border-2 border-gray-700/50 flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 
                               bg-clip-text text-transparent">
                  {percent}%
                </span>
              </div>
              
              {/* Progress ring */}
              <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="30"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${(percent / 100) * 188.5} 188.5`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Progress</span>
            </div>
            <span className="text-sm font-medium text-gray-300">
              {course.completedModules || 0}/{course.totalModules || 0} modules
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`absolute h-full rounded-full bg-gradient-to-r ${getProgressColor()} 
                        shadow-lg shadow-cyan-500/20`}
            />
            
            {/* Shimmer effect */}
            <div className={`absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                          blur-sm ${isHovered ? 'animate-shimmer' : ''}`}
                 style={{ animation: isHovered ? 'shimmer 2s infinite' : 'none' }} />
          </div>
          
          {/* Progress text */}
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">Last accessed: {lastAccessed}</span>
            {percent === 100 ? (
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Course Completed!</span>
              </div>
            ) : percent >= 75 ? (
              <span className="text-xs text-cyan-400 font-medium">Almost there! 🚀</span>
            ) : percent >= 50 ? (
              <span className="text-xs text-blue-400 font-medium">Halfway there! ⚡</span>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onContinue(course.courseId)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                     bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30
                     border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400 font-medium
                     transition-all duration-200 group/btn"
          >
            <Zap className="w-4 h-4 group-hover/btn:animate-pulse" />
            {percent === 100 ? 'Review Course' : percent > 0 ? 'Continue Learning' : 'Start Learning'}
            <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
          
          <button
            onClick={() => toast.success('Course details will open soon!')}
            className="px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 
                     border border-gray-600/50 hover:border-gray-500/50 text-gray-300 
                     font-medium transition-all duration-200"
          >
            Details
          </button>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-tl-2xl" />
    </motion.div>
  );
};

export const CoursesSection = ({ stats, onContinueCourse, navigate }) => {
  return (
    <div className="mt-8">
      <div className="relative rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 
                    backdrop-blur-sm border border-gray-700/30 p-6">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 
                            border border-cyan-500/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              Your Learning Journey
            </h3>
            <p className="text-gray-400 mt-2">
              Track your progress across all enrolled courses
            </p>
          </div>
          
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-800/50 
                     hover:from-gray-600/50 hover:to-gray-700/50 border border-gray-600/50 
                     hover:border-gray-500/50 text-gray-300 font-medium transition-all duration-200
                     flex items-center gap-2 group"
          >
            View All Courses
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Courses grid */}
        {stats?.courses?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.courses.map((course, index) => (
              <EnhancedCourseProgressCard 
                key={course.courseId} 
                course={course} 
                onContinue={onContinueCourse}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 
                          border border-gray-700 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-300 mb-2">No courses yet</h4>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start your learning journey by enrolling in courses from our catalog
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 
                       hover:from-cyan-600 hover:to-blue-600 text-white font-medium
                       transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              Browse Courses
            </button>
          </div>
        )}

        {/* Stats summary */}
        {stats?.courses?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-700/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {stats.courses.length}
                </div>
                <div className="text-gray-400 text-sm mt-1">Total Courses</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {Math.round(stats.courses.reduce((acc, c) => acc + (c.percentage || 0), 0) / stats.courses.length)}%
                </div>
                <div className="text-gray-400 text-sm mt-1">Avg. Progress</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {stats.courses.filter(c => c.percentage === 100).length}
                </div>
                <div className="text-gray-400 text-sm mt-1">Completed</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.courses.reduce((acc, c) => acc + (c.completedModules || 0), 0)}
                </div>
                <div className="text-gray-400 text-sm mt-1">Modules Done</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};