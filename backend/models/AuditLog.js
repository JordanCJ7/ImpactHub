const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'user_login',
      'user_logout',
      'password_changed',
      'email_verified',
      'campaign_created',
      'campaign_updated',
      'campaign_deleted',
      'campaign_approved',
      'campaign_rejected',
      'campaign_suspended',
      'donation_made',
      'donation_refunded',
      'payment_processed',
      'payment_failed',
      'admin_action',
      'data_export',
      'settings_changed'
    ]
  },
  resource: {
    type: String,
    enum: ['user', 'campaign', 'donation', 'notification', 'system']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String,
  location: {
    country: String,
    region: String,
    city: String
  },
  outcome: {
    type: String,
    enum: ['success', 'failure', 'partial'],
    default: 'success'
  },
  errorMessage: String
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

// Static methods
auditLogSchema.statics.logAction = function(data) {
  return this.create(data);
};

auditLogSchema.statics.getUserActivity = function(userId, limit = 50) {
  return this.find({ user: userId })
             .sort({ createdAt: -1 })
             .limit(limit);
};

auditLogSchema.statics.getResourceHistory = function(resource, resourceId) {
  return this.find({ resource, resourceId })
             .populate('user', 'name email')
             .sort({ createdAt: -1 });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
