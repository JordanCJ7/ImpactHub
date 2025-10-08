import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar, 
  Users, 
  DollarSign,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  X,
  Loader2
} from 'lucide-react';
import { campaignService } from '@/services/campaigns';
import { resolveCampaignImageUrl } from '@/lib/imageUtils';

const MyCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'raised', label: 'Most Raised' },
    { value: 'goal', label: 'Highest Goal' },
    { value: 'ending_soon', label: 'Ending Soon' }
  ];

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await campaignService.getMyCampaigns(currentPage, 12);
      
      if (!(res as any).error) {
        const data = (res as any).data?.campaigns || [];
        
        // Filter and sort campaigns client-side for now
        let filteredCampaigns = data;
        
        // Apply search filter
        if (searchQuery.trim()) {
          filteredCampaigns = filteredCampaigns.filter((c: any) =>
            c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
          filteredCampaigns = filteredCampaigns.filter((c: any) => c.status === statusFilter);
        }
        
        // Apply sorting
        filteredCampaigns.sort((a: any, b: any) => {
          switch (sortBy) {
            case 'raised':
              return (b.raised || b.currentAmount || 0) - (a.raised || a.currentAmount || 0);
            case 'goal':
              return (b.goal || b.targetAmount || 0) - (a.goal || a.targetAmount || 0);
            case 'ending_soon':
              const aEnd = new Date(a.endDate || a.endsAt || '2099-12-31').getTime();
              const bEnd = new Date(b.endDate || b.endsAt || '2099-12-31').getTime();
              return aEnd - bEnd;
            default: // recent
              const aDate = new Date(a.createdAt || a.updatedAt || 0).getTime();
              const bDate = new Date(b.createdAt || b.updatedAt || 0).getTime();
              return bDate - aDate;
          }
        });
        
        // Normalize campaigns for UI
        const normalizedCampaigns = filteredCampaigns.map((c: any) => ({
          id: c._id,
          title: c.title,
          description: c.description,
          status: c.status || 'draft',
          raised: c.raised || c.amountRaised || c.currentAmount || 0,
          goal: c.goal || c.target || c.targetAmount || 0,
          donors: c.donorsCount || (c.donations ? c.donations.length : (c.analytics?.donorCount || 0)),
          daysLeft: c.endDate || c.endsAt ? Math.max(0, Math.ceil((new Date(c.endDate || c.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
          image: resolveCampaignImageUrl(c),
          category: c.category,
          createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
          updatedAt: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '',
          engagement: c.engagement || (c.analytics?.views || 0),
          raw: c
        }));
        
        setCampaigns(normalizedCampaigns);
        setPagination((res as any).data?.pagination || { current: 1, pages: 1, total: normalizedCampaigns.length });
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
  <div className="min-h-screen bg-background">
      {/* Header */}
  <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/leader">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage and track all your campaigns.</p>
              </div>
            </div>
            <Button asChild>
              <Link to="/leader/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Campaign
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading campaigns...</span>
              </div>
            ) : (
              <span>
                Showing {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
                {pagination.total > campaigns.length && ` of ${pagination.total}`}
              </span>
            )}
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading campaigns...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters or search terms.' : 'Get started by creating your first campaign.'}
            </p>
            <Button asChild>
              <Link to="/leader/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1 capitalize">{campaign.status}</span>
                    </Badge>
                  </div>
                  {campaign.category && (
                    <Badge className="absolute top-3 right-3 bg-white/95 text-gray-900">
                      {campaign.category}
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{campaign.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">LKR{campaign.raised.toLocaleString()} raised</span>
                        <span className="text-sm text-gray-500">
                          {campaign.status === 'completed' ? 'Goal reached!' : `${campaign.daysLeft} days left`}
                        </span>
                      </div>
                      <Progress value={campaign.goal ? (campaign.raised / campaign.goal) * 100 : 0} className="h-2" />
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Goal: LKR{campaign.goal.toLocaleString()}</span>
                        <span>{campaign.donors} donors</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Created: {campaign.createdAt}</span>
                      <span>Updated: {campaign.updatedAt}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/campaigns/${campaign.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/leader/edit/${campaign.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                if (page > pagination.pages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;