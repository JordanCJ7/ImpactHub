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
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Short description cannot exceed 200 characters'),
  body('story')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Story cannot exceed 10000 characters'),
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
  // Organization fields are now optional since they're auto-populated from user profile
  body('organizationName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('organizationEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid organization email'),
  body('timeline')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Timeline must be between 10 and 2000 characters'),
  body('budget')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Budget breakdown must be between 10 and 2000 characters'),
  body('risks')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Risk assessment cannot exceed 2000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('beneficiaries')
    .optional()
    .isObject()
    .withMessage('Beneficiaries must be an object'),
  body('beneficiaries.count')
    .optional()
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Beneficiaries count must be a non-negative number'),
  body('beneficiaries.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Beneficiaries description cannot exceed 500 characters'),
  body('features')
    .optional()
    .isObject()
    .withMessage('Features must be an object'),
  body('seo')
    .optional()
    .isObject()
    .withMessage('SEO must be an object')
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
// Register authenticated list of drafts BEFORE generic :id route to avoid conflicts
router.get('/user/drafts', auth, authorize(['campaign-leader', 'admin']), campaignController.getDraftCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.get('/:id/updates', campaignController.getCampaignUpdates);
router.get('/:id/donations', campaignController.getCampaignDonations);
router.get('/:id/analytics', campaignController.getCampaignAnalytics);

// Campaign interaction (view tracking)
router.post('/:id/view', campaignController.recordView);
router.post('/:id/share', campaignController.recordShare);
// Like / Unlike endpoints (donors only)
// Like / Unlike endpoints (donors only) - ensure auth runs before authorize so req.user is set
router.post('/:id/like', auth, authorize(['donor', 'campaign-leader', 'admin']), campaignController.likeCampaign);
router.delete('/:id/like', auth, authorize(['donor', 'campaign-leader', 'admin']), campaignController.unlikeCampaign);

// Protected routes
router.use(auth); // All routes below require authentication

// Campaign creation and management
router.post('/', 
  authorize(['campaign-leader', 'admin']), 
  createCampaignValidation, 
  campaignController.createCampaign
);

// Drafts: create and list
router.post('/drafts',
  authorize(['campaign-leader', 'admin']),
  // Minimal validation for drafts (optional fields allowed)
  campaignController.createDraftCampaign
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
