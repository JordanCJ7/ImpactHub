const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'admin') {
      // Admin dashboard stats
      const totalCampaigns = await Campaign.countDocuments();
      const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
      const totalDonations = await Donation.countDocuments({ status: 'completed' });
      const totalAmountResult = await Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalAmount = totalAmountResult[0]?.total || 0;
      const totalUsers = await User.countDocuments();

      stats = {
        campaigns: { total: totalCampaigns, active: activeCampaigns },
        donations: { total: totalDonations },
        amount: { total: totalAmount },
        users: { total: totalUsers }
      };
    } else if (userRole === 'campaign-leader') {
      // Campaign leader dashboard stats
      const myCampaigns = await Campaign.countDocuments({ creator: req.user._id });
      const activeCampaigns = await Campaign.countDocuments({ 
        creator: req.user._id, 
        status: 'active' 
      });
      const myDonationsResult = await Donation.aggregate([
        {
          $lookup: {
            from: 'campaigns',
            localField: 'campaign',
            foreignField: '_id',
            as: 'campaignData'
          }
        },
        { $unwind: '$campaignData' },
        { $match: { 'campaignData.creator': req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);
      const myDonations = myDonationsResult[0] || { total: 0, count: 0 };

      stats = {
        campaigns: { total: myCampaigns, active: activeCampaigns },
        donations: { total: myDonations.count },
        amount: { total: myDonations.total }
      };
    } else {
      // Donor dashboard stats
      const myDonations = await Donation.countDocuments({ 
        donor: req.user._id, 
        status: 'completed' 
      });
      const myAmountResult = await Donation.aggregate([
        { $match: { donor: req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const myAmount = myAmountResult[0]?.total || 0;
      const supportedCampaigns = await Donation.distinct('campaign', {
        donor: req.user._id,
        status: 'completed'
      });

      stats = {
        donations: { total: myDonations },
        amount: { total: myAmount },
        campaigns: { supported: supportedCampaigns.length }
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get user-specific stats for profile pages
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === 'donor') {
      // Get donor analytics
      const myDonations = await Donation.countDocuments({ 
        donor: userId, 
        status: 'completed' 
      });
      
      const myAmountResult = await Donation.aggregate([
        { $match: { donor: userId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalDonated = myAmountResult[0]?.total || 0;
      
      const supportedCampaigns = await Donation.distinct('campaign', {
        donor: userId,
        status: 'completed'
      });

      // Calculate donor level based on total donations
      let donorLevel = 'Bronze';
      if (totalDonated >= 100000) donorLevel = 'Platinum';
      else if (totalDonated >= 50000) donorLevel = 'Gold';
      else if (totalDonated >= 10000) donorLevel = 'Silver';

      const overview = {
        totalDonated,
        donationCount: myDonations,
        campaignsSupported: supportedCampaigns.length,
        campaignsCreated: 0,
        totalRaised: 0,
        impactPoints: Math.floor(totalDonated / 100), // 1 point per 100 LKR
        donorLevel
      };

      res.json({ overview });
    } else if (userRole === 'campaign-leader') {
      // Get campaign leader analytics
      const myCampaigns = await Campaign.countDocuments({ creator: userId });
      const myDonationsResult = await Donation.aggregate([
        {
          $lookup: {
            from: 'campaigns',
            localField: 'campaign',
            foreignField: '_id',
            as: 'campaignData'
          }
        },
        { $unwind: '$campaignData' },
        { $match: { 'campaignData.creator': userId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);
      const raisedData = myDonationsResult[0] || { total: 0, count: 0 };

      const overview = {
        totalDonated: 0,
        donationCount: 0,
        campaignsSupported: 0,
        campaignsCreated: myCampaigns,
        totalRaised: raisedData.total,
        impactPoints: Math.floor(raisedData.total / 50), // 1 point per 50 LKR raised
        donorLevel: 'Leader'
      };

      res.json({ overview });
    } else {
      // For admin or other roles, return basic stats
      const overview = {
        totalDonated: 0,
        donationCount: 0,
        campaignsSupported: 0,
        campaignsCreated: 0,
        totalRaised: 0,
        impactPoints: 0,
        donorLevel: 'Admin'
      };

      res.json({ overview });
    }
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics'
    });
  }
};

// Get trends
const getTrends = async (req, res) => {
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
    }

    // Get donation trends
    const donationTrends = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get campaign trends
    const campaignTrends = await Campaign.aggregate([
      {
        $match: {
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ 
      trends: {
        donations: donationTrends,
        campaigns: campaignTrends
      },
      period 
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      error: 'Failed to fetch trends'
    });
  }
};

// Get campaign overview
const getCampaignOverview = async (req, res) => {
  try {
    let filter = {};
    
    // If not admin, filter by user's campaigns
    if (req.user.role !== 'admin') {
      filter.creator = req.user._id;
    }

    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status currentAmount targetAmount donorCount createdAt');

    const summary = await Campaign.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalRaised: { $sum: '$currentAmount' },
          totalGoal: { $sum: '$targetAmount' }
        }
      }
    ]);

    res.json({
      overview: {
        campaigns,
        summary: summary[0] || { total: 0, active: 0, totalRaised: 0, totalGoal: 0 }
      }
    });
  } catch (error) {
    console.error('Get campaign overview error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign overview'
    });
  }
};

// Get platform overview analytics
const getPlatformOverview = async (req, res) => {
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

    // Total campaigns
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const newCampaigns = await Campaign.countDocuments({
      createdAt: dateFilter
    });

    // Total donations
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    const newDonations = await Donation.countDocuments({
      status: 'completed',
      createdAt: dateFilter
    });

    // Total amount raised
    const totalAmountResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult[0]?.total || 0;

    // New amount raised in period
    const newAmountResult = await Donation.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: dateFilter
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const newAmount = newAmountResult[0]?.total || 0;

    // Total users
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: dateFilter
    });

    res.json({
      overview: {
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          new: newCampaigns
        },
        donations: {
          total: totalDonations,
          new: newDonations
        },
        amount: {
          total: totalAmount,
          new: newAmount
        },
        users: {
          total: totalUsers,
          new: newUsers
        }
      },
      period
    });
  } catch (error) {
    console.error('Get platform overview error:', error);
    res.status(500).json({
      error: 'Failed to fetch platform overview'
    });
  }
};

// Get donation trends
const getDonationTrends = async (req, res) => {
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
    }

    const trends = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ trends, period });
  } catch (error) {
    console.error('Get donation trends error:', error);
    res.status(500).json({
      error: 'Failed to fetch donation trends'
    });
  }
};

// Get campaign performance
const getCampaignPerformance = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const performance = await Campaign.aggregate([
      { $match: { status: 'active' } },
      {
        $addFields: {
          progressPercentage: {
            $cond: {
              if: { $gt: ['$targetAmount', 0] },
              then: { $multiply: [{ $divide: ['$currentAmount', '$targetAmount'] }, 100] },
              else: 0
            }
          }
        }
      },
      { $sort: { progressPercentage: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          title: 1,
          currentAmount: 1,
          targetAmount: 1,
          progressPercentage: 1,
          donorCount: 1,
          socialShares: 1
        }
      }
    ]);

    res.json({ performance });
  } catch (error) {
    console.error('Get campaign performance error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign performance'
    });
  }
};

// Get user engagement
const getUserEngagement = async (req, res) => {
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
    }

    // Active users (users who made donations in period)
    const activeUsers = await Donation.distinct('donor', {
      status: 'completed',
      createdAt: dateFilter
    });

    // New users in period
    const newUsers = await User.countDocuments({
      createdAt: dateFilter
    });

    // User retention (placeholder - would need session tracking)
    const engagement = {
      activeUsers: activeUsers.length,
      newUsers: newUsers,
      retentionRate: 0, // Placeholder
      averageSessionDuration: 0, // Placeholder
      bounceRate: 0 // Placeholder
    };

    res.json({ engagement, period });
  } catch (error) {
    console.error('Get user engagement error:', error);
    res.status(500).json({
      error: 'Failed to fetch user engagement'
    });
  }
};

// Get category breakdown
const getCategoryBreakdown = async (req, res) => {
  try {
    const breakdown = await Campaign.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalRaised: { $sum: '$currentAmount' },
          totalGoal: { $sum: '$targetAmount' }
        }
      },
      {
        $addFields: {
          category: '$_id',
          progressPercentage: {
            $cond: {
              if: { $gt: ['$totalGoal', 0] },
              then: { $multiply: [{ $divide: ['$totalRaised', '$totalGoal'] }, 100] },
              else: 0
            }
          }
        }
      },
      { $sort: { totalRaised: -1 } },
      {
        $project: {
          _id: 0,
          category: 1,
          count: 1,
          totalRaised: 1,
          totalGoal: 1,
          progressPercentage: 1
        }
      }
    ]);

    res.json({ breakdown });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({
      error: 'Failed to fetch category breakdown'
    });
  }
};

// Get geographic distribution (placeholder)
const getGeographicDistribution = async (req, res) => {
  try {
    // Placeholder - would need location data
    const distribution = [
      { country: 'United States', donations: 0, amount: 0 },
      { country: 'Canada', donations: 0, amount: 0 },
      { country: 'United Kingdom', donations: 0, amount: 0 }
    ];

    res.json({ distribution });
  } catch (error) {
    console.error('Get geographic distribution error:', error);
    res.status(500).json({
      error: 'Failed to fetch geographic distribution'
    });
  }
};

// Export analytics data
const exportAnalytics = async (req, res) => {
  try {
    const { type = 'summary', format = 'json' } = req.query;

    let data = {};

    if (type === 'summary') {
      // Get summary data
      const totalCampaigns = await Campaign.countDocuments();
      const totalDonations = await Donation.countDocuments({ status: 'completed' });
      const totalAmountResult = await Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalAmount = totalAmountResult[0]?.total || 0;

      data = {
        summary: {
          totalCampaigns,
          totalDonations,
          totalAmount,
          generatedAt: new Date()
        }
      };
    }

    if (format === 'json') {
      res.json(data);
    } else {
      res.status(400).json({
        error: 'Unsupported export format'
      });
    }
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      error: 'Failed to export analytics data'
    });
  }
};

// Get donation summary
const getDonationSummary = async (req, res) => {
  try {
    const userRole = req.user.role;
    let filter = {};

    if (userRole === 'donor') {
      filter.donor = req.user._id;
    }

    const summary = await Donation.aggregate([
      { $match: { ...filter, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      }
    ]);

    res.json({
      summary: summary[0] || {
        totalAmount: 0,
        totalDonations: 0,
        averageAmount: 0,
        maxAmount: 0,
        minAmount: 0
      }
    });
  } catch (error) {
    console.error('Get donation summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch donation summary'
    });
  }
};

// Get platform stats (admin only)
const getPlatformStats = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const pendingCampaigns = await Campaign.countDocuments({ status: 'pending' });
    
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    const totalAmountResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult[0]?.total || 0;

    const totalUsers = await User.countDocuments();
    const donorCount = await User.countDocuments({ role: 'donor' });
    const leaderCount = await User.countDocuments({ role: 'campaign-leader' });

    res.json({
      stats: {
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          pending: pendingCampaigns
        },
        donations: {
          total: totalDonations,
          totalAmount: totalAmount
        },
        users: {
          total: totalUsers,
          donors: donorCount,
          leaders: leaderCount
        }
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch platform statistics'
    });
  }
};

// Get user analytics (admin only)
const getUserAnalytics = async (req, res) => {
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
    }

    const newUsers = await User.countDocuments({
      createdAt: dateFilter
    });

    const activeUsers = await Donation.distinct('donor', {
      status: 'completed',
      createdAt: dateFilter
    });

    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: dateFilter }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      analytics: {
        newUsers,
        activeUsers: activeUsers.length,
        userGrowth
      },
      period
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch user analytics'
    });
  }
};

// Get financial report (admin only)
const getFinancialReport = async (req, res) => {
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
      report: {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueByDay,
        revenueByCategory
      },
      period
    });
  } catch (error) {
    console.error('Get financial report error:', error);
    res.status(500).json({
      error: 'Failed to generate financial report'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUserStats,
  getTrends,
  getCampaignOverview,
  getPlatformOverview,
  getDonationTrends,
  getCampaignPerformance,
  getUserEngagement,
  getCategoryBreakdown,
  getGeographicDistribution,
  exportAnalytics,
  getDonationSummary,
  getPlatformStats,
  getUserAnalytics,
  getFinancialReport
};
