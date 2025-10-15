import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';

const DonationSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      // Fetch session details to confirm payment
      const fetchSessionDetails = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donations/session/${sessionId}`
          );
          
          if (response.ok) {
            const data = await response.json();
            setSessionData(data);
          } else {
            setError('Failed to load donation details');
          }
        } catch (err) {
          console.error('Error fetching session:', err);
          setError('Failed to load donation details');
        } finally {
          setLoading(false);
        }
      };

      fetchSessionDetails();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-yellow-600">
              Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/campaigns">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Browse More Campaigns
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-600">
            Donation Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for your generous donation! Your payment has been processed successfully.
          </p>
          
          {sessionData && sessionData.status === 'completed' && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Campaign:</span>
                <span className="text-sm font-medium">{sessionData.campaign?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-sm font-medium">
                  {sessionData.currency} {sessionData.amount.toLocaleString()}
                </span>
              </div>
              {sessionData.donationId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Donation ID:</span>
                  <span className="text-xs font-mono">{sessionData.donationId}</span>
                </div>
              )}
            </div>
          )}
          
          {sessionId && (
            <p className="text-xs text-muted-foreground">
              Session ID: {sessionId}
            </p>
          )}
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/campaigns">
                <ExternalLink className="mr-2 h-4 w-4" />
                Browse More Campaigns
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationSuccess;