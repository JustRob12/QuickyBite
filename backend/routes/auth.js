const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phoneNumber, pronouns } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      phoneNumber: phoneNumber || '',
      pronouns: pronouns || 'he/him'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create token
    const payload = {
      id: user.id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return user data without password
    const userResponse = await User.findById(user.id).select('-password');

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create and send token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // Construct the full profile picture URL
    const fullProfilePicturePath = user.profilePicture 
      ? `${process.env.API_URL || 'http://localhost:5000'}${user.profilePicture}`
      : null;

    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: fullProfilePicturePath  // Send the full URL
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload profile picture route
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: req.file.path.replace(/\\/g, '/') }, // Normalize path for all OS
      { new: true }
    ).select('-password');

    console.log('Updated user with profile picture:', user); // Debug log

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// Add this route to handle profile updates
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name, email, phoneNumber, pronouns } = req.body;
    const userId = req.user.id;

    // First get the current user to preserve existing data
    const currentUser = await User.findById(userId);
    
    // Check if email is already in use by another user
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    // Update user profile while preserving other fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name || currentUser.name,
          email: email || currentUser.email,
          phoneNumber: phoneNumber || currentUser.phoneNumber,
          pronouns: pronouns || currentUser.pronouns,
          profilePicture: currentUser.profilePicture
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    // Log the update for debugging
    console.log('Updated user:', updatedUser);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route if you haven't already
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users for suggestions
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;