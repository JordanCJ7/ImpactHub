const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '30d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, password, role = 'donor' } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role,
      isEmailVerified: false
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Log registration
    await AuditLog.logAction({
      user: user._id,
      action: 'user_created',
      resource: 'user',
      resourceId: user._id,
      details: { role, email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to register user',
      details: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if account is banned
    if (user.isBanned) {
      return res.status(401).json({
        error: 'Account is banned.',
        reason: user.banReason
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    // Log login
    await AuditLog.logAction({
      user: user._id,
      action: 'user_login',
      resource: 'user',
      resourceId: user._id,
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to login',
      details: error.message
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Log logout
    await AuditLog.logAction({
      user: req.user._id,
      action: 'user_logout',
      resource: 'user',
      resourceId: req.user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Failed to logout'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Invalid refresh token'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to get user data'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, address, preferences } = req.body;
    const user = req.user;

    // Update allowed fields
    if (name) user.name = name.trim();
    if (bio !== undefined) user.profile.bio = bio;
    if (phone !== undefined) user.profile.phone = phone;
    if (address) user.profile.address = { ...user.profile.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    // Log profile update
    await AuditLog.logAction({
      user: user._id,
      action: 'user_updated',
      resource: 'user',
      resourceId: user._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log password change
    await AuditLog.logAction({
      user: user._id,
      action: 'password_changed',
      resource: 'user',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      details: error.message
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // TODO: Send email with reset link
    // const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password?token=${resetToken}`;

    res.json({
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to process password reset request'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token, password } = req.body;

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Log password reset
    await AuditLog.logAction({
      user: user._id,
      action: 'password_changed',
      resource: 'user',
      resourceId: user._id,
      details: { method: 'reset' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Failed to reset password'
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // Log email verification
    await AuditLog.logAction({
      user: user._id,
      action: 'email_verified',
      resource: 'user',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Failed to verify email'
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const user = req.user;

    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // TODO: Send verification email

    res.json({
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Failed to resend verification email'
    });
  }
};

// Google OAuth authentication
const googleAuth = async (req, res) => {
  try {
    // TODO: Implement Google OAuth
    res.status(501).json({
      error: 'Google authentication not yet implemented'
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      error: 'Failed to authenticate with Google'
    });
  }
};

// Facebook OAuth authentication
const facebookAuth = async (req, res) => {
  try {
    // TODO: Implement Facebook OAuth
    res.status(501).json({
      error: 'Facebook authentication not yet implemented'
    });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({
      error: 'Failed to authenticate with Facebook'
    });
  }
};

// Check authentication status
const checkAuth = async (req, res) => {
  try {
    res.json({
      isAuthenticated: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({
      error: 'Failed to check authentication status'
    });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const user = req.user;

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    // Log account deletion
    await AuditLog.logAction({
      user: user._id,
      action: 'user_deleted',
      resource: 'user',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Failed to delete account'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  googleAuth,
  facebookAuth,
  checkAuth,
  deleteAccount
};
