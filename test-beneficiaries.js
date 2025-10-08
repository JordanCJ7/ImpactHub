const fetch = require('node-fetch');

// Test campaign creation to debug beneficiaries issue
const testCampaignCreation = async () => {
  const campaignData = {
    title: 'Test Campaign Beneficiaries',
    description: 'This is a test campaign to debug beneficiaries object structure. Testing if the object is properly sent and received by the backend.',
    shortDescription: 'Test campaign for debugging purposes',
    story: 'This is a test story for debugging the beneficiaries object issue.',
    goal: 10000,
    category: 'Health & Medical',
    endDate: '2025-12-31T00:00:00.000Z',
    location: {
      country: 'Test Country',
      state: 'Test State', 
      city: 'Test City'
    },
    beneficiaries: {
      count: 100,
      description: 'Test beneficiaries description'
    },
    organizationName: 'Test Organization',
    organizationEmail: 'test@example.com',
    timeline: 'Test timeline',
    budget: 'Test budget',
    risks: 'Test risks',
    features: {
      allowAnonymousDonations: true,
      allowRecurringDonations: false,
      sendUpdatesToDonors: true,
      allowComments: true
    },
    seo: {
      metaTitle: 'Test Campaign',
      metaDescription: 'Test description',
      keywords: ['test']
    }
  };

  console.log('Sending campaign data:');
  console.log('beneficiaries:', JSON.stringify(campaignData.beneficiaries, null, 2));

  try {
    const response = await fetch('http://localhost:5000/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add a valid JWT token here
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      },
      body: JSON.stringify(campaignData)
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

testCampaignCreation();