const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validationResult } = require('express-validator');

if (process.env.NODE_ENV !== 'production') {
  console.log('Donation controller loaded. Using dynamic pricing for variable donation amounts.');
}

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

// Create a Stripe Checkout Session for a campaign donation
const createCheckoutSession = async (req, res) => {
  try {
    const { campaignId, amount, currency = 'LKR', donorEmail, donorName, isAnonymous = false, message } = req.body;

    // Only campaignId and amount are required here; Stripe Checkout can collect payer email
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

    // Create a pending Donation record to be fulfilled after webhook confirmation
    const donationData = {
      campaign: campaignId,
      amount,
      currency,
      isAnonymous,
      message,
      status: 'pending',
      payment: {
        paymentId: `checkout_${Date.now()}`,
        paymentMethod: 'stripe',
        netAmount: amount,
        currency
      },
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
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
          // Store donor info for linking later when customer details are available
          donationData.anonymousDonor = { name: finalDonorName || 'Supporter', email: finalDonorEmail };
        }
      } else {
        // Stripe will collect email - mark as non-anonymous for now
        donationData.anonymousDonor = { name: finalDonorName || 'Supporter', email: '' };
      }
    }

    const donation = new Donation(donationData);

    await donation.save();

    // Build session payload
    const sessionPayload = {
      payment_method_types: ['card'],
      mode: 'payment',
      metadata: {
        donationId: donation._id.toString(),
        campaignId,
        isAnonymous: isAnonymous.toString(),
        message: message || ''
      },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/donation-cancel`
    };

    if (finalDonorEmail) sessionPayload.customer_email = finalDonorEmail;
    if (finalDonorName) sessionPayload.metadata.donorName = finalDonorName;

    // Use dynamic pricing for variable donation amounts (no fixed Price ID needed)
    sessionPayload.line_items = [{
      price_data: {
        currency: currency.toLowerCase(),
        product_data: { 
          name: `Donation to ${campaign.title}`,
          description: `Support ${campaign.title} - One-time donation`
        },
        unit_amount: Math.round(amount * 100) // Convert to smallest currency unit (cents)
      },
      quantity: 1
    }];

    // Create Checkout Session with dynamic pricing
    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionPayload);
    } catch (stripeErr) {
      // Log detailed Stripe error for debugging
      console.error('Stripe Checkout session creation failed:');
      console.error('Message:', stripeErr.message);
      if (stripeErr.type) console.error('Type:', stripeErr.type);
      if (stripeErr.code) console.error('Code:', stripeErr.code);
      if (stripeErr.raw && stripeErr.raw.message) console.error('Stripe raw message:', stripeErr.raw.message);

      // Return helpful error in development; keep generic in production
      const resp = { error: 'Failed to create checkout session' };
      if (process.env.NODE_ENV !== 'production') {
        resp.detail = stripeErr.message;
        if (stripeErr.raw && stripeErr.raw.message) resp.stripeRaw = stripeErr.raw.message;
      }
      return res.status(500).json(resp);
    }

    // Attach payment id
    donation.payment.paymentId = session.id;
    await donation.save();

    res.json({ url: session.url, sessionId: session.id });
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
        raised: donation.amount,
        'analytics.donorCount': 1
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

      case 'checkout.session.completed':
        // A Checkout Session completed — fulfill the donation
        const session = event.data.object;
        // If we created a Donation earlier and stored its id in metadata
        const donationId = session.metadata && session.metadata.donationId;
        if (donationId) {
          const donation = await Donation.findById(donationId);
          if (donation && donation.status === 'pending') {
            donation.status = 'completed';
            donation.payment.transactionId = session.payment_intent || session.payment_intent?.id || '';
            
            // Update donor information from Stripe if available and donation is not anonymous
            if (!donation.isAnonymous && session.customer_details) {
              if (session.customer_details.email && !donation.anonymousDonor.email) {
                donation.anonymousDonor.email = session.customer_details.email;
              }
              if (session.customer_details.name && !donation.anonymousDonor.name) {
                donation.anonymousDonor.name = session.customer_details.name;
              }
              
              // Try to link to existing user by email
              if (session.customer_details.email && !donation.donor) {
                const existingUser = await User.findOne({ email: session.customer_details.email });
                if (existingUser) {
                  donation.donor = existingUser._id;
                }
              }
            }
            
            await donation.save();

            // Update campaign amounts - use correct field name 'raised' not 'currentAmount'
            await Campaign.findByIdAndUpdate(donation.campaign, {
              $inc: { raised: donation.amount, 'analytics.donorCount': 1 }
            });

            // Update user stats if donor email exists
            if (donation.anonymousDonor && donation.anonymousDonor.email) {
              await User.findOneAndUpdate({ email: donation.anonymousDonor.email }, {
                $inc: { 'donationStats.totalDonated': donation.amount, 'donationStats.donationCount': 1 }
              });
            }
            
            // Also update user stats if donor ID exists
            if (donation.donor) {
              await User.findByIdAndUpdate(donation.donor, {
                $inc: { 'donationStats.totalDonated': donation.amount, 'donationStats.donationCount': 1 }
              });
            }
          }
        }
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
        raised: donation.amount,
        'analytics.donorCount': 1
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
  ,
  createCheckoutSession
};
