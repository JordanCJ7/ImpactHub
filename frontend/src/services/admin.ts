// Admin Service
import { apiService } from './api';

export interface PlatformStats {
  stats: {
    totalUsers: number;
    totalCampaigns: number;
    totalDonations: number;
    totalAmount: number;
    usersByRole: Array<{ _id: string; count: number }>;
    campaignsByStatus: Array<{ _id: string; count: number }>;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin: string;
  stats?: {
    totalDonated?: number;
    campaignsCreated?: number;
    donorLevel?: string;
  };
}

export interface Campaign {
  _id: string;
  title: string;
  status: string;
  creator: {
    _id: string;
    name: string;
    email: string;
    organizationName?: string;
  };
  goal: number;
  raised: number;
  createdAt: string;
  endDate: string;
}

export interface Donation {
  _id: string;
  amount: number;
  status: string;
  campaign: {
    _id: string;
    title: string;
    creator: {
      _id: string;
      name: string;
      email: string;
    };
  };
  donorEmail: string;
  createdAt: string;
}

export interface FinancialOverview {
  overview: {
    totalRevenue: number;
    revenueByDay: Array<{ _id: string; amount: number; count: number }>;
    revenueByCategory: Array<{ _id: string; amount: number; count: number }>;
  };
  period: string;
}

export interface AuditLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  createdAt: string;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  userRegistration: boolean;
  campaignCreation: boolean;
  donationProcessing: boolean;
  maxCampaignDuration: number;
  minDonationAmount: number;
  maxDonationAmount: number;
  commission: number;
  supportEmail: string;
  supportPhone: string;
}

class AdminService {
  // Platform Statistics
  async getPlatformStats() {
    const response = await apiService.get<PlatformStats>('/admin/stats/overview');
    return response.data;
  }

  // User Management
  async getAllUsers(page: number = 1, limit: number = 20, role?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (role) {
      queryParams.append('role', role);
    }

    const response = await apiService.get(`/admin/users?${queryParams.toString()}`);
    return response.data;
  }

  async getUsers() {
    const response = await apiService.get<User[]>('/admin/users');
    return response.data;
  }

  async blockUser(id: string) {
    // Backend expects a `status` string (active|suspended|banned)
    const response = await apiService.put(`/admin/users/${id}/status`, {
      status: 'banned',
      banReason: 'Blocked by admin'
    });
    if (response.error) throw response;
    return response.data;
  }

  async unblockUser(id: string) {
    const response = await apiService.put(`/admin/users/${id}/status`, {
      status: 'active',
      banReason: null
    });
    if (response.error) throw response;
    return response.data;
  }

  async getUserById(id: string) {
    const response = await apiService.get(`/admin/users/${id}`);
    return response.data;
  }

  async updateUserStatus(id: string, status: { isActive?: boolean; isBanned?: boolean; banReason?: string }) {
    const response = await apiService.put(`/admin/users/${id}/status`, status);
    if (response.error) throw response;
    return response.data;
  }

  async updateUserRole(id: string, role: string) {
    const response = await apiService.put(`/admin/users/${id}/role`, { role });
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await apiService.delete(`/admin/users/${id}`);
    return response.data;
  }

  // Campaign Management
  async getAllCampaigns(page: number = 1, limit: number = 20, status?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      queryParams.append('status', status);
    }

    const response = await apiService.get(`/admin/campaigns?${queryParams.toString()}`);
    return response.data;
  }

  async getPendingCampaigns() {
    const response = await apiService.get('/admin/campaigns/pending');
    return response.data;
  }

  async approveCampaign(id: string) {
    const response = await apiService.put(`/admin/campaigns/${id}/approve`);
    return response.data;
  }

  async rejectCampaign(id: string, reason: string) {
    const response = await apiService.put(`/admin/campaigns/${id}/reject`, { reason });
    return response.data;
  }

  async suspendCampaign(id: string, reason: string) {
    const response = await apiService.put(`/admin/campaigns/${id}/suspend`, { reason });
    return response.data;
  }

  // Donation Management
  async getAllDonations(page: number = 1, limit: number = 20, status?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      queryParams.append('status', status);
    }

    const response = await apiService.get(`/admin/donations?${queryParams.toString()}`);
    return response.data;
  }

  async verifyDonation(id: string) {
    const response = await apiService.put(`/admin/donations/${id}/verify`);
    return response.data;
  }

  async refundDonation(id: string, reason: string) {
    const response = await apiService.post(`/admin/donations/${id}/refund`, { reason });
    return response.data;
  }

  // Financial Reports
  async getFinancialOverview(period: string = '30d') {
    const response = await apiService.get(`/admin/reports/financial?period=${period}`);
    return response.data;
  }

  // System Management
  async getAuditLogs(page: number = 1, limit: number = 50, action?: string, resource?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (action) {
      queryParams.append('action', action);
    }
    
    if (resource) {
      queryParams.append('resource', resource);
    }

    const response = await apiService.get(`/admin/logs/audit?${queryParams.toString()}`);
    return response.data;
  }

  async getSystemSettings() {
    const response = await apiService.get('/admin/settings');
    return response.data;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>) {
    const response = await apiService.put('/admin/settings', settings);
    return response.data;
  }

  async broadcastNotification(notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    targetUsers?: string[];
  }) {
    const response = await apiService.post('/admin/notifications/broadcast', notification);
    return response.data;
  }

  // Data Export
  async exportUsers() {
    const response = await apiService.get('/admin/export/users');
    return response.data;
  }

  async exportCampaigns() {
    const response = await apiService.get('/admin/export/campaigns');
    return response.data;
  }

  async exportDonations() {
    const response = await apiService.get('/admin/export/donations');
    return response.data;
  }
}

export const adminService = new AdminService();
export default adminService;