const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
const User = require('./models/User');
require('dotenv').config();

const createTestCampaigns = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/impacthub');
    console.log('Connected to MongoDB');

    // Check if we have at least one user to assign as creator
    let creator = await User.findOne();
    if (!creator) {
      // Create a test user if none exists
      creator = await User.create({
        name: 'Test Campaign Leader',
        email: 'leader@example.com',
        password: 'password123',
        role: 'campaign_leader',
        isEmailVerified: true
      });
      console.log('Created test user');
    }

    // Delete existing campaigns for fresh start
    await Campaign.deleteMany({});
    console.log('Cleared existing campaigns');

    // Create test campaigns with correct schema
    const campaigns = await Campaign.create([
      {
        title: 'Clean Water for Rural Communities',
        description: 'Providing clean drinking water access to 10,000 people in remote villages through well construction and water purification systems. This project will dramatically improve health outcomes and reduce water-borne diseases.',
        shortDescription: 'Clean water access for 10,000 people in remote villages',
        goal: 100000,
        raised: 75420,
        category: 'Health & Medical',
        creator: creator._id,
        organizationName: 'Clean Water Initiative',
        organizationEmail: 'info@cleanwater.org',
        location: 'Thanamalvila, Monaragala',
        beneficiaries: 'Rural communities in drought-affected areas',
        images: [
          {
            url: '/images/CleanWater.jpg',
            caption: 'Well construction in progress',
            isPrimary: true
          }
        ],
        endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
        status: 'active',
        featured: true,
        urgent: false
      },
      {
        title: 'Education for Every Child',
        description: 'Building schools and providing educational resources for underprivileged children in rural areas. Our mission is to ensure every child has access to quality education regardless of their economic background.',
        shortDescription: 'Building schools for underprivileged children',
        goal: 75000,
        raised: 42350,
        category: 'Education',
        creator: creator._id,
        organizationName: 'Education First Foundation',
        organizationEmail: 'contact@educationfirst.org',
        location: 'Ambalangoda',
        beneficiaries: 'Children aged 5-18 in rural communities',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
            caption: 'Children learning in temporary classroom',
            isPrimary: true
          }
        ],
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: 'active',
        featured: false,
        urgent: false
      },
      {
        title: 'Emergency Food Relief',
        description: 'Providing emergency food supplies to families affected by natural disasters and economic hardship. Time-sensitive relief efforts to prevent malnutrition and starvation in affected communities.',
        shortDescription: 'Emergency food supplies for disaster-affected families',
        goal: 50000,
        raised: 28900,
        category: 'Emergency Relief',
        creator: creator._id,
        organizationName: 'Relief Network',
        organizationEmail: 'emergency@relief.org',
        location: 'Yapanaya',
        beneficiaries: 'Families affected by recent flooding',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop',
            caption: 'Food distribution in progress',
            isPrimary: true
          }
        ],
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        status: 'active',
        featured: false,
        urgent: true
      },
      {
        title: 'Save the Rainforest',
        description: 'Protecting endangered rainforest ecosystems and supporting local conservation efforts. Our project focuses on reforestation, wildlife protection, and sustainable community development.',
        shortDescription: 'Protecting endangered rainforest ecosystems',
        goal: 120000,
        raised: 89250,
        category: 'Environment',
        creator: creator._id,
        organizationName: 'Forest Conservation Alliance',
        organizationEmail: 'info@forestalliance.org',
        location: 'Anuradhapura',
        beneficiaries: 'Local wildlife and forest-dependent communities',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop',
            caption: 'Protected forest area',
            isPrimary: true
          }
        ],
        endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000), // 67 days from now
        status: 'active',
        featured: true,
        urgent: false
      },
      {
        title: 'Animal Shelter Support',
        description: 'Supporting local animal shelters with food, medical care, and facility improvements. Help us provide a safe haven for abandoned and injured animals while they await their forever homes.',
        shortDescription: 'Support for local animal shelters',
        goal: 30000,
        raised: 15680,
        category: 'Animals & Wildlife',
        creator: creator._id,
        organizationName: 'Animal Welfare Society',
        organizationEmail: 'help@animalwelfare.org',
        location: 'Ratnapura',
        beneficiaries: 'Abandoned and injured animals',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=250&fit=crop',
            caption: 'Animals receiving care at the shelter',
            isPrimary: true
          }
        ],
        endDate: new Date(Date.now() + 89 * 24 * 60 * 60 * 1000), // 89 days from now
        status: 'active',
        featured: false,
        urgent: false
      },
      {
        title: 'Community Health Clinic',
        description: 'Establishing a community health clinic to provide basic healthcare services in underserved areas. The clinic will offer preventive care, basic treatments, and health education programs.',
        shortDescription: 'Healthcare clinic for underserved communities',
        goal: 95000,
        raised: 67890,
        category: 'Health & Medical',
        creator: creator._id,
        organizationName: 'Community Health Initiative',
        organizationEmail: 'clinic@healthinit.org',
        location: 'Polonnaruwa',
        beneficiaries: 'Residents of underserved rural areas',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
            caption: 'Mobile health clinic in action',
            isPrimary: true
          }
        ],
        endDate: new Date(Date.now() + 34 * 24 * 60 * 60 * 1000), // 34 days from now
        status: 'active',
        featured: false,
        urgent: false
      }
    ]);

    console.log(`✅ Successfully created ${campaigns.length} test campaigns`);
    console.log('Campaigns created with the following titles:');
    campaigns.forEach(campaign => {
      console.log(`- ${campaign.title} (${campaign.category})`);
    });

  } catch (error) {
    console.error('❌ Error creating test campaigns:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

createTestCampaigns();
