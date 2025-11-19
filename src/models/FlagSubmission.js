import mongoose from 'mongoose';
import crypto from 'crypto';

const FlagSubmissionSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  sessionId: {
    type: String, // vmInstanceId from Session
    required: true,
    index: true
  },
  
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
    index: true
  },
  
  // Flag details
  flagType: {
    type: String,
    enum: ['user', 'root'],
    required: true,
    index: true
  },
  
  submittedFlag: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  expectedFlag: {
    type: String,
    required: true
  },
  
  isCorrect: {
    type: Boolean,
    required: true,
    index: true
  },
  
  // Points and scoring
  pointsAwarded: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timing
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  responseTime: {
    type: Number, // Milliseconds taken to respond
    default: 0
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    attemptNumber: {
      type: Number,
      default: 1
    },
    hintsUsed: {
      type: Number,
      default: 0
    }
  },
  
  // Security
  hash: {
    type: String, // Hash of submission for integrity
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for performance and analytics
FlagSubmissionSchema.index({ userId: 1, isCorrect: 1, submittedAt: -1 });
FlagSubmissionSchema.index({ labId: 1, flagType: 1, isCorrect: 1 });
FlagSubmissionSchema.index({ sessionId: 1, submittedAt: 1 });

// Virtual for points efficiency (points per attempt)
FlagSubmissionSchema.virtual('efficiency').get(function() {
  return this.metadata.attemptNumber > 0 ? this.pointsAwarded / this.metadata.attemptNumber : 0;
});

// Static methods
FlagSubmissionSchema.statics = {
  // Get user statistics
  async getUserStats(userId) {
    const stats = await this.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          correctSubmissions: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          totalPoints: { $sum: '$pointsAwarded' },
          userFlags: {
            $sum: { $cond: [{ $and: ['$isCorrect', { $eq: ['$flagType', 'user'] }] }, 1, 0] }
          },
          rootFlags: {
            $sum: { $cond: [{ $and: ['$isCorrect', { $eq: ['$flagType', 'root'] }] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalSubmissions: 0,
      correctSubmissions: 0,
      totalPoints: 0,
      userFlags: 0,
      rootFlags: 0
    };
    
    result.accuracy = result.totalSubmissions > 0 
      ? ((result.correctSubmissions / result.totalSubmissions) * 100).toFixed(1)
      : 0;
    
    return result;
  },
  
  // Get lab statistics
  async getLabStats(labId) {
    const stats = await this.aggregate([
      { $match: { labId: new mongoose.Types.ObjectId(labId) } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          userFlagAttempts: {
            $sum: { $cond: [{ $eq: ['$flagType', 'user'] }, 1, 0] }
          },
          rootFlagAttempts: {
            $sum: { $cond: [{ $eq: ['$flagType', 'root'] }, 1, 0] }
          },
          userFlagSuccesses: {
            $sum: { $cond: [{ $and: ['$isCorrect', { $eq: ['$flagType', 'user'] }] }, 1, 0] }
          },
          rootFlagSuccesses: {
            $sum: { $cond: [{ $and: ['$isCorrect', { $eq: ['$flagType', 'root'] }] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalAttempts: 0,
      uniqueUsers: [],
      correctAttempts: 0,
      userFlagAttempts: 0,
      rootFlagAttempts: 0,
      userFlagSuccesses: 0,
      rootFlagSuccesses: 0
    };
    
    result.uniqueUserCount = result.uniqueUsers.length;
    result.successRate = result.totalAttempts > 0 
      ? ((result.correctAttempts / result.totalAttempts) * 100).toFixed(1)
      : 0;
    result.userFlagSuccessRate = result.userFlagAttempts > 0
      ? ((result.userFlagSuccesses / result.userFlagAttempts) * 100).toFixed(1)
      : 0;
    result.rootFlagSuccessRate = result.rootFlagAttempts > 0
      ? ((result.rootFlagSuccesses / result.rootFlagAttempts) * 100).toFixed(1)
      : 0;
    
    delete result.uniqueUsers; // Remove the array for cleaner response
    
    return result;
  },
  
  // Get recent submissions
  findRecentByUser(userId, limit = 20) {
    return this.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(limit)
      .populate('labId', 'name difficulty category')
      .populate('sessionId', 'startedAt status');
  },
  
  // Find attempts for a specific session
  findBySession(sessionId) {
    return this.find({ sessionId })
      .sort({ submittedAt: 1 });
  },
  
  // Get leaderboard data
  async getTopSubmitters(limit = 50) {
    const topUsers = await this.aggregate([
      { $match: { isCorrect: true } },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$pointsAwarded' },
          totalCorrect: { $sum: 1 },
          userFlags: {
            $sum: { $cond: [{ $eq: ['$flagType', 'user'] }, 1, 0] }
          },
          rootFlags: {
            $sum: { $cond: [{ $eq: ['$flagType', 'root'] }, 1, 0] }
          },
          lastSubmission: { $max: '$submittedAt' }
        }
      },
      { $sort: { totalPoints: -1, lastSubmission: -1 } },
      { $limit: limit }
    ]);
    
    // Populate user details
    await mongoose.model('User').populate(topUsers, {
      path: '_id',
      select: 'username fullName avatar'
    });
    
    return topUsers.map((user, index) => ({
      rank: index + 1,
      user: user._id,
      totalPoints: user.totalPoints,
      totalCorrect: user.totalCorrect,
      userFlags: user.userFlags,
      rootFlags: user.rootFlags,
      lastActivity: user.lastSubmission
    }));
  }
};

// Instance methods
FlagSubmissionSchema.methods = {
  // Validate submission integrity
  validateIntegrity() {
    const expectedHash = crypto.createHash('sha256')
      .update(`${this.userId}${this.sessionId}${this.submittedFlag}${this.submittedAt}`)
      .digest('hex');
    
    return this.hash === expectedHash;
  }
};

// Pre-save middleware
FlagSubmissionSchema.pre('save', function(next) {
  // Generate hash for integrity
  if (!this.hash) {
    this.hash = crypto.createHash('sha256')
      .update(`${this.userId}${this.sessionId}${this.submittedFlag}${this.submittedAt}`)
      .digest('hex');
  }
  
  next();
});

export default mongoose.model('FlagSubmission', FlagSubmissionSchema);