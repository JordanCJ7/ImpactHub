const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

// Public routes
router.get('/', campaignController.getAllCampaigns);
router.get('/search', campaignController.searchCampaigns);
router.get('/categories', campaignController.getCategories);
router.get('/featured', campaignController.getFeaturedCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.get('/:id/donations', campaignController.getCampaignDonations);
router.get('/:id/impact-reports', campaignController.getImpactReports);

// Social sharing
router.post('/:id/share', campaignController.incrementShareCount);

module.exports = router;
