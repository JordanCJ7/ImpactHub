import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Plus, 
  Eye, 
  Edit, 
  MessageCircle,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { campaignService, type DraftCampaignSummary } from '@/services/campaigns';

const LeaderDashboard: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftCampaignSummary[] | null>(null);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [campaigns, setCampaigns] = useState<any[] | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [recentDonations, setRecentDonations] = useState<any[] | null>(null);
  const [loadingDonations, setLoadingDonations] = useState(false);

  useEffect(() => {
    const loadDrafts = async () => {
      try {
        setLoadingDrafts(true);
        const res = await campaignService.getMyDrafts();
        if (!(res as any).error) {
          setDrafts((res as any).data?.drafts || []);
        }
      } catch (e) {
        setDrafts([]);
      } finally {
        setLoadingDrafts(false);
      }
    };
    loadDrafts();
    // load campaigns and recent donations for leader
    const loadCampaigns = async () => {
      try {
        setLoadingCampaigns(true);
        const res = await campaignService.getMyCampaigns();
        if (!(res as any).error) {
          // normalize campaigns for UI
          const data = (res as any).data?.campaigns || [];
          setCampaigns(data.map((c: any) => ({
            id: c._id,
            title: c.title,
            status: c.status || 'paused',
            raised: c.raised || c.amountRaised || 0,
            goal: c.goal || c.target || 0,
            donors: c.donorsCount || (c.donations ? c.donations.length : 0),
            daysLeft: c.endsAt ? Math.max(0, Math.ceil((new Date(c.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
            image: c.image || c.coverImage || `/images/CleanWater.jpg`,
            lastUpdate: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''),
            engagement: c.engagement || 0,
            raw: c
          })));

          // try to fetch recent donations via service if available
          if (campaignService.getRecentDonations) {
            try {
              setLoadingDonations(true);
              const dRes = await campaignService.getRecentDonations();
              if (!(dRes as any).error) {
                setRecentDonations((dRes as any).data?.donations || []);
              }
            } catch (e) {
              // fallback to deriving from campaigns
            } finally {
              setLoadingDonations(false);
            }
          }

          // if recent donations still empty, derive from campaigns
          if (!recentDonations) {
            const derived: any[] = [];
            (data || []).forEach((c: any) => {
              if (c.donations && Array.isArray(c.donations)) {
                c.donations.slice(-3).forEach((don: any) => {
                  derived.push({
                    id: don._id || `${c._id}-${don._id || Math.random()}`,
                    donor: don.name || don.donorName || (don.user && don.user.name) || 'Anonymous',
                    amount: don.amount || don.value || 0,
                    campaign: c.title,
                    time: don.createdAt ? new Date(don.createdAt).toLocaleString() : '',
                    avatar: (don.user && don.user.avatar) || don.avatar || ''
                  });
                });
              }
            });
            if (derived.length > 0) setRecentDonations(derived.slice(0, 5));
          }
        } else {
          setCampaigns([]);
        }
      } catch (e) {
        setCampaigns([]);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    loadCampaigns();
  }, []);
  const stats = [
    { icon: Target, label: "Active Campaigns", value: "3", change: "+1 this month", color: "text-blue-600" },
    { icon: DollarSign, label: "Total Raised", value: "LKR 47,250", change: "LKR 8,500 this month", color: "text-green-600" },
    { icon: Users, label: "Total Donors", value: "892", change: "+127 this month", color: "text-purple-600" },
    { icon: TrendingUp, label: "Avg. Donation", value: "LKR 530", change: "+12% this month", color: "text-orange-600" }
  ];

  // campaigns state is fetched from API

  // recentDonations is derived from API when available

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Leader Dashboard</h1>
              <p className="text-gray-600">Manage your campaigns and track their impact.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link to="/leader/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button asChild>
                <Link to="/leader/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-50`}>
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
            {/* My Campaigns */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Campaigns</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/leader/campaigns">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {loadingCampaigns ? (
                    <div className="p-4 text-sm text-gray-500">Loading campaigns...</div>
                  ) : campaigns && campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <img
                          src={campaign.image}
                          alt={campaign.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                            <Badge className={getStatusColor(campaign.status)}>
                              {getStatusIcon(campaign.status)}
                              <span className="ml-1 capitalize">{campaign.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">LKR{(campaign.raised || 0).toLocaleString()} raised</span>
                              <span className="text-sm text-gray-500">
                                {campaign.status === 'completed' ? 'Goal reached!' : `${campaign.daysLeft} days left`}
                              </span>
                            </div>
                            <Progress value={campaign.goal ? (campaign.raised / campaign.goal) * 100 : 0} className="h-2" />
                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>{campaign.donors} donors</span>
                              <span>Engagement: {campaign.engagement}%</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-2">Last update: {campaign.lastUpdate}</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/campaigns/${campaign.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/leader/edit/${campaign.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500">No campaigns found.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingDonations ? (
                    <div className="p-4 text-sm text-gray-500">Loading donations...</div>
                  ) : recentDonations && recentDonations.length > 0 ? (
                    recentDonations.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {donation.avatar ? (
                              <AvatarImage src={donation.avatar} alt={donation.donor} />
                            ) : (
                              <AvatarFallback>{(donation.donor || 'A').charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-900">{donation.donor}</h4>
                            <p className="text-sm text-gray-500">{donation.campaign}</p>
                            <p className="text-xs text-gray-400">{donation.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">LKR{(donation.amount || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500">No recent donations.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/leader/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Campaign
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Update to Donors
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/leader/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>

                {/* Drafts Quick Action */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Drafts</span>
                    </div>
                    <Button size="sm" variant="link" className="px-0" asChild>
                      <Link to="/leader/drafts">View all drafts</Link>
                    </Button>
                  </div>
                  {loadingDrafts ? (
                    <div className="text-sm text-gray-500">Loading drafts...</div>
                  ) : drafts && drafts.length > 0 ? (
                    <div className="space-y-2">
                      {drafts.map((d) => {
                        const updated = d.updatedAt ? new Date(d.updatedAt) : (d.createdAt ? new Date(d.createdAt) : null);
                        const updatedLabel = updated && !isNaN(updated.getTime()) ? updated.toLocaleDateString() : 'N/A';
                        return (
                          <div key={d._id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50">
                            <div className="truncate">
                              <div className="font-medium truncate">{d.title || 'Untitled Draft'}</div>
                              <div className="text-xs text-gray-500">Updated {updatedLabel}</div>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/leader/create?draft=${d._id}`}>Continue</Link>
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No drafts yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>This Month's Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">LKR 8,500</div>
                  <div className="text-sm text-gray-600">New Donations</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-blue-600">127</div>
                    <div className="text-xs text-gray-600">New Donors</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600">15</div>
                    <div className="text-xs text-gray-600">Updates Posted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm">Regular Updates</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Campaigns with weekly updates raise 40% more than those without.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 text-sm">Visual Content</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Add photos and videos to increase donor engagement by 65%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;