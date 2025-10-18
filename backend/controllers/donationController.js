const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const {
  processPayment,
  generateSessionId,
  generatePaymentIntentId,
  validateCardNumber,
  validateExpiry,
  validateCVV
} = require('../utils/paymentSimulator');

if (process.env.NODE_ENV !== 'production') {
  console.log('Donation controller loaded. Using mock payment simulator.');
}

const createPaymentIntent = async (req, res) => {
  try {
    const { campaignId, amount, currency = 'LKR', donorEmail, donorName, message, isAnonymous = false } = req.body;
    
    if (!campaignId || !amount || !donorEmail || !donorName) {
      return res.status(400).json({ 
        error: 'Missing required fields: campaignId, amount, donorEmail, donorName' 
      });
    }
    
    if (amount < 1) {
      return res.status(400).json({ error: 'Minimum donation amount is $1' });
    }
    
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    if (campaign.status !== 'active') {
      return res.status(400).json({ error: 'Campaign is not accepting donations' });
    }
    
    // Generate mock payment intent ID
    const paymentIntentId = generatePaymentIntentId();
    
    // Create pending donation record
    const donation = new Donation({
      campaign: campaignId,
      amount,
      currency,
      status: 'pending',
      isAnonymous,
      message,
      anonymousDonor: { name: donorName, email: donorEmail },
      payment: {
        paymentId: paymentIntentId,
        paymentMethod: 'mock_card',
        netAmount: amount,
        currency
      },
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referrer')
      }
    });
    
    await donation.save();
    
    res.json({
      clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).substring(7)}`,
      donationId: donation._id,
      paymentIntentId
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Create a mock checkout session for donation
const createCheckoutSession = async (req, res) => {
  try {
    const { campaignId, amount, currency = 'LKR', donorEmail, donorName, isAnonymous = false, message } = req.body;

    // Only campaignId and amount are required
    if (!campaignId || !amount) {
      return res.status(400).json({ error: 'Missing required fields: campaignId, amount' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status !== 'active') return res.status(400).json({ error: 'Campaign is not accepting donations' });

    // Try to get authenticated user from JWT token if present
    let authUser = null;
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        authUser = await User.findById(decoded.id || decoded.userId).select('name email _id');
      }
    } catch (err) {
      // Not authenticated, continue without user
    }

    // Use authenticated user info or fallback to provided info
    const finalDonorEmail = authUser?.email || donorEmail || '';
    const finalDonorName = authUser?.name || donorName || '';

    // Generate a mock session ID
    const sessionId = generateSessionId();

    // Create a pending Donation record
    const donationData = {
      campaign: campaignId,
      amount,
      currency,
      isAnonymous,
      message,
      status: 'pending',
      payment: {
        paymentId: sessionId,
        paymentMethod: 'mock_card',
        netAmount: amount,
        currency
      },
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        sessionId
      }
    };

    // Handle donor vs anonymousDonor based on isAnonymous flag and authentication
    if (isAnonymous) {
      donationData.anonymousDonor = { name: 'Anonymous', email: '' };
    } else {
      // For non-anonymous donations, prefer authenticated user
      if (authUser) {
        donationData.donor = authUser._id;
      } else if (finalDonorEmail) {
        // Try to find existing user by email
        const existingUser = await User.findOne({ email: finalDonorEmail });
        if (existingUser) {
          donationData.donor = existingUser._id;
        } else {
          donationData.anonymousDonor = { name: finalDonorName || 'Supporter', email: finalDonorEmail };
        }
      } else {
        donationData.anonymousDonor = { name: finalDonorName || 'Supporter', email: '' };
      }
    }

    const donation = new Donation(donationData);
    await donation.save();

    // Return session info - frontend will navigate to our mock payment page
    res.json({ 
      sessionId,
      donationId: donation._id.toString(),
      amount,
      currency,
      campaignTitle: campaign.title,
      // Instead of Stripe URL, we return a local payment page URL
      url: `/payment/${sessionId}`,
      isLocal: true // Flag to tell frontend this is a local mock payment
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// Confirm donation after successful payment
const confirmDonation = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }
    
    // Find donation by payment intent ID
    const donation = await Donation.findOne({ 'payment.paymentId': paymentIntentId });
    if (!donation) {
      return res.status(404).json({ error: 'Donation record not found' });
    }
    
    if (donation.status === 'completed') {
      return res.status(200).json({ message: 'Donation already confirmed', donation });
    }
    
    // Update donation status
    donation.status = 'completed';
    await donation.save();
    
    // Update campaign amounts and counts
    await Campaign.findByIdAndUpdate(donation.campaign, {
      $inc: { 
        raised: donation.amount,
        'analytics.donorCount': 1
      }
    });
    
    // Update user donation stats if user exists
    if (donation.anonymousDonor && donation.anonymousDonor.email) {
      await User.findOneAndUpdate(
        { email: donation.anonymousDonor.email },
        {
          $inc: {
            'stats.totalDonated': donation.amount,
            'stats.donationCount': 1
          }
        }
      );
    }
    
    res.json({
      message: 'Donation confirmed successfully',
      donation: {
        id: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        createdAt: donation.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error confirming donation:', error);
    res.status(500).json({ error: 'Failed to confirm donation' });
  }
};

// Get donation history for a user
const getDonationHistory = async (req, res) => {
  try {
    const { email } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const donations = await Donation.find({ 
      'anonymousDonor.email': email,
      status: 'completed'
    })
    .populate('campaign', 'title organizationName images primaryImage description goal raised category creator')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Donation.countDocuments({ 
      'anonymousDonor.email': email,
      status: 'completed'
    });
    
    // Calculate summary stats
    const stats = await Donation.aggregate([
      { $match: { 'anonymousDonor.email': email, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalDonated: { $sum: '$amount' },
          donationCount: { $sum: 1 },
          avgDonation: { $avg: '$amount' }
        }
      }
    ]);
    
    res.json({
      donations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      },
      stats: stats[0] || { totalDonated: 0, donationCount: 0, avgDonation: 0 }
    });
    
  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({ error: 'Failed to fetch donation history' });
  }
};

// Process mock payment
const processMockPayment = async (req, res) => {
  try {
    const { sessionId, cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;

    if (!sessionId || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      return res.status(400).json({ 
        error: 'Missing required payment fields',
        required: ['sessionId', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'cardholderName']
      });
    }

    // Find the donation by session ID
    const donation = await Donation.findOne({ 'metadata.sessionId': sessionId });
    if (!donation) {
      return res.status(404).json({ error: 'Donation session not found' });
    }

    if (donation.status === 'completed') {
      return res.status(400).json({ error: 'This donation has already been processed' });
    }

    // Process the payment using our simulator
    const paymentResult = await processPayment({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName,
      amount: donation.amount,
      currency: donation.currency
    });

    if (!paymentResult.success) {
      // Payment failed - update donation status
      donation.status = 'failed';
      donation.failureReason = paymentResult.message;
      await donation.save();

      return res.status(400).json({ 
        error: paymentResult.error,
        message: paymentResult.message
      });
    }

    // Payment successful - update donation
    donation.status = 'completed';
    donation.payment.transactionId = paymentResult.transactionId;
    donation.payment.paymentMethod = 'card';
    donation.payment.cardLast4 = paymentResult.card.last4;
    donation.payment.cardBrand = paymentResult.card.brand;
    donation.completedAt = new Date();
    
    await donation.save();

    // Update campaign amounts
    await Campaign.findByIdAndUpdate(donation.campaign, {
      $inc: { raised: donation.amount, 'analytics.donorCount': 1 }
    });

    // Update user stats if donor email exists
    if (donation.anonymousDonor && donation.anonymousDonor.email) {
      await User.findOneAndUpdate({ email: donation.anonymousDonor.email }, {
        $inc: { 'stats.totalDonated': donation.amount, 'stats.donationCount': 1 }
      });
    }

    // Also update user stats if donor ID exists
    if (donation.donor) {
      await User.findByIdAndUpdate(donation.donor, {
        $inc: { 'stats.totalDonated': donation.amount, 'stats.donationCount': 1 }
      });
    }

    res.json({
      success: true,
      sessionId,
      transactionId: paymentResult.transactionId,
      donation: {
        id: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status
      }
    });

  } catch (error) {
    console.error('Error processing mock payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

// Get session details
const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const donation = await Donation.findOne({ 'metadata.sessionId': sessionId })
      .populate('campaign', 'title images primaryImage organizationName description goal raised category creator')
      .populate('donor', 'name email');

    if (!donation) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId,
      donationId: donation._id,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      campaign: {
        id: donation.campaign._id,
        title: donation.campaign.title,
        imageUrl: donation.campaign.imageUrl,
        organizationName: donation.campaign.organizationName
      },
      isAnonymous: donation.isAnonymous,
      message: donation.message
    });

  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
};

// Handle Stripe webhook for payment updates (now just a mock)
const handleWebhook = async (req, res) => {
  // Mock webhook - not needed for simulator but kept for compatibility
  res.json({ received: true, message: 'Mock webhook - no action needed' });
};

// Get recent donations (public)
const getRecentDonations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const donations = await Donation.find({ 
      status: 'completed',
      isAnonymous: false 
    })
    .populate('campaign', 'title images primaryImage description goal raised category creator organizationName')
    .populate('donor', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('donor anonymousDonor amount campaign createdAt message');
    
    res.json(donations);
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    res.status(500).json({ error: 'Failed to fetch recent donations' });
  }
};

// Get top donations (public)
const getTopDonations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const donations = await Donation.find({ 
      status: 'completed',
      isAnonymous: false 
    })
    .populate('campaign', 'title images primaryImage description goal raised category creator organizationName')
    .populate('donor', 'name')
    .sort({ amount: -1 })
    .limit(limit)
    .select('donor anonymousDonor amount campaign createdAt message');
    
    res.json(donations);
  } catch (error) {
    console.error('Error fetching top donations:', error);
    res.status(500).json({ error: 'Failed to fetch top donations' });
  }
};

// Get donation statistics (public)
const getDonationStats = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalDonated = totalAmount.length > 0 ? totalAmount[0].total : 0;
    
    res.json({
      totalDonations,
      totalAmount: totalDonated,
      averageDonation: totalDonations > 0 ? totalDonated / totalDonations : 0
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
};

// Create donation (placeholder - use payment intent instead)
const createDonation = async (req, res) => {
  res.status(400).json({ 
    error: 'Direct donation creation not supported. Use /create-payment-intent instead.' 
  });
};

// Get my donations
const getMyDonations = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const donations = await Donation.find({ 
      donor: userId,
      status: 'completed' 
    })
    .populate('campaign', 'title description images primaryImage goal raised category creator organizationName')
    .sort({ createdAt: -1 });
    
    res.json(donations);
  } catch (error) {
    console.error('Error fetching user donations:', error);
    res.status(500).json({ error: 'Failed to fetch your donations' });
  }
};

const getDonationById = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const cancelDonation = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const refundDonation = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const generateReceipt = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const getTaxSummary = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const getDonationAnalytics = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const getCampaignDonationAnalytics = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const getAllDonations = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const verifyDonation = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const generateReports = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const createRecurringDonation = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const getMyRecurringDonations = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const cancelRecurringDonation = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const pauseRecurringDonation = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const resumeRecurringDonation = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const stripeWebhook = async (req, res) => {
  res.json({ received: true, message: 'Mock Stripe webhook' });
};

const payhereWebhook = async (req, res) => {
  res.json({ received: true, message: 'Mock PayHere webhook' });
};

// Note: the functions above (e.g. createDonation, getDonationById, etc.)
// are intentionally defined once earlier in this file. Duplicated
// placeholder stubs were removed to prevent duplicate declarations and
// allow the imported `processPayment` from the payment simulator to be used.

module.exports = {
  createPaymentIntent,
  confirmDonation,
  getDonationHistory,
  handleWebhook,
  getRecentDonations,
  getTopDonations,
  getDonationStats,
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
  refundDonation,
  generateReceipt,
  getTaxSummary,
  getDonationAnalytics,
  getCampaignDonationAnalytics,
  getAllDonations,
  verifyDonation,
  generateReports,
  createRecurringDonation,
  getMyRecurringDonations,
  cancelRecurringDonation,
  pauseRecurringDonation,
  resumeRecurringDonation,
  stripeWebhook,
  payhereWebhook,
  createCheckoutSession,
  processMockPayment,
  getSessionDetails
};
