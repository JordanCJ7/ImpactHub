const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google OAuth
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['donor', 'organization', 'admin'],
    default: 'donor'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD']
    },
    preferredCategories: [{
      type: String,
      enum: ['education', 'health', 'environment', 'poverty', 'disaster-relief', 'other']
    }]
  },
  donationStats: {
    totalDonated: {
      type: Number,
      default: 0
    },
    donationCount: {
      type: Number,
      default: 0
    },
    favoriteCauses: [{
      type: String,
      enum: ['education', 'health', 'environment', 'poverty', 'disaster-relief', 'other']
    }]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
