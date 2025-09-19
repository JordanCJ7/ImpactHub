// Upload service for handling file uploads
import { apiService } from './api';

interface UploadedImage {
  filename: string;
  url: string;
  originalName: string;
  size: number;
  mimetype: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  images: UploadedImage[];
}

class UploadService {
  // Upload campaign images
  async uploadCampaignImages(files: File[]): Promise<{ data?: UploadResponse; error?: string }> {
    try {
      const formData = new FormData();
      
      // Add all files to FormData
      files.forEach(file => {
        formData.append('images', file);
      });

      // Use fetch directly since we need to send FormData
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/uploads/campaign-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'Failed to upload images'
        };
      }

      return { data };
    } catch (error) {
      console.error('Upload campaign images error:', error);
      return {
        error: 'Network error. Please check your connection.'
      };
    }
  }

  // Delete campaign image
  async deleteCampaignImage(filename: string): Promise<{ success?: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/uploads/campaign-images/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Failed to delete image'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete campaign image error:', error);
      return {
        error: 'Network error. Please check your connection.'
      };
    }
  }

  // Get full URL for campaign image
  getCampaignImageUrl(filename: string): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/campaigns/${filename}`;
  }

  // Upload a single avatar file (used by profile uploader)
  async uploadAvatar(file: File): Promise<{ data?: { url: string }; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/uploads/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: data.message || 'Failed to upload avatar' };
      }

      return { data };
    } catch (error) {
      console.error('Upload avatar error:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  }

  // Validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Please select a valid image file (JPG, PNG, GIF, WebP).'
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 5MB.'
      };
    }

    return { valid: true };
  }

  // Validate multiple image files
  validateImageFiles(files: File[]): { valid: boolean; error?: string } {
    if (files.length === 0) {
      return {
        valid: false,
        error: 'Please select at least one image.'
      };
    }

    if (files.length > 5) {
      return {
        valid: false,
        error: 'You can upload a maximum of 5 images.'
      };
    }

    for (const file of files) {
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        return validation;
      }
    }

    return { valid: true };
  }
}

export const uploadService = new UploadService();
export default uploadService;
