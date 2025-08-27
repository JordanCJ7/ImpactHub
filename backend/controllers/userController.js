const User = require('../models/User');
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
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
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

module.exports = {
  register,
  login,
  googleAuth,
  getUserProfile,
  updateUserProfile
};
