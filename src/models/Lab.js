import mongoose from 'mongoose';

const LabSchema = new mongoose.Schema({
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
    maxlength: 1000
  },
  
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    index: true
  },
  
  category: {
    type: String,
    enum: ['Web', 'Binary', 'Network', 'Crypto', 'Forensics', 'Misc'],
    required: true,
    index: true
  },
  
  // File paths and VM info
  ovfPath: {
    type: String,
    required: false // Legacy field, kept for backward compatibility
  },
  
  baseImagePath: {
    type: String, // Path to qcow2 base image for KVM/libvirt
    required: false
  },
  
  ovaChecksum: {
    type: String,
    required: false // Legacy field
  },
  
  baseImageChecksum: {
    type: String, // Checksum for qcow2 base image
    required: false
  },
  
  templateVmId: {
    type: String, // Legacy: VirtualBox VM ID / Now: base image path
    index: true
  },
  
  // Flag configuration
  flags: {
    user: {
      template: {
        type: String,
        required: true
      },
      points: {
        type: Number,
        default: 25,
        min: 1,
        max: 100
      },
      locations: [{
        type: String // File paths where user flags are placed
      }]
    },
    root: {
      template: {
        type: String,
        required: true
      },
      points: {
        type: Number,
        default: 50,
        min: 1,
        max: 200
      },
      locations: [{
        type: String // File paths where root flags are placed
      }]
    }
  },
  
  // VM configuration
  vmConfig: {
    ram: {
      type: Number,
      default: 1024,
      min: 512,
      max: 8192
    },
    cpu: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    network: {
      type: String,
      default: 'nat',
      enum: ['nat', 'bridged', 'host-only']
    },
    diskSize: {
      type: Number, // In GB
      default: 20
    }
  },
  
  // Default credentials for SSH access
  defaultCredentials: {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  
  // Root credentials for flag injection (optional)
  rootCredentials: {
    username: {
      type: String,
      default: 'root'
    },
    password: {
      type: String
    }
  },
  
  // Lab metadata
  services: [{
    type: String // e.g., "SSH (22)", "HTTP (80)"
  }],
  
  vulnerabilities: [{
    type: String // e.g., "SQL Injection", "Buffer Overflow"
  }],
  
  estimatedSolveTime: {
    type: String, // e.g., "2-4 hours"
    default: "1-3 hours"
  },
  
  // Status and management
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to existing User model from frontend-team
    required: true
  },
  
  // Statistics
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number, // In minutes
      default: 0
    },
    userFlagSubmissions: {
      type: Number,
      default: 0
    },
    rootFlagSubmissions: {
      type: Number,
      default: 0
    }
  },
  
  // Rating system
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
LabSchema.index({ difficulty: 1, category: 1 });
LabSchema.index({ isActive: 1, createdAt: -1 });
LabSchema.index({ 'stats.totalSessions': -1 });

// Virtual for completion rate
LabSchema.virtual('completionRate').get(function() {
  if (this.stats.totalSessions === 0) return 0;
  return ((this.stats.totalCompletions / this.stats.totalSessions) * 100).toFixed(1);
});

// Virtual for total points possible
LabSchema.virtual('totalPoints').get(function() {
  return this.flags.user.points + this.flags.root.points;
});

// Static methods
LabSchema.statics = {
  // Find active labs
  findActive() {
    return this.find({ isActive: true }).sort({ createdAt: -1 });
  },
  
  // Find by category
  findByCategory(category) {
    return this.find({ category, isActive: true }).sort({ 'stats.totalSessions': -1 });
  },
  
  // Find by difficulty
  findByDifficulty(difficulty) {
    return this.find({ difficulty, isActive: true }).sort({ 'stats.totalSessions': -1 });
  },
  
  // Get popular labs
  findPopular(limit = 10) {
    return this.find({ isActive: true })
      .sort({ 'stats.totalSessions': -1 })
      .limit(limit);
  }
};

// Instance methods
LabSchema.methods = {
  // Increment session count
  async incrementSession() {
    this.stats.totalSessions += 1;
    return await this.save();
  },
  
  // Increment completion count
  async incrementCompletion(completionTimeMinutes) {
    this.stats.totalCompletions += 1;
    
    // Update average completion time
    const totalTime = this.stats.averageCompletionTime * (this.stats.totalCompletions - 1);
    this.stats.averageCompletionTime = (totalTime + completionTimeMinutes) / this.stats.totalCompletions;
    
    return await this.save();
  },
  
  // Increment flag submission counts
  async incrementFlagSubmission(flagType) {
    if (flagType === 'user') {
      this.stats.userFlagSubmissions += 1;
    } else if (flagType === 'root') {
      this.stats.rootFlagSubmissions += 1;
    }
    return await this.save();
  },
  
  // Add rating
  async addRating(rating) {
    const totalRating = this.rating.average * this.rating.count;
    this.rating.count += 1;
    this.rating.average = (totalRating + rating) / this.rating.count;
    return await this.save();
  }
};

// Pre-save middleware
LabSchema.pre('save', function(next) {
  // Ensure flag templates contain placeholders
  if (this.flags.user.template && !this.flags.user.template.includes('{')) {
    return next(new Error('User flag template must contain placeholders like {session}'));
  }
  if (this.flags.root.template && !this.flags.root.template.includes('{')) {
    return next(new Error('Root flag template must contain placeholders like {session}'));
  }
  next();
});

export default mongoose.model('Lab', LabSchema);