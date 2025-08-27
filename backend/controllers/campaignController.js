const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const { validationResult } = require('express-validator');

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

module.exports = {
  getAllCampaigns,
  searchCampaigns,
  getCategories,
  getFeaturedCampaigns,
  getCampaignById,
  getCampaignDonations,
  getImpactReports,
  incrementShareCount
};
