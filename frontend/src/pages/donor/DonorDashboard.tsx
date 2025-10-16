import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, TrendingUp, Users, Calendar, DollarSign, Award, Bell, Settings, Plus, ArrowRight, Globe, Target, Loader2, AlertCircle } from 'lucide-react';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { donationService, campaignService, analyticsService } from '@/services';
import { resolveCampaignImageUrl } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';
import { campaignService as campaignServiceDirect } from '@/services/campaigns';
import type { Donation, UserAnalytics } from '@/services';

const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [supportedCampaigns, setSupportedCampaigns] = useState<any[]>([]);
  const [localLiked, setLocalLiked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('likedCampaigns');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });
  const [likeInflight, setLikeInflight] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    peopleImpacted: 0,
    donorLevel: 'Bronze'
  });

  // Static achievements data (can be replaced with API call later)
  const achievements = [
    { title: "First Donation", description: "Made your first donation", date: "Dec 2023", earned: stats.totalDonated > 0 },
    { title: "Consistent Giver", description: "Donated for 3 consecutive months", date: "Jan 2024", earned: stats.campaignsSupported >= 3 },
    { title: "Community Builder", description: "Supported 10 different campaigns", date: "Jan 2024", earned: stats.campaignsSupported >= 10 },
    { title: "Major Donor", description: "Single donation over LKR 5,000", date: null, earned: false }
  ];

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user analytics and stats
      const [analyticsResponse, donationsResponse, campaignsResponse] = await Promise.allSettled([
        analyticsService.getUserAnalytics(),
          donationService.getMyDonations({ limit: 6 }),
          campaignService.getSupportedCampaigns(1, 3)
      ]);

      // Handle analytics data
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.data) {
        const analytics = analyticsResponse.value.data;
        setUserAnalytics(analytics);
        setStats({
          totalDonated: analytics.overview.totalDonated || 0,
          campaignsSupported: analytics.overview.campaignsSupported || 0,
          peopleImpacted: analytics.impactMetrics?.peopleHelped || 0,
          donorLevel: analytics.overview.donorLevel || 'Bronze'
        });
      }

      // Handle donations data
      if (donationsResponse.status === 'fulfilled' && donationsResponse.value.data) {
        const donationsData = donationsResponse.value.data;
        if (donationsData && 'donations' in donationsData) {
          // Ensure we only keep the latest 6 donations
          setRecentDonations((donationsData.donations || []).slice(0, 6));
        } else if (Array.isArray(donationsData)) {
          setRecentDonations(donationsData.slice(0, 6));
        }
      }

      // Handle campaigns data
      if (campaignsResponse.status === 'fulfilled' && campaignsResponse.value.data) {
        const campaignsData = campaignsResponse.value.data;
        if (campaignsData && 'campaigns' in campaignsData) {
          setSupportedCampaigns(campaignsData.campaigns || []);
        } else if (Array.isArray(campaignsData)) {
          setSupportedCampaigns(campaignsData);
        }
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // After initial load, merge local liked IDs (fallback) into supportedCampaigns if server returned none for those ids
  useEffect(() => {
    const mergeLocalLikes = async () => {
      try {
        const likedIds = Object.keys(localLiked).filter(id => localLiked[id]);
        if (likedIds.length === 0) return;

        // If supportedCampaigns already contains those IDs, nothing to do
        const missing = likedIds.filter(id => !supportedCampaigns.find(c => c._id === id));
        if (missing.length === 0) return;

        // Fetch missing campaigns in parallel (lightweight)
        const fetches = missing.map(id => campaignServiceDirect.getCampaignById(id).then((res:any) => res.data || null).catch(() => null));
        const results = await Promise.all(fetches);
        const fetched = results.filter(Boolean);
        if (fetched.length > 0) {
          setSupportedCampaigns(prev => [...fetched, ...prev]);
        }
      } catch (err) {
        // non-fatal
        console.error('Failed merging local liked campaigns:', err);
      }
    };

    mergeLocalLikes();
  }, [localLiked]);

  // Persist localLiked when changed
  useEffect(() => {
    try { localStorage.setItem('likedCampaigns', JSON.stringify(localLiked)); } catch (e) { /* ignore */ }
  }, [localLiked]);

  // Handler to toggle like from dashboard (will update local state and call API)
  const handleToggleLikeFromDashboard = async (campaignId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'Log in to like campaigns.' });
      return;
    }

    if (likeInflight[campaignId]) return; // debounce
    setLikeInflight(prev => ({ ...prev, [campaignId]: true }));

    // optimistic update in supportedCampaigns
    setSupportedCampaigns(prev => prev.map(c => c._id === campaignId ? ({ ...c, analytics: { ...c.analytics, liked: !currentlyLiked } }) : c));
    setLocalLiked(prev => ({ ...prev, [campaignId]: !currentlyLiked }));

    try {
      const res: any = await campaignService.toggleLike(campaignId, !!currentlyLiked);
      if (res && res.error) {
  // rollback
  setSupportedCampaigns(prev => prev.map(c => c._id === campaignId ? ({ ...c, analytics: { ...c.analytics, liked: currentlyLiked } }) : c));
  setLocalLiked(prev => ({ ...prev, [campaignId]: currentlyLiked }));
  toast({ title: 'Like failed', description: 'Failed to update like. Please try again.', variant: 'destructive' });
      } else if (res && res.data && (res.data as any).campaign) {
        // merge authoritative campaign
        const updated = (res.data as any).campaign;
        setSupportedCampaigns(prev => prev.map(c => c._id === campaignId ? ({ ...c, ...updated }) : c));
        // Update local fallback: remove only this id
        setLocalLiked(prev => {
          const next = { ...prev };
          delete next[campaignId];
          try { localStorage.setItem('likedCampaigns', JSON.stringify(next)); } catch (e) { /* ignore */ }
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling like from dashboard:', err);
  // rollback
  setSupportedCampaigns(prev => prev.map(c => c._id === campaignId ? ({ ...c, analytics: { ...c.analytics, liked: currentlyLiked } }) : c));
  setLocalLiked(prev => ({ ...prev, [campaignId]: currentlyLiked }));
  toast({ title: 'Network error', description: 'Network error while updating like', variant: 'destructive' });
    } finally {
      setLikeInflight(prev => {
        const next = { ...prev };
        delete next[campaignId];
        return next;
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Compute cumulative donated amount for a campaign for the current user
  const getCampaignDonatedAmount = (campaignId: string) => {
    // Prefer server-provided donatedAmount on campaign
    const campaign = supportedCampaigns.find(c => c._id === campaignId);
    if (campaign && (campaign.donatedAmount !== undefined && campaign.donatedAmount !== null)) {
      return campaign.donatedAmount;
    }

    // Fallback: sum amounts in recentDonations for that campaign
    const sum = recentDonations.filter(d => d.campaign && d.campaign._id === campaignId)
      .reduce((acc, d) => acc + (d.amount || 0), 0);
    return sum;
  };

  const getDonorLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze': return 'text-orange-600';
      case 'silver': return 'text-gray-600';
      case 'gold': return 'text-yellow-600';
      case 'platinum': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statsDisplay = [
    { 
      icon: DollarSign, 
      label: "Total Donated", 
      value: formatCurrency(stats.totalDonated), 
      change: userAnalytics?.monthlyDonations?.slice(-1)[0] 
        ? `${formatCurrency(userAnalytics.monthlyDonations.slice(-1)[0].amount)} this month` 
        : "No donations this month", 
      color: "text-green-600" 
    },
    { 
      icon: Heart, 
      label: "Campaigns Supported", 
      value: stats.campaignsSupported.toString(), 
      change: userAnalytics?.overview?.donationCount 
        ? `${userAnalytics.overview.donationCount} total donations` 
        : "0 donations", 
      color: "text-red-600" 
    },
    { 
      icon: Users, 
      label: "People Impacted", 
      value: stats.peopleImpacted.toLocaleString(), 
      change: userAnalytics?.impactMetrics?.communitiesReached 
        ? `${userAnalytics.impactMetrics.communitiesReached} communities` 
        : "0 communities", 
      color: "text-blue-600" 
    },
    { 
      icon: Award, 
      label: "Donor Level", 
      value: stats.donorLevel, 
      change: "Keep donating to level up!", 
      color: getDonorLevelColor(stats.donorLevel) 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background">
      {/* Header */}
  <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user?.name?.split(' ')[0] || 'Friend'}!
              </h1>
              <p className="text-muted-foreground">Here's your impact summary and recent activity.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link to="/donor/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  <Badge className="ml-2 bg-red-500 text-white">3</Badge>
                </Link>
              </Button>
              <Button asChild>
                <Link to="/campaigns">
                  <Plus className="h-4 w-4 mr-2" />
                  Find Campaigns
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Supported Campaigns */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Favourite Campaigns</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/campaigns">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {supportedCampaigns.length > 0 ? (
                    supportedCampaigns.map((campaign) => {
                      const imageUrl = resolveCampaignImageUrl(campaign);
                      return (
                        <div key={campaign._id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted transition-colors">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={campaign.title || 'Campaign image'}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {campaign.title ? campaign.title.substring(0, 2).toUpperCase() : 'CA'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground mb-1">{campaign.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Your contribution: <span className="font-medium text-green-600">{formatCurrency(campaign.donatedAmount ?? getCampaignDonatedAmount(campaign._id))}</span>
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{formatCurrency(campaign.amountRaised ?? campaign.raised ?? campaign.currentAmount ?? 0)} raised</span>
                              <span className="text-sm text-muted-foreground">
                                {campaign.endDate ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 'N/A'} days left
                              </span>
                            </div>
                            <Progress value={campaign.goal ? ((campaign.amountRaised ?? campaign.raised ?? campaign.currentAmount ?? 0) / (campaign.goal || campaign.targetAmount || 1)) * 100 : 0} className="h-2" />
                          </div>
                          
                          {campaign.lastUpdate && (
                            <p className="text-sm text-blue-600 mt-2">Latest: {campaign.lastUpdate}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Button
                            variant={((campaign.analytics as any)?.liked ?? localLiked[campaign._id]) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleToggleLikeFromDashboard(campaign._id, !!((campaign.analytics as any)?.liked ?? localLiked[campaign._id]))}
                            disabled={!!likeInflight[campaign._id]}
                          >
                            <Heart
                              className="h-4 w-4 mr-2"
                              style={{ fill: ((campaign.analytics as any)?.liked ?? localLiked[campaign._id]) ? 'currentColor' : 'none' }}
                            />
                            {((campaign.analytics as any)?.liked ?? localLiked[campaign._id]) ? 'Liked' : 'Like'}
                          </Button>

                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/campaigns/${campaign._id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">No campaigns supported yet</p>
                      <Button className="mt-4" asChild>
                        <Link to="/campaigns">Explore Campaigns</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Donations</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/donor/history">View All History</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDonations.length > 0 ? (
                    recentDonations.map((donation) => {
                      const campaignImageUrl = resolveCampaignImageUrl(donation.campaign);
                      return (
                      <div key={donation._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <img 
                              src={campaignImageUrl} 
                              alt={donation.campaign?.title || 'campaign'} 
                              className="w-12 h-12 object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.opacity = '0';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{donation.campaign.title}</h4>
                            <p className="text-xs text-muted-foreground">Contributed total: <span className="font-medium">{formatCurrency(getCampaignDonatedAmount(donation.campaign._id))}</span></p>
                            <p className="text-sm text-muted-foreground">{formatDate(donation.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{formatCurrency(donation.amount)}</div>
                          <Badge className={getStatusColor(donation.status)}>
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">No donations yet</p>
                      <Button className="mt-4" asChild>
                        <Link to="/campaigns">Make Your First Donation</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span>Your Global Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.peopleImpacted.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Lives Touched</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {userAnalytics?.impactMetrics?.communitiesReached || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Communities</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600">
                      {userAnalytics?.impactMetrics?.projectsSupported || stats.campaignsSupported}
                    </div>
                    <div className="text-xs text-muted-foreground">Projects</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/impact">
                    <Target className="mr-2 h-4 w-4" />
                    View Impact Report
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${achievement.earned ? 'bg-yellow-50' : 'bg-muted'}`}>
                      <Award className={`h-5 w-5 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/donor/profile">View All Achievements</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/campaigns">Find New Campaigns</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/donor/history">
                    <FileText className="mr-2 h-4 w-4" />
                    Donation History
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/donor/profile">Update Profile</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/donor/leaderboard">View Leaderboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;