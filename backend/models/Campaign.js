const mongoose = require('mongoose');
const validator = require('validator');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    minlength: [10, 'Title must be at least 10 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    maxlength: [5000, 'Description cannot be more than 5000 characters'],
    minlength: [50, 'Description must be at least 50 characters']
  },
  story: {
    type: String,
    maxlength: [10000, 'Story cannot be more than 10000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  // Financial details
  goal: {
    type: Number,
    required: [true, 'Goal amount is required'],
    min: [100, 'Goal amount must be at least LKR 100']
  },
  raised: {
    type: Number,
    default: 0,
    min: [0, 'Raised amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']
  },
  // Campaign details
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Health & Medical', 'Education', 'Environment', 'Emergency Relief', 
           'Animals & Wildlife', 'Community Development', 'Children & Youth', 
           'Arts & Culture', 'Sports & Recreation', 'Technology']
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  location: {
    type: String,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  beneficiaries: {
    type: String,
    maxlength: [500, 'Beneficiaries description cannot be more than 500 characters']
  },
  // Creator information
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Campaign creator is required']
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot be more than 100 characters']
  },
  organizationEmail: {
    type: String,
    required: [true, 'Organization email is required'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid organization email']
  },
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  video: {
    url: String,
    caption: String
  },
  // Timeline
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  duration: {
    type: Number, // Duration in days
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  // Status and approval
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'completed', 'suspended', 'cancelled'],
    default: 'draft'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  // Planning and implementation
  timeline: {
    type: String,
    maxlength: [2000, 'Timeline cannot be more than 2000 characters']
  },
  budget: {
    type: String,
    maxlength: [2000, 'Budget breakdown cannot be more than 2000 characters']
  },
  risks: {
    type: String,
    maxlength: [1000, 'Risk assessment cannot be more than 1000 characters']
  },
  // Progress tracking
  updates: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Update title cannot be more than 100 characters']
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Update content cannot be more than 2000 characters']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    donorCount: {
      type: Number,
      default: 0
    },
    averageDonation: {
      type: Number,
      default: 0
    },
    topDonation: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  // Features
  features: {
    allowAnonymousDonations: {
      type: Boolean,
      default: true
    },
    allowRecurringDonations: {
      type: Boolean,
      default: false
    },
    sendUpdatesToDonors: {
      type: Boolean,
      default: true
    },
    allowComments: {
      type: Boolean,
      default: true
    }
  },
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
campaignSchema.index({ status: 1, approvalStatus: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ creator: 1 });
campaignSchema.index({ endDate: 1 });
campaignSchema.index({ 'analytics.views': -1 });
campaignSchema.index({ raised: -1 });
campaignSchema.index({ createdAt: -1 });

// Virtuals
campaignSchema.virtual('progressPercentage').get(function() {
  if (!this.goal || this.goal === 0) return 0;
  return Math.min(Math.round((this.raised / this.goal) * 100), 100);
});

campaignSchema.virtual('daysLeft').get(function() {
  if (!this.endDate) return 0;
  const today = new Date();
  const timeDiff = this.endDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(daysDiff, 0);
});

campaignSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.daysLeft > 0;
});

campaignSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : this.images[0].url;
});

campaignSchema.virtual('donationProgress').get(function() {
  return {
    raised: this.raised,
    goal: this.goal,
    percentage: this.progressPercentage,
    remaining: Math.max(this.goal - this.raised, 0),
    donorCount: this.analytics.donorCount
  };
});

// Pre-save middleware
campaignSchema.pre('save', function(next) {
  // Set duration based on start and end dates
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    this.duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  
  // Generate short description if not provided
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 197) + '...';
  }
  
  // Update conversion rate
  if (this.analytics.uniqueViews > 0) {
    this.analytics.conversionRate = (this.analytics.donorCount / this.analytics.uniqueViews) * 100;
  }
  
  next();
});

// Instance methods
campaignSchema.methods.addDonation = function(amount) {
  this.raised += amount;
  this.analytics.donorCount += 1;
  
  // Update analytics
  this.analytics.averageDonation = this.raised / this.analytics.donorCount;
  if (amount > this.analytics.topDonation) {
    this.analytics.topDonation = amount;
  }
  
  // Check if campaign is completed
  if (this.raised >= this.goal) {
    this.status = 'completed';
  }
};

campaignSchema.methods.addView = function(isUnique = false) {
  this.analytics.views += 1;
  if (isUnique) {
    this.analytics.uniqueViews += 1;
  }
};

campaignSchema.methods.addShare = function() {
  this.analytics.shares += 1;
};

campaignSchema.methods.addUpdate = function(updateData) {
  this.updates.push({
    title: updateData.title,
    content: updateData.content,
    images: updateData.images || [],
    isPublic: updateData.isPublic !== false
  });
};

// Static methods
campaignSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ 
    status: 'active', 
    approvalStatus: 'approved',
    endDate: { $gt: new Date() }
  })
  .populate('creator', 'name avatar')
  .sort({ 'analytics.views': -1, createdAt: -1 })
  .limit(limit);
};

campaignSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ 
    category, 
    status: 'active', 
    approvalStatus: 'approved',
    endDate: { $gt: new Date() }
  })
  .populate('creator', 'name avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
};

campaignSchema.statics.getUrgent = function(limit = 5) {
  return this.find({ 
    status: 'active', 
    approvalStatus: 'approved',
    endDate: { $gt: new Date() }
  })
  .populate('creator', 'name avatar')
  .sort({ endDate: 1 }) // Ending soon first
  .limit(limit);
};

campaignSchema.statics.getTrending = function(limit = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        status: 'active',
        approvalStatus: 'approved',
        endDate: { $gt: new Date() },
        createdAt: { $gte: oneWeekAgo }
      }
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ['$analytics.views', 0.3] },
            { $multiply: ['$analytics.donorCount', 0.4] },
            { $multiply: ['$analytics.shares', 0.3] }
          ]
        }
      }
    },
    { $sort: { trendingScore: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Campaign', campaignSchema);

campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);
