// Analytics Service
import { apiService } from './api';

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalDonations: number;
  totalAmount: number;
  totalUsers: number;
  totalDonors: number;
  recentActivity: Array<{
    type: 'campaign_created' | 'donation_made' | 'user_registered';
    message: string;
    timestamp: string;
    user?: {
      name: string;
      avatar?: string;
    };
    amount?: number;
    campaign?: {
      title: string;
    };
  }>;
  monthlyStats: Array<{
    month: string;
    campaigns: number;
    donations: number;
    amount: number;
    users: number;
  }>;
}

export interface UserAnalytics {
  overview: {
    totalDonated: number;
    donationCount: number;
    campaignsSupported: number;
    campaignsCreated: number;
    totalRaised: number;
    impactPoints: number;
    donorLevel: string;
  };
  donationHistory: Array<{
    date: string;
    amount: number;
    campaign: string;
  }>;
  categoryBreakdown: { [category: string]: number };
  monthlyDonations: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  impactMetrics: {
    peopleHelped: number;
    projectsSupported: number;
    communitiesReached: number;
  };
}

export interface PlatformAnalytics {
  overview: {
    totalRevenue: number;
    totalCampaigns: number;
    totalDonations: number;
    totalUsers: number;
    averageDonation: number;
    successRate: number;
  };
  trends: {
    daily: Array<{
      date: string;
      revenue: number;
      donations: number;
      newUsers: number;
      newCampaigns: number;
    }>;
    monthly: Array<{
      month: string;
      revenue: number;
      donations: number;
      users: number;
      campaigns: number;
    }>;
  };
  categories: Array<{
    category: string;
    campaignCount: number;
    totalRaised: number;
    averageGoal: number;
    successRate: number;
  }>;
  geography: {
    countries: { [country: string]: number };
    cities: { [city: string]: number };
  };
  demographics: {
    ageGroups: { [ageGroup: string]: number };
    gender: { [gender: string]: number };
    donorTypes: { [type: string]: number };
  };
  performance: {
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
    returnVisitorRate: number;
  };
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  region?: string;
  campaignStatus?: string;
  donationType?: string;
  userRole?: string;
}

class AnalyticsService {
  // Get dashboard statistics
  async getDashboardStats() {
    return apiService.get<DashboardStats>('/analytics/dashboard');
  }

  // Get user analytics
  async getUserAnalytics() {
    return apiService.get<UserAnalytics>('/analytics/user');
  }

  // Get platform analytics (admin only)
  async getPlatformAnalytics(filters?: ReportFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/analytics/platform?${queryParams.toString()}`
      : '/analytics/platform';
      
    return apiService.get<PlatformAnalytics>(endpoint);
  }

  // Get campaign performance
  async getCampaignPerformance(campaignId: string) {
    return apiService.get(`/analytics/campaign/${campaignId}/performance`);
  }

  // Get donation trends
  async getDonationTrends(filters?: ReportFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/analytics/donations/trends?${queryParams.toString()}`
      : '/analytics/donations/trends';
      
    return apiService.get(endpoint);
  }

  // Get user engagement
  async getUserEngagement(filters?: ReportFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/analytics/users/engagement?${queryParams.toString()}`
      : '/analytics/users/engagement';
      
    return apiService.get(endpoint);
  }

  // Export analytics data
  async exportAnalytics(type: 'campaigns' | 'donations' | 'users', filters?: ReportFilters) {
    const queryParams = new URLSearchParams({ type });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return apiService.get(`/analytics/export?${queryParams.toString()}`);
  }

  // Generate custom report
  async generateCustomReport(reportConfig: {
    name: string;
    description?: string;
    metrics: string[];
    filters?: ReportFilters;
    format: 'json' | 'csv' | 'pdf';
  }) {
    return apiService.post('/analytics/reports/custom', reportConfig);
  }

  // Get scheduled reports
  async getScheduledReports() {
    return apiService.get('/analytics/reports/scheduled');
  }

  // Create scheduled report
  async createScheduledReport(reportConfig: {
    name: string;
    description?: string;
    metrics: string[];
    filters?: ReportFilters;
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number;
      dayOfMonth?: number;
      time: string;
    };
    recipients: string[];
    format: 'json' | 'csv' | 'pdf';
  }) {
    return apiService.post('/analytics/reports/scheduled', reportConfig);
  }

  // Update scheduled report
  async updateScheduledReport(id: string, reportConfig: any) {
    return apiService.put(`/analytics/reports/scheduled/${id}`, reportConfig);
  }

  // Delete scheduled report
  async deleteScheduledReport(id: string) {
    return apiService.delete(`/analytics/reports/scheduled/${id}`);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
