import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, TrendingUp, Users, Calendar, DollarSign, Award, Bell, Settings, Plus, ArrowRight, Globe, Target } from 'lucide-react';
import { FileText } from 'lucide-react';

const DonorDashboard: React.FC = () => {
  const stats = [
    { icon: DollarSign, label: "Total Donated", value: "$2,450", change: "+$150 this month", color: "text-green-600" },
    { icon: Heart, label: "Campaigns Supported", value: "12", change: "+2 this month", color: "text-red-600" },
    { icon: Users, label: "People Impacted", value: "1,247", change: "+89 this month", color: "text-blue-600" },
    { icon: Award, label: "Donor Level", value: "Gold", change: "Next: Platinum", color: "text-yellow-600" }
  ];

  const recentDonations = [
    {
      id: 1,
      campaign: "Clean Water for Rural Communities",
      amount: 150,
      date: "2024-01-15",
      status: "completed",
      image: "/images/CleanWater.jpg"
    },
    {
      id: 2,
      campaign: "Education for Every Child",
      amount: 100,
      date: "2024-01-12",
      status: "completed",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      campaign: "Emergency Food Relief",
      amount: 75,
      date: "2024-01-08",
      status: "completed",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&h=100&fit=crop"
    }
  ];

  const supportedCampaigns = [
    {
      id: 1,
      title: "Clean Water for Rural Communities",
      raised: 75420,
      goal: 100000,
      yourContribution: 150,
      lastUpdate: "Well drilling completed in village 1",
      image: "/images/CleanWater.jpg",
      daysLeft: 23
    },
    {
      id: 2,
      title: "Education for Every Child",
      raised: 42350,
      goal: 75000,
      yourContribution: 100,
      lastUpdate: "School construction 60% complete",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop",
      daysLeft: 45
    },
    {
      id: 3,
      title: "Emergency Food Relief",
      raised: 28900,
      goal: 50000,
      yourContribution: 75,
      lastUpdate: "Distributed 500 food packages this week",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=200&fit=crop",
      daysLeft: 12
    }
  ];

  const achievements = [
    { title: "First Donation", description: "Made your first donation", date: "Dec 2023", earned: true },
    { title: "Consistent Giver", description: "Donated for 3 consecutive months", date: "Jan 2024", earned: true },
    { title: "Community Builder", description: "Supported 10 different campaigns", date: "Jan 2024", earned: true },
    { title: "Major Donor", description: "Single donation over $500", date: null, earned: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
              <p className="text-gray-600">Here's your impact summary and recent activity.</p>
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
            {/* Supported Campaigns */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Supported Campaigns</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/campaigns">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {supportedCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{campaign.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">Your contribution: <span className="font-medium text-green-600">${campaign.yourContribution}</span></p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">${campaign.raised.toLocaleString()} raised</span>
                            <span className="text-sm text-gray-500">{campaign.daysLeft} days left</span>
                          </div>
                          <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                        </div>
                        
                        <p className="text-sm text-blue-600 mt-2">Latest: {campaign.lastUpdate}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/campaigns/${campaign.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
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
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img src={donation.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-medium text-gray-900">{donation.campaign}</h4>
                          <p className="text-sm text-gray-500">{donation.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${donation.amount}</div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                    </div>
                  ))}
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
                  <div className="text-3xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Lives Touched</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">3</div>
                    <div className="text-xs text-gray-600">Countries</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600">12</div>
                    <div className="text-xs text-gray-600">Projects</div>
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
                    <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${achievement.earned ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                      <Award className={`h-5 w-5 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
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