const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const donationController = require('../controllers/donationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Validation middleware
const createDonationValidation = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Amount must be between 1 and 1,000,000'),
  body('campaign')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'paypal', 'stripe', 'razorpay', 'payhere'])
    .withMessage('Invalid payment method'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean')
];

// Public routes
router.get('/recent', donationController.getRecentDonations);
router.get('/top', donationController.getTopDonations);
router.get('/stats', donationController.getDonationStats);

// Create donation (can be anonymous)
router.post('/', createDonationValidation, donationController.createDonation);

// Payment processing
router.post('/create-payment-intent', donationController.createPaymentIntent);
router.post('/confirm', donationController.confirmDonation);
router.post('/process-payment', donationController.processPayment);
router.post('/webhook', donationController.handleWebhook);
router.post('/webhook/stripe', donationController.stripeWebhook);
router.post('/webhook/payhere', donationController.payhereWebhook);

// Protected routes
router.use(auth);

// User's donation history
router.get('/my-donations', donationController.getMyDonations);
router.get('/my-donations/:id', donationController.getDonationById);
router.get('/history/:email', donationController.getDonationHistory);

// Donation management
router.put('/:id/cancel', donationController.cancelDonation);
router.post('/:id/refund', authorize(['admin']), donationController.refundDonation);

// Receipts and tax documents
router.get('/:id/receipt', donationController.generateReceipt);
router.get('/tax-summary/:year', donationController.getTaxSummary);

// Analytics for campaign leaders and admins
router.get('/analytics/overview', 
  authorize(['campaign-leader', 'admin']), 
  donationController.getDonationAnalytics
);

router.get('/analytics/campaign/:campaignId', 
  authorize(['campaign-leader', 'admin']), 
  donationController.getCampaignDonationAnalytics
);

// Admin routes
router.get('/admin/all', 
  authorize(['admin']), 
  donationController.getAllDonations
);

router.put('/admin/:id/verify', 
  authorize(['admin']), 
  donationController.verifyDonation
);

router.get('/admin/reports', 
  authorize(['admin']), 
  donationController.generateReports
);

// Recurring donations
router.post('/recurring', 
  [
    ...createDonationValidation,
    body('frequency').isIn(['weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid frequency'),
    body('endDate').isISO8601().withMessage('Please provide a valid end date')
  ],
  donationController.createRecurringDonation
);

router.get('/recurring/my-subscriptions', donationController.getMyRecurringDonations);
router.put('/recurring/:id/cancel', donationController.cancelRecurringDonation);
router.put('/recurring/:id/pause', donationController.pauseRecurringDonation);
router.put('/recurring/:id/resume', donationController.resumeRecurringDonation);

module.exports = router;
