const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import User model
const User = require('./models/User');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      console.log('Role:', existingUser.role);
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'donor',
      isEmailVerified: true,
      profile: {
        bio: 'I am a test user for the ImpactHub platform.',
        phone: '0771234567', // Valid Sri Lankan phone format
        address: {
          street: '123 Test Street',
          city: 'Colombo',
          state: 'Western Province',
          country: 'Sri Lanka',
          zipCode: '10100'
        }
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        currency: 'LKR',
        language: 'en',
        preferredCategories: ['Education', 'Health & Medical'], // Valid enum values
        donationPrivacy: 'public'
      },
      stats: {
        totalDonated: 5000,
        donationCount: 3,
        campaignsSupported: 2,
        campaignsCreated: 0,
        totalRaised: 0,
        impactPoints: 50,
        donorLevel: 'Bronze'
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('Role: donor');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createTestUser();
