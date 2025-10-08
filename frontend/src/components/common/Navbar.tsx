import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, Menu, Bell, User, LogOut, Settings, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import ThemeToggle from '@/components/common/ThemeToggle';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

   // Get notification path based on user role
   const getNotificationPath = () => {
     if (!user?.role) return '/';
     switch (user.role) {
       case 'donor':
         return '/donor/notifications';
       case 'campaign-leader':
         return '/leader/notifications';
       case 'admin':
         return '/admin/notifications';
       default:
         return '/';
     }
   };

  const getDashboardPath = () => {
    if (!user?.role) return '/';
    switch (user.role) {
      case 'donor':
        return '/donor/dashboard';
      case 'campaign-leader':
        return '/leader/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getProfilePath = () => {
    if (!user?.role) return '/';
    switch (user.role) {
      case 'donor':
        return '/donor/profile';
      case 'campaign-leader':
        return '/leader/profile';
      case 'admin':
        return '/admin/profile';
      default:
        return '/';
    }
  };

  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/70 dark:bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--brand-from))] to-[hsl(var(--brand-to))] rounded-lg flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              ImpactHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/campaigns" className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors ${isActive('/campaigns') ? 'text-indigo-600 font-medium' : ''}`}>
              Campaigns
            </Link>
            <Link to="/about" className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors ${isActive('/about') ? 'text-indigo-600 font-medium' : ''}`}>
              About
            </Link>
            <Link to="/help" className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors ${isActive('/help') ? 'text-indigo-600 font-medium' : ''}`}>
              Help
            </Link>
            <Link to="/contact" className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors ${isActive('/contact') ? 'text-indigo-600 font-medium' : ''}`}>
              Contact
            </Link>
            {/* Development test link */}
            {import.meta.env.DEV && (
              <Link to="/test" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">
                API Test
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Connection Status - visible in development */}
            {import.meta.env.DEV && <ConnectionStatus />}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={getNotificationPath()} className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        3
                      </span>
                    </Link>
                  </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.avatarData || user?.avatar || undefined} 
                          alt={user?.name || 'User'} 
                        />
                        <AvatarFallback>
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardPath()} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={getProfilePath()} className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="primaryGradient" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t grid gap-2">
            <Link to="/campaigns" className={`px-2 py-2 rounded hover:bg-accent ${isActive('/campaigns') ? 'text-indigo-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setMobileOpen(false)}>
              Campaigns
            </Link>
            <Link to="/about" className={`px-2 py-2 rounded hover:bg-accent ${isActive('/about') ? 'text-indigo-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link to="/help" className={`px-2 py-2 rounded hover:bg-accent ${isActive('/help') ? 'text-indigo-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setMobileOpen(false)}>
              Help
            </Link>
            <Link to="/contact" className={`px-2 py-2 rounded hover:bg-accent ${isActive('/contact') ? 'text-indigo-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            {!isAuthenticated && (
              <div className="flex gap-2 px-2 pt-2">
                <Button variant="ghost" asChild className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="primaryGradient" asChild className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;