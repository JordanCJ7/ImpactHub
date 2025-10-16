import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Users, Calendar, Target, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

interface LeaderboardDonor {
  _id: string;
  name: string;
  avatar?: string;
  totalDonated: number;
  campaignsSupported: number;
  donorLevel: string;
  rank?: number;
  isCurrentUser?: boolean;
}

const DonorLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('total-donated');
  const [loading, setLoading] = useState(true);
  const [topDonors, setTopDonors] = useState<LeaderboardDonor[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<LeaderboardDonor | null>(null);

  // Load leaderboard data
  useEffect(() => {
    loadLeaderboard();
  }, [timeframe, category]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      // Fetch top donors from the public leaderboard endpoint
      const response = await apiService.get('/users/leaderboard?limit=50');
      
      if (response.data && response.data.leaderboard) {
        const donors: LeaderboardDonor[] = response.data.leaderboard.map((donor: any) => ({
          ...donor,
          isCurrentUser: user?._id === donor._id
        }));

        setTopDonors(donors);
        
        // Find current user in the list
        const currentUser = donors.find(d => d.isCurrentUser);
        setCurrentUserStats(currentUser || null);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      // Set empty array on error so UI shows "no donors found" message
      setTopDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const gradeInfo = {
    'Bronze': { color: 'bg-orange-100 text-orange-800', icon: Award, minAmount: 0 },
    'Silver': { color: 'bg-gray-100 text-gray-800', icon: Medal, minAmount: 5000 },
    'Gold': { color: 'bg-yellow-100 text-yellow-800', icon: Star, minAmount: 20000 },
    'Platinum': { color: 'bg-purple-100 text-purple-800', icon: Crown, minAmount: 100000 }
  };

  const currentUser = currentUserStats;
  const nextGrade = currentUser?.donorLevel === 'Bronze' ? 'Silver' : 
                    currentUser?.donorLevel === 'Silver' ? 'Gold' : 
                    currentUser?.donorLevel === 'Gold' ? 'Platinum' : 'Platinum';
  const nextGradeAmount = gradeInfo[nextGrade as keyof typeof gradeInfo]?.minAmount || 0;
  const progressToNext = currentUser && nextGradeAmount > 0 ? Math.min((currentUser.totalDonated / nextGradeAmount) * 100, 100) : 0;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />;
  return <span className="text-lg font-bold text-gray-600 dark:text-gray-300">#{rank}</span>;
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

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      ) : (
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
                const GradeIcon = gradeInfo[donor.donorLevel as keyof typeof gradeInfo]?.icon || Award;
                
                return (
                  <Card key={donor.rank} className={`relative overflow-hidden ${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                    <CardContent className="text-center p-6">
                      <div className="absolute top-4 left-4">
                        {getRankIcon(donor.rank || 0)}
                      </div>
                      
                      <Avatar className="w-20 h-20 mx-auto mb-4">
                        <AvatarImage src={donor.avatar} alt={donor.name} />
                        <AvatarFallback>{donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-bold text-lg mb-2">{donor.name}</h3>
                      
                      <Badge className={gradeInfo[donor.donorLevel as keyof typeof gradeInfo]?.color}>
                        <GradeIcon className="h-3 w-3 mr-1" />
                        {donor.donorLevel}
                      </Badge>
                      
                      <div className="mt-4 space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          LKR {donor.totalDonated.toLocaleString()}
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
                  {topDonors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No donors found. Be the first to make a donation!
                    </div>
                  ) : (
                    topDonors.map((donor) => {
                      const GradeIcon = gradeInfo[donor.donorLevel as keyof typeof gradeInfo]?.icon || Award;
                      
                      return (
                        <div 
                          key={donor._id} 
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            donor.isCurrentUser ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-400' : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 flex justify-center">
                              {getRankIcon(donor.rank || 0)}
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
                                <Badge className={gradeInfo[donor.donorLevel as keyof typeof gradeInfo]?.color}>
                                  <GradeIcon className="h-3 w-3 mr-1" />
                                  {donor.donorLevel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              LKR {donor.totalDonated.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {donor.campaignsSupported} campaigns
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                        LKR {currentUser.totalDonated.toLocaleString()} / LKR {nextGradeAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={Math.min(progressToNext, 100)} className="h-2" />
                  </div>
                  
                  {currentUser.donorLevel !== 'Platinum' && (
                    <div className="text-center text-sm text-gray-600">
                      LKR {(nextGradeAmount - currentUser.totalDonated).toLocaleString()} more to reach {nextGrade}
                    </div>
                  )}
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
                  const isCurrentGrade = currentUser?.donorLevel === grade;
                  
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
                        LKR {info.minAmount.toLocaleString()}+
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
                  <div key={donor._id} className="flex items-center space-x-3">
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
                      LKR {donor.totalDonated.toLocaleString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default DonorLeaderboard;