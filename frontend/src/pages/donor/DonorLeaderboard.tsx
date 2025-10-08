import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Users, Calendar, Target } from 'lucide-react';

const DonorLeaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('total-donated');

  const topDonors = [
    {
      rank: 1,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      totalDonated: 12500,
      campaignsSupported: 28,
      impactScore: 98,
      grade: 'Platinum',
      isCurrentUser: false,
      achievements: ['Top Donor', 'Consistent Giver', 'Community Builder']
    },
    {
      rank: 2,
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      totalDonated: 10800,
      campaignsSupported: 24,
      impactScore: 94,
      grade: 'Platinum',
      isCurrentUser: false,
      achievements: ['Major Donor', 'Water Champion', 'Education Supporter']
    },
    {
      rank: 3,
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      totalDonated: 9200,
      campaignsSupported: 31,
      impactScore: 92,
      grade: 'Gold',
      isCurrentUser: false,
      achievements: ['Community Builder', 'Consistent Giver', 'Health Advocate']
    },
    {
      rank: 12,
      name: 'John Donor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      totalDonated: 2450,
      campaignsSupported: 12,
      impactScore: 78,
      grade: 'Gold',
      isCurrentUser: true,
      achievements: ['Consistent Giver', 'Water Champion']
    }
  ];

  const gradeInfo = {
    'Bronze': { color: 'bg-orange-100 text-orange-800', icon: Award, minAmount: 0 },
    'Silver': { color: 'bg-gray-100 text-gray-800', icon: Medal, minAmount: 500 },
    'Gold': { color: 'bg-yellow-100 text-yellow-800', icon: Star, minAmount: 2000 },
    'Platinum': { color: 'bg-purple-100 text-purple-800', icon: Crown, minAmount: 10000 }
  };

  const currentUser = topDonors.find(donor => donor.isCurrentUser);
  const nextGrade = currentUser?.grade === 'Gold' ? 'Platinum' : 'Gold';
  const nextGradeAmount = gradeInfo[nextGrade as keyof typeof gradeInfo]?.minAmount || 0;
  const progressToNext = currentUser ? (currentUser.totalDonated / nextGradeAmount) * 100 : 0;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-4xl font-bold mb-4">Donor Leaderboard</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Celebrating our community of generous donors making a real difference in the world.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All Time</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total-donated">Total Donated</SelectItem>
                      <SelectItem value="campaigns-supported">Campaigns Supported</SelectItem>
                      <SelectItem value="impact-score">Impact Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {topDonors.slice(0, 3).map((donor, index) => {
                const heights = ['h-32', 'h-24', 'h-20'];
                const GradeIcon = gradeInfo[donor.grade as keyof typeof gradeInfo]?.icon || Award;
                
                return (
                  <Card key={donor.rank} className={`relative overflow-hidden ${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                    <CardContent className="text-center p-6">
                      <div className="absolute top-4 left-4">
                        {getRankIcon(donor.rank)}
                      </div>
                      
                      <Avatar className="w-20 h-20 mx-auto mb-4">
                        <AvatarImage src={donor.avatar} alt={donor.name} />
                        <AvatarFallback>{donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-bold text-lg mb-2">{donor.name}</h3>
                      
                      <Badge className={gradeInfo[donor.grade as keyof typeof gradeInfo]?.color}>
                        <GradeIcon className="h-3 w-3 mr-1" />
                        {donor.grade}
                      </Badge>
                      
                      <div className="mt-4 space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          ${donor.totalDonated.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {donor.campaignsSupported} campaigns supported
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Full Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Full Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDonors.map((donor) => {
                    const GradeIcon = gradeInfo[donor.grade as keyof typeof gradeInfo]?.icon || Award;
                    
                    return (
                      <div 
                        key={donor.rank} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          donor.isCurrentUser ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-400' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 flex justify-center">
                            {getRankIcon(donor.rank)}
                          </div>
                          
                          <Avatar>
                            <AvatarImage src={donor.avatar} alt={donor.name} />
                            <AvatarFallback>{donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">
                                {donor.name}
                                {donor.isCurrentUser && <span className="text-indigo-600 ml-2">(You)</span>}
                              </h4>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={gradeInfo[donor.grade as keyof typeof gradeInfo]?.color}>
                                <GradeIcon className="h-3 w-3 mr-1" />
                                {donor.grade}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Impact Score: {donor.impactScore}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            ${donor.totalDonated.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donor.campaignsSupported} campaigns
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Progress */}
            {currentUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-indigo-600" />
                    <span>Your Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">#{currentUser.rank}</div>
                    <div className="text-sm text-gray-600">Current Ranking</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress to {nextGrade}</span>
                      <span className="text-sm text-gray-500">
                        ${currentUser.totalDonated} / ${nextGradeAmount}
                      </span>
                    </div>
                    <Progress value={Math.min(progressToNext, 100)} className="h-2" />
                  </div>
                  
                  <div className="text-center text-sm text-gray-600">
                    ${(nextGradeAmount - currentUser.totalDonated).toLocaleString()} more to reach {nextGrade}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grade System */}
            <Card>
              <CardHeader>
                <CardTitle>Donor Grades</CardTitle>
                <CardDescription>
                  Unlock new grades as your total donations increase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(gradeInfo).map(([grade, info]) => {
                  const Icon = info.icon;
                  const isCurrentGrade = currentUser?.grade === grade;
                  
                  return (
                    <div 
                      key={grade}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isCurrentGrade ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${isCurrentGrade ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${isCurrentGrade ? 'text-indigo-900' : 'text-gray-700'}`}>
                          {grade}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ${info.minAmount.toLocaleString()}+
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Monthly Leaders */}
            <Card>
              <CardHeader>
                <CardTitle>This Month's Leaders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topDonors.slice(0, 3).map((donor, index) => (
                  <div key={donor.rank} className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-gray-600">
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={donor.avatar} alt={donor.name} />
                      <AvatarFallback className="text-xs">
                        {donor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{donor.name}</div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      $450
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorLeaderboard;