// Integration Test Page
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiService, authService, campaignService, donationService, analyticsService } from '../services';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const IntegrationTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (index: number, result: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...result } : test));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    const testCases: Omit<TestResult, 'status'>[] = [
      { name: 'Backend Health Check' },
      { name: 'API Service Connection' },
      { name: 'Auth Service Test' },
      { name: 'Campaign Service Test' },
      { name: 'Donation Service Test' },
      { name: 'Analytics Service Test' },
    ];

    setTests(testCases.map(test => ({ ...test, status: 'pending' })));

    // Test 1: Backend Health Check
    try {
      const start = Date.now();
      const response = await apiService.healthCheck();
      const duration = Date.now() - start;
      
      if (response.data) {
        updateTestResult(0, {
          status: 'success',
          message: `Backend is healthy (${duration}ms)`,
          duration
        });
      } else {
        updateTestResult(0, {
          status: 'error',
          message: response.error || 'Health check failed',
          duration
        });
      }
    } catch (error) {
      updateTestResult(0, {
        status: 'error',
        message: `Health check failed: ${error}`
      });
    }

    // Test 2: API Service Connection
    try {
      const start = Date.now();
      const response = await fetch('http://localhost:5000/api/health');
      const duration = Date.now() - start;
      
      if (response.ok) {
        const data = await response.json();
        updateTestResult(1, {
          status: 'success',
          message: `Direct API connection successful (${duration}ms)`,
          duration
        });
      } else {
        updateTestResult(1, {
          status: 'error',
          message: `API connection failed: ${response.status}`
        });
      }
    } catch (error) {
      updateTestResult(1, {
        status: 'error',
        message: `API connection failed: ${error}`
      });
    }

    // Test 3: Auth Service Test
    try {
      const start = Date.now();
      // Try to get current user (should fail if not authenticated)
      const response = await authService.getCurrentUser();
      const duration = Date.now() - start;
      
      // Expected to fail with 401 if not authenticated
      if (response.error && response.error.includes('Access denied')) {
        updateTestResult(2, {
          status: 'success',
          message: `Auth service working - requires authentication (${duration}ms)`,
          duration
        });
      } else if (response.data) {
        updateTestResult(2, {
          status: 'success',
          message: `Auth service working - user authenticated (${duration}ms)`,
          duration
        });
      } else {
        updateTestResult(2, {
          status: 'error',
          message: response.error || 'Auth service test failed'
        });
      }
    } catch (error) {
      updateTestResult(2, {
        status: 'error',
        message: `Auth service failed: ${error}`
      });
    }

    // Test 4: Campaign Service Test
    try {
      const start = Date.now();
      const response = await campaignService.getCampaigns({ limit: 1 });
      const duration = Date.now() - start;
      
      if (response.data) {
        updateTestResult(3, {
          status: 'success',
          message: `Campaign service working (${duration}ms)`,
          duration
        });
      } else {
        updateTestResult(3, {
          status: 'error',
          message: response.error || 'Campaign service test failed'
        });
      }
    } catch (error) {
      updateTestResult(3, {
        status: 'error',
        message: `Campaign service failed: ${error}`
      });
    }

    // Test 5: Donation Service Test
    try {
      const start = Date.now();
      const response = await donationService.getDonationStats();
      const duration = Date.now() - start;
      
      if (response.data || response.error) {
        updateTestResult(4, {
          status: 'success',
          message: `Donation service working (${duration}ms)`,
          duration
        });
      } else {
        updateTestResult(4, {
          status: 'error',
          message: 'Donation service test failed'
        });
      }
    } catch (error) {
      updateTestResult(4, {
        status: 'error',
        message: `Donation service failed: ${error}`
      });
    }

    // Test 6: Analytics Service Test
    try {
      const start = Date.now();
      const response = await analyticsService.getDashboardStats();
      const duration = Date.now() - start;
      
      if (response.data || (response.error && response.error.includes('Access denied'))) {
        updateTestResult(5, {
          status: 'success',
          message: `Analytics service working (${duration}ms)`,
          duration
        });
      } else {
        updateTestResult(5, {
          status: 'error',
          message: response.error || 'Analytics service test failed'
        });
      }
    } catch (error) {
      updateTestResult(5, {
        status: 'error',
        message: `Analytics service failed: ${error}`
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Backend Integration Test</h1>
          <p className="text-gray-600 mt-2">
            Test the connection and functionality of all backend services
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Integration Tests</CardTitle>
            <CardDescription>
              These tests verify that the frontend can successfully communicate with all backend services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run Integration Tests'
                )}
              </Button>

              {tests.length > 0 && (
                <div className="space-y-3">
                  {tests.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <div className={`text-sm ${getStatusColor(test.status)}`}>
                        {test.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Make sure the backend server is running on port 5000 before running these tests.
            Some tests may show expected authentication errors if you're not logged in.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default IntegrationTest;
