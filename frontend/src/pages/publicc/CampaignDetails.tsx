import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Flag, Users, Clock, MapPin, CheckCircle, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';

const CampaignDetails: React.FC = () => {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);

  // Mock campaign data - in real app, fetch based on ID
  const campaign = {
    id: 1,
    title: "Clean Water for Rural Communities",
    description: "Providing clean drinking water access to 10,000 people in remote villages through well construction and water purification systems.",
    image: "/images/CleanWater.jpg",
    raised: 75420,
    goal: 100000,
    donors: 1247,
    daysLeft: 23,
    category: "Health & Medical",
    location: "Thanamalvila , Monaragala",
    organizer: {
      name: "Water for Life Foundation",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      verified: true,
      description: "A non-profit organization dedicated to providing clean water access to underserved communities worldwide.",
      founded: "2015",
      projectsCompleted: 127
    },
    updates: [
      {
        id: 1,
        title: "First Well Successfully Drilled!",
        content: "Great news! We've completed drilling our first well in Kimani village. The water quality tests came back excellent, and the community is already benefiting from clean water access.",
        date: "2024-01-15",
        images: ["https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop"]
      },
      {
        id: 2,
        title: "Solar Pump Installation Progress",
        content: "Our team has installed solar-powered pumps in 3 locations. These sustainable systems will ensure reliable water access even during dry seasons.",
        date: "2024-01-10",
        images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop"]
      }
    ],
    recentDonors: [
      { name: "Kamani W.", amount: 5000, time: "2 hours ago", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face" },
      { name: "Minsara K.", amount: 2500, time: "5 hours ago", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" },
      { name: "Eshini L.", amount: 1500, time: "1 day ago", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face" }
    ]
  };

  const progressPercentage = (campaign.raised / campaign.goal) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" asChild>
            <Link to="/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <Card>
              <div className="relative">
                <img src={campaign.image} alt={campaign.title} className="w-full h-64 md:h-80 object-cover rounded-t-lg" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-green-600 text-white">Verified</Badge>
                  <Badge className="bg-blue-600 text-white">{campaign.category}</Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl mb-2">{campaign.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{campaign.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{campaign.daysLeft} days left</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? 'text-red-600' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Campaign Details Tabs */}
            <Card>
              <Tabs defaultValue="story" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="story">Story</TabsTrigger>
                    <TabsTrigger value="updates">Updates ({campaign.updates.length})</TabsTrigger>
                    <TabsTrigger value="donors">Donors ({campaign.donors})</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <CardContent>
                  <TabsContent value="story" className="space-y-6">
                    <div className="prose max-w-none">
                      <p className="text-lg text-gray-700 mb-6">{campaign.description}</p>
                      
                      <h3 className="text-xl font-semibold mb-4">About This Campaign</h3>
                      <p className="text-gray-700 mb-4">
                        Access to clean water is a fundamental human right, yet millions of people in rural communities 
                        still lack this basic necessity. Our comprehensive water project aims to transform the lives of 
                        10,000 people across 15 remote villages in Thanamalvila.
                      </p>
                      
                      <h4 className="text-lg font-semibold mb-3">Our Approach:</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                        <li>Drilling deep water wells in strategic locations</li>
                        <li>Installing solar-powered water pumps</li>
                        <li>Building water storage and distribution systems</li>
                        <li>Training local technicians for maintenance</li>
                        <li>Establishing community water committees</li>
                      </ul>
                      
                      <h4 className="text-lg font-semibold mb-3">Expected Impact:</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>10,000 people will have access to clean water within 500 meters of their homes</li>
                        <li>2,500 children will have more time for education</li>
                        <li>40% reduction in waterborne diseases</li>
                        <li>Economic opportunities through saved time and improved health</li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="updates" className="space-y-6">
                    {campaign.updates.map((update) => (
                      <div key={update.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{update.date}</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-3">{update.title}</h4>
                        <p className="text-gray-700 mb-4">{update.content}</p>
                        {update.images.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {update.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Update ${update.id} image ${index + 1}`}
                                className="rounded-lg w-full h-48 object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="donors" className="space-y-4">
                    {campaign.recentDonors.map((donor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={donor.avatar} alt={donor.name} />
                            <AvatarFallback>{donor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{donor.name}</div>
                            <div className="text-sm text-gray-500">{donor.time}</div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          LKR {donor.amount}
                        </div>
                      </div>
                    ))}
                    <div className="text-center py-4">
                      <Button variant="outline">View All Donors</Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <div className="text-3xl font-bold text-gray-900">
                  LKR {campaign.raised.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  raised of LKR {campaign.goal.toLocaleString()} goal
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{Math.round(progressPercentage)}% funded</span>
                  <span>{campaign.daysLeft} days left</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{campaign.donors}</div>
                    <div className="text-sm text-gray-600">donors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{campaign.daysLeft}</div>
                    <div className="text-sm text-gray-600">days left</div>
                  </div>
                </div>
                
                <Separator />
                
                <Button asChild className="w-full" size="lg">
                  <Link to={`/donate/${campaign.id}`}>
                    Donate Now
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Campaign
                </Button>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarImage src={campaign.organizer.avatar} alt={campaign.organizer.name} />
                    <AvatarFallback>{campaign.organizer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{campaign.organizer.name}</h4>
                      {campaign.organizer.verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{campaign.organizer.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>Founded {campaign.organizer.founded}</span>
                      <span>{campaign.organizer.projectsCompleted} projects completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;