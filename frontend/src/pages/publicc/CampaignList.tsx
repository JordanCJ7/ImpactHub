import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Filter, Users, Clock, ArrowRight, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { campaignService, type Campaign } from '@/services/campaigns';
import { resolveCampaignImageUrl } from '@/lib/imageUtils';
import { useAuth } from '@/contexts/AuthContext';
import Section from '@/components/common/Section';

const CampaignList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // like button removed for CampaignList (handled in other pages)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Health & Medical', label: 'Health & Medical' },
    { value: 'Education', label: 'Education' },
    { value: 'Environment', label: 'Environment' },
    { value: 'Emergency Relief', label: 'Emergency Relief' },
    { value: 'Animals & Wildlife', label: 'Animals & Wildlife' },
    { value: 'Community Development', label: 'Community Development' },
    { value: 'Children & Youth', label: 'Children & Youth' },
    { value: 'Arts & Culture', label: 'Arts & Culture' },
    { value: 'Sports & Recreation', label: 'Sports & Recreation' },
    { value: 'Technology', label: 'Technology' }
  ];

  // Fetch campaigns data
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      
      if (searchQuery.trim()) {
        // Search campaigns
        result = await campaignService.searchCampaigns(searchQuery, {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sortBy: sortBy as 'recent' | 'goal' | 'raised' | 'ending_soon',
          page: pagination.current,
          limit: 12
        });
      } else {
        // Get campaigns with filters
        result = await campaignService.getCampaigns({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sortBy: sortBy as 'recent' | 'goal' | 'raised' | 'ending_soon',
          page: pagination.current,
          limit: 12
        });
      }

      if (result.error) {
        setError(result.error);
        setCampaigns([]);
      } else if (result.data) {
        const fetched = result.data.campaigns || [];
        // Use server-provided analytics.liked directly (no localStorage fallback)
        const initialized = fetched.map((c: Campaign) => ({
          ...c,
          analytics: {
            ...(c.analytics || {}),
            liked: (c.analytics as any)?.liked || false
          }
        }));

        setCampaigns(initialized);
        setPagination(result.data.pagination || { current: 1, pages: 1, total: 0 });

        // If user is authenticated but no campaigns have liked flags from server, retry once after a short delay
        if (user && initialized.length > 0 && !initialized.some(c => typeof (c.analytics as any)?.liked !== 'undefined')) {
          setTimeout(() => {
            fetchCampaigns();
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch campaigns on component mount and when filters change
  const { user, loading: authLoading } = useAuth();
  useEffect(() => {
    // Wait for auth to finish loading before fetching to ensure proper Authorization headers
    if (!authLoading) {
      fetchCampaigns();
    }
  }, [selectedCategory, sortBy, pagination.current, user, authLoading]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
        fetchCampaigns();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper function to calculate days left
  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Helper function to calculate progress percentage
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to get location string
  const getLocationString = (location: Campaign['location']) => {
    if (!location) return '';
    
    // Handle both object format and string format
    if (typeof location === 'string') {
      return location;
    } else if (typeof location === 'object') {
      const parts = [location.city, location.state, location.country].filter(Boolean);
      return parts.join(', ');
    }
    
    return '';
  };

  // Helper function to get campaign image
  const getCampaignImage = (campaign: Campaign) => {
    return resolveCampaignImageUrl(campaign);
  };

  // Toggle like handler - relies on server state only
  // like toggle handler removed — liking is handled on CampaignDetails/DonorDashboard

  return (
    <>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <Section
        className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900"
        title={<>
          Discover <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Campaigns</span>
        </> as unknown as string}
        subtitle="Browse through thousands of verified campaigns and find causes that matter to you. Every donation makes a difference."
        center
      >

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="raised">Most Raised</SelectItem>
                  <SelectItem value="donors">Most Donors</SelectItem>
                  <SelectItem value="ending">Ending Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-center text-gray-600 dark:text-gray-300">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading campaigns...</span>
                </div>
              ) : (
                <span>
                  Showing {campaigns.length} of {pagination.total} campaigns
                  {pagination.pages > 1 && ` (Page ${pagination.current} of ${pagination.pages})`}
                </span>
              )}
            </div>
          </div>
      </Section>

      {/* Campaign Grid */}
      <Section>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-300">Loading campaigns...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load campaigns</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <Button onClick={fetchCampaigns}>
                Try Again
              </Button>
            </div>
          )}

          {/* Campaign Grid */}
          {!loading && !error && campaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.map((campaign, idx) => (
                  <Card key={campaign._id} className={`overflow-hidden hover:shadow-md transition-shadow duration-200 animate-in fade-in-50 slide-in-from-bottom-4`} style={{ animationDelay: `${Math.min(idx, 6) * 60}ms` }}>
                  <div className="relative">
                    <img
                      src={getCampaignImage(campaign)}
                      alt={campaign.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {campaign.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          Featured
                        </Badge>
                      )}
                      {campaign.urgent && (
                        <Badge className="bg-red-500 text-white">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <Badge className="absolute top-3 right-3 bg-white text-gray-900 dark:text-gray-900 capitalize">
                      {campaign.category}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start space-x-2 text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>{getLocationString(campaign.location)}</span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{campaign.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                            {formatCurrency(campaign.raised)} raised
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(campaign.goal)} goal
                          </span>
                        </div>
                        <Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{campaign.analytics?.donorCount || 0} donors</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{getDaysLeft(campaign.endDate)} days left</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button asChild className="flex-1" variant="primaryGradient">
                          <Link to={`/campaigns/${campaign._id}`}>
                            View Campaign
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="primaryGradient">
                          <Link to={`/donate/${campaign._id}`}>
                            Donate
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && campaigns.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search terms or filters to find more campaigns.'
                  : 'No campaigns are currently available. Check back soon!'
                }
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && campaigns.length > 0 && pagination.pages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                  disabled={pagination.current <= 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.current ? "default" : "outline"}
                    onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  disabled={pagination.current >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </Section>
    </div>
    </>
  );
};

export default CampaignList;