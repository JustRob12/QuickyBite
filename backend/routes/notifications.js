const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Share app with another user
router.post('/share', auth, async (req, res) => {
  try {
    const { email, message } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find recipient user by email
    const recipient = await User.findOne({ email: email.toLowerCase() });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found. Only registered users can receive notifications.' });
    }

    // Don't allow sharing with yourself
    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot share with yourself' });
    }

    // Get sender's information
    const sender = await User.findById(req.user.id);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Create notification for recipient
    const notification = new Notification({
      recipient: recipient._id,
      sender: sender._id,
      senderName: sender.name,
      senderEmail: sender.email,
      type: 'share',
      message: `From: ${sender.name} (${sender.email})\n\n${message || 'Shared QuickyBite with you!'}`
    });

    await notification.save();
    res.json({ message: 'Shared successfully' });
  } catch (error) {
    console.error('Error sharing:', error);
    res.status(500).json({ message: 'Error sharing content' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if the user owns this notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this notification' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// Delete all notifications for the current user
router.delete('/all', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: 'Error deleting notifications' });
  }
});

module.exports = router;
