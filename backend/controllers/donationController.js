const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validationResult } = require('express-validator');

// Create payment intent for donation
const createPaymentIntent = async (req, res) => {
  try {
    const { campaignId, amount, currency = 'USD', donorEmail, donorName, message, isAnonymous = false } = req.body;
    
    // Validate input
    if (!campaignId || !amount || !donorEmail || !donorName) {
      return res.status(400).json({ 
        error: 'Missing required fields: campaignId, amount, donorEmail, donorName' 
      });
    }
    
    // Validate minimum amount
    if (amount < 1) {
      return res.status(400).json({ error: 'Minimum donation amount is $1' });
    }
    
    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    if (campaign.status !== 'active') {
      return res.status(400).json({ error: 'Campaign is not accepting donations' });
    }
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        campaignId,
        donorEmail,
        donorName,
        isAnonymous: isAnonymous.toString(),
        message: message || ''
      }
    });
    
    // Create pending donation record
    const donation = new Donation({
      campaignId,
      donorEmail,
      donorName,
      amount,
      currency,
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      isAnonymous,
      message,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referrer')
      }
    });
    
    await donation.save();
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      donationId: donation._id
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Confirm donation after successful payment
const confirmDonation = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }
    
    // Retrieve payment intent from Stripe to verify payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Find and update donation record
    const donation = await Donation.findOne({ paymentIntentId });
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
    await Campaign.findByIdAndUpdate(donation.campaignId, {
      $inc: { 
        currentAmount: donation.amount,
        donationCount: 1
      }
    });
    
    // Update user donation stats if user exists
    await User.findOneAndUpdate(
      { email: donation.donorEmail },
      {
        $inc: {
          'donationStats.totalDonated': donation.amount,
          'donationStats.donationCount': 1
        }
      }
    );
    
    res.json({
      message: 'Donation confirmed successfully',
      donation: {
        id: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        campaignId: donation.campaignId,
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
      donorEmail: email,
      status: 'completed'
    })
    .populate('campaignId', 'title organizationName imageUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Donation.countDocuments({ 
      donorEmail: email,
      status: 'completed'
    });
    
    // Calculate summary stats
    const stats = await Donation.aggregate([
      { $match: { donorEmail: email, status: 'completed' } },
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

// Handle Stripe webhook for payment updates
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};

// Helper function to handle successful payment
const handlePaymentSucceeded = async (paymentIntent) => {
  const donation = await Donation.findOne({ paymentIntentId: paymentIntent.id });
  
  if (donation && donation.status === 'pending') {
    donation.status = 'completed';
    await donation.save();
    
    // Update campaign
    await Campaign.findByIdAndUpdate(donation.campaignId, {
      $inc: { 
        currentAmount: donation.amount,
        donationCount: 1
      }
    });
    
    // Update user stats
    await User.findOneAndUpdate(
      { email: donation.donorEmail },
      {
        $inc: {
          'donationStats.totalDonated': donation.amount,
          'donationStats.donationCount': 1
        }
      }
    );
  }
};

// Helper function to handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  const donation = await Donation.findOne({ paymentIntentId: paymentIntent.id });
  
  if (donation && donation.status === 'pending') {
    donation.status = 'failed';
    await donation.save();
  }
};

// Get recent donations (public)
const getRecentDonations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const donations = await Donation.find({ 
      status: 'completed',
      isAnonymous: false 
    })
    .populate('campaignId', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('donorName amount campaignId createdAt message');
    
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
    .populate('campaignId', 'title')
    .sort({ amount: -1 })
    .limit(limit)
    .select('donorName amount campaignId createdAt message');
    
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

// Placeholder functions for missing routes
const getMyDonations = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const donations = await Donation.find({ 
      donorEmail: userEmail,
      status: 'completed' 
    })
    .populate('campaignId', 'title')
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

const processPayment = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const stripeWebhook = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

const payhereWebhook = async (req, res) => {
  res.status(501).json({ error: 'Function not implemented yet' });
};

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
  processPayment,
  stripeWebhook,
  payhereWebhook
};
