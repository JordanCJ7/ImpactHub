const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Core donation details
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Donation amount must be at least 1'],
    max: [1000000, 'Donation amount cannot exceed 1,000,000']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']
  },
  // References
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isAnonymous;
    }
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: [true, 'Campaign reference is required']
  },
  // Donation options
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  },
  recurringEndDate: {
    type: Date,
    required: function() {
      return this.isRecurring;
    }
  },
  // Anonymous donor details (if applicable)
  anonymousDonor: {
    name: {
      type: String,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      lowercase: true
    },
    country: String
  },
  // Payment details
  payment: {
    paymentId: {
      type: String,
      required: [true, 'Payment ID is required']
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'paypal', 'stripe', 'razorpay', 'payhere'],
      required: [true, 'Payment method is required']
    },
    transactionId: String,
    processingFee: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    },
    currency: String,
    exchangeRate: {
      type: Number,
      default: 1
    },
    paymentGateway: String,
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      select: false // Don't include in regular queries for security
    }
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  failureReason: String,
  refundReason: String,
  refundedAt: Date,
  // Additional information
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters'],
    trim: true
  },
  dedicatedTo: {
    type: String,
    maxlength: [100, 'Dedication cannot be more than 100 characters'],
    trim: true
  },
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      enum: ['web', 'mobile_app', 'api', 'widget', 'social_media'],
      default: 'web'
    },
    referrer: String,
    campaign_source: String,
    campaign_medium: String,
    campaign_name: String
  },
  // Tax and receipts
  tax: {
    isEligible: {
      type: Boolean,
      default: true
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    receiptGenerated: {
      type: Boolean,
      default: false
    },
    receiptUrl: String,
    taxYear: Number
  },
  // Communication
  communication: {
    confirmationSent: {
      type: Boolean,
      default: false
    },
    confirmationSentAt: Date,
    thankyouSent: {
      type: Boolean,
      default: false
    },
    thankyouSentAt: Date,
    updatePreference: {
      type: String,
      enum: ['all', 'major', 'none'],
      default: 'all'
    }
  },
  // Verification
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationMethod: {
      type: String,
      enum: ['automatic', 'manual', 'bank_confirmation']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ campaign: 1, createdAt: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ 'payment.paymentId': 1 });
donationSchema.index({ 'tax.receiptNumber': 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ amount: -1 });

// Virtuals
donationSchema.virtual('displayAmount').get(function() {
  return `${this.currency} ${this.amount.toLocaleString()}`;
});

donationSchema.virtual('donorName').get(function() {
  if (this.isAnonymous) {
    return 'Anonymous';
  }
  if (this.donor && typeof this.donor === 'object' && this.donor.name) {
    return this.donor.name;
  }
  if (this.anonymousDonor && this.anonymousDonor.name) {
    return this.anonymousDonor.name;
  }
  return 'Anonymous';
});

donationSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

donationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Pre-save middleware
donationSchema.pre('save', function(next) {
  // Generate receipt number for completed donations
  if (this.status === 'completed' && !this.tax.receiptNumber) {
    this.tax.receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    this.tax.taxYear = new Date().getFullYear();
  }
  
  // Calculate net amount if not provided
  if (!this.payment.netAmount) {
    this.payment.netAmount = this.amount - (this.payment.processingFee || 0);
  }
  
  next();
});

// Static methods
donationSchema.statics.getTotalRaised = function(campaignId) {
  return this.aggregate([
    { $match: { campaign: campaignId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

donationSchema.statics.getTopDonations = function(limit = 10) {
  return this.find({ status: 'completed' })
             .populate('donor', 'name avatar')
             .populate('campaign', 'title')
             .sort({ amount: -1 })
             .limit(limit);
};

donationSchema.statics.getRecentDonations = function(limit = 20) {
  return this.find({ status: 'completed' })
             .populate('donor', 'name avatar')
             .populate('campaign', 'title')
             .sort({ createdAt: -1 })
             .limit(limit);
};

donationSchema.statics.getDonationsByUser = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ donor: userId })
             .populate('campaign', 'title images')
             .sort({ createdAt: -1 })
             .skip(skip)
             .limit(limit);
};

donationSchema.statics.getDonationStats = function(startDate, endDate) {
  const matchStage = {
    status: 'completed',
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        averageDonation: { $avg: '$amount' },
        maxDonation: { $max: '$amount' },
        minDonation: { $min: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Donation', donationSchema);
