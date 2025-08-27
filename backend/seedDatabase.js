const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
const User = require('./models/User');
const Donation = require('./models/Donation');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/impacthub');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Campaign.deleteMany({}),
      User.deleteMany({}),
      Donation.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        name: 'John Donor',
        email: 'john@example.com',
        password: 'password123',
        isEmailVerified: true,
        preferences: {
          currency: 'USD',
          preferredCategories: ['education', 'health']
        }
      },
      {
        name: 'Sarah Philanthropist',
        email: 'sarah@example.com',
        password: 'password123',
        isEmailVerified: true,
        preferences: {
          currency: 'USD',
          preferredCategories: ['environment', 'poverty']
        }
      }
    ]);
    console.log('Created sample users');

    // Create sample campaigns
    const campaigns = await Campaign.create([
      {
        title: 'Build Schools in Rural Kenya',
        description: 'Help us build sustainable schools in rural Kenya to provide quality education to over 500 children. Our project includes construction of classrooms, providing desks, books, and training local teachers. The impact of education in these communities will last for generations, breaking the cycle of poverty and creating opportunities for a brighter future.',
        shortDescription: 'Building schools to educate 500+ children in rural Kenya',
        targetAmount: 50000,
        currentAmount: 15750,
        category: 'education',
        organizationName: 'Education for All Kenya',
        organizationEmail: 'contact@educationkenya.org',
        imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800',
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        donationCount: 23,
        socialShares: 45,
        impactReports: [
          {
            title: 'Project Kickoff',
            description: 'Land has been secured and local permits obtained. Construction begins next month.',
            reportDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: 'Clean Water Wells for Villages',
        description: 'Provide clean, safe drinking water to 10 villages in drought-affected regions. Each well will serve approximately 200 people and includes maintenance training for local communities. Clean water access reduces disease, improves health outcomes, and allows children to attend school instead of walking hours to fetch water.',
        shortDescription: 'Clean water access for 2,000 people in drought-affected areas',
        targetAmount: 25000,
        currentAmount: 8900,
        category: 'health',
        organizationName: 'Wells of Hope',
        organizationEmail: 'info@wellsofhope.org',
        imageUrl: 'https://images.unsplash.com/photo-1541844053589-346841d0b34c?w=800',
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        donationCount: 34,
        socialShares: 67
      },
      {
        title: 'Reforestation Project Amazon',
        description: 'Plant 10,000 trees in deforested areas of the Amazon rainforest. This project works with indigenous communities to restore biodiversity, combat climate change, and preserve crucial wildlife habitats. Each tree planted represents hope for our planet\'s future and helps offset carbon emissions.',
        shortDescription: 'Plant 10,000 trees to restore Amazon rainforest',
        targetAmount: 15000,
        currentAmount: 12300,
        category: 'environment',
        organizationName: 'Amazon Conservation Alliance',
        organizationEmail: 'contact@amazonconservation.org',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        donationCount: 89,
        socialShares: 123,
        impactReports: [
          {
            title: 'First 1,000 Trees Planted',
            description: 'Successfully planted our first 1,000 trees with local community volunteers.',
            reportDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: 'Emergency Food Relief',
        description: 'Provide emergency food assistance to families affected by recent natural disasters. Our relief packages include nutritious meals for one week, clean water, and basic medical supplies. Time is critical - families need immediate support to survive this crisis.',
        shortDescription: 'Emergency food relief for disaster-affected families',
        targetAmount: 75000,
        currentAmount: 42500,
        category: 'disaster-relief',
        organizationName: 'Global Relief Network',
        organizationEmail: 'emergency@globalrelief.org',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        donationCount: 156,
        socialShares: 234
      },
      {
        title: 'Mobile Medical Clinic',
        description: 'Fund a mobile medical clinic to serve remote communities without access to healthcare. The clinic will provide basic medical care, vaccinations, and health education to over 1,000 people monthly. Healthcare is a basic human right, and this clinic brings hope to underserved populations.',
        shortDescription: 'Mobile healthcare for 1,000+ people in remote areas',
        targetAmount: 35000,
        currentAmount: 18750,
        category: 'health',
        organizationName: 'Mobile Health Initiative',
        organizationEmail: 'info@mobilehealth.org',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
        endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
        donationCount: 67,
        socialShares: 89
      },
      {
        title: 'Homeless Shelter Renovation',
        description: 'Renovate and expand our homeless shelter to accommodate 50 more individuals during winter months. The renovation includes heating upgrades, new beds, kitchen expansion, and creating private family spaces. Every person deserves a warm, safe place to stay.',
        shortDescription: 'Shelter renovation to house 50 more homeless individuals',
        targetAmount: 28000,
        currentAmount: 19600,
        category: 'poverty',
        organizationName: 'Safe Haven Shelter',
        organizationEmail: 'support@safehavenshelter.org',
        imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
        endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
        donationCount: 78,
        socialShares: 56
      }
    ]);
    console.log('Created sample campaigns');

    // Create sample donations
    const donations = [];
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      const donationCount = Math.floor(Math.random() * 20) + 10; // 10-30 donations per campaign
      
      for (let j = 0; j < donationCount; j++) {
        const amount = Math.floor(Math.random() * 500) + 25; // $25-$525
        const user = users[Math.floor(Math.random() * users.length)];
        
        donations.push({
          campaignId: campaign._id,
          donorEmail: j % 3 === 0 ? user.email : `donor${i}${j}@example.com`,
          donorName: j % 3 === 0 ? user.name : `Donor ${i}${j}`,
          amount: amount,
          currency: 'USD',
          paymentIntentId: `pi_test_${Date.now()}_${i}_${j}`,
          status: 'completed',
          isAnonymous: Math.random() > 0.7, // 30% anonymous
          message: j % 4 === 0 ? 'Keep up the great work!' : undefined,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    await Donation.create(donations);
    console.log('Created sample donations');

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${users.length} users, ${campaigns.length} campaigns, and ${donations.length} donations`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
