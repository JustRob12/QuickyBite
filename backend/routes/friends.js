const express = require('express');
const router = express.Router();
const Friend = require('../models/Friend');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users (for friend suggestions)
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find(
            { _id: { $ne: req.user.id } },
            'name email profilePicture'
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send friend request
router.post('/request', auth, async (req, res) => {
    try {
        const { friendId } = req.body;
        
        // Check if friend request already exists
        const existingRequest = await Friend.findOne({
            user: req.user.id,
            friend: friendId
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exists' });
        }

        const friendRequest = new Friend({
            user: req.user.id,
            friend: friendId
        });

        await friendRequest.save();

        // Increment the friend request count for the recipient
        const recipientUser = await User.findById(friendId);
        recipientUser.friendRequestCount = (recipientUser.friendRequestCount || 0) + 1;
        await recipientUser.save();

        res.status(201).json(friendRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get friend requests (both sent and received)
router.get('/requests', auth, async (req, res) => {
    try {
        const receivedRequests = await Friend.find({ friend: req.user.id, status: 'pending' })
            .populate('user', 'name email profilePicture');
        
        const sentRequests = await Friend.find({ user: req.user.id, status: 'pending' })
            .populate('friend', 'name email profilePicture');

        res.json({ received: receivedRequests, sent: sentRequests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Accept or reject friend request
router.put('/request/:requestId', auth, async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        
        const friendRequest = await Friend.findOne({
            _id: req.params.requestId,
            friend: req.user.id,
            status: 'pending'
        });

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        friendRequest.status = status;
        await friendRequest.save();

        res.json(friendRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all friends
router.get('/list', auth, async (req, res) => {
    try {
        const friends = await Friend.find({
            $or: [
                { user: req.user.id, status: 'accepted' },
                { friend: req.user.id, status: 'accepted' }
            ]
        }).populate('user friend', 'name email profilePicture');

        // Format the response to always show the friend's data regardless of whether they're in the user or friend field
        const formattedFriends = friends.map(friendship => {
            const friendData = friendship.user._id.toString() === req.user.id ? 
                friendship.friend : 
                friendship.user;
            return {
                friendshipId: friendship._id,
                friend: friendData
            };
        });

        res.json(formattedFriends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove friend
router.delete('/remove/:friendId', auth, async (req, res) => {
    try {
        await Friend.findOneAndDelete({
            $or: [
                { user: req.user.id, friend: req.params.friendId },
                { user: req.params.friendId, friend: req.user.id }
            ],
            status: 'accepted'
        });

        res.json({ message: 'Friend removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
