import mongoose from 'mongoose';

// Reference to the User model from main-backend
// This allows labs-backend to update User fields like labsProgress and labsStats
const UserSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  email: String,
  labsProgress: [{
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab' },
    sessionsStarted: { type: Number, default: 0 },
    flagsCaptured: {
      user: { type: Boolean, default: false },
      root: { type: Boolean, default: false }
    },
    points: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    firstAttemptAt: Date,
    completedAt: Date,
    bestTime: Number,
    attempts: { type: Number, default: 0 }
  }],
  labsStats: {
    totalSessions: { type: Number, default: 0 },
    totalFlagsCaptured: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    labsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    rank: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Use existing 'users' collection from main-backend
// Check if model already exists to prevent overwrite error
export default mongoose.models.User || mongoose.model('User', UserSchema, 'users');
