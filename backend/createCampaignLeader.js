const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import User model
const User = require('./models/User');

async function createCampaignLeader() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if campaign leader already exists
    const existingUser = await User.findOne({ email: 'leader@example.com' });
    if (existingUser) {
      console.log('Campaign leader already exists!');
      console.log('Email: leader@example.com');
      console.log('Password: password123');
      console.log('Role:', existingUser.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create campaign leader
    const campaignLeader = new User({
      name: 'Campaign Leader',
      email: 'leader@example.com',
      password: hashedPassword,
      role: 'campaign-leader',
      isEmailVerified: true,
      organizationName: 'Test Organization',
      profile: {
        bio: 'I am a campaign leader for testing purposes.',
        phone: '0777654321',
        address: {
          street: '456 Leader Street',
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
        preferredCategories: ['Education', 'Environment']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await campaignLeader.save();
    console.log('Campaign leader created successfully!');
    console.log('Email: leader@example.com');
    console.log('Password: password123');
    console.log('Role: campaign-leader');

  } catch (error) {
    console.error('Error creating campaign leader:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createCampaignLeader();
