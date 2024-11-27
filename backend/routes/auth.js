const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
router.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Upload request received:', { body: req.body, file: req.file });
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.body.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userId = req.body.userId;
    console.log('Looking for user with ID:', userId);
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(uploadsDir, path.basename(user.profilePicture));
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update user's profile picture path
    const profilePicturePath = `/uploads/${req.file.filename}`;
    console.log('Updating profile picture path to:', profilePicturePath);
    
    user.profilePicture = profilePicturePath;
    await user.save();

    console.log('Profile picture updated successfully');
    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePicturePath
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading profile picture', 
      error: error.message,
      stack: error.stack 
    });
  }
});

module.exports = router;