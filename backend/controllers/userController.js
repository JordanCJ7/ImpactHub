const User = require('../models/User');
const Donation = require('../models/Donation');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, password' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    // Handle duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
        donationStats: user.donationStats
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Google OAuth authentication
const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    
    // Validate input
    if (!googleId || !email || !name) {
      return res.status(400).json({ 
        error: 'Missing required Google auth data' 
      });
    }
    
    // Check if user exists by email or googleId
    let user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { googleId }
      ]
    });
    
    if (user) {
      // Update existing user with Google data if needed
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      user.isEmailVerified = true; // Google emails are verified
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar,
        isEmailVerified: true
      });
      await user.save();
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: 'Google authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
        donationStats: user.donationStats
      },
      token
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Get current user (authenticated user)
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userObj = user.toJSON();
    
    // If user has an avatar, convert it to base64 data URL
    if (userObj.avatar) {
      try {
        const path = require('path');
        const fs = require('fs').promises;
        const avatarPath = path.join(__dirname, '../uploads/avatars', path.basename(userObj.avatar));
        const avatarData = await fs.readFile(avatarPath);
        const ext = path.extname(userObj.avatar).toLowerCase();
        
        let mimeType = 'image/jpeg'; // default
        switch (ext) {
          case '.png': mimeType = 'image/png'; break;
          case '.gif': mimeType = 'image/gif'; break;
          case '.webp': mimeType = 'image/webp'; break;
          case '.jpg':
          case '.jpeg': mimeType = 'image/jpeg'; break;
        }
        
        userObj.avatarData = `data:${mimeType};base64,${avatarData.toString('base64')}`;
      } catch (avatarError) {
        console.log('Could not load avatar file:', avatarError.message);
        // Don't fail the request if avatar can't be loaded
      }
    }
    
    res.json(userObj);
    
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // For JWT-based auth, logout is handled client-side by removing the token
    // But we can still log the action or invalidate tokens if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const updates = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Don't allow updating sensitive fields
    delete updates.password;
    delete updates.googleId;
    delete updates.role;
    delete updates.donationStats;
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Get donor leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    console.log('=== Leaderboard Debug ===');
    
    // Calculate real-time donor stats from completed donations
    const donorStats = await Donation.aggregate([
      { $match: { status: 'completed', donor: { $ne: null } } },
      {
        $group: {
          _id: '$donor',
          totalDonated: { $sum: '$amount' },
          donationCount: { $sum: 1 }
        }
      },
      { $match: { totalDonated: { $gt: 0 } } },
      { $sort: { totalDonated: -1 } },
      { $limit: parseInt(limit) }
    ]);

    console.log('Donor stats from aggregation:', donorStats.length);

    // Get user details for each donor
    const donorIds = donorStats.map(stat => stat._id);
    const donors = await User.find({ 
      _id: { $in: donorIds },
      role: 'donor'
    })
    .select('name email avatar createdAt');

    console.log('Donors found:', donors.length);

    // Count campaigns supported by each donor
    const campaignCounts = await Donation.aggregate([
      { $match: { donor: { $in: donorIds }, status: 'completed' } },
      { $group: { _id: '$donor', campaignsSupported: { $addToSet: '$campaign' } } },
      { $project: { _id: 1, campaignsSupported: { $size: '$campaignsSupported' } } }
    ]);

    // Combine data
    const donorMap = donors.reduce((map, donor) => {
      map[donor._id.toString()] = donor;
      return map;
    }, {});

    const campaignMap = campaignCounts.reduce((map, item) => {
      map[item._id.toString()] = item.campaignsSupported;
      return map;
    }, {});

    // Format the leaderboard
    const leaderboard = donorStats.map((stat, index) => {
      const donorId = stat._id.toString();
      const donor = donorMap[donorId];
      const totalDonated = stat.totalDonated;
      
      // Calculate donor level
      let donorLevel = 'Bronze';
      if (totalDonated >= 100000) donorLevel = 'Platinum';
      else if (totalDonated >= 20000) donorLevel = 'Gold';
      else if (totalDonated >= 5000) donorLevel = 'Silver';

      return {
        _id: stat._id,
        name: donor?.name || 'Anonymous',
        avatar: donor?.avatar || null,
        totalDonated: stat.totalDonated,
        campaignsSupported: campaignMap[donorId] || 0,
        donorLevel,
        rank: index + 1
      };
    });

    console.log('Final leaderboard count:', leaderboard.length);
    console.log('=========================');

    res.json({ 
      success: true,
      count: leaderboard.length,
      leaderboard 
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getUserProfile,
  getCurrentUser,
  logout,
  updateUserProfile,
  getLeaderboard
};
