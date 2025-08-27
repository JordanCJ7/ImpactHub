const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be at least $1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['education', 'health', 'environment', 'poverty', 'disaster-relief', 'other']
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true
  },
  organizationEmail: {
    type: String,
    required: [true, 'Organization email is required'],
    lowercase: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'suspended'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  impactReports: [{
    title: String,
    description: String,
    reportDate: {
      type: Date,
      default: Date.now
    },
    attachmentUrl: String
  }],
  donationCount: {
    type: Number,
    default: 0
  },
  socialShares: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
campaignSchema.virtual('progressPercentage').get(function() {
  return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const timeDiff = this.endDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(daysDiff, 0);
});

campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);
