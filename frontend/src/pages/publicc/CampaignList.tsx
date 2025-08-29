import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Filter, Heart, Users, Clock, ArrowRight, MapPin } from 'lucide-react';

const CampaignList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'education', label: 'Education' },
    { value: 'environment', label: 'Environment' },
    { value: 'emergency', label: 'Emergency Relief' },
    { value: 'animals', label: 'Animals & Wildlife' },
    { value: 'community', label: 'Community Development' },
    { value: 'children', label: 'Children & Youth' }
  ];

  const campaigns = [
    {
      id: 1,
      title: "Clean Water for Rural Communities",
      description: "Providing clean drinking water access to 10,000 people in remote villages through well construction and water purification systems.",
      image: "/images/CleanWater.jpg",
      raised: 75420,
      goal: 100000,
      donors: 1247,
      daysLeft: 23,
      category: "health",
      location: "Thanamalvila , Monaragala",
      featured: true,
      urgent: false
    },
    {
      id: 2,
      title: "Education for Every Child",
      description: "Building schools and providing educational resources for underprivileged children in rural areas.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
      raised: 42350,
      goal: 75000,
      donors: 892,
      daysLeft: 45,
      category: "education",
      location: "Ambalangoda",
      featured: false,
      urgent: false
    },
    {
      id: 3,
      title: "Emergency Food Relief",
      description: "Providing emergency food supplies to families affected by natural disasters and economic hardship.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop",
      raised: 28900,
      goal: 50000,
      donors: 567,
      daysLeft: 12,
      category: "emergency",
      location: "Yapanaya",
      featured: false,
      urgent: true
    },
    {
      id: 4,
      title: "Save the Rainforest",
      description: "Protecting endangered rainforest ecosystems and supporting local conservation efforts.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop",
      raised: 89250,
      goal: 120000,
      donors: 2156,
      daysLeft: 67,
      category: "environment",
      location: "Anuradhapura",
      featured: true,
      urgent: false
    },
    {
      id: 5,
      title: "Animal Shelter Support",
      description: "Supporting local animal shelters with food, medical care, and facility improvements.",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=250&fit=crop",
      raised: 15680,
      goal: 30000,
      donors: 334,
      daysLeft: 89,
      category: "animals",
      location: "Ratnapura",
      featured: false,
      urgent: false
    },
    {
      id: 6,
      title: "Community Health Clinic",
      description: "Establishing a community health clinic to provide basic healthcare services in underserved areas.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
      raised: 67890,
      goal: 95000,
      donors: 1543,
      daysLeft: 34,
      category: "health",
      location: "Polonnaruwa, Sri Lanka",
      featured: false,
      urgent: false
    }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'raised':
        return b.raised - a.raised;
      case 'goal':
        return b.goal - a.goal;
      case 'donors':
        return b.donors - a.donors;
      case 'ending':
        return a.daysLeft - b.daysLeft;
      default:
        return b.id - a.id; // most recent first
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Discover <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Campaigns</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse through thousands of verified campaigns and find causes that matter to you. Every donation makes a difference.
            </p>
          </div>

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

            <div className="text-center text-gray-600">
              Showing {sortedCampaigns.length} of {campaigns.length} campaigns
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative">
                  <img
                    src={campaign.image}
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
                  <Badge className="absolute top-3 right-3 bg-white text-gray-900 capitalize">
                    {categories.find(cat => cat.value === campaign.category)?.label.split(' ')[0]}
                  </Badge>
                </div>
                
                <CardHeader>
                  <div className="flex items-start space-x-2 text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{campaign.location}</span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{campaign.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          LKR {campaign.raised.toLocaleString()} raised
                        </span>
                        <span className="text-sm text-gray-500">
                          LKR {campaign.goal.toLocaleString()} goal
                        </span>
                      </div>
                      <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{campaign.donors} donors</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{campaign.daysLeft} days left</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/campaigns/${campaign.id}`}>
                          View Campaign
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find more campaigns.
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CampaignList;