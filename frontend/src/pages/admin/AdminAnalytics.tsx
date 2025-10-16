import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Download,
  Filter
} from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  const campaigns = [
    { id: 'all', name: 'All Campaigns' },
    { id: '1', name: 'Clean Water for Rural Communities' },
    { id: '2', name: 'Education for Every Child' },
    { id: '3', name: 'Emergency Food Relief' }
  ];

  const overviewStats = [
    { 
      icon: DollarSign, 
      label: "Total Raised", 
      value: "$167,670", 
      change: "+15.2%", 
      trend: "up",
      color: "text-green-600" 
    },
    { 
      icon: Users, 
      label: "Total Donors", 
      value: "2,706", 
      change: "+8.7%", 
      trend: "up",
      color: "text-blue-600" 
    },
    { 
      icon: Target, 
      label: "Avg. Donation", 
      value: "$62", 
      change: "+12.3%", 
      trend: "up",
      color: "text-purple-600" 
    },
    { 
      icon: TrendingUp, 
      label: "Conversion Rate", 
      value: "3.4%", 
      change: "-0.2%", 
      trend: "down",
      color: "text-orange-600" 
    }
  ];

  const campaignPerformance = [
    {
      name: "Clean Water for Rural Communities",
      raised: 75420,
      goal: 100000,
      donors: 1247,
      views: 15420,
      shares: 234,
      engagement: 94,
      conversionRate: 8.1
    },
    {
      name: "Education for Every Child",
      raised: 42350,
      goal: 75000,
      donors: 892,
      views: 12100,
      shares: 156,
      engagement: 87,
      conversionRate: 7.4
    },
    {
      name: "Emergency Food Relief",
      raised: 50000,
      goal: 50000,
      donors: 567,
      views: 8900,
      shares: 189,
      engagement: 92,
      conversionRate: 6.4
    }
  ];

  const donorInsights = {
    demographics: [
      { age: "18-24", percentage: 15, count: 406 },
      { age: "25-34", percentage: 28, count: 757 },
      { age: "35-44", percentage: 25, count: 677 },
      { age: "45-54", percentage: 20, count: 541 },
      { age: "55+", percentage: 12, count: 325 }
    ],
    geography: [
      { country: "United States", percentage: 45, count: 1218 },
      { country: "Canada", percentage: 18, count: 487 },
      { country: "United Kingdom", percentage: 12, count: 325 },
      { country: "Australia", percentage: 8, count: 216 },
      { country: "Others", percentage: 17, count: 460 }
    ],
    donationSizes: [
      { range: "$1-25", percentage: 35, count: 947 },
      { range: "$26-50", percentage: 28, count: 757 },
      { range: "$51-100", percentage: 22, count: 595 },
      { range: "$101-250", percentage: 10, count: 271 },
      { range: "$250+", percentage: 5, count: 135 }
    ]
  };

  const engagementMetrics = [
    { metric: "Page Views", value: "36,420", change: "+12.5%" },
    { metric: "Unique Visitors", value: "28,150", change: "+8.9%" },
    { metric: "Social Shares", value: "579", change: "+23.1%" },
    { metric: "Comments", value: "234", change: "+15.7%" },
    { metric: "Email Opens", value: "89.2%", change: "+2.1%" },
    { metric: "Click-through Rate", value: "4.7%", change: "+0.8%" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Analytics</h1>
              <p className="text-gray-600 dark:text-gray-300">Track performance and insights for your campaigns.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <p className={`text-xs mt-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} from last period
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-50`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="donors">Donor Insights</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Detailed performance metrics for each campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {campaignPerformance.map((campaign, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                        <Badge className="bg-green-100 text-green-800">
                          {Math.round((campaign.raised / campaign.goal) * 100)}% funded
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            LKR {campaign.raised.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Raised</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {campaign.donors}
                          </div>
                          <div className="text-sm text-gray-600">Donors</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {campaign.views.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {campaign.conversionRate}%
                          </div>
                          <div className="text-sm text-gray-600">Conversion</div>
                        </div>
                      </div>
                      
                      <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donor Insights Tab */}
          <TabsContent value="donors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Age Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donorInsights.demographics.map((demo, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{demo.age}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${demo.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{demo.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donorInsights.geography.map((geo, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{geo.country}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${geo.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{geo.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Donation Sizes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donorInsights.donationSizes.map((size, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{size.range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${size.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{size.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {engagementMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <p className="text-xs text-green-600 mt-1">{metric.change}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Timeline</CardTitle>
                <CardDescription>
                  Track how engagement changes over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Engagement chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Donation Trends</CardTitle>
                  <CardDescription>
                    Daily donation amounts over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Donation trend chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>
                    Where your visitors are coming from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Direct</span>
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Social Media</span>
                      <span className="text-sm text-gray-600">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email</span>
                      <span className="text-sm text-gray-600">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Search</span>
                      <span className="text-sm text-gray-600">12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAnalytics;