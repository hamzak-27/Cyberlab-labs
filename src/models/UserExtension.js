import mongoose from 'mongoose';

// User Badge relationship model
const UserBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
    index: true
  },
  
  earnedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Additional context when badge was earned
  context: {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab'
    },
    trigger: String // What triggered the badge
  }
}, {
  timestamps: true
});

// Compound index to ensure unique badge per user
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Export UserBadge model
export const UserBadge = mongoose.model('UserBadge', UserBadgeSchema);

// Extended user lab statistics model
const UserLabStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to existing User model from frontend-team
    required: true,
    unique: true,
    index: true
  },
  
  // Lab statistics
  labStats: {
    totalPoints: {
      type: Number,
      default: 0,
      index: true
    },
    
    rank: {
      type: Number,
      default: 0,
      index: true
    },
    
    labsCompleted: {
      type: Number,
      default: 0
    },
    
    labsAttempted: {
      type: Number,
      default: 0
    },
    
    flagsFound: {
      type: Number,
      default: 0
    },
    
    userFlagsFound: {
      type: Number,
      default: 0
    },
    
    rootFlagsFound: {
      type: Number,
      default: 0
    },
    
    // Streaks and achievements
    currentStreak: {
      type: Number,
      default: 0
    },
    
    longestStreak: {
      type: Number,
      default: 0
    },
    
    perfectRuns: {
      type: Number,
      default: 0 // Labs completed without wrong flag submissions
    },
    
    fastestCompletion: {
      type: Number,
      default: Infinity // Fastest lab completion in minutes
    },
    
    // Category-wise progress
    categoriesCompleted: {
      Web: { type: Number, default: 0 },
      Binary: { type: Number, default: 0 },
      Network: { type: Number, default: 0 },
      Crypto: { type: Number, default: 0 },
      Forensics: { type: Number, default: 0 },
      Misc: { type: Number, default: 0 }
    },
    
    categoriesExplored: {
      type: Number,
      default: 0
    },
    
    // Accuracy
    totalAttempts: {
      type: Number,
      default: 0
    },
    
    successfulAttempts: {
      type: Number,
      default: 0
    }
  },
  
  // Current active session info
  activeSession: {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    startedAt: Date,
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab'
    }
  },
  
  // User preferences
  preferences: {
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy'
    },
    
    favoriteCategory: String,
    
    notifications: {
      sessionExpiry: {
        type: Boolean,
        default: true
      },
      badgeEarned: {
        type: Boolean,
        default: true
      },
      newLabs: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Activity tracking
  activity: {
    lastLoginAt: Date,
    
    lastLabAt: Date,
    
    totalSessionTime: {
      type: Number,
      default: 0 // Total time in minutes across all sessions
    },
    
    averageSessionTime: {
      type: Number,
      default: 0
    },
    
    loginStreak: {
      type: Number,
      default: 0
    },
    
    favoriteLabTimes: {
      morning: { type: Number, default: 0 },    // 6-12
      afternoon: { type: Number, default: 0 },  // 12-18
      evening: { type: Number, default: 0 },    // 18-24
      night: { type: Number, default: 0 }       // 0-6
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for accuracy percentage
UserLabStatsSchema.virtual('accuracy').get(function() {
  if (this.labStats.totalAttempts === 0) return 100;
  return ((this.labStats.successfulAttempts / this.labStats.totalAttempts) * 100).toFixed(1);
});

// Virtual for completion rate
UserLabStatsSchema.virtual('completionRate').get(function() {
  if (this.labStats.labsAttempted === 0) return 0;
  return ((this.labStats.labsCompleted / this.labStats.labsAttempted) * 100).toFixed(1);
});

// Virtual for level based on points
UserLabStatsSchema.virtual('level').get(function() {
  const points = this.labStats.totalPoints;
  if (points < 100) return { level: 1, title: 'Novice' };
  if (points < 500) return { level: 2, title: 'Apprentice' };
  if (points < 1000) return { level: 3, title: 'Intermediate' };
  if (points < 2000) return { level: 4, title: 'Advanced' };
  if (points < 5000) return { level: 5, title: 'Expert' };
  return { level: 6, title: 'Master' };
});

// Static methods
UserLabStatsSchema.statics = {
  // Find or create user stats
  async findOrCreate(userId) {
    let stats = await this.findOne({ userId });
    if (!stats) {
      stats = new this({ userId });
      await stats.save();
    }
    return stats;
  },
  
  // Get leaderboard
  async getLeaderboard(limit = 50, category = null) {
    const matchStage = category 
      ? { [`labStats.categoriesCompleted.${category}`]: { $gt: 0 } }
      : {};
    
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          fullName: '$user.fullName',
          avatar: '$user.avatar',
          totalPoints: '$labStats.totalPoints',
          labsCompleted: '$labStats.labsCompleted',
          currentStreak: '$labStats.currentStreak',
          level: '$level',
          lastActivity: '$activity.lastLabAt'
        }
      },
      { $sort: { totalPoints: -1, labsCompleted: -1 } },
      { $limit: limit }
    ];
    
    return await this.aggregate(pipeline);
  },
  
  // Update ranks for all users
  async updateRanks() {
    const users = await this.find({})
      .sort({ 'labStats.totalPoints': -1, 'labStats.labsCompleted': -1 });
    
    for (let i = 0; i < users.length; i++) {
      users[i].labStats.rank = i + 1;
      await users[i].save();
    }
  }
};

// Instance methods
UserLabStatsSchema.methods = {
  // Update lab statistics after session
  async updateAfterSession(session, lab) {
    // Update basic stats
    this.labStats.labsAttempted += 1;
    
    if (session.isCompleted) {
      this.labStats.labsCompleted += 1;
      this.labStats.totalPoints += session.stats.totalPoints;
      this.labStats.flagsFound += session.stats.flagsFound;
      
      if (session.flags.user.isCorrect) this.labStats.userFlagsFound += 1;
      if (session.flags.root.isCorrect) this.labStats.rootFlagsFound += 1;
      
      // Update category progress
      this.labStats.categoriesCompleted[lab.category] += 1;
      
      // Update streaks
      this.labStats.currentStreak += 1;
      if (this.labStats.currentStreak > this.labStats.longestStreak) {
        this.labStats.longestStreak = this.labStats.currentStreak;
      }
      
      // Check for perfect run
      const submissions = await mongoose.model('FlagSubmission')
        .find({ sessionId: session._id, isCorrect: false });
      if (submissions.length === 0) {
        this.labStats.perfectRuns += 1;
      }
      
      // Update fastest completion
      if (session.stats.durationMinutes < this.labStats.fastestCompletion) {
        this.labStats.fastestCompletion = session.stats.durationMinutes;
      }
    } else {
      // Reset streak on failure
      this.labStats.currentStreak = 0;
    }
    
    // Update activity
    this.activity.lastLabAt = new Date();
    this.activity.totalSessionTime += session.stats.durationMinutes;
    this.activity.averageSessionTime = this.activity.totalSessionTime / this.labStats.labsAttempted;
    
    // Update time preference
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) this.activity.favoriteLabTimes.morning += 1;
    else if (hour >= 12 && hour < 18) this.activity.favoriteLabTimes.afternoon += 1;
    else if (hour >= 18 && hour < 24) this.activity.favoriteLabTimes.evening += 1;
    else this.activity.favoriteLabTimes.night += 1;
    
    // Clear active session
    this.activeSession = {};
    
    return await this.save();
  },
  
  // Set active session
  async setActiveSession(sessionId, labId) {
    this.activeSession = {
      sessionId,
      labId,
      startedAt: new Date()
    };
    return await this.save();
  },
  
  // Update flag submission stats
  async updateFlagStats(isCorrect) {
    this.labStats.totalAttempts += 1;
    if (isCorrect) {
      this.labStats.successfulAttempts += 1;
    }
    return await this.save();
  },
  
  // Get user badges
  async getBadges() {
    const userBadges = await UserBadge.find({ userId: this.userId })
      .populate('badgeId')
      .sort({ earnedAt: -1 });
    
    return userBadges.map(ub => ({
      badge: ub.badgeId,
      earnedAt: ub.earnedAt,
      context: ub.context
    }));
  },
  
  // Check and award new badges
  async checkForNewBadges() {
    const Badge = mongoose.model('Badge');
    const userStats = this.toObject();
    
    const eligibleBadges = await Badge.checkEligibility(this.userId, userStats);
    const newBadges = [];
    
    for (const badge of eligibleBadges) {
      const canEarn = await badge.canBeEarnedBy(this.userId);
      if (canEarn) {
        const result = await badge.awardTo(this.userId);
        if (result.awarded) {
          newBadges.push(result.userBadge);
        }
      }
    }
    
    return newBadges;
  }
};

export default mongoose.model('UserLabStats', UserLabStatsSchema);