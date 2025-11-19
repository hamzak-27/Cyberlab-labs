import mongoose from 'mongoose';

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  icon: {
    type: String, // URL or emoji or icon class
    default: '🏆'
  },
  
  // Badge criteria
  criteria: {
    type: {
      type: String,
      enum: [
        'labs_completed',     // Complete X labs
        'points_earned',      // Earn X points
        'streak',            // X consecutive correct flags
        'category_master',   // Complete all labs in category
        'speed_demon',       // Complete lab in under X minutes
        'perfectionist',     // Complete lab without wrong flag submissions
        'first_blood',       // First to complete a new lab
        'dedication',        // Login X consecutive days
        'explorer'           // Complete labs in all categories
      ],
      required: true
    },
    
    value: {
      type: Number, // Required value (e.g., 10 for 10 labs completed)
      required: true,
      min: 1
    },
    
    // Additional criteria parameters
    category: String,        // For category_master
    timeLimit: Number,       // For speed_demon (in minutes)
    labIds: [String]        // For specific lab requirements
  },
  
  // Badge properties
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
    index: true
  },
  
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Badge status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Hidden badges (shown only when earned)
  isHidden: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  stats: {
    totalAwarded: {
      type: Number,
      default: 0
    },
    firstEarnedAt: Date,
    lastEarnedAt: Date
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  color: {
    type: String,
    default: '#FFD700' // Gold color
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
BadgeSchema.index({ rarity: 1, isActive: 1 });
BadgeSchema.index({ 'criteria.type': 1 });
BadgeSchema.index({ isActive: 1, isHidden: 1 });

// Virtual for rarity score
BadgeSchema.virtual('rarityScore').get(function() {
  const scores = { common: 1, rare: 2, epic: 3, legendary: 4 };
  return scores[this.rarity] || 1;
});

// Virtual for completion rate
BadgeSchema.virtual('completionRate').get(function() {
  // This would need to be calculated against total user count
  return 0; // Placeholder
});

// Static methods
BadgeSchema.statics = {
  // Find active badges
  findActive() {
    return this.find({ isActive: true, isHidden: false })
      .sort({ rarity: 1, name: 1 });
  },
  
  // Find badges by rarity
  findByRarity(rarity) {
    return this.find({ rarity, isActive: true })
      .sort({ name: 1 });
  },
  
  // Find badges by criteria type
  findByCriteria(criteriaType) {
    return this.find({ 
      'criteria.type': criteriaType, 
      isActive: true 
    });
  },
  
  // Check if user is eligible for any badges
  async checkEligibility(userId, userStats) {
    const badges = await this.find({ isActive: true });
    const eligibleBadges = [];
    
    for (const badge of badges) {
      const isEligible = await this.isUserEligible(badge, userId, userStats);
      if (isEligible) {
        eligibleBadges.push(badge);
      }
    }
    
    return eligibleBadges;
  },
  
  // Check if user meets badge criteria
  async isUserEligible(badge, userId, userStats) {
    const { type, value, category, timeLimit } = badge.criteria;
    
    switch (type) {
      case 'labs_completed':
        return userStats.labsCompleted >= value;
        
      case 'points_earned':
        return userStats.totalPoints >= value;
        
      case 'category_master':
        // Check if user completed all labs in category
        const Lab = mongoose.model('Lab');
        const totalLabsInCategory = await Lab.countDocuments({ 
          category, 
          isActive: true 
        });
        const userCompletedInCategory = userStats.categoriesCompleted[category] || 0;
        return userCompletedInCategory >= totalLabsInCategory && totalLabsInCategory >= value;
        
      case 'streak':
        return userStats.currentStreak >= value;
        
      case 'perfectionist':
        return userStats.perfectRuns >= value;
        
      case 'speed_demon':
        return userStats.fastestCompletion <= timeLimit;
        
      case 'explorer':
        const totalCategories = await Lab.distinct('category', { isActive: true });
        return userStats.categoriesExplored >= totalCategories.length;
        
      default:
        return false;
    }
  },
  
  // Get popular badges
  findPopular(limit = 10) {
    return this.find({ isActive: true })
      .sort({ 'stats.totalAwarded': -1 })
      .limit(limit);
  }
};

// Instance methods
BadgeSchema.methods = {
  // Award badge to user
  async awardTo(userId) {
    const UserBadge = mongoose.model('UserBadge');
    
    // Check if user already has this badge
    const existingAward = await UserBadge.findOne({
      userId,
      badgeId: this._id
    });
    
    if (existingAward) {
      return { awarded: false, reason: 'Badge already owned' };
    }
    
    // Create badge award
    const userBadge = new UserBadge({
      userId,
      badgeId: this._id,
      earnedAt: new Date()
    });
    
    await userBadge.save();
    
    // Update badge statistics
    this.stats.totalAwarded += 1;
    if (!this.stats.firstEarnedAt) {
      this.stats.firstEarnedAt = new Date();
    }
    this.stats.lastEarnedAt = new Date();
    
    await this.save();
    
    return { awarded: true, userBadge };
  },
  
  // Check if badge can be earned by user
  async canBeEarnedBy(userId) {
    const UserBadge = mongoose.model('UserBadge');
    
    // Check if user already has badge
    const hasBadge = await UserBadge.exists({
      userId,
      badgeId: this._id
    });
    
    return !hasBadge && this.isActive;
  }
};

export default mongoose.model('Badge', BadgeSchema);