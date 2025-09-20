import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target, 
  DollarSign, 
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Shield,
  BarChart3,
  FileText,
  Bell,
  Download,
  Loader2,
  Eye,
  Edit,
  Ban,
  Trash2,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, type PlatformStats, type User, type Campaign, type Donation } from '@/services/admin';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, usersResponse, campaignsResponse, donationsResponse] = await Promise.allSettled([
        adminService.getPlatformStats(),
        adminService.getAllUsers(1, 5),
        adminService.getPendingCampaigns(),
        adminService.getAllDonations(1, 5)
      ]);

      // Handle platform stats
      if (statsResponse.status === 'fulfilled') {
        setPlatformStats(statsResponse.value);
      }

      // Handle recent users
      if (usersResponse.status === 'fulfilled') {
        setRecentUsers((usersResponse.value as any)?.users || []);
      }

      // Handle pending campaigns
      if (campaignsResponse.status === 'fulfilled') {
        setPendingCampaigns((campaignsResponse.value as any)?.campaigns || []);
      }

      // Handle recent donations
      if (donationsResponse.status === 'fulfilled') {
        setRecentDonations((donationsResponse.value as any)?.donations || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleCampaignAction = async (campaignId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [campaignId]: true }));
      
      if (action === 'approve') {
        await adminService.approveCampaign(campaignId);
        toast({
          title: "Campaign Approved",
          description: "The campaign has been successfully approved.",
        });
      } else if (action === 'reject' && reason) {
        await adminService.rejectCampaign(campaignId, reason);
        toast({
          title: "Campaign Rejected",
          description: "The campaign has been rejected.",
        });
      }
      
      // Reload pending campaigns
      const campaignsResponse = await adminService.getPendingCampaigns();
      setPendingCampaigns((campaignsResponse as any)?.campaigns || []);
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} campaign. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'campaign-leader':
        return 'bg-blue-100 text-blue-800';
      case 'donor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-muted text-foreground';
    }
  };

  // Stats display
  const statsDisplay = [
    {
      title: 'Total Users',
      value: platformStats?.stats.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12% this month'
    },
    {
      title: 'Total Campaigns',
      value: platformStats?.stats.totalCampaigns || 0,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8% this month'
    },
    {
      title: 'Total Donations',
      value: platformStats?.stats.totalDonations || 0,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15% this month'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(platformStats?.stats.totalAmount || 0),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+22% this month'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name}. <br /> Manage your platform efficiently.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/campaigns">
                  <Target className="h-4 w-4 mr-2" />
                  Campaign Management
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
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
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Campaigns */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Pending Campaigns</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/campaigns?status=pending">View All</Link>
                    </Button>
                  </div>
                  <CardDescription>
                    Campaigns awaiting approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingCampaigns.length > 0 ? (
                      pendingCampaigns.slice(0, 3).map((campaign) => (
                        <div key={campaign._id} className="flex items-start space-x-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {campaign.title.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground mb-1">{campaign.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {campaign.creator.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Goal: {formatCurrency(campaign.goal)}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleCampaignAction(campaign._id, 'approve')}
                              disabled={actionLoading[campaign._id]}
                            >
                              {actionLoading[campaign._id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCampaignAction(campaign._id, 'reject', 'Does not meet platform guidelines')}
                              disabled={actionLoading[campaign._id]}
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">No pending campaigns</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest donations and user activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDonations.length > 0 ? (
                      recentDonations.slice(0, 5).map((donation) => (
                        <div key={donation._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {formatCurrency(donation.amount)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                to {donation.campaign.title}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(donation.status)}>
                              {donation.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(donation.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No recent donations</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <Button asChild>
                    <Link to="/admin/users">
                      <Users className="h-4 w-4 mr-2" />
                      Manage All Users
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Recent user registrations and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-foreground">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Campaign Management</CardTitle>
                  <Button asChild>
                    <Link to="/admin/campaigns">
                      <Target className="h-4 w-4 mr-2" />
                      Manage All Campaigns
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Review and approve campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Campaign management features coming soon</p>
                  <Button className="mt-4" asChild>
                    <Link to="/admin/campaigns">Go to Campaign Management</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Donation Management</CardTitle>
                  <Button asChild>
                    <Link to="/admin/donations">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Manage All Donations
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Monitor and verify donations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Donation management features coming soon</p>
                  <Button className="mt-4" asChild>
                    <Link to="/admin/donations">Go to Donation Management</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>
                    Revenue and transaction analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link to="/admin/reports/financial">
                      <FileText className="h-4 w-4 mr-2" />
                      View Financial Reports
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Analytics</CardTitle>
                  <CardDescription>
                    User behavior and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link to="/admin/analytics/users">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View User Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>
                    Audit trails and system events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link to="/admin/logs">
                      <Shield className="h-4 w-4 mr-2" />
                      View System Logs
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;