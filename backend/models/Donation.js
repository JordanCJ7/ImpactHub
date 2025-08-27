const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: [true, 'Campaign ID is required']
  },
  donorEmail: {
    type: String,
    required: [true, 'Donor email is required'],
    lowercase: true,
    trim: true
  },
  donorName: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Minimum donation amount is $1']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD']
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal'],
    default: 'stripe'
  },
  paymentIntentId: {
    type: String,
    required: [true, 'Payment intent ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters'],
    trim: true
  },
  receiptEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
donationSchema.index({ campaignId: 1, createdAt: -1 });
donationSchema.index({ donorEmail: 1, createdAt: -1 });
donationSchema.index({ status: 1 });

module.exports = mongoose.model('Donation', donationSchema);
