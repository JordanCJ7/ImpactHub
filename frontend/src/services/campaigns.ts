// Campaign Service
import { apiService } from './api';

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  story?: string;
  targetAmount: number;
  currentAmount: number;
  goal: number;
  raised: number;
  category: string;
  creator: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  images: string[] | Array<{url: string; caption?: string; isPrimary?: boolean}>;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  urgent: boolean;
  verified: boolean;
  startDate: string;
  endDate: string;
  location?: {
    country: string;
    state?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | string;
  beneficiaries?: {
    count: number;
    description: string;
    demographics?: {
      ageGroups: { [key: string]: number };
      gender: { [key: string]: number };
    };
  };
  impactReports: Array<{
    title: string;
    content: string;
    images: string[];
    createdAt: string;
    isPublic: boolean;
  }>;
  analytics: {
    views: number;
    uniqueViews: number;
    shares: number;
    donorCount: number;
    averageDonation: number;
    topDonation: number;
    conversionRate: number;
  };
  features: {
    allowAnonymousDonations: boolean;
    allowRecurringDonations: boolean;
    sendUpdatesToDonors: boolean;
    allowComments: boolean;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignData {
  title: string;
  description: string;
  story?: string;
  goal: number | string;
  category: string;
  images?: string[];
  endDate: string;
  location?: {
    country: string;
    state?: string;
    city?: string;
  };
  beneficiaries?: {
    count: number;
    description: string;
  };
  features?: {
    allowAnonymousDonations?: boolean;
    allowRecurringDonations?: boolean;
    sendUpdatesToDonors?: boolean;
    allowComments?: boolean;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface CampaignFilters {
  category?: string;
  status?: string;
  featured?: boolean;
  urgent?: boolean;
  location?: string;
  search?: string;
  sortBy?: 'recent' | 'goal' | 'raised' | 'ending_soon';
  page?: number;
  limit?: number;
}

export interface CampaignUpdate {
  title: string;
  content: string;
  images?: string[];
  isPublic?: boolean;
}

export interface CampaignAnalytics {
  overview: {
    totalViews: number;
    uniqueViews: number;
    totalShares: number;
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    conversionRate: number;
  };
  timeline: Array<{
    date: string;
    views: number;
    donations: number;
    amount: number;
  }>;
  demographics: {
    ageGroups: { [key: string]: number };
    gender: { [key: string]: number };
    locations: { [key: string]: number };
  };
  performance: {
    conversionRate: number;
    averageDonation: number;
    repeatDonorRate: number;
  };
}

export interface DraftCampaignSummary {
  _id: string;
  title?: string;
  status: 'draft';
  endDate?: string;
  goal?: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

class CampaignService {
  // Get all campaigns
  async getCampaigns(filters?: CampaignFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/campaigns?${queryParams.toString()}`
      : '/campaigns';
      
    return apiService.get<{
      campaigns: Campaign[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(endpoint);
  }

  // Get featured campaigns
  async getFeaturedCampaigns() {
    return apiService.get<Campaign[]>('/campaigns/featured');
  }

  // Get trending campaigns
  async getTrendingCampaigns() {
    return apiService.get<Campaign[]>('/campaigns/trending');
  }

  // Get urgent campaigns
  async getUrgentCampaigns() {
    return apiService.get<Campaign[]>('/campaigns/urgent');
  }

  // Get campaigns by category
  async getCampaignsByCategory(category: string, limit?: number) {
    const queryParams = new URLSearchParams({ category });
    if (limit) queryParams.append('limit', limit.toString());
    
    return apiService.get<Campaign[]>(`/campaigns/categories?${queryParams.toString()}`);
  }

  // Search campaigns
  async searchCampaigns(query: string, filters?: CampaignFilters) {
    const queryParams = new URLSearchParams({ search: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return apiService.get<{
      campaigns: Campaign[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(`/campaigns/search?${queryParams.toString()}`);
  }

  // Get campaign by ID
  async getCampaignById(id: string) {
    return apiService.get<Campaign>(`/campaigns/${id}`);
  }

  // Create campaign
  async createCampaign(campaignData: CreateCampaignData) {
    return apiService.post<Campaign>('/campaigns', campaignData);
  }

  // Update campaign
  async updateCampaign(id: string, campaignData: UpdateCampaignData) {
    return apiService.put<Campaign>(`/campaigns/${id}`, campaignData);
  }

  // Delete campaign
  async deleteCampaign(id: string) {
    return apiService.delete(`/campaigns/${id}`);
  }

  // Get my campaigns
  async getMyCampaigns(page?: number, limit?: number) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const endpoint = queryParams.toString() 
      ? `/campaigns/user/my-campaigns?${queryParams.toString()}`
      : '/campaigns/user/my-campaigns';
      
    return apiService.get<{
      campaigns: Campaign[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(endpoint);
  }

  // Get supported campaigns
  async getSupportedCampaigns(page?: number, limit?: number) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const endpoint = queryParams.toString() 
      ? `/campaigns/user/supported-campaigns?${queryParams.toString()}`
      : '/campaigns/user/supported-campaigns';
      
    return apiService.get<{
      campaigns: Campaign[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(endpoint);
  }

  // Record view
  async recordView(id: string) {
    return apiService.post(`/campaigns/${id}/view`);
  }

  // Like a campaign
  async likeCampaign(id: string) {
    return apiService.post(`/campaigns/${id}/like`);
  }

  // Unlike a campaign
  async unlikeCampaign(id: string) {
    return apiService.delete(`/campaigns/${id}/like`);
  }

  // Toggle like (tries to like, caller can use response)
  async toggleLike(id: string, liked: boolean) {
    if (liked) {
      return this.unlikeCampaign(id);
    }

    // Try to like; if we get a 401 but the client believes it's authenticated, retry once
    const res = await this.likeCampaign(id);
    if (res && res.error && res.error.toLowerCase().includes('unauthorized')) {
      // Import authService lazily to avoid circular import issues
      const { authService } = await import('./auth');
      if (authService.isAuthenticated()) {
        // Retry once after a short delay to allow token propagation
        await new Promise(r => setTimeout(r, 250));
        return this.likeCampaign(id);
      }
    }
    return res;
  }

  // Record share
  async recordShare(id: string) {
    return apiService.post(`/campaigns/${id}/share`);
  }

  // Get campaign updates
  async getCampaignUpdates(id: string) {
    return apiService.get<{ updates: any[] }>(`/campaigns/${id}/updates`);
  }

  // Add campaign update
  async addCampaignUpdate(id: string, updateData: CampaignUpdate) {
    return apiService.post(`/campaigns/${id}/updates`, updateData);
  }

  // Get campaign analytics
  async getCampaignAnalytics(id: string) {
    return apiService.get<CampaignAnalytics>(`/campaigns/${id}/analytics`);
  }

  // Get detailed analytics
  async getDetailedAnalytics(id: string) {
    return apiService.get<CampaignAnalytics>(`/campaigns/${id}/analytics/detailed`);
  }

  // Export campaign data
  async exportCampaignData(id: string) {
    return apiService.get(`/campaigns/${id}/export`);
  }

  // Campaign status management (admin only)
  async updateCampaignStatus(id: string, status: string) {
    return apiService.put(`/campaigns/${id}/status`, { status });
  }

  // Approve campaign (admin only)
  async approveCampaign(id: string) {
    return apiService.put(`/campaigns/${id}/approve`);
  }

  // Reject campaign (admin only)
  async rejectCampaign(id: string, reason: string) {
    return apiService.put(`/campaigns/${id}/reject`, { reason });
  }

  // Drafts
  async createDraft(draftData: Partial<CreateCampaignData>) {
    return apiService.post<{ campaign: { _id: string; status: 'draft'; createdAt: string } }>(
      '/campaigns/drafts',
      draftData
    );
  }

  async getMyDrafts() {
    // Add cache buster to avoid stale 304 responses during active editing
    const ts = Date.now();
    return apiService.get<{ drafts: DraftCampaignSummary[] }>(`/campaigns/user/drafts?_=${ts}`);
  }

  // Delete a draft (campaign leader or admin)
  async deleteDraft(id: string) {
    return apiService.delete(`/campaigns/${id}`);
  }

  async publishCampaign(id: string, data?: Partial<CreateCampaignData>) {
    // Update with any provided data and set status active
    return apiService.put(`/campaigns/${id}`, { ...(data || {}), status: 'active' });
  }
}

export const campaignService = new CampaignService();
export default campaignService;
