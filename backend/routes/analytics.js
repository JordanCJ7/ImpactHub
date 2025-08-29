const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Protected routes
router.use(auth);

// General analytics (for all authenticated users)
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/user', analyticsController.getUserStats);
router.get('/trends', analyticsController.getTrends);

// Campaign analytics (for campaign leaders and admins)
router.get('/campaigns/overview', 
  authorize(['campaign-leader', 'admin']), 
  analyticsController.getCampaignOverview
);

router.get('/campaigns/:id/performance', 
  authorize(['campaign-leader', 'admin']), 
  analyticsController.getCampaignPerformance
);

// Donation analytics
router.get('/donations/summary', 
  authorize(['donor', 'campaign-leader', 'admin']), 
  analyticsController.getDonationSummary
);

router.get('/donations/trends', 
  authorize(['campaign-leader', 'admin']), 
  analyticsController.getDonationTrends
);

// Admin analytics
router.get('/admin/platform-stats', 
  authorize(['admin']), 
  analyticsController.getPlatformStats
);

router.get('/admin/user-analytics', 
  authorize(['admin']), 
  analyticsController.getUserAnalytics
);

router.get('/admin/financial-report', 
  authorize(['admin']), 
  analyticsController.getFinancialReport
);

router.get('/admin/export', 
  authorize(['admin']), 
  analyticsController.exportAnalytics
);

module.exports = router;
