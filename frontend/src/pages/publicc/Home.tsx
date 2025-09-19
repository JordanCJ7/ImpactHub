import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Target, Award, ArrowRight, TrendingUp, Globe, Shield } from 'lucide-react';
import { campaignService } from '@/services/campaigns';
import { resolveCampaignImageUrl } from '@/lib/imageUtils';

const Home: React.FC = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadFeatured = async () => {
      setLoadingFeatured(true);
      try {
        // Prefer a random endpoint if available
        let res: any;
        if ((campaignService as any).getRandomCampaigns) {
          res = await (campaignService as any).getRandomCampaigns(3);
        } else if ((campaignService as any).getCampaigns) {
          // fallback: fetch a page of campaigns and pick 3 at random
          const allRes = await (campaignService as any).getCampaigns({ page: 1, limit: 20 });
          const list = (allRes && allRes.data && (allRes.data.campaigns || allRes.data)) || [];
          // shuffle and slice
          for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
          }
          res = { data: { campaigns: list.slice(0, 3) } };
        }

        const campaigns = (res && res.data && (res.data.campaigns || res.data)) || [];
        if (!mounted) return;
        // Normalize shape and resolve images
        const normalized = campaigns.slice(0, 3).map((c: any) => ({
          id: c._id || c.id,
          title: c.title,
          description: c.description || c.summary || '',
          image: resolveCampaignImageUrl(c) || c.image || '',
          raised: c.amountRaised || c.raised || c.currentAmount || 0,
          goal: c.goal || c.target || c.targetAmount || 0,
          donors: c.donorsCount || (c.donations ? c.donations.length : 0),
          daysLeft: c.endDate ? Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
          category: c.category || (c.tags && c.tags[0]) || 'General'
        }));
        setFeaturedCampaigns(normalized);
      } catch (err) {
        console.error('Failed loading featured campaigns', err);
        setFeaturedCampaigns([]);
      } finally {
        if (mounted) setLoadingFeatured(false);
      }
    };
    loadFeatured();
    return () => { mounted = false; };
  }, []);

  const stats = [
    { icon: Heart, label: "Total Raised", value: "LKR 2.4M", color: "text-red-600" },
    { icon: Users, label: "Active Donors", value: "15K+", color: "text-blue-600" },
    { icon: Target, label: "Campaigns Funded", value: "324", color: "text-green-600" },
    { icon: Globe, label: "Countries Reached", value: "42", color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Make a <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Difference</span> Today
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of donors making an impact worldwide. Every contribution matters, every story counts.
            </p>
            
            {/* Role-based Login Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                <Link to="/login?role=donor">
                  <Heart className="mr-2 h-5 w-5" />
                  Login as Donor
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login?role=campaign-leader">
                  <Target className="mr-2 h-5 w-5" />
                  Campaign Leader
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login?role=admin">
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Portal
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg mb-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Campaigns
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover campaigns that are making a real impact in communities around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loadingFeatured ? (
              <div className="col-span-3 text-center py-10">Loading featured campaigns...</div>
            ) : featuredCampaigns && featuredCampaigns.length > 0 ? (
              featuredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    {campaign.image ? (
                      <img src={campaign.image} alt={campaign.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {campaign.title ? campaign.title.substring(0, 2).toUpperCase() : 'CA'}
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-white text-gray-900">
                      {campaign.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">LKR {campaign.raised.toLocaleString()} raised</span>
                          <span className="text-sm text-gray-500">LKR{campaign.goal.toLocaleString()} goal</span>
                        </div>
                        <Progress value={(campaign.raised / (campaign.goal || 1)) * 100} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{campaign.donors} donors</span>
                        <span>{campaign.daysLeft} days left</span>
                      </div>
                      <Button asChild className="w-full">
                        <Link to={`/campaigns/${campaign.id}`}>
                          View Campaign
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">No featured campaigns available.</div>
            )}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/campaigns">
                View All Campaigns
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Making a difference is simple. Follow these easy steps to start your impact journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-6">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Discover Campaigns</h3>
              <p className="text-gray-600">
                Browse through verified campaigns and find causes that resonate with your values and interests.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-6">
                <Heart className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Make a Donation</h3>
              <p className="text-gray-600">
                Choose your donation amount and make secure payments. Every contribution, big or small, makes a difference.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-6">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Impact</h3>
              <p className="text-gray-600">
                Receive regular updates on your donations and see the real-world impact of your generosity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join our community of changemakers and start your impact journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              <Link to="/register" className="flex items-center">
                Start Donating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white text-indigo-600 hover:bg-gray-100">
              <Link to="/campaigns">Browse Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;