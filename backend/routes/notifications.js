const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require authentication
router.use(auth);

// Get user's notifications
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notifications as read
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notifications
router.delete('/:id', notificationController.deleteNotification);
router.delete('/clear-all', notificationController.clearAllNotifications);

// Notification preferences
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);

// Admin routes for sending notifications
router.post('/send', 
  authorize(['admin']), 
  notificationController.sendNotification
);

router.post('/broadcast', 
  authorize(['admin']), 
  notificationController.broadcastNotification
);

module.exports = router;
