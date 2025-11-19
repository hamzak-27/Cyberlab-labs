import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  // User and Lab references
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to existing User model from frontend-team
    required: true,
    index: true
  },
  
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
    index: true
  },
  
  // VM instance details
  vmInstanceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  vmName: {
    type: String,
    required: true
  },
  
  // Session status
  status: {
    type: String,
    enum: ['starting', 'running', 'stopping', 'stopped', 'failed', 'expired'],
    default: 'starting',
    index: true
  },
  
  // Network connection information
  connectionInfo: mongoose.Schema.Types.Mixed,  // Allow flexible connection info for different network modes
  
  // Generated flags for this session
  flags: {
    user: {
      value: {
        type: String,
        required: true
      },
      foundAt: Date,
      submitted: {
        type: Boolean,
        default: false
      },
      submittedAt: Date,
      isCorrect: {
        type: Boolean,
        default: false
      }
    },
    root: {
      value: {
        type: String,
        required: true
      },
      foundAt: Date,
      submitted: {
        type: Boolean,
        default: false
      },
      submittedAt: Date,
      isCorrect: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Session timing
  startedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    default: function() {
      return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    }
  },
  
  stoppedAt: Date,
  
  // Session statistics
  stats: {
    totalPoints: {
      type: Number,
      default: 0
    },
    flagsFound: {
      type: Number,
      default: 0,
      max: 2
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    durationMinutes: {
      type: Number,
      default: 0
    }
  },
  
  // Error tracking
  errors: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['vm_start_failed', 'vm_stop_failed', 'flag_injection_failed', 'network_error', 'timeout']
    },
    message: String,
    details: mongoose.Schema.Types.Mixed
  }],
  
  // Additional metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    isExtended: {
      type: Boolean,
      default: false
    },
    extensionCount: {
      type: Number,
      default: 0,
      max: 3 // Limit extensions
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
SessionSchema.index({ userId: 1, status: 1 });
SessionSchema.index({ status: 1, expiresAt: 1 });
SessionSchema.index({ labId: 1, createdAt: -1 });

// TTL index for automatic cleanup of expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for session duration
SessionSchema.virtual('duration').get(function() {
  const endTime = this.stoppedAt || new Date();
  return Math.round((endTime - this.startedAt) / 1000 / 60); // Duration in minutes
});

// Virtual for time remaining
SessionSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const remaining = Math.max(0, this.expiresAt - now);
  return Math.round(remaining / 1000 / 60); // Minutes remaining
});

// Virtual for is expired
SessionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for is active
SessionSchema.virtual('isActive').get(function() {
  return ['starting', 'running'].includes(this.status) && !this.isExpired;
});

// Virtual for completion status
SessionSchema.virtual('isCompleted').get(function() {
  return this.flags.user.submitted && this.flags.root.submitted;
});

// Static methods
SessionSchema.statics = {
  // Find active sessions for a user
  findActiveByUser(userId) {
    return this.findOne({
      userId,
      status: { $in: ['starting', 'running'] },
      expiresAt: { $gt: new Date() }
    });
  },
  
  // Find sessions by lab
  findByLab(labId, limit = 50) {
    return this.find({ labId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username fullName');
  },
  
  // Find expired sessions that need cleanup
  findExpired() {
    return this.find({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: { $in: ['stopping', 'stopped'] } }
      ]
    });
  },
  
  // Get session statistics
  async getStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          activeSessions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['starting', 'running']] },
                    { $gt: ['$expiresAt', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          completedSessions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    '$flags.user.submitted',
                    '$flags.root.submitted'
                  ]
                },
                1,
                0
              ]
            }
          },
          averageDuration: { $avg: '$stats.durationMinutes' }
        }
      }
    ]);
    
    return stats[0] || {
      totalSessions: 0,
      activeSessions: 0,
      completedSessions: 0,
      averageDuration: 0
    };
  }
};

// Instance methods
SessionSchema.methods = {
  // Update last activity
  async updateActivity() {
    this.lastActivity = new Date();
    return await this.save();
  },
  
  // Extend session timeout
  async extend(additionalMinutes = 30) {
    if (this.metadata.extensionCount >= 3) {
      throw new Error('Maximum extensions reached');
    }
    
    this.expiresAt = new Date(this.expiresAt.getTime() + additionalMinutes * 60 * 1000);
    this.metadata.isExtended = true;
    this.metadata.extensionCount += 1;
    
    return await this.save();
  },
  
  // Mark flag as submitted
  async submitFlag(flagType, isCorrect = false, points = 0) {
    if (!['user', 'root'].includes(flagType)) {
      throw new Error('Invalid flag type');
    }
    
    this.flags[flagType].submitted = true;
    this.flags[flagType].submittedAt = new Date();
    this.flags[flagType].isCorrect = isCorrect;
    
    if (isCorrect) {
      this.flags[flagType].foundAt = new Date();
      this.stats.totalPoints += points;
      this.stats.flagsFound += 1;
      
      // Update completion percentage
      this.stats.completionPercentage = (this.stats.flagsFound / 2) * 100;
    }
    
    return await this.save();
  },
  
  // Stop session
  async stop() {
    this.status = 'stopping';
    this.stoppedAt = new Date();
    this.stats.durationMinutes = this.duration;
    return await this.save();
  },
  
  // Mark as completed
  async complete() {
    this.status = 'stopped';
    if (!this.stoppedAt) {
      this.stoppedAt = new Date();
    }
    this.stats.durationMinutes = this.duration;
    return await this.save();
  },
  
  // Add error
  async addError(type, message, details = null) {
    this.errors.push({
      type,
      message,
      details
    });
    
    // If too many errors, mark as failed
    if (this.errors.length > 5) {
      this.status = 'failed';
    }
    
    return await this.save();
  }
};

// Pre-save middleware
SessionSchema.pre('save', function(next) {
  // Update duration if session is stopped
  if (this.stoppedAt && this.stats.durationMinutes === 0) {
    this.stats.durationMinutes = this.duration;
  }
  
  next();
});

// Post-save middleware for cleanup
SessionSchema.post('save', async function(doc) {
  // If session is completed, trigger cleanup after a delay
  if (doc.status === 'stopped' && doc.isModified('status')) {
    // Schedule cleanup job here if needed
    console.log(`Session ${doc._id} completed, scheduling cleanup`);
  }
});

export default mongoose.model('Session', SessionSchema);