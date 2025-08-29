const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const campaignController = require('../controllers/campaignController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Validation middleware
const createCampaignValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Title must be between 10 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  body('goal')
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Goal must be at least 100'),
  body('category')
    .isIn(['Health & Medical', 'Education', 'Environment', 'Emergency Relief', 
           'Animals & Wildlife', 'Community Development', 'Children & Youth', 
           'Arts & Culture', 'Sports & Recreation', 'Technology'])
    .withMessage('Invalid category'),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('organizationName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('organizationEmail')
    .isEmail()
    .withMessage('Please provide a valid organization email')
];

const updateCampaignValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Title must be between 10 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  body('goal')
    .optional()
    .isNumeric()
    .isFloat({ min: 100 })
    .withMessage('Goal must be at least 100'),
  body('category')
    .optional()
    .isIn(['Health & Medical', 'Education', 'Environment', 'Emergency Relief', 
           'Animals & Wildlife', 'Community Development', 'Children & Youth', 
           'Arts & Culture', 'Sports & Recreation', 'Technology'])
    .withMessage('Invalid category')
];

// Public routes
router.get('/', campaignController.getAllCampaigns);
router.get('/featured', campaignController.getFeaturedCampaigns);
router.get('/trending', campaignController.getTrendingCampaigns);
router.get('/urgent', campaignController.getUrgentCampaigns);
router.get('/categories', campaignController.getCampaignsByCategory);
router.get('/search', campaignController.searchCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.get('/:id/updates', campaignController.getCampaignUpdates);
router.get('/:id/donations', campaignController.getCampaignDonations);
router.get('/:id/analytics', campaignController.getCampaignAnalytics);

// Campaign interaction (view tracking)
router.post('/:id/view', campaignController.recordView);
router.post('/:id/share', campaignController.recordShare);

// Protected routes
router.use(auth); // All routes below require authentication

// Campaign creation and management
router.post('/', 
  authorize(['campaign-leader', 'admin']), 
  createCampaignValidation, 
  campaignController.createCampaign
);

router.put('/:id', 
  authorize(['campaign-leader', 'admin']), 
  updateCampaignValidation, 
  campaignController.updateCampaign
);

router.delete('/:id', 
  authorize(['campaign-leader', 'admin']), 
  campaignController.deleteCampaign
);

// Campaign status management
router.put('/:id/status', 
  authorize(['admin']), 
  campaignController.updateCampaignStatus
);

router.put('/:id/approve', 
  authorize(['admin']), 
  campaignController.approveCampaign
);

router.put('/:id/reject', 
  authorize(['admin']), 
  campaignController.rejectCampaign
);

// Campaign updates
router.post('/:id/updates', 
  authorize(['campaign-leader', 'admin']),
  [
    body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters')
  ],
  campaignController.addCampaignUpdate
);

router.put('/:id/updates/:updateId', 
  authorize(['campaign-leader', 'admin']), 
  campaignController.updateCampaignUpdate
);

router.delete('/:id/updates/:updateId', 
  authorize(['campaign-leader', 'admin']), 
  campaignController.deleteCampaignUpdate
);

// User's campaigns
router.get('/user/my-campaigns', 
  authorize(['campaign-leader', 'admin']), 
  campaignController.getMyCampaigns
);

router.get('/user/supported-campaigns', 
  authorize(['donor', 'campaign-leader', 'admin']), 
  campaignController.getSupportedCampaigns
);

// Analytics and reporting
router.get('/:id/analytics/detailed', 
  authorize(['campaign-leader', 'admin']), 
  campaignController.getDetailedAnalytics
);

router.get('/:id/export', 
  authorize(['campaign-leader', 'admin']), 
  campaignController.exportCampaignData
);

module.exports = router;
