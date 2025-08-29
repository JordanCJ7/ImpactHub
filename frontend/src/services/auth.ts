// Authentication Service
import { apiService } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'campaign-leader' | 'admin' | 'public';
  avatar?: string;
  isEmailVerified: boolean;
  profile?: {
    bio?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    dateOfBirth?: string;
    organization?: {
      name?: string;
      website?: string;
      description?: string;
      registrationNumber?: string;
    };
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    currency: string;
    language: string;
    preferredCategories: string[];
    donationPrivacy: string;
  };
  stats?: {
    totalDonated: number;
    donationCount: number;
    campaignsSupported: number;
    campaignsCreated: number;
    totalRaised: number;
    impactPoints: number;
    donorLevel: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'donor' | 'campaign-leader';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials) {
    const response = await apiService.post<AuthResponse>('/users/login', credentials);
    
    if (response.data) {
      // Store token in API service
      apiService.setToken(response.data.token);
    }
    
    return response;
  }

  // Register user
  async register(userData: RegisterData) {
    const response = await apiService.post<AuthResponse>('/users/register', userData);
    
    if (response.data) {
      // Store token in API service
      apiService.setToken(response.data.token);
    }
    
    return response;
  }

  // Logout user
  async logout() {
    try {
      await apiService.post('/users/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always remove token locally
      apiService.setToken('');
      localStorage.removeItem('auth_token');
    }
  }

  // Get current user profile
  async getCurrentUser() {
    return apiService.get<User>('/users/me');
  }

  // Update user profile
  async updateProfile(profileData: Partial<User>, email?: string) {
    // If no email provided, get it from the profile data or current user
    const userEmail = email || profileData.email;
    if (!userEmail) {
      throw new Error('Email is required for profile update');
    }
    return apiService.put<User>(`/users/profile/${encodeURIComponent(userEmail)}`, profileData);
  }

  // Change password
  async changePassword(passwordData: ChangePasswordData) {
    return apiService.put('/users/change-password', passwordData);
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData) {
    return apiService.post('/users/forgot-password', data);
  }

  // Reset password
  async resetPassword(data: ResetPasswordData) {
    return apiService.post('/users/reset-password', data);
  }

  // Verify email
  async verifyEmail(token: string) {
    return apiService.post('/users/verify-email', { token });
  }

  // Resend verification email
  async resendVerificationEmail() {
    return apiService.post('/users/resend-verification');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
export default authService;
