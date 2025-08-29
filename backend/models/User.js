const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.isOAuthUser;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['donor', 'campaign-leader', 'admin', 'public'],
    default: 'donor'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  // OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  // Profile information
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || validator.isMobilePhone(v);
        },
        message: 'Please provide a valid phone number'
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    dateOfBirth: Date,
    organization: {
      name: String,
      website: String,
      description: String,
      registrationNumber: String
    }
  },
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      default: 'LKR',
      enum: ['LKR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'si', 'ta']
    },
    preferredCategories: [{
      type: String,
      enum: ['Health & Medical', 'Education', 'Environment', 'Emergency Relief', 
             'Animals & Wildlife', 'Community Development', 'Children & Youth', 
             'Arts & Culture', 'Sports & Recreation', 'Technology']
    }],
    donationPrivacy: {
      type: String,
      enum: ['public', 'anonymous', 'private'],
      default: 'public'
    }
  },
  // Statistics
  stats: {
    totalDonated: {
      type: Number,
      default: 0
    },
    donationCount: {
      type: Number,
      default: 0
    },
    campaignsSupported: {
      type: Number,
      default: 0
    },
    campaignsCreated: {
      type: Number,
      default: 0
    },
    totalRaised: {
      type: Number,
      default: 0
    },
    impactPoints: {
      type: Number,
      default: 0
    },
    donorLevel: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze'
    }
  },
  // Activity tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  banExpiresAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'stats.donorLevel': 1 });

// Virtual for full name
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Virtual for avatar URL
userSchema.virtual('avatarUrl').get(function() {
  if (this.avatar) {
    return this.avatar;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.displayName)}&background=4F46E5&color=fff&size=200`;
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update login stats
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.loginCount += 1;
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateDonorLevel = function() {
  const totalDonated = this.stats.totalDonated;
  if (totalDonated >= 100000) {
    this.stats.donorLevel = 'Diamond';
  } else if (totalDonated >= 50000) {
    this.stats.donorLevel = 'Platinum';
  } else if (totalDonated >= 25000) {
    this.stats.donorLevel = 'Gold';
  } else if (totalDonated >= 10000) {
    this.stats.donorLevel = 'Silver';
  } else {
    this.stats.donorLevel = 'Bronze';
  }
};

userSchema.methods.addDonation = function(amount) {
  this.stats.totalDonated += amount;
  this.stats.donationCount += 1;
  this.stats.impactPoints += Math.floor(amount / 100);
  this.updateDonorLevel();
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.getTopDonors = function(limit = 10) {
  return this.find({ role: 'donor', isActive: true })
             .sort({ 'stats.totalDonated': -1 })
             .limit(limit)
             .select('name avatar stats.totalDonated stats.donorLevel');
};

module.exports = mongoose.model('User', userSchema);

module.exports = mongoose.model('User', userSchema);
