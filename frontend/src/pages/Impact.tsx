import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsService, donationService } from '@/services';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Impact: React.FC = () => {
  const { user } = useAuth();
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const formatNumber = (n: number) => n.toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [analyticsRes, donationsRes] = await Promise.allSettled([
          analyticsService.getUserAnalytics(),
          donationService.getMyDonations({ limit: 10 })
        ]);
        if (analyticsRes.status === 'fulfilled') setUserAnalytics(analyticsRes.value.data || null);
        if (donationsRes.status === 'fulfilled') {
          const d = donationsRes.value.data;
          setRecentDonations(Array.isArray(d) ? d : (d?.donations || []));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // donor-only summary calculations
  const totalDonated = userAnalytics?.overview?.totalDonated ?? recentDonations.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const donationCount = userAnalytics?.overview?.donationCount ?? recentDonations.length;
  const avgDonation = donationCount > 0 ? Math.round((totalDonated || 0) / donationCount) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Impact Summary</h1>
            <p className="text-muted-foreground dark:text-gray-300">Personal summary of your donations and impact.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link to="/donor/dashboard">Back</Link>
            </Button>
            <Button variant="primaryGradient" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
            </Button>
          </div>
        </div>

        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>Please sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-gray-300">Sign in to view your personal donation summary.</p>
              <div className="mt-4">
                <Button asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donor Overview</CardTitle>
                <CardDescription>Your donation statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={(user as any).avatar || undefined} alt={user.name || 'User'} />
                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                  <div>
                    <div className="text-lg font-bold">LKR {formatNumber(totalDonated || 0)}</div>
                    <div className="text-xs text-muted-foreground">Total donated</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{donationCount}</div>
                    <div className="text-xs text-muted-foreground">Donations</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">LKR {formatNumber(avgDonation)}</div>
                    <div className="text-xs text-muted-foreground">Average donation</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest donations from your account</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : recentDonations.length > 0 ? (
                  <div className="space-y-3">
                    {recentDonations.map(r => (
                      <div key={r._id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{r.campaign?.title || r.campaign}</div>
                          <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="font-semibold">LKR {Number(r.amount).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No donations yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Impact;
