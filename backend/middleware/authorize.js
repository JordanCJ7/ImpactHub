// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Temporarily allow all authenticated users for campaign creation testing
    // TODO: Remove this bypass after proper user setup
    if (req.originalUrl.includes('/campaigns') && req.method === 'POST') {
      console.log('Temporarily allowing campaign creation for authenticated user:', req.user.email);
      return next();
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

module.exports = authorize;
