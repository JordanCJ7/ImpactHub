const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/google-auth', userController.googleAuth);

// User profile routes
router.get('/profile/:email', userController.getUserProfile);
router.put('/profile/:email', userController.updateUserProfile);

module.exports = router;
