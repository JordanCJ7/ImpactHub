import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public
import Home from './pages/publicc/Home';
import CampaignList from './pages/publicc/CampaignList';
import DonationConfirmation from './pages/publicc/DonationConfirmation';
import CampaignDetails from './pages/publicc/CampaignDetails';
import Donate from './pages/publicc/Donate';
import DonationSuccess from './pages/publicc/DonationSuccess';
import DonationCancel from './pages/publicc/DonationCancel';
import MockPayment from './pages/publicc/MockPayment';
import About from './pages/publicc/About';
import Contact from './pages/publicc/Contact';
import Help from './pages/publicc/Help';
import TermsOfService from './pages/publicc/TermsOfService';

// Donor Pages
import DonorProfile from './pages/donor/DonorProfile';
import DonorDashboard from './pages/donor/DonorDashboard';
import DonationHistory from './pages/donor/DonationHistory'; 
import DonorNotifications from './pages/donor/DonorNotifications'
import DonorLeaderboard from './pages/donor/DonorLeaderboard'

// Campaign Leader Pages
import LeaderDashboard from './pages/leader/LeaderDashboard';
import LeaderProfile from './pages/leader/LeaderProfile';
import CreateCampaign from './pages/leader/CreateCampaign';
import LeaderDrafts from './pages/leader/LeaderDrafts';
import MyCampaigns from './pages/leader/MyCampaigns';
import EditCampaign from './pages/leader/EditCampaign';
import LeaderNotifications from './pages/leader/LeaderNotifications'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminCampaignManagement from './pages/admin/AdminCampaignManagement';
import AdminProfile from './pages/admin/AdminProfile';
import LeaderAnalytics from './pages/leader/LeaderAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminDonations from './pages/admin/AdminDonations';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Development/Testing Pages
import IntegrationTest from '@/pages/IntegrationTest';

import NotFound from './pages/NotFound';
import Impact from './pages/Impact';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import RootRedirect from './components/auth/RootRedirect';


// Layout wrapper
const Layout = ({ children }) => {
  const location = useLocation();
  // Paths where navbar and footer should be hidden
  const hideLayout = ["/login", "/register"];
  const shouldHide = hideLayout.includes(location.pathname);
  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHide && <Navbar />}
      <main className="flex-1">{children}</main>
      {!shouldHide && <Footer />}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/donation-confirmation/:id" element={<DonationConfirmation />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/donate/:id" element={<Donate />} />
            <Route path="/payment/:sessionId" element={<MockPayment />} />
            <Route path="/donation-success" element={<DonationSuccess />} />
            <Route path="/donation-cancel" element={<DonationCancel />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/policies" element={<TermsOfService />} />

            {/* Donor Routes */}
            <Route path="/donor/profile" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorProfile />
              </ProtectedRoute>
            } />
            <Route path="/donor/dashboard" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/donor/notifications" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorNotifications/>
              </ProtectedRoute>
            } />
            <Route path="/donor/history" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonationHistory />
              </ProtectedRoute>
            } />
            <Route path="/donor/leaderboard" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorLeaderboard />
              </ProtectedRoute>
            } />

             {/* Campaign Leader Routes */}
                <Route path="/leader/dashboard" element={
                  <ProtectedRoute allowedRoles={['campaign-leader']}>
                    <LeaderDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/leader" element={
                  <ProtectedRoute allowedRoles={['campaign-leader']}>
                    <LeaderDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/leader/profile" element={
                  <ProtectedRoute allowedRoles={['campaign-leader']}>
                    <LeaderProfile />
                  </ProtectedRoute>
                } />
                <Route path="/leader/campaigns" element={
                  <ProtectedRoute allowedRoles={['campaign-leader']}>
                    <MyCampaigns />
                  </ProtectedRoute>
                } />
                  <Route path="/leader/drafts" element={
                    <ProtectedRoute allowedRoles={['campaign-leader']}>
                      <LeaderDrafts />
                    </ProtectedRoute>
                  } />
                   <Route path="/leader/analytics" element={
                    <ProtectedRoute allowedRoles={['campaign-leader']}>
                      <LeaderAnalytics />
                    </ProtectedRoute>
                  } />
                 <Route path="/leader/create" element={
                   <ProtectedRoute allowedRoles={['campaign-leader']}>
                     <CreateCampaign />
                   </ProtectedRoute>
                 } />
                 <Route path="/leader/edit/:id" element={
                   <ProtectedRoute allowedRoles={['campaign-leader']}>
                     <EditCampaign />
                   </ProtectedRoute>
                 } />
                  <Route path="/leader/notifications" element={
                   <ProtectedRoute allowedRoles={['campaign-leader']}>
                     <LeaderNotifications/>
                   </ProtectedRoute>
                 } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/campaigns" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCampaignManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminNotifications />
              </ProtectedRoute>
            } />
            <Route path="/admin/donations" element={
              <ProtectedRoute allowedRoles={['admin']}>
                < AdminDonations />
              </ProtectedRoute>
            } />

             <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                < AdminAnalytics />
              </ProtectedRoute>
            } />


            {/* General Authenticated Routes */}
            <Route path="/donor/notifications" element={
              <ProtectedRoute allowedRoles={['donor', 'campaign-leader', 'admin']}>
                <div>Notifications - Coming Soon</div>
              </ProtectedRoute>
            } />

            {/* Development/Testing Routes */}
            <Route path="/test" element={<IntegrationTest />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
             <Route path="/impact" element={<Impact />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
