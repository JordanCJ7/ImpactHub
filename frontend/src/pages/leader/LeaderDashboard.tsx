import React from 'react';
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
  AlertCircle
} from 'lucide-react';

const LeaderDashboard: React.FC = () => {
  const stats = [
    { icon: Target, label: "Active Campaigns", value: "3", change: "+1 this month", color: "text-blue-600" },
    { icon: DollarSign, label: "Total Raised", value: "LKR 47,250", change: "LKR 8,500 this month", color: "text-green-600" },
    { icon: Users, label: "Total Donors", value: "892", change: "+127 this month", color: "text-purple-600" },
    { icon: TrendingUp, label: "Avg. Donation", value: "LKR 530", change: "+12% this month", color: "text-orange-600" }
  ];

  const campaigns = [
    {
      id: 1,
      title: "Clean Water for Rural Communities",
      status: "active",
      raised: 75420,
      goal: 100000,
      donors: 1247,
      daysLeft: 23,
      image: "/images/CleanWater.jpg",
      lastUpdate: "2 days ago",
      engagement: 94
    },
    {
      id: 2,
      title: "Education for Every Child",
      status: "active",
      raised: 42350,
      goal: 75000,
      donors: 892,
      daysLeft: 45,
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop",
      lastUpdate: "1 week ago",
      engagement: 87
    },
    {
      id: 3,
      title: "Emergency Food Relief",
      status: "completed",
      raised: 50000,
      goal: 50000,
      donors: 567,
      daysLeft: 0,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=200&fit=crop",
      lastUpdate: "Completed",
      engagement: 92
    }
  ];

  const recentDonations = [
    {
      id: 1,
      donor: "Kamani Weerasinha",
      amount: 5000,
      campaign: "Clean Water for Rural Communities",
      time: "2 hours ago",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 2,
      donor: "Minsara Kaushalya",
      amount: 2500,
      campaign: "Education for Every Child",
      time: "5 hours ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 3,
      donor: "Eshini Liyanapathiranage",
      amount: 1000,
      campaign: "Clean Water for Rural Communities",
      time: "1 day ago",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
    }
  ];

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
                  {campaigns.map((campaign) => (
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
                            <span className="text-sm text-gray-600">LKR{campaign.raised.toLocaleString()} raised</span>
                            <span className="text-sm text-gray-500">
                              {campaign.status === 'completed' ? 'Goal reached!' : `${campaign.daysLeft} days left`}
                            </span>
                          </div>
                          <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
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
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={donation.avatar} alt={donation.donor} />
                          <AvatarFallback>{donation.donor.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-gray-900">{donation.donor}</h4>
                          <p className="text-sm text-gray-500">{donation.campaign}</p>
                          <p className="text-xs text-gray-400">{donation.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">LKR{donation.amount}</div>
                      </div>
                    </div>
                  ))}
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