// Donation Service
import { apiService } from './api';

export interface Donation {
  _id: string;
  donor?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  campaign: {
    _id: string;
    title: string;
    creator: {
      _id: string;
      name: string;
    };
  };
  amount: number;
  originalAmount: number;
  payment: {
    method: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'razorpay' | 'payhere';
    transactionId?: string;
    processingFee: number;
    netAmount: number;
    currency: string;
    exchangeRate: number;
    paymentGateway?: string;
  };
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  failureReason?: string;
  refundReason?: string;
  refundedAt?: string;
  message?: string;
  isAnonymous: boolean;
  isRecurring: boolean;
  recurringDetails?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    nextPaymentDate: string;
    endDate?: string;
    isActive: boolean;
    isPaused: boolean;
    pausedAt?: string;
    pauseReason?: string;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    source?: string;
    campaign?: string;
    medium?: string;
  };
  receipt?: {
    receiptNumber: string;
    issuedAt: string;
    downloadUrl?: string;
  };
  tax?: {
    isDeductible: boolean;
    category: string;
    jurisdiction: string;
    documentUrl?: string;
  };
  verification?: {
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationData {
  campaignId: string;
  amount: number;
  message?: string;
  isAnonymous?: boolean;
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'razorpay' | 'payhere';
  currency?: string;
  donorInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: {
    source?: string;
    campaign?: string;
    medium?: string;
  };
}

export interface CreateRecurringDonationData extends CreateDonationData {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  endDate?: string;
}

export interface PaymentIntentData {
  campaignId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
}

export interface ConfirmDonationData {
  donationId: string;
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface DonationFilters {
  campaignId?: string;
  status?: string;
  paymentMethod?: string;
  isAnonymous?: boolean;
  isRecurring?: boolean;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'amount' | 'campaign';
}

export interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  topDonation: number;
  recentDonations: Donation[];
  topDonors: Array<{
    name: string;
    amount: number;
    donationCount: number;
    avatar?: string;
  }>;
  monthlyStats: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export interface DonationAnalytics {
  overview: {
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    recurringDonations: number;
    recurringAmount: number;
  };
  timeline: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  paymentMethods: { [key: string]: number };
  demographics: {
    countries: { [key: string]: number };
    donorTypes: { [key: string]: number };
  };
  performance: {
    conversionRate: number;
    averageProcessingTime: number;
    failureRate: number;
  };
}

class DonationService {
  // Get recent donations (public)
  async getRecentDonations(limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiService.get<Donation[]>(`/donations/recent${queryParams}`);
  }

  // Get top donations (public)
  async getTopDonations(limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiService.get<Donation[]>(`/donations/top${queryParams}`);
  }

  // Get donation statistics (public)
  async getDonationStats() {
    return apiService.get<DonationStats>('/donations/stats');
  }

  // Create donation
  async createDonation(donationData: CreateDonationData) {
    return apiService.post<Donation>('/donations', donationData);
  }

  // Create recurring donation
  async createRecurringDonation(donationData: CreateRecurringDonationData) {
    return apiService.post<Donation>('/donations/recurring', donationData);
  }

  // Create payment intent
  async createPaymentIntent(paymentData: PaymentIntentData) {
    return apiService.post<{ clientSecret: string; paymentIntentId: string }>('/donations/create-payment-intent', paymentData);
  }

  // Confirm donation
  async confirmDonation(confirmData: ConfirmDonationData) {
    return apiService.post<Donation>('/donations/confirm', confirmData);
  }

  // Process payment
  async processPayment(paymentData: any) {
    return apiService.post('/donations/process-payment', paymentData);
  }

  // Get my donations
  async getMyDonations(filters?: DonationFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/donations/my-donations?${queryParams.toString()}`
      : '/donations/my-donations';
      
    return apiService.get<{
      donations: Donation[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(endpoint);
  }

  // Get donation by ID
  async getDonationById(id: string) {
    return apiService.get<Donation>(`/donations/my-donations/${id}`);
  }

  // Get donation history by email
  async getDonationHistory(email: string, filters?: DonationFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/donations/history/${email}?${queryParams.toString()}`
      : `/donations/history/${email}`;
      
    return apiService.get<{
      donations: Donation[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(endpoint);
  }

  // Update donation
  async updateDonation(id: string, updateData: Partial<Donation>) {
    return apiService.put<Donation>(`/donations/${id}`, updateData);
  }

  // Cancel donation
  async cancelDonation(id: string, reason?: string) {
    return apiService.put(`/donations/${id}/cancel`, { reason });
  }

  // Generate receipt
  async generateReceipt(id: string) {
    return apiService.get(`/donations/${id}/receipt`);
  }

  // Get tax summary
  async getTaxSummary(year: number) {
    return apiService.get(`/donations/tax-summary/${year}`);
  }

  // Get my recurring subscriptions
  async getMyRecurringDonations() {
    return apiService.get<Donation[]>('/donations/recurring/my-subscriptions');
  }

  // Cancel recurring donation
  async cancelRecurringDonation(id: string) {
    return apiService.put(`/donations/recurring/${id}/cancel`);
  }

  // Pause recurring donation
  async pauseRecurringDonation(id: string, reason?: string) {
    return apiService.put(`/donations/recurring/${id}/pause`, { reason });
  }

  // Resume recurring donation
  async resumeRecurringDonation(id: string) {
    return apiService.put(`/donations/recurring/${id}/resume`);
  }

  // Get donation analytics (for campaign leaders and admins)
  async getDonationAnalytics() {
    return apiService.get<DonationAnalytics>('/donations/analytics/overview');
  }

  // Get campaign donation analytics
  async getCampaignDonationAnalytics(campaignId: string) {
    return apiService.get<DonationAnalytics>(`/donations/analytics/campaign/${campaignId}`);
  }

  // Admin: Get all donations
  async getAllDonations(filters?: DonationFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/donations/admin/all?${queryParams.toString()}`
      : '/donations/admin/all';
      
    return apiService.get<{
      donations: Donation[];
      pagination: {
        current: number;
        pages: number;
        total: number;
      };
    }>(endpoint);
  }

  // Admin: Verify donation
  async verifyDonation(id: string, notes?: string) {
    return apiService.put(`/donations/admin/${id}/verify`, { notes });
  }

  // Admin: Refund donation
  async refundDonation(id: string, reason: string) {
    return apiService.post(`/donations/${id}/refund`, { reason });
  }

  // Admin: Generate reports
  async generateReports(filters?: DonationFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/donations/admin/reports?${queryParams.toString()}`
      : '/donations/admin/reports';
      
    return apiService.get(endpoint);
  }
}

export const donationService = new DonationService();
export default donationService;
