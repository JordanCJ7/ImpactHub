import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import Home from '@/pages/publicc/Home';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not authenticated, show public home page
  if (!isAuthenticated || !user) {
    return <Home />;
  }

  // Redirect authenticated users to their role-specific dashboard
  const getDashboardPath = (role: UserRole) => {
    switch (role) {
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

  return <Navigate to={getDashboardPath(user.role)} replace />;
};

export default RootRedirect;
