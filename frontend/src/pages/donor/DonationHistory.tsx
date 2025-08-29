import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  DollarSign, 
  Heart,
  TrendingUp,
  FileText,
  Eye,
  BarChart3,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Gift,
  AlertCircle
} from 'lucide-react';

const DonationHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const donations = [
    {
      id: 'DON-20240115001',
      campaign: {
        id: 1,
        title: 'Clean Water for Rural Communities',
        image: '/images/CleanWater.jpg',
        organizer: 'Water for Life Foundation'
      },
      amount: 15000,
      processingFee: 40.65,
      totalAmount: 15040.65,
      feesCovered: true,
      date: '2024-01-15',
      status: 'completed',
      paymentMethod: 'Visa ****4242',
      isAnonymous: false,
      message: 'Happy to support this important cause!',
      taxDeductible: true,
      receiptDownloaded: false,
      impactUpdate: 'Your donation helped drill a new well serving 200 families'
    },
    {
      id: 'DON-20240112002',
      campaign: {
        id: 2,
        title: 'Education for Every Child',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop',
        organizer: 'Education First'
      },
      amount: 10000,
      processingFee: 30.20,
      totalAmount: 10030.20,
      feesCovered: false,
      date: '2024-01-12',
      status: 'completed',
      paymentMethod: 'Mastercard ****5555',
      isAnonymous: false,
      message: '',
      taxDeductible: true,
      receiptDownloaded: true,
      impactUpdate: 'Helped purchase school supplies for 25 students'
    },
    {
      id: 'DON-20240108003',
      campaign: {
        id: 3,
        title: 'Emergency Food Relief',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&h=100&fit=crop',
        organizer: 'Relief International'
      },
      amount: 45000,
      processingFee: 60.48,
      totalAmount: 45060.48,
      feesCovered: true,
      date: '2024-01-08',
      status: 'completed',
      paymentMethod: 'PayPal',
      isAnonymous: true,
      message: '',
      taxDeductible: true,
      receiptDownloaded: false,
      impactUpdate: 'Provided 15 emergency food packages to families in need'
    },
    {
      id: 'DON-20240105004',
      campaign: {
        id: 4,
        title: 'Animal Shelter Support',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop',
        organizer: 'Local Animal Shelter'
      },
      amount: 50000,
      processingFee: 100.75,
      totalAmount: 50100.75,
      feesCovered: true,
      date: '2024-01-05',
      status: 'completed',
      paymentMethod: 'Apple Pay',
      isAnonymous: false,
      message: 'Love supporting our furry friends!',
      taxDeductible: true,
      receiptDownloaded: true,
      impactUpdate: 'Helped provide medical care for 3 rescued animals'
    },
    {
      id: 'DON-20231228005',
      campaign: {
        id: 5,
        title: 'Holiday Meals for Families',
        image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=100&h=100&fit=crop',
        organizer: 'Community Food Bank'
      },
      amount: 20000,
      processingFee: 60.10,
      totalAmount: 20060.10,
      feesCovered: true,
      date: '2023-12-28',
      status: 'completed',
      paymentMethod: 'Visa ****4242',
      isAnonymous: false,
      message: 'Merry Christmas to all families!',
      taxDeductible: true,
      receiptDownloaded: true,
      impactUpdate: 'Provided holiday meals for 40 families'
    },
    {
      id: 'DON-20231220006',
      campaign: {
        id: 6,
        title: 'Winter Clothing Drive',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
        organizer: 'Homeless Support Network'
      },
      amount: 12500,
      processingFee: 30.93,
      totalAmount: 12530.93,
      feesCovered: true,
      date: '2023-12-20',
      status: 'completed',
      paymentMethod: 'Google Pay',
      isAnonymous: false,
      message: 'Stay warm everyone!',
      taxDeductible: true,
      receiptDownloaded: false,
      impactUpdate: 'Provided winter coats for 8 individuals'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.campaign.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const donationDate = new Date(donation.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - donationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeFilter) {
        case '7d':
          matchesTime = daysDiff <= 7;
          break;
        case '30d':
          matchesTime = daysDiff <= 30;
          break;
        case '90d':
          matchesTime = daysDiff <= 90;
          break;
        case '1y':
          matchesTime = daysDiff <= 365;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });

  const sortedDonations = [...filteredDonations].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.amount - a.amount;
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalFeesCovered = donations.reduce((sum, donation) => 
    sum + (donation.feesCovered ? donation.processingFee : 0), 0
  );
  const averageDonation = totalDonated / donations.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
              <p className="text-gray-600">Track all your donations and their impact over time.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Tax Summary
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donated</p>
                  <p className="text-2xl font-bold text-green-600">Rs.{totalDonated}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-blue-600">{donations.length}</p>
                </div>
                <Gift className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Donation</p>
                  <p className="text-2xl font-bold text-purple-600">Rs.{averageDonation.toFixed(0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fees Covered</p>
                  <p className="text-2xl font-bold text-orange-600">Rs.{totalFeesCovered.toFixed(2)}</p>
                </div>
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search campaigns or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount">Highest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Donation List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="receipts">Tax Receipts</TabsTrigger>
          </TabsList>

          {/* Donation List */}
          <TabsContent value="list" className="space-y-4">
            {sortedDonations.map((donation) => (
              <Card key={donation.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={donation.campaign.image}
                      alt={donation.campaign.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {donation.campaign.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            by {donation.campaign.organizer}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            Rs.{donation.amount}
                          </div>
                          <Badge className={getStatusColor(donation.status)}>
                            {getStatusIcon(donation.status)}
                            <span className="ml-1 capitalize">{donation.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(donation.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Payment: {donation.paymentMethod}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>ID: {donation.id}</span>
                        </div>
                      </div>

                      {donation.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 italic">"{donation.message}"</p>
                        </div>
                      )}

                      {donation.impactUpdate && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Impact Update</span>
                          </div>
                          <p className="text-sm text-blue-700">{donation.impactUpdate}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {donation.feesCovered && (
                            <span className="flex items-center space-x-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span>Fees covered</span>
                            </span>
                          )}
                          {donation.isAnonymous && (
                            <span>Anonymous donation</span>
                          )}
                          {donation.taxDeductible && (
                            <span>Tax deductible</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/campaigns/${donation.campaign.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Campaign
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sortedDonations.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || statusFilter !== 'all' || timeFilter !== 'all'
                      ? "Try adjusting your search terms or filters."
                      : "You haven't made any donations yet."}
                  </p>
                  {!searchQuery && statusFilter === 'all' && timeFilter === 'all' && (
                    <Button asChild>
                      <Link to="/campaigns">
                        <Heart className="h-4 w-4 mr-2" />
                        Find Campaigns to Support
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Donation Trends</CardTitle>
                  <CardDescription>Your giving patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Donation trend chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Where your donations have gone</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Health & Medical</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
                        </div>
                        <span className="text-sm text-gray-600">$225</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Education</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }} />
                        </div>
                        <span className="text-sm text-gray-600">$100</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Emergency Relief</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '25%' }} />
                        </div>
                        <span className="text-sm text-gray-600">$275</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Giving Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">$325</div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">$275</div>
                    <div className="text-sm text-gray-600">Last Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">+18%</div>
                    <div className="text-sm text-gray-600">Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Receipts */}
          <TabsContent value="receipts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Year 2024</CardTitle>
                <CardDescription>
                  Download receipts for tax-deductible donations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-green-900">2024 Tax Summary</h4>
                      <p className="text-sm text-green-700">
                        Total tax-deductible donations: ${donations.filter(d => d.taxDeductible).reduce((sum, d) => sum + d.amount, 0)}
                      </p>
                    </div>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download Summary
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {donations.filter(d => d.taxDeductible).map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{donation.campaign.title}</h4>
                            <p className="text-sm text-gray-600">
                              ${donation.amount} • {new Date(donation.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {donation.receiptDownloaded && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DonationHistory;