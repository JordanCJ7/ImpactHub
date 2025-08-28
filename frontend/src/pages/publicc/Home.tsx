import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Target, Award, ArrowRight, TrendingUp, Globe, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const featuredCampaigns = [
    {
      id: 1,
      title: "Clean Water for Rural Communities",
      description: "Providing clean drinking water access to 10,000 people in remote villages.",
      image: "/images/CleanWater.jpg",
      raised: 75420,
      goal: 100000,
      donors: 1247,
      daysLeft: 23,
      category: "Health"
    },
    {
      id: 2,
      title: "Education for Every Child",
      description: "Building schools and providing educational resources for underprivileged children.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
      raised: 42350,
      goal: 75000,
      donors: 892,
      daysLeft: 45,
      category: "Education"
    },
    {
      id: 3,
      title: "Emergency Food Relief",
      description: "Providing emergency food supplies to families affected by natural disasters.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop",
      raised: 28900,
      goal: 50000,
      donors: 567,
      daysLeft: 12,
      category: "Emergency"
    }
  ];

  const stats = [
    { icon: Heart, label: "Total Raised", value: "$2.4M", color: "text-red-600" },
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
            {featuredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
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
                        <span className="text-sm font-medium text-gray-600">
                          ${campaign.raised.toLocaleString()} raised
                        </span>
                        <span className="text-sm text-gray-500">
                          ${campaign.goal.toLocaleString()} goal
                        </span>
                      </div>
                      <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
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
            ))}
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
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
              <Link to="/campaigns">Browse Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;