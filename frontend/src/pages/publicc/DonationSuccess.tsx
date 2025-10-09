import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink } from 'lucide-react';

const DonationSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Optional: Fetch session details from your backend for receipt display
      // For now, we'll just show a success message
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