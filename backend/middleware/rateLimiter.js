const rateLimit = require('express-rate-limit');

// General API rate limiting
const general = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication routes
const auth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiting for donation creation
const donation = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 donation attempts per 5 minutes
  message: {
    error: 'Too many donation attempts, please try again later.',
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for campaign creation
const campaign = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 campaign creations per hour
  message: {
    error: 'Too many campaign creation attempts, please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password reset
const passwordReset = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment endpoint rate limiting
const payment = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 payment requests per minute
  message: {
    error: 'Too many payment requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  general,
  auth,
  donation,
  campaign,
  passwordReset,
  payment
};
