import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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


// Donor Pages
import DonorProfile from './pages/donor/DonorProfile';

const App = () => (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                
                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/campaigns" element={<CampaignList />} />

                 <Route path="/donation-confirmation/:id" element={<DonationConfirmation />} />
                <Route path="/campaigns/:id" element={<CampaignDetails />} />

                {/* Donor Routes */}
                <Route path="/donor/profile" element={<DonorProfile />} />

              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
);

export default App;