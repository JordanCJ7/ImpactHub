const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test campaign creation
async function testCampaignCreation() {
  try {
    console.log('Testing campaign creation...');

    // First, login to get token
    console.log('Logging in...');
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginResponse = await makeRequest(loginOptions, {
      email: 'test@example.com',
      password: 'password123'
    });

    if (loginResponse.statusCode !== 200) {
      console.error('Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('Login successful, token received');

    // Now create a campaign
    console.log('Creating campaign...');
    const campaignData = {
      title: 'Test Campaign for Clean Water',
      description: 'This is a test campaign to provide clean water to rural communities in Sri Lanka.',
      story: 'Our organization has been working with rural communities to provide clean water solutions...',
      goal: '50000', // Send as string
      category: 'Health & Medical',
      endDate: '2025-12-31T00:00:00.000Z',
      location: {
        country: 'Sri Lanka',
        state: 'Central Province',
        city: 'Kandy'
      },
      beneficiaries: {
        description: '500 families in rural areas'
      },
      images: []
    };

    const createOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/campaigns',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const createResponse = await makeRequest(createOptions, campaignData);

    console.log('Response status:', createResponse.statusCode);
    console.log('Response data:', createResponse.data);

    if (createResponse.statusCode === 201) {
      console.log('Campaign created successfully!');
    } else {
      console.error('Campaign creation failed');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCampaignCreation();
