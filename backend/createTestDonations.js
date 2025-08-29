const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Donation = require('./models/Donation');

async function createTestDonations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('Test user not found! Please run createTestUser.js first.');
      return;
    }

    // Check if test campaigns exist, if not create them
    let campaign1 = await Campaign.findOne({ title: 'Clean Water for Rural Schools' });
    if (!campaign1) {
      campaign1 = new Campaign({
        title: 'Clean Water for Rural Schools',
        description: 'Providing clean water access to rural schools in Sri Lanka. This project aims to install clean water systems and sanitation facilities in underserved rural schools to improve student health and attendance.',
        goal: 100000,
        raised: 25000,
        category: 'Education',
        status: 'active',
        creator: testUser._id,
        organizationName: 'Rural Education Foundation',
        organizationEmail: 'contact@ruraleducation.lk',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        location: 'Anuradhapura, Sri Lanka'
      });
      await campaign1.save();
      console.log('✅ Created test campaign 1');
    }

    let campaign2 = await Campaign.findOne({ title: 'Medical Equipment for Rural Clinic' });
    if (!campaign2) {
      campaign2 = new Campaign({
        title: 'Medical Equipment for Rural Clinic',
        description: 'Purchasing essential medical equipment for a rural clinic. This initiative will provide modern diagnostic equipment and treatment facilities to serve remote communities with limited healthcare access.',
        goal: 150000,
        raised: 75000,
        category: 'Health & Medical',
        status: 'active',
        creator: testUser._id,
        organizationName: 'Community Health Initiative',
        organizationEmail: 'info@communityhealth.lk',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        location: 'Badulla, Sri Lanka'
      });
      await campaign2.save();
      console.log('✅ Created test campaign 2');
    }

    // Check if donations already exist
    const existingDonations = await Donation.find({ donor: testUser._id });
    if (existingDonations.length > 0) {
      console.log('Test donations already exist!');
      console.log('Total donations:', existingDonations.length);
      return;
    }

    // Create test donations
    const donations = [
      {
        donor: testUser._id,
        campaign: campaign1._id,
        amount: 2500,
        status: 'completed',
        payment: {
          paymentId: 'pay_test_001',
          paymentMethod: 'card',
          transactionId: 'txn_test_001',
          processingFee: 75,
          netAmount: 2425,
          currency: 'LKR',
          paymentGateway: 'stripe'
        },
        createdAt: new Date('2024-03-15'),
        message: 'Happy to support clean water initiatives!'
      },
      {
        donor: testUser._id,
        campaign: campaign2._id,
        amount: 1500,
        status: 'completed',
        payment: {
          paymentId: 'pay_test_002',
          paymentMethod: 'card',
          transactionId: 'txn_test_002',
          processingFee: 45,
          netAmount: 1455,
          currency: 'LKR',
          paymentGateway: 'stripe'
        },
        createdAt: new Date('2024-04-10'),
        message: 'Hope this helps the rural clinic.'
      },
      {
        donor: testUser._id,
        campaign: campaign1._id,
        amount: 1000,
        status: 'completed',
        payment: {
          paymentId: 'pay_test_003',
          paymentMethod: 'bank_transfer',
          transactionId: 'txn_test_003',
          processingFee: 25,
          netAmount: 975,
          currency: 'LKR',
          paymentGateway: 'bank'
        },
        createdAt: new Date('2024-05-20'),
        message: 'Another contribution for the cause!'
      }
    ];

    await Donation.insertMany(donations);
    console.log('✅ Created 3 test donations');

    // Update user stats
    await User.findByIdAndUpdate(testUser._id, {
      'stats.totalDonated': 5000,
      'stats.donationCount': 3,
      'stats.campaignsSupported': 2,
      'stats.impactPoints': 50,
      'stats.donorLevel': 'Bronze'
    });

    console.log('✅ Updated user stats');
    console.log('\n🎉 Test data created successfully!');
    console.log('Login with:');
    console.log('Email: test@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating test donations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createTestDonations();
