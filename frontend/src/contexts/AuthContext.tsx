import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type User as ApiUser, type LoginCredentials, type RegisterData } from '../services';

export type UserRole = 'public' | 'donor' | 'campaign-leader' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarData?: string;
  isEmailVerified?: boolean;
  profile?: any;
  preferences?: any;
  stats?: any;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  isBanned?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Convert API user to local user format
export const convertApiUser = (apiUser: ApiUser): User => ({
  id: apiUser._id,
  name: apiUser.name,
  email: apiUser.email,
  role: apiUser.role as UserRole,
  avatar: apiUser.avatar,
  avatarData: apiUser.avatarData,
  isEmailVerified: apiUser.isEmailVerified,
  profile: apiUser.profile,
  preferences: apiUser.preferences,
  stats: apiUser.stats,
  createdAt: (apiUser as any).createdAt,
  updatedAt: (apiUser as any).updatedAt,
  lastLogin: (apiUser as any).lastLogin,
  isActive: (apiUser as any).isActive,
  isBanned: (apiUser as any).isBanned,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setLoading(true);
      const credentials: LoginCredentials = { email, password };
      const response = await authService.login(credentials);

      if (response.data) {
        const userData = convertApiUser(response.data.user);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          if (response.data) {
            setUser(convertApiUser(response.data));
          } else {
            // Token is invalid, remove it
            await authService.logout();
          }
          // Note: Auto-login removed for security reasons
          // Development should use manual login for proper testing
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        await authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const userData: RegisterData = { 
        name, 
        email, 
        password, 
        role: role as 'donor' | 'campaign-leader'
      };
      const response = await authService.register(userData);
      
      if (response.data) {
        setUser(convertApiUser(response.data.user));
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};