const { validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// Get all campaigns with filtering and pagination
const getAllCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const filter = { status: 'active' };
    
    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    
    // Sort options
    let sort = { createdAt: -1 }; // Default: newest first
    
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'progress':
          sort = { currentAmount: -1 };
          break;
        case 'target':
          sort = { targetAmount: -1 };
          break;
        case 'ending-soon':
          sort = { endDate: 1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
      }
    }
    
    const campaigns = await Campaign.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-impactReports'); // Exclude detailed reports for listing
    
    const total = await Campaign.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      campaigns,
      pagination: {
        currentPage: page,
        totalPages,
        totalCampaigns: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

// Search campaigns
const searchCampaigns = async (req, res) => {
  try {
    const { q, category, minAmount, maxAmount } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const filter = { status: 'active' };
    
    // Text search
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { organizationName: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      filter.targetAmount = {};
      if (minAmount) filter.targetAmount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.targetAmount.$lte = parseFloat(maxAmount);
    }
    
    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-impactReports');
    
    const total = await Campaign.countDocuments(filter);
    
    res.json({
      campaigns,
      total,
      query: q || '',
      filters: { category, minAmount, maxAmount }
    });
  } catch (error) {
    console.error('Error searching campaigns:', error);
    res.status(500).json({ error: 'Failed to search campaigns' });
  }
};

// Get campaign categories
const getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'education', label: 'Education', icon: '🎓' },
      { value: 'health', label: 'Health & Medical', icon: '🏥' },
      { value: 'environment', label: 'Environment', icon: '🌱' },
      { value: 'poverty', label: 'Poverty Relief', icon: '🤝' },
      { value: 'disaster-relief', label: 'Disaster Relief', icon: '🆘' },
      { value: 'other', label: 'Other Causes', icon: '💝' }
    ];
    
    // Get campaign counts for each category
    const categoryCounts = await Campaign.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const categoriesWithCounts = categories.map(cat => {
      const countData = categoryCounts.find(c => c._id === cat.value);
      return {
        ...cat,
        count: countData ? countData.count : 0
      };
    });
    
    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get featured campaigns
const getFeaturedCampaigns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    // Featured campaigns are those with high donation counts or near completion
    const campaigns = await Campaign.find({ status: 'active' })
      .sort({ donationCount: -1, currentAmount: -1 })
      .limit(limit)
      .select('-impactReports');
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching featured campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch featured campaigns' });
  }
};

// Get single campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
};

// Get campaign donations
const getCampaignDonations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const donations = await Donation.find({ 
      campaignId: req.params.id,
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('donorName amount currency isAnonymous message createdAt');
    
    // Hide donor names for anonymous donations
    const sanitizedDonations = donations.map(donation => ({
      ...donation.toObject(),
      donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName
    }));
    
    const total = await Donation.countDocuments({ 
      campaignId: req.params.id,
      status: 'completed'
    });
    
    res.json({
      donations: sanitizedDonations,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching campaign donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
};

// Get impact reports
const getImpactReports = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .select('impactReports');
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const reports = campaign.impactReports.sort((a, b) => b.reportDate - a.reportDate);
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching impact reports:', error);
    res.status(500).json({ error: 'Failed to fetch impact reports' });
  }
};

// Increment share count
const incrementShareCount = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $inc: { socialShares: 1 } },
      { new: true }
    );
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({ socialShares: campaign.socialShares });
  } catch (error) {
    console.error('Error incrementing share count:', error);
    res.status(500).json({ error: 'Failed to update share count' });
  }
};

// Get trending campaigns
const getTrendingCampaigns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get campaigns with recent activity and good performance
    const campaigns = await Campaign.find({ 
      status: 'active'
    })
    .sort({ socialShares: -1, currentAmount: -1, createdAt: -1 })
    .limit(limit)
    .select('-impactReports');
    
    res.json(campaigns);
  } catch (error) {
    console.error('Get trending campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch trending campaigns' });
  }
};

// Get urgent campaigns  
const getUrgentCampaigns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const campaigns = await Campaign.find({ 
      status: 'active',
      endDate: { $lte: threeDaysFromNow, $gte: new Date() }
    })
    .sort({ endDate: 1 })
    .limit(limit)
    .select('-impactReports');
    
    res.json(campaigns);
  } catch (error) {
    console.error('Get urgent campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch urgent campaigns' });
  }
};

// Get campaigns by category
const getCampaignsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!category) {
      return res.status(400).json({
        error: 'Category parameter is required'
      });
    }

    const campaigns = await Campaign.find({
      category: category,
      status: 'active'
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-impactReports');

    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns by category error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaigns by category'
    });
  }
};

// Get campaign updates
const getCampaignUpdates = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.json({ updates: campaign.impactReports || [] });
  } catch (error) {
    console.error('Get campaign updates error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign updates'
    });
  }
};

// Get campaign analytics
const getCampaignAnalytics = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    const analytics = {
      raised: campaign.currentAmount || 0,
      goal: campaign.targetAmount || 0,
      progressPercentage: campaign.targetAmount ? Math.round((campaign.currentAmount || 0) / campaign.targetAmount * 100) : 0,
      donorCount: campaign.donorCount || 0,
      views: 0,
      shares: campaign.socialShares || 0
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign analytics'
    });
  }
};

// Record campaign view
const recordView = async (req, res) => {
  try {
    res.json({ message: 'View recorded' });
  } catch (error) {
    console.error('Record view error:', error);
    res.status(500).json({
      error: 'Failed to record view'
    });
  }
};

// Record campaign share
const recordShare = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $inc: { socialShares: 1 } },
      { new: true }
    );
    
    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.json({
      message: 'Share recorded',
      shares: campaign.socialShares
    });
  } catch (error) {
    console.error('Record share error:', error);
    res.status(500).json({
      error: 'Failed to record share'
    });
  }
};

// Create campaign (placeholder)
const createCampaign = async (req, res) => {
  try {
    res.status(501).json({
      error: 'Campaign creation not yet implemented'
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      error: 'Failed to create campaign'
    });
  }
};

// Update campaign (placeholder)
const updateCampaign = async (req, res) => {
  try {
    res.status(501).json({
      error: 'Campaign update not yet implemented'
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      error: 'Failed to update campaign'
    });
  }
};

// Delete campaign (placeholder)
const deleteCampaign = async (req, res) => {
  try {
    res.status(501).json({
      error: 'Campaign deletion not yet implemented'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      error: 'Failed to delete campaign'
    });
  }
};

// Update campaign status (admin only)
const updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.json({
      message: 'Campaign status updated successfully',
      campaign: {
        _id: campaign._id,
        status: campaign.status
      }
    });
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({
      error: 'Failed to update campaign status'
    });
  }
};

// Approve campaign (admin only)
const approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: 'active', approvedAt: new Date(), approvedBy: req.user._id },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    res.json({
      message: 'Campaign approved successfully',
      campaign: {
        _id: campaign._id,
        status: campaign.status
      }
    });
  } catch (error) {
    console.error('Approve campaign error:', error);
    res.status(500).json({
      error: 'Failed to approve campaign'
    });
  }
};

// Reject campaign (admin only)
const rejectCampaign = async (req, res) => {
  try {
    const { reason } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
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

    res.json({
      message: 'Campaign rejected successfully',
      campaign: {
        _id: campaign._id,
        status: campaign.status
      }
    });
  } catch (error) {
    console.error('Reject campaign error:', error);
    res.status(500).json({
      error: 'Failed to reject campaign'
    });
  }
};

// Add campaign update
const addCampaignUpdate = async (req, res) => {
  try {
    const { title, content, images } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    // Check authorization
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to add updates to this campaign'
      });
    }

    const update = {
      _id: require('mongoose').Types.ObjectId(),
      title,
      content,
      images: images || [],
      createdAt: new Date()
    };

    campaign.impactReports.push(update);
    await campaign.save();

    res.status(201).json({
      message: 'Campaign update added successfully',
      update
    });
  } catch (error) {
    console.error('Add campaign update error:', error);
    res.status(500).json({
      error: 'Failed to add campaign update'
    });
  }
};

// Update campaign update
const updateCampaignUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const { title, content, images } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    // Check authorization
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to update this campaign'
      });
    }

    const updateIndex = campaign.impactReports.findIndex(
      update => update._id.toString() === updateId
    );

    if (updateIndex === -1) {
      return res.status(404).json({
        error: 'Update not found'
      });
    }

    campaign.impactReports[updateIndex] = {
      ...campaign.impactReports[updateIndex].toObject(),
      title: title || campaign.impactReports[updateIndex].title,
      content: content || campaign.impactReports[updateIndex].content,
      images: images || campaign.impactReports[updateIndex].images,
      updatedAt: new Date()
    };

    await campaign.save();

    res.json({
      message: 'Campaign update modified successfully',
      update: campaign.impactReports[updateIndex]
    });
  } catch (error) {
    console.error('Update campaign update error:', error);
    res.status(500).json({
      error: 'Failed to update campaign update'
    });
  }
};

// Delete campaign update
const deleteCampaignUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    // Check authorization
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to delete updates from this campaign'
      });
    }

    const updateIndex = campaign.impactReports.findIndex(
      update => update._id.toString() === updateId
    );

    if (updateIndex === -1) {
      return res.status(404).json({
        error: 'Update not found'
      });
    }

    campaign.impactReports.splice(updateIndex, 1);
    await campaign.save();

    res.json({
      message: 'Campaign update deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign update error:', error);
    res.status(500).json({
      error: 'Failed to delete campaign update'
    });
  }
};

// Get user's campaigns
const getMyCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const campaigns = await Campaign.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Campaign.countDocuments({ creator: req.user._id });

    res.json({
      campaigns,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get my campaigns error:', error);
    res.status(500).json({
      error: 'Failed to fetch your campaigns'
    });
  }
};

// Get supported campaigns
const getSupportedCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // For now, return empty array - would need to implement with donations
    const campaigns = [];
    const total = 0;

    res.json({
      campaigns,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get supported campaigns error:', error);
    res.status(500).json({
      error: 'Failed to fetch supported campaigns'
    });
  }
};

// Get detailed analytics
const getDetailedAnalytics = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    // Check authorization
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to view detailed analytics for this campaign'
      });
    }

    const analytics = {
      basic: {
        raised: campaign.currentAmount || 0,
        goal: campaign.targetAmount || 0,
        progressPercentage: campaign.targetAmount ? Math.round((campaign.currentAmount || 0) / campaign.targetAmount * 100) : 0,
        donorCount: campaign.donorCount || 0,
        shares: campaign.socialShares || 0
      },
      timeline: [],
      demographics: {},
      performance: {
        conversionRate: 0,
        averageDonation: 0,
        repeatDonorRate: 0
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get detailed analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch detailed analytics'
    });
  }
};

// Export campaign data
const exportCampaignData = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }

    // Check authorization
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to export data for this campaign'
      });
    }

    const exportData = {
      campaign: {
        title: campaign.title,
        description: campaign.description,
        goal: campaign.targetAmount,
        raised: campaign.currentAmount,
        status: campaign.status,
        createdAt: campaign.createdAt,
        endDate: campaign.endDate
      },
      donations: [],
      analytics: {
        totalDonations: campaign.donorCount || 0,
        totalAmount: campaign.currentAmount || 0,
        shares: campaign.socialShares || 0
      }
    };

    res.json({ 
      message: 'Campaign data exported successfully',
      data: exportData 
    });
  } catch (error) {
    console.error('Export campaign data error:', error);
    res.status(500).json({
      error: 'Failed to export campaign data'
    });
  }
};

module.exports = {
  getAllCampaigns,
  getFeaturedCampaigns,
  getTrendingCampaigns,
  getUrgentCampaigns,
  getCampaignsByCategory,
  searchCampaigns,
  getCampaignById,
  getCampaignUpdates,
  getCampaignDonations,
  getCampaignAnalytics,
  recordView,
  recordShare,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
  approveCampaign,
  rejectCampaign,
  addCampaignUpdate,
  updateCampaignUpdate,
  deleteCampaignUpdate,
  getMyCampaigns,
  getSupportedCampaigns,
  getDetailedAnalytics,
  exportCampaignData,
  getImpactReports,
  incrementShareCount
};
