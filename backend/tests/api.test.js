const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('API Health Check', () => {
  test('GET /api/health should return 200', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(res.body.status).toBe('OK');
    expect(res.body.message).toBe('ImpactHub API is running');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Campaign Endpoints', () => {
  test('GET /api/campaigns should return campaigns list', async () => {
    const res = await request(app)
      .get('/api/campaigns')
      .expect(200);
    
    expect(res.body.campaigns).toBeDefined();
    expect(res.body.pagination).toBeDefined();
    expect(Array.isArray(res.body.campaigns)).toBe(true);
  });

  test('GET /api/campaigns/categories should return categories', async () => {
    const res = await request(app)
      .get('/api/campaigns/categories')
      .expect(200);
    
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

// Close database connection after tests
afterAll(async () => {
  await mongoose.connection.close();
});
