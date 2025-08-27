# ImpactHub Frontend

React.js frontend for the ImpactHub charitable donation platform.

## Setup (Sprint 0)
- Will use Create React App or Vite (to be decided in Sprint 0)
- Material-UI for UI components
- To be initialized in Sprint 1

## Sprint 1 Requirements (MVP Core Features)

### 🎯 Sprint 1 Goals
Implement core user-facing features that enable users to browse campaigns and make donations.

### ✅ Must-Have Features (Sprint 1)

#### 1. Campaign Browsing System
**Components to Build:**
- `CampaignGrid` - Responsive grid layout for campaign cards
- `CampaignCard` - Individual campaign preview with image, title, progress bar, target amount
- `CategoryFilter` - Filter campaigns by category (Education, Health, Environment, etc.)
- `SearchBar` - Real-time search functionality
- `SortDropdown` - Sort by progress, target amount, ending soon, newest
- `Pagination` - Navigate through campaign pages

**API Integration:**
```javascript
// Key endpoints to integrate
GET /api/campaigns - List campaigns with filtering
GET /api/campaigns/search - Search campaigns
GET /api/campaigns/categories - Get available categories
GET /api/campaigns/featured - Featured campaigns
```

#### 2. Campaign Details Page
**Components to Build:**
- `CampaignDetails` - Full campaign information display
- `ProgressBar` - Visual progress indicator with animations
- `DonationForm` - Multi-step donation process
- `RecentDonations` - List of recent donors (anonymized)
- `ImpactReports` - Campaign updates and reports
- `SocialShare` - Share buttons for social media
- `CampaignStats` - Days remaining, donation count, progress percentage

**Features:**
- Responsive image gallery
- Progress visualization with animations
- Social sharing integration
- Mobile-optimized layout

#### 3. Secure Donation Flow
**Components to Build:**
- `DonationWizard` - Multi-step donation process
  - Step 1: Amount selection with preset options
  - Step 2: Donor information form
  - Step 3: Payment with Stripe integration
  - Step 4: Confirmation and receipt
- `PaymentForm` - Stripe Elements integration
- `DonationConfirmation` - Success page with donation details
- `AmountSelector` - Preset amounts + custom input

**Payment Integration:**
```javascript
// Stripe integration requirements
- Stripe React SDK integration
- Secure card input with Stripe Elements
- Payment intent creation and confirmation
- Error handling for failed payments
- Loading states during processing
```

#### 4. User Authentication (Optional but Recommended)
**Components to Build:**
- `LoginForm` - Email/password login
- `RegisterForm` - User registration
- `GoogleAuthButton` - Google OAuth integration
- `UserProfile` - View/edit user preferences
- `DonationHistory` - Personal donation tracking

#### 5. Core Layout & Navigation
**Components to Build:**
- `Header` - Navigation with responsive menu
- `Footer` - Links, contact info, social media
- `Layout` - Common page structure
- `LoadingSpinner` - Loading states
- `ErrorBoundary` - Error handling
- `NotFound` - 404 page

### 🛠 Technical Stack (Sprint 1)

#### Core Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (recommended) or Create React App
- **Styling**: Tailwind CSS + Headless UI or Material-UI v5
- **State Management**: React Context API + useReducer
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router v6

#### Payment Integration
- **Stripe**: @stripe/stripe-js + @stripe/react-stripe-js
- **Payment Flow**: Payment Intents API

#### Development Tools
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **Dev Server**: Vite dev server with HMR

### 📁 Recommended Project Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/          # Shared components
│   │   ├── campaigns/       # Campaign-related components
│   │   ├── donations/       # Donation flow components
│   │   ├── auth/           # Authentication components
│   │   └── layout/         # Layout components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── utils/              # Helper functions
│   ├── types/              # TypeScript types
│   ├── context/            # React Context providers
│   └── assets/             # Images, icons, etc.
├── package.json
└── README.md
```

### 🔌 API Integration Points
```javascript
// Campaign endpoints
const campaignAPI = {
  getAllCampaigns: (params) => axios.get('/api/campaigns', { params }),
  getCampaign: (id) => axios.get(`/api/campaigns/${id}`),
  searchCampaigns: (query) => axios.get('/api/campaigns/search', { params: query }),
  getCategories: () => axios.get('/api/campaigns/categories'),
  getFeatured: () => axios.get('/api/campaigns/featured'),
};

// Donation endpoints
const donationAPI = {
  createPaymentIntent: (data) => axios.post('/api/donations/create-payment-intent', data),
  confirmDonation: (data) => axios.post('/api/donations/confirm', data),
  getDonationHistory: (email) => axios.get(`/api/donations/history/${email}`),
};
```

### 📱 Responsive Design Requirements
- **Mobile First**: Design for mobile screens first
- **Breakpoints**: 
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+
- **Touch Friendly**: Minimum 44px touch targets
- **Performance**: Lazy loading for images and components

### ⚡ Performance Targets (Sprint 1)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Bundle Size**: < 500KB initial load
- **Image Optimization**: WebP format with fallbacks

---

## Sprint 2 Requirements (Enhanced Features)

### 🎯 Sprint 2 Goals
Enhance user experience with advanced features, admin capabilities, and improved performance.

### ✅ Enhanced Features (Sprint 2)

#### 1. Advanced User Dashboard
**Components to Build:**
- `UserDashboard` - Personal donation overview
- `DonationAnalytics` - Charts showing donation patterns
- `FavoriteCampaigns` - Saved/bookmarked campaigns
- `DonationCertificates` - Downloadable donation receipts
- `UserPreferences` - Notification settings, preferred categories
- `ProfileSettings` - Avatar upload, personal information

#### 2. Campaign Management (Admin Features)
**Components to Build:**
- `AdminDashboard` - Admin overview with metrics
- `CampaignCreator` - Multi-step campaign creation form
- `CampaignEditor` - Edit existing campaigns
- `MediaUploader` - Image/video upload with preview
- `ImpactReportEditor` - Create and edit impact reports
- `CampaignAnalytics` - Detailed campaign performance metrics
- `UserManagement` - Manage users and organizations

#### 3. Enhanced Search & Discovery
**Components to Build:**
- `AdvancedFilters` - Location, amount range, organization type
- `MapView` - Geographic campaign visualization
- `RecommendationEngine` - Personalized campaign suggestions
- `TrendingCampaigns` - Popular and trending campaigns
- `SavedSearches` - Save and manage search queries

#### 4. Social Features
**Components to Build:**
- `CampaignComments` - User comments and updates
- `DonorWall` - Public donor recognition (optional)
- `ShareTracking` - Track social media engagement
- `CommunityFeed` - Updates from followed campaigns
- `LeaderBoard` - Top donors and most active campaigns

#### 5. Advanced Payment Features
**Components to Build:**
- `PayPalIntegration` - Alternative payment method
- `RecurringDonations` - Monthly/yearly donation setup
- `DonationGoals` - Personal donation targets
- `CorporateDonations` - Business donation features
- `TaxReceipts` - Automated tax documentation

#### 6. Performance & Analytics
**Components to Build:**
- `AnalyticsDashboard` - Comprehensive analytics
- `PerformanceMonitor` - Real-time performance tracking
- `A/B Testing` - Component variant testing
- `ErrorTracking` - Advanced error reporting
- `UserBehaviorTracking` - User interaction analytics

### 🛠 Enhanced Technical Stack (Sprint 2)

#### Advanced State Management
- **Global State**: Redux Toolkit or Zustand
- **Server State**: React Query (TanStack Query)
- **Form State**: React Hook Form with complex validation

#### Advanced UI/UX
- **Animations**: Framer Motion or React Spring
- **Charts**: Chart.js or Recharts
- **Maps**: Mapbox GL JS or Google Maps
- **Rich Text**: Quill.js or Draft.js

#### Performance Optimization
- **Code Splitting**: React.lazy + Suspense
- **Image Optimization**: Next.js Image or custom solution
- **PWA Features**: Service workers, offline support
- **Bundle Analysis**: webpack-bundle-analyzer

#### Testing & Quality
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress or Playwright
- **Visual Testing**: Storybook
- **Performance Testing**: Lighthouse CI

### 📊 Advanced Features Breakdown

#### Real-time Features
- Live donation updates using WebSockets
- Real-time campaign progress updates
- Live chat support integration
- Push notifications for important updates

#### Accessibility Improvements
- WCAG 2.1 AA compliance
- Screen reader optimization
- Keyboard navigation support
- High contrast mode

#### Internationalization
- Multi-language support
- Currency localization
- Date/time formatting
- RTL language support

### 🚀 Performance Targets (Sprint 2)
- **First Contentful Paint**: < 1.0s
- **Time to Interactive**: < 3.0s
- **Bundle Size**: < 300KB initial (with code splitting)
- **Lighthouse Score**: > 90 for all metrics

### 📋 Sprint 2 Priority Order
1. **High Priority**: User dashboard, admin features, advanced search
2. **Medium Priority**: Social features, PayPal integration, analytics
3. **Low Priority**: A/B testing, advanced animations, PWA features

### 🔧 Development Workflow
- **Feature Branches**: One branch per feature
- **Code Reviews**: Required for all PRs
- **Testing**: Unit tests required for all components
- **Documentation**: Storybook stories for all UI components
- **Performance**: Bundle analysis on each build
