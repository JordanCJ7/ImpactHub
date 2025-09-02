const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const AuditLog = require('../models/AuditLog');

// Get platform statistics
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCampaigns = await Campaign.countDocuments();
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    
    const totalAmountResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult[0]?.total || 0;

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const campaignsByStatus = await Campaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalCampaigns,
        totalDonations,
        totalAmount,
        usersByRole,
        campaignsByStatus
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch platform statistics'
    });
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    let filter = {};
    if (role) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('stats');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Failed to fetch user'
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be active, suspended, or banned'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'user_status_updated',
      resource: 'user',
      resourceId: userId,
      details: { newStatus: status },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status'
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['donor', 'campaign-leader', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be donor, campaign-leader, or admin'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'user_role_updated',
      resource: 'user',
      resourceId: userId,
      details: { newRole: role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'user_deleted',
      resource: 'user',
      resourceId: userId,
      details: { deletedUserEmail: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user'
    });
  }
};

// Get all campaigns for admin review
const getAllCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const campaigns = await Campaign.find(filter)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Campaign.countDocuments(filter);

    res.json({
      campaigns,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all campaigns error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaigns'
    });
  }
};

// Approve campaign
const approveCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;

    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { 
        status: 'active',
        approvedAt: new Date(),
        approvedBy: req.user._id
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'campaign_approved',
      resource: 'campaign',
      resourceId: campaignId,
      details: { campaignTitle: campaign.title },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Campaign approved successfully',
      campaign
    });
  } catch (error) {
    console.error('Approve campaign error:', error);
    res.status(500).json({
      error: 'Failed to approve campaign'
    });
  }
};

// Reject campaign
const rejectCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { reason } = req.body;

    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { 
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: req.user._id,
        rejectionReason: reason
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'campaign_rejected',
      resource: 'campaign',
      resourceId: campaignId,
      details: { campaignTitle: campaign.title, reason },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Campaign rejected successfully',
      campaign
    });
  } catch (error) {
    console.error('Reject campaign error:', error);
    res.status(500).json({
      error: 'Failed to reject campaign'
    });
  }
};

// Get financial overview
const getFinancialOverview = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    const totalRevenue = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueByDay = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueByCategory = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: dateFilter } },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaignData'
        }
      },
      { $unwind: '$campaignData' },
      {
        $group: {
          _id: '$campaignData.category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    res.json({
      overview: {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueByDay,
        revenueByCategory
      },
      period
    });
  } catch (error) {
    console.error('Get financial overview error:', error);
    res.status(500).json({
      error: 'Failed to fetch financial overview'
    });
  }
};

// Get system audit logs
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const action = req.query.action;
    const resource = req.query.resource;

    let filter = {};
    if (action) {
      filter.action = action;
    }
    if (resource) {
      filter.resource = resource;
    }

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      error: 'Failed to fetch audit logs'
    });
  }
};

// System settings management
const getSystemSettings = async (req, res) => {
  try {
    // For now, return default settings
    // In a real app, this would be stored in a settings collection
    const settings = {
      platform: {
        name: 'ImpactHub',
        description: 'A platform for charitable campaigns',
        maintenanceMode: false,
        registrationEnabled: true
      },
      donations: {
        minimumAmount: 1,
        maximumAmount: 1000000,
        platformFeePercentage: 5,
        allowAnonymousDonations: true
      },
      campaigns: {
        requireApproval: true,
        maximumDuration: 365, // days
        allowImageUploads: true,
        maximumImages: 10
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true
      }
    };

    res.json({ settings });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      error: 'Failed to fetch system settings'
    });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    // For now, just return success
    // In a real app, this would update the settings in database
    
    // Log the action
    await AuditLog.logAction({
      user: req.user._id,
      action: 'system_settings_updated',
      resource: 'system',
      resourceId: null,
      details: { updatedSettings: Object.keys(settings) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'System settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      error: 'Failed to update system settings'
    });
  }
};

// Placeholder functions for missing admin routes
const getPendingCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'pending' })
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending campaigns' });
  }
};

const suspendCampaign = async (req, res) => {
  try {
    res.status(501).json({ error: 'Campaign suspension not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to suspend campaign' });
  }
};

const getAllDonations = async (req, res) => {
  try {
    res.status(501).json({ error: 'Donation management not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
};

const getFlaggedDonations = async (req, res) => {
  try {
    res.status(501).json({ error: 'Flagged donations not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flagged donations' });
  }
};

const verifyDonation = async (req, res) => {
  try {
    res.status(501).json({ error: 'Donation verification not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify donation' });
  }
};

const processRefund = async (req, res) => {
  try {
    res.status(501).json({ error: 'Refund processing not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process refund' });
  }
};

const getFinancialReport = async (req, res) => {
  try {
    res.status(501).json({ error: 'Financial reports not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
};

const getTaxReport = async (req, res) => {
  try {
    res.status(501).json({ error: 'Tax reports not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate tax report' });
  }
};

const getAuditReport = async (req, res) => {
  try {
    res.status(501).json({ error: 'Audit reports not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate audit report' });
  }
};

const getPlatformOverview = async (req, res) => {
  try {
    res.status(501).json({ error: 'Platform overview not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platform overview' });
  }
};

const getGrowthStats = async (req, res) => {
  try {
    res.status(501).json({ error: 'Growth stats not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch growth stats' });
  }
};

const getPerformanceStats = async (req, res) => {
  try {
    res.status(501).json({ error: 'Performance stats not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance stats' });
  }
};

const getErrorLogs = async (req, res) => {
  try {
    res.status(501).json({ error: 'Error logs not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
};

const broadcastNotification = async (req, res) => {
  try {
    res.status(501).json({ error: 'Broadcast notifications not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
};

const exportUsers = async (req, res) => {
  try {
    res.status(501).json({ error: 'User export not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export users' });
  }
};

const exportCampaigns = async (req, res) => {
  try {
    res.status(501).json({ error: 'Campaign export not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export campaigns' });
  }
};

const exportDonations = async (req, res) => {
  try {
    res.status(501).json({ error: 'Donation export not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export donations' });
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllCampaigns,
  getPendingCampaigns,
  approveCampaign,
  rejectCampaign,
  suspendCampaign,
  getAllDonations,
  getFlaggedDonations,
  verifyDonation,
  processRefund,
  getFinancialOverview,
  getFinancialReport,
  getTaxReport,
  getAuditReport,
  getPlatformOverview,
  getGrowthStats,
  getPerformanceStats,
  getAuditLogs,
  getErrorLogs,
  broadcastNotification,
  exportUsers,
  exportCampaigns,
  exportDonations,
  getSystemSettings,
  updateSystemSettings
};
