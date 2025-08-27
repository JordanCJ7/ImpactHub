# ImpactHub Backend

Node.js + Express API for the ImpactHub MVP - Sprint 1 Implementation

## Setup (Sprint 0)
- Express app (to be initialized in Sprint 1)
- MongoDB for data storage
- To be initialized in Sprint 1

## Features Implemented (Sprint 1)

### Core Features (Must Have)
✅ **Browse Campaigns**: Full campaign browsing with filtering, search, pagination  
✅ **Secure Donations**: Stripe integration for secure one-time payments  
✅ **Donation History**: Track personal donation history by email  
✅ **Impact Reports**: View charity impact reports and updates  
✅ **Social Sharing**: Campaign sharing with share count tracking  

### Additional Features (Should Have)
✅ **User Authentication**: Register/login with JWT + Google OAuth support  
✅ **User Profiles**: Donation tracking and preferences  

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt, Google OAuth ready
- **Payments**: Stripe payment processing
- **Validation**: express-validator
- **Security**: CORS, rate limiting

## Project Structure

```
backend/
├── controllers/          # Business logic
│   ├── campaignController.js
│   ├── donationController.js
│   └── userController.js
├── models/              # Database schemas
│   ├── Campaign.js
│   ├── Donation.js
│   └── User.js
├── routes/              # API endpoints
│   ├── campaigns.js
│   ├── donations.js
│   └── users.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── rateLimiter.js
├── utils/               # Helper functions
│   └── helpers.js
├── tests/               # Test files (TBD)
├── server.js            # Main application file
├── package.json         # Dependencies
├── seedDatabase.js      # Development data seeder
└── .env.example         # Environment template
```

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/impacthub
JWT_SECRET=your_secure_random_string
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:3000
```

### 3. Database Setup
Make sure MongoDB is running, then seed with sample data:
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

API will be available at: `http://localhost:5000/api`

## Available Scripts

- `npm start` - Production server
- `npm run dev` - Development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests (TBD Sprint 2)

## API Endpoints

### Health Check
- `GET /api/health` - API status

### Campaigns
- `GET /api/campaigns` - List campaigns (with filtering/pagination)
- `GET /api/campaigns/search` - Search campaigns
- `GET /api/campaigns/categories` - Get categories with counts
- `GET /api/campaigns/featured` - Get featured campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `GET /api/campaigns/:id/donations` - Get campaign donations
- `GET /api/campaigns/:id/impact-reports` - Get impact reports
- `POST /api/campaigns/:id/share` - Increment share count

### Donations
- `POST /api/donations/create-payment-intent` - Create Stripe payment
- `POST /api/donations/confirm` - Confirm successful payment
- `GET /api/donations/history/:email` - Get user donation history
- `POST /api/donations/webhook` - Stripe webhook handler

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/google-auth` - Google OAuth
- `GET /api/users/profile/:email` - Get user profile
- `PUT /api/users/profile/:email` - Update user profile

## Database Models

### Campaign
- Title, description, target/current amounts
- Organization details, category, status
- Donation count, social shares
- Virtual fields: progress percentage, days remaining

### Donation
- Campaign reference, donor details
- Amount, currency, payment method
- Stripe payment intent ID, status
- Anonymous option, optional message

### User
- Name, email, password (hashed)
- Google OAuth support
- Preferences and donation statistics
- Role-based access (donor/organization/admin)

## Security Features

- JWT authentication with configurable expiration
- Password hashing with bcrypt
- Rate limiting (general, auth, payments)
- Input validation and sanitization
- CORS protection
- Environment-based configuration

## Payment Processing

- Stripe integration for secure payments
- Payment intent creation and confirmation flow
- Webhook handling for payment status updates
- Automatic campaign amount updates
- User donation statistics tracking

## Development Data

Run `npm run seed` to populate the database with:
- 6 sample campaigns across different categories
- 2 sample users with different preferences
- Multiple donations per campaign with realistic data
- Impact reports for some campaigns

## Next Steps (Sprint 2)

### Backend Enhancements
- [ ] Admin dashboard API endpoints
- [ ] Email notification system
- [ ] PayPal payment integration
- [ ] Advanced analytics endpoints
- [ ] Image upload handling
- [ ] Campaign creation/management API
- [ ] Comprehensive test suite

### Performance & Security
- [ ] API response caching
- [ ] Database query optimization
- [ ] Enhanced rate limiting
- [ ] API key authentication for admin features
- [ ] Audit logging
