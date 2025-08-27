const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// Public routes
router.post('/create-payment-intent', donationController.createPaymentIntent);
router.post('/confirm', donationController.confirmDonation);
router.get('/history/:email', donationController.getDonationHistory);

// Webhook for payment confirmation
router.post('/webhook', donationController.handleWebhook);

module.exports = router;
