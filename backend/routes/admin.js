const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require admin authorization
router.use(auth);
router.use(authorize(['admin']));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Campaign management
router.get('/campaigns', adminController.getAllCampaigns);
router.get('/campaigns/pending', adminController.getPendingCampaigns);
router.put('/campaigns/:id/approve', adminController.approveCampaign);
router.put('/campaigns/:id/reject', [
  body('reason').notEmpty().withMessage('Rejection reason is required')
], adminController.rejectCampaign);
router.put('/campaigns/:id/suspend', [
  body('reason').notEmpty().withMessage('Suspension reason is required')
], adminController.suspendCampaign);

// Donation management
router.get('/donations', adminController.getAllDonations);
router.get('/donations/flagged', adminController.getFlaggedDonations);
router.put('/donations/:id/verify', adminController.verifyDonation);
router.post('/donations/:id/refund', [
  body('reason').notEmpty().withMessage('Refund reason is required')
], adminController.processRefund);

// Financial reports
router.get('/reports/financial', adminController.getFinancialReport);
router.get('/reports/tax', adminController.getTaxReport);
router.get('/reports/audit', adminController.getAuditReport);

// Platform statistics
router.get('/stats/overview', adminController.getPlatformOverview);
router.get('/stats/growth', adminController.getGrowthStats);
router.get('/stats/performance', adminController.getPerformanceStats);

// System management
router.get('/logs/audit', adminController.getAuditLogs);
router.get('/logs/errors', adminController.getErrorLogs);
router.post('/notifications/broadcast', [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').isIn(['info', 'warning', 'success', 'error']).withMessage('Invalid notification type')
], adminController.broadcastNotification);

// Data export
router.get('/export/users', adminController.exportUsers);
router.get('/export/campaigns', adminController.exportCampaigns);
router.get('/export/donations', adminController.exportDonations);

// Settings management
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

module.exports = router;
