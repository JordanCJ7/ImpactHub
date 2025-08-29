
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

// Donor Pages
import DonorProfile from './pages/donor/DonorProfile';
import DonorDashboard from './pages/donor/DonorDashboard';
import DonationHistory from './pages/donor/DonationHistory'; 

// Campaign Leader Pages
import LeaderDashboard from './pages/leader/LeaderDashboard';
import CreateCampaign from './pages/leader/CreateCampaign';

// Development/Testing Pages
import IntegrationTest from '@/pages/IntegrationTest';

import NotFound from './pages/NotFound';

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
            <Route path="/donor/history" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonationHistory />
              </ProtectedRoute>
            } />

             {/* Campaign Leader Routes */}
                <Route path="/leader/dashboard" element={
                  <ProtectedRoute allowedRoles={['campaign-leader']}>
                    <LeaderDashboard />
                  </ProtectedRoute>
                } />
                 <Route path="/leader/create" element={
                   <ProtectedRoute allowedRoles={['campaign-leader']}>
                     <CreateCampaign />
                   </ProtectedRoute>
                 } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Dashboard - Coming Soon</div>
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
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
