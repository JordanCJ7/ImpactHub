// Health Check Hook
import { useState, useEffect } from 'react';
import { apiService } from '../services';

interface HealthStatus {
  isConnected: boolean;
  loading: boolean;
  error?: string;
  lastChecked?: Date;
}

export const useHealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus>({
    isConnected: false,
    loading: true,
  });

  const checkHealth = async () => {
    try {
      setHealth(prev => ({ ...prev, loading: true, error: undefined }));
      
      const response = await apiService.healthCheck();
      
      if (response.data) {
        setHealth({
          isConnected: true,
          loading: false,
          lastChecked: new Date(),
        });
      } else {
        setHealth({
          isConnected: false,
          loading: false,
          error: response.error || 'Health check failed',
          lastChecked: new Date(),
        });
      }
    } catch (error) {
      setHealth({
        isConnected: false,
        loading: false,
        error: 'Network error - unable to reach backend',
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { ...health, checkHealth };
};
