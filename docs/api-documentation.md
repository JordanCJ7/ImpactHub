# ImpactHub API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints are public for MVP. User authentication is optional for donation tracking.

### Headers
```
Content-Type: application/json
Authorization: Bearer <token> (optional)
```

## Endpoints

### Health Check
```http
GET /health
```
Returns API status and timestamp.

### Campaigns

#### Get All Campaigns
```http
GET /campaigns
```
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category
- `sort` (string): Sort by 'progress', 'target', 'ending-soon', 'newest'

**Response:**
```json
{
  "campaigns": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCampaigns": 24,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Search Campaigns
```http
GET /campaigns/search?q=education&category=education
```
**Query Parameters:**
- `q` (string): Search query
- `category` (string): Filter by category
- `minAmount` (number): Minimum target amount
- `maxAmount` (number): Maximum target amount

#### Get Campaign Categories
```http
GET /campaigns/categories
```
Returns list of campaign categories with counts.

#### Get Featured Campaigns
```http
GET /campaigns/featured?limit=6
```
Returns campaigns with high donation activity.

#### Get Single Campaign
```http
GET /campaigns/:id
```
Returns detailed campaign information including virtual fields.

#### Get Campaign Donations
```http
GET /campaigns/:id/donations
```
Returns recent donations for a campaign (anonymized).

#### Get Impact Reports
```http
GET /campaigns/:id/impact-reports
```
Returns impact reports for a campaign.

#### Increment Share Count
```http
POST /campaigns/:id/share
```
Increments social media share counter.

### Donations

#### Create Payment Intent
```http
POST /donations/create-payment-intent
```
**Body:**
```json
{
  "campaignId": "campaign_id",
  "amount": 50,
  "currency": "USD",
  "donorEmail": "donor@example.com",
  "donorName": "John Doe",
  "message": "Keep up the great work!",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "clientSecret": "pi_stripe_client_secret",
  "donationId": "donation_id"
}
```

#### Confirm Donation
```http
POST /donations/confirm
```
**Body:**
```json
{
  "paymentIntentId": "pi_stripe_payment_intent_id"
}
```

#### Get Donation History
```http
GET /donations/history/:email
```
Returns donation history for a user with pagination and stats.

#### Stripe Webhook
```http
POST /donations/webhook
```
Handles Stripe payment status updates.

### Users

#### Register
```http
POST /users/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /users/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth
```http
POST /users/google-auth
```
**Body:**
```json
{
  "googleId": "google_user_id",
  "email": "john@gmail.com",
  "name": "John Doe",
  "avatar": "avatar_url"
}
```

#### Get User Profile
```http
GET /users/profile/:email
```

#### Update User Profile
```http
PUT /users/profile/:email
```
**Body:**
```json
{
  "name": "John Updated",
  "preferences": {
    "emailNotifications": true,
    "currency": "USD",
    "preferredCategories": ["education", "health"]
  }
}
```

## Data Models

### Campaign
```json
{
  "_id": "ObjectId",
  "title": "String (required, max 100)",
  "description": "String (required, max 2000)",
  "shortDescription": "String (required, max 200)",
  "targetAmount": "Number (required, min 1)",
  "currentAmount": "Number (default 0)",
  "currency": "String (default USD)",
  "category": "String (enum)",
  "organizationName": "String (required)",
  "organizationEmail": "String (required)",
  "imageUrl": "String",
  "status": "String (enum: active, completed, suspended)",
  "startDate": "Date",
  "endDate": "Date (required)",
  "donationCount": "Number (default 0)",
  "socialShares": "Number (default 0)",
  "impactReports": "Array",
  "progressPercentage": "Virtual field",
  "daysRemaining": "Virtual field"
}
```

### Donation
```json
{
  "_id": "ObjectId",
  "campaignId": "ObjectId (ref Campaign)",
  "donorEmail": "String (required)",
  "donorName": "String (required)",
  "amount": "Number (required, min 1)",
  "currency": "String (default USD)",
  "paymentMethod": "String (default stripe)",
  "paymentIntentId": "String (required)",
  "status": "String (enum: pending, completed, failed, refunded)",
  "isAnonymous": "Boolean (default false)",
  "message": "String (max 500)",
  "receiptEmail": "String",
  "metadata": "Object"
}
```

### User
```json
{
  "_id": "ObjectId",
  "name": "String (required, max 50)",
  "email": "String (required, unique)",
  "password": "String (hashed)",
  "googleId": "String (unique, sparse)",
  "avatar": "String",
  "role": "String (enum: donor, organization, admin)",
  "isEmailVerified": "Boolean (default false)",
  "preferences": {
    "emailNotifications": "Boolean",
    "currency": "String",
    "preferredCategories": "Array"
  },
  "donationStats": {
    "totalDonated": "Number",
    "donationCount": "Number",
    "favoriteCauses": "Array"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error in development"
}
```

## Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes  
- Payment endpoints: 10 requests per minute

## Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/impacthub
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:3000
```
