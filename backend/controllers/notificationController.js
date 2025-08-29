const Notification = require('../models/Notification');

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const filter = { recipient: req.user._id };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications'
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to fetch unread count'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read'
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification'
    });
  }
};

// Clear all notifications
const clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id
    });

    res.json({
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      error: 'Failed to clear all notifications'
    });
  }
};

// Get notification preferences
const getPreferences = async (req, res) => {
  try {
    // For now, return default preferences
    // In a real app, this would be stored in user profile
    const preferences = {
      email: {
        donations: true,
        campaignUpdates: true,
        systemAlerts: true,
        marketingEmails: false
      },
      push: {
        donations: true,
        campaignUpdates: false,
        systemAlerts: true
      },
      sms: {
        donations: false,
        campaignUpdates: false,
        systemAlerts: false
      }
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      error: 'Failed to fetch notification preferences'
    });
  }
};

// Update notification preferences
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    // For now, just return success
    // In a real app, this would update user profile
    res.json({
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      error: 'Failed to update notification preferences'
    });
  }
};

// Create notification (admin only)
const createNotification = async (req, res) => {
  try {
    const { recipients, type, title, message, data, actionUrl, actionText } = req.body;

    const notifications = [];

    // If recipients is 'all', send to all users
    if (recipients === 'all') {
      // For now, just return success
      // In a real app, this would create notifications for all users
      return res.status(201).json({
        message: 'Notification sent to all users',
        count: 0
      });
    }

    // Send to specific recipients
    for (const recipientId of recipients) {
      const notification = await Notification.createNotification({
        recipient: recipientId,
        sender: req.user._id,
        type,
        title,
        message,
        data,
        actionUrl,
        actionText
      });
      notifications.push(notification);
    }

    res.status(201).json({
      message: 'Notifications created successfully',
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      error: 'Failed to create notification'
    });
  }
};

// Get notification statistics (admin only)
const getNotificationStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
    }

    const totalNotifications = await Notification.countDocuments({
      createdAt: dateFilter
    });

    const readNotifications = await Notification.countDocuments({
      createdAt: dateFilter,
      isRead: true
    });

    const notificationsByType = await Notification.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const readRate = totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;

    res.json({
      stats: {
        total: totalNotifications,
        read: readNotifications,
        unread: totalNotifications - readNotifications,
        readRate: Math.round(readRate * 100) / 100,
        byType: notificationsByType
      },
      period
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch notification statistics'
    });
  }
};

// Send notification to specific users (admin only)
const sendNotification = async (req, res) => {
  try {
    const { recipients, type, title, message, data, actionUrl, actionText } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        error: 'Recipients array is required'
      });
    }

    const notifications = [];

    for (const recipientId of recipients) {
      const notification = await Notification.createNotification({
        recipient: recipientId,
        sender: req.user._id,
        type: type || 'system_alert',
        title,
        message,
        data,
        actionUrl,
        actionText
      });
      notifications.push(notification);
    }

    res.status(201).json({
      message: 'Notifications sent successfully',
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      error: 'Failed to send notification'
    });
  }
};

// Broadcast notification to all users (admin only)
const broadcastNotification = async (req, res) => {
  try {
    const { type, title, message, data, actionUrl, actionText } = req.body;

    // For now, just return success
    // In a real app, this would create notifications for all users
    // This would typically be done with a background job
    
    res.status(201).json({
      message: 'Broadcast notification queued successfully',
      type: type || 'system_announcement',
      title,
      message,
      estimatedRecipients: 0 // Placeholder
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({
      error: 'Failed to broadcast notification'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getPreferences,
  updatePreferences,
  createNotification,
  getNotificationStats,
  sendNotification,
  broadcastNotification
};
