import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

// Reference to User model (shared with frontend-team)
// We'll dynamically import it to avoid circular dependencies
let User = null;

const getUserModel = async () => {
  if (!User) {
    try {
      // Try to import from frontend-team models first, fallback to our own reference
      User = (await import('../../frontend-team/backend/src/models/User.js')).default;
    } catch (error) {
      // Create our own User reference that matches frontend-team structure
      const mongoose = await import('mongoose');
      
      // Check if model already exists to avoid OverwriteModelError
      if (mongoose.default.models.User) {
        User = mongoose.default.models.User;
      } else {
        const userSchema = new mongoose.Schema({
          username: String,
          fullName: String,
          email: String,
          role: { type: String, enum: ['user', 'admin'], default: 'user' },
          avatar: String,
          token: Number
        });
        User = mongoose.default.model('User', userSchema);
      }
    }
  }
  return User;
};
