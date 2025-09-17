const { validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Helper: try to get user (minimal fields) from Authorization header if present
const getUserFromReq = async (req) => {
  try {
    const header = req.header('Authorization');
    if (!header) {
      return null;
    }
    const token = header.replace('Bearer ', '');
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id || decoded.userId;
    if (!userId) return null;
    const user = await User.findById(userId).select('supportedCampaigns');
    return user;
  } catch (err) {
    return null;
  }
};

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
    
    if (req.query.sortBy || req.query.sort) {
      const sortParam = req.query.sortBy || req.query.sort;
      switch (sortParam) {
        case 'raised':
        case 'progress':
          sort = { currentAmount: -1 };
          break;
        case 'goal':
        case 'target':
          sort = { targetAmount: -1 };
          break;
        case 'ending_soon':
        case 'ending-soon':
          sort = { endDate: 1 };
          break;
        case 'recent':
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

    // If request has a token, mark campaigns liked by this user
    try {
      const user = await getUserFromReq(req);
      if (user) {
        const ids = (user.supportedCampaigns || []).map(id => id.toString());
        // convert docs to plain objects and set analytics.liked
        const campaignsWithLiked = campaigns.map(c => {
          const obj = c.toObject ? c.toObject() : c;
          obj.analytics = obj.analytics || {};
          obj.analytics.liked = ids.includes(obj._id.toString());
          return obj;
        });

        return res.json({
          campaigns: campaignsWithLiked,
          pagination: {
            current: page,
            pages: totalPages,
            total: total
          }
        });
      }
    } catch (e) {
      // non-fatal: fall through to return campaigns as-is
    }
    
    const total = await Campaign.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      campaigns,
      pagination: {
        current: page,
        pages: totalPages,
        total: total
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
    // accept both `q` and `search` query params from different clients
    const q = req.query.q || req.query.search;
    const { category, minAmount, maxAmount } = req.query;
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
    const totalPages = Math.ceil(total / limit);
    
    // Try to mark liked campaigns for requesting user (if token present)
    try {
      const user = await getUserFromReq(req);
      if (user && user.supportedCampaigns && user.supportedCampaigns.length > 0) {
        const ids = user.supportedCampaigns.map(id => id.toString());
        const campaignsWithLiked = campaigns.map(c => {
          const obj = c.toObject ? c.toObject() : c;
          obj.analytics = obj.analytics || {};
          obj.analytics.liked = ids.includes(obj._id.toString());
          return obj;
        });

        return res.json({
          campaigns: campaignsWithLiked,
          pagination: {
            current: page,
            pages: totalPages,
            total: total
          },
          query: q || '',
          filters: { category, minAmount, maxAmount }
        });
      }
    } catch (e) {
      // non-fatal - fallthrough to return campaigns as-is
      console.error('Error marking liked campaigns in search:', e);
    }

    res.json({
      campaigns,
      pagination: {
        current: page,
        pages: totalPages,
        total: total
      },
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
    
    // Attempt to mark liked if token is present
    try {
      const user = await getUserFromReq(req);
      const obj = campaign.toObject ? campaign.toObject() : campaign;
      obj.analytics = obj.analytics || {};
      if (user && user.supportedCampaigns && user.supportedCampaigns.find(id => id.toString() === obj._id.toString())) {
        obj.analytics.liked = true;
      } else {
        obj.analytics.liked = obj.analytics.liked || false;
      }
      return res.json(obj);
    } catch (e) {
      return res.json(campaign);
    }
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

// Create campaign
const createCampaign = async (req, res) => {
  try {
    console.log('Create campaign request body:', req.body);
    console.log('User:', req.user ? req.user.email : 'null');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      description,
      story,
      goal,
      category,
      images,
      endDate,
      location,
      beneficiaries,
      features,
      seo
    } = req.body;

    console.log('Parsed data:', { title, description, goal, category, endDate });

    // Validate and parse goal
    const parsedGoal = parseFloat(goal);
    if (isNaN(parsedGoal) || parsedGoal < 100) {
      console.log('Invalid goal:', goal, parsedGoal);
      return res.status(400).json({
        error: 'Goal must be a valid number and at least 100'
      });
    }

    // Validate and parse endDate
    const endDateObj = new Date(endDate);
    if (isNaN(endDateObj.getTime())) {
      console.log('Invalid endDate:', endDate);
      return res.status(400).json({
        error: 'Invalid end date'
      });
    }

    // Calculate duration from endDate
    const startDate = new Date();
    const duration = Math.ceil((endDateObj - startDate) / (1000 * 60 * 60 * 24));

    if (duration <= 0) {
      console.log('Invalid duration:', duration);
      return res.status(400).json({
        error: 'End date must be in the future'
      });
    }

    console.log('Calculated duration:', duration);

    // Create campaign object
    const campaignData = {
      title,
      description,
      story,
      goal: parsedGoal,
      category,
      creator: req.user.id,
      organizationName: req.user.organizationName || req.user.profile?.organization?.name || req.user.name,
      organizationEmail: req.user.email,
      endDate: endDateObj,
      duration,
      status: 'draft', // Start as draft, can be activated later
      approvalStatus: 'pending'
    };

    console.log('Campaign data to save:', campaignData);

    // Add optional fields
    if (location && (location.country || location.city || location.state)) {
      campaignData.location = [location.city, location.state, location.country].filter(Boolean).join(', ');
    }

    if (beneficiaries && beneficiaries.description) {
      campaignData.beneficiaries = beneficiaries.description;
    }

    if (images && images.length > 0) {
      campaignData.images = images.map((url, index) => ({
        url,
        isPrimary: index === 0
      }));
    }

    console.log('Final campaign data:', campaignData);

    // Create the campaign
    const campaign = new Campaign(campaignData);
    await campaign.save();
    console.log('Campaign saved successfully:', campaign._id);

    // Create audit log
    try {
      await AuditLog.create({
        user: req.user.id,
        action: 'campaign_created',
        resource: 'campaign',
        resourceId: campaign._id,
        details: `Created campaign: ${title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      console.log('Audit log created');
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
      // Don't fail the request for audit log errors
    }

    // Notify admins about new campaign pending approval
    try {
      const adminUsers = await User.find({ role: 'admin' });
      console.log('Found admin users:', adminUsers.length);
      for (const admin of adminUsers) {
        await Notification.create({
          recipient: admin._id,
          type: 'new_campaign',
          title: 'New Campaign Pending Approval',
          message: `A new campaign "${title}" is pending your approval.`,
          data: { campaignId: campaign._id }
        });
      }
      console.log('Notifications sent to admins');
    } catch (notificationError) {
      console.error('Notification creation failed:', notificationError);
      // Don't fail the request for notification errors
    }

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: {
        _id: campaign._id,
        title: campaign.title,
        status: campaign.status,
        approvalStatus: campaign.approvalStatus,
        createdAt: campaign.createdAt
      }
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to create campaign',
      details: error.message
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
    // Use the user's supportedCampaigns list when available
    const user = await User.findById(req.user._id).select('supportedCampaigns');
    const ids = (user && user.supportedCampaigns) ? user.supportedCampaigns : [];

    const campaigns = await Campaign.find({ _id: { $in: ids } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = ids.length;

    // mark all returned campaigns as liked
    const campaignsWithLiked = campaigns.map(c => {
      const obj = c.toObject ? c.toObject() : c;
      obj.analytics = obj.analytics || {};
      obj.analytics.liked = true;
      return obj;
    });

    res.json({
      campaigns: campaignsWithLiked,
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

// Like a campaign (adds to user's supportedCampaigns and increments campaign analytics.likes)
const likeCampaign = async (req, res) => {
  try {
    const userId = req.user._id;
    const campaignId = req.params.id;

    const user = await User.findById(userId);
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // Add to user's supportedCampaigns if not already present
    if (!user.supportedCampaigns) user.supportedCampaigns = [];
    if (!user.supportedCampaigns.find(id => id.toString() === campaignId.toString())) {
      user.supportedCampaigns.push(campaignId);
      await user.save();
    }

    // Increment campaign likes
    campaign.analytics = campaign.analytics || {};
    campaign.analytics.likes = (campaign.analytics.likes || 0) + 1;
    await campaign.save();
    // Return campaign with liked flag for the requesting user
    const campaignObj = campaign.toObject ? campaign.toObject() : campaign;
    campaignObj.analytics = campaignObj.analytics || {};
    campaignObj.analytics.liked = true;
    res.json({ message: 'Liked', campaign: campaignObj });
  } catch (error) {
    console.error('Like campaign error:', error);
    res.status(500).json({ error: 'Failed to like campaign' });
  }
};

// Unlike a campaign (remove from user's supportedCampaigns and decrement likes)
const unlikeCampaign = async (req, res) => {
  try {
    const userId = req.user._id;
    const campaignId = req.params.id;

    const user = await User.findById(userId);
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (user && user.supportedCampaigns && user.supportedCampaigns.find(id => id.toString() === campaignId.toString())) {
      user.supportedCampaigns = user.supportedCampaigns.filter(id => id.toString() !== campaignId.toString());
      await user.save();
    }

    // Decrement campaign likes (not below 0)
    campaign.analytics = campaign.analytics || {};
    campaign.analytics.likes = Math.max(0, (campaign.analytics.likes || 0) - 1);
    await campaign.save();
    // Return campaign with liked flag set false for the requesting user
    const campaignObj = campaign.toObject ? campaign.toObject() : campaign;
    campaignObj.analytics = campaignObj.analytics || {};
    campaignObj.analytics.liked = false;
    res.json({ message: 'Unliked', campaign: campaignObj });
  } catch (error) {
    console.error('Unlike campaign error:', error);
    res.status(500).json({ error: 'Failed to unlike campaign' });
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
  ,
  likeCampaign,
  unlikeCampaign
};
