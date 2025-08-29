const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/google-auth', userController.googleAuth);

// Protected routes
router.use(auth);

// Current user route
router.get('/me', userController.getCurrentUser);
router.post('/logout', userController.logout);

// User profile routes
router.get('/profile/:email', userController.getUserProfile);
router.put('/profile/:email', userController.updateUserProfile);

module.exports = router;
