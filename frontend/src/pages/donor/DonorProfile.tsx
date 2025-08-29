import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, MapPin, Camera, Bell, Shield, CreditCard, Award, Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService, donationService, analyticsService } from '@/services';

const DonorProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    campaignsSupported: 0,
    donorLevel: 'Bronze'
  });
  const [donationHistory, setDonationHistory] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    joinDate: '',
    avatar: ''
  });

  const [notifications, setNotifications] = useState({
    campaignUpdates: true,
    donationReceipts: true,
    monthlyReports: true,
    newCampaigns: false,
    marketing: false
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showDonations: false,
    showLeaderboard: true
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch updated user profile
        const userResponse = await authService.getCurrentUser();
        
        if (userResponse.data) {
          const userData = userResponse.data;
          
          const newProfile = {
            firstName: (userData.name || '').split(' ')[0] || '',
            lastName: (userData.name || '').split(' ').slice(1).join(' ') || '',
            email: userData.email || '',
            phone: userData.profile?.phone || '',
            bio: userData.profile?.bio || '',
            location: userData.profile?.address ? 
              `${userData.profile.address.city}, ${userData.profile.address.country}` : '',
            joinDate: new Date(userData.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            }),
            avatar: userData.avatar || ''
          };
          
          setProfile(newProfile);

          // Update notifications from user preferences
          if (userData.preferences) {
            setNotifications({
              campaignUpdates: userData.preferences.emailNotifications,
              donationReceipts: userData.preferences.emailNotifications,
              monthlyReports: userData.preferences.emailNotifications,
              newCampaigns: userData.preferences.emailNotifications,
              marketing: false
            });
          }

          // Set user stats
          setUserStats(userData.stats);
        }

        // Fetch donation history
        const donationsResponse = await donationService.getMyDonations({ limit: 10 });
        if (donationsResponse.data) {
          setDonationHistory(donationsResponse.data.donations || []);
        }

        // Fetch user analytics/stats
        const analyticsResponse = await analyticsService.getUserAnalytics();
        if (analyticsResponse.data && analyticsResponse.data.overview) {
          setStats({
            totalDonated: analyticsResponse.data.overview.totalDonated || 0,
            donationCount: analyticsResponse.data.overview.donationCount || 0,
            campaignsSupported: analyticsResponse.data.overview.campaignsSupported || 0,
            donorLevel: analyticsResponse.data.overview.donorLevel || 'Bronze'
          });
        }

        // Set mock payment methods (since we don't have this API yet)
        setPaymentMethods([
          {
            id: 1,
            type: 'Visa',
            lastFour: '4242',
            isDefault: true
          },
          {
            id: 2,
            type: 'Mastercard',
            lastFour: '5555',
            isDefault: false
          }
        ]);

      } catch (error) {
        console.error('Failed to fetch user data:', error);
        console.error('Error details:', error.response || error.message || error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Generate achievements based on real user stats
  const generateAchievements = () => {
    if (!userStats) return [];
    
    const achievements = [];
    
    // First Donation
    if (userStats.donationCount > 0) {
      achievements.push({
        title: "First Donation",
        description: "Made your first donation",
        date: "Completed",
        earned: true
      });
    }

    // Consistent Giver
    if (userStats.donationCount >= 3) {
      achievements.push({
        title: "Consistent Giver",
        description: "Made multiple donations",
        date: "Completed",
        earned: true
      });
    }

    // Community Builder
    if (userStats.campaignsSupported >= 5) {
      achievements.push({
        title: "Community Builder",
        description: "Supported 5+ different campaigns",
        date: "Completed",
        earned: true
      });
    }

    // Major Donor
    if (userStats.totalDonated >= 10000) {
      achievements.push({
        title: "Major Donor",
        description: "Donated over LKR 10,000",
        date: "Completed",
        earned: true
      });
    }

    // Add pending achievements
    if (userStats.campaignsSupported < 10) {
      achievements.push({
        title: "Campaign Champion",
        description: "Support 10 different campaigns",
        date: null,
        earned: false
      });
    }

    if (userStats.totalDonated < 50000) {
      achievements.push({
        title: "Platinum Donor",
        description: "Donate over LKR 50,000",
        date: null,
        earned: false
      });
    }

    return achievements;
  };

  const achievements = generateAchievements();

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Update profile data
      const updateData = {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email, // Add email to updateData
        profile: {
          bio: profile.bio,
          phone: profile.phone,
          address: {
            city: profile.location.split(',')[0]?.trim() || '',
            country: profile.location.split(',')[1]?.trim() || ''
          }
        },
        preferences: {
          emailNotifications: notifications.campaignUpdates,
          smsNotifications: false,
          currency: 'LKR',
          language: 'en',
          preferredCategories: [],
          donationPrivacy: 'public'
        }
      };

      const response = await authService.updateProfile(updateData, profile.email);
      
      if (response.data) {
        updateUser(response.data);
        setIsEditing(false);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Alert */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <Button 
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            {/* User Statistics */}
            {userStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Impact</CardTitle>
                  <CardDescription>
                    See the difference you've made through your donations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        LKR {userStats.totalDonated?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-600">Total Donated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {userStats.donationCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Donations Made</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {userStats.campaignsSupported || 0}
                      </div>
                      <div className="text-sm text-gray-600">Campaigns Supported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {userStats.donorLevel || 'Bronze'}
                      </div>
                      <div className="text-sm text-gray-600">Donor Level</div>
                    </div>
                  </div>
                  {userStats.impactPoints > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-indigo-600">
                          {userStats.impactPoints} Impact Points
                        </div>
                        <div className="text-sm text-gray-600">
                          Member since {profile.joinDate}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your account details and profile information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                    <AvatarFallback className="text-2xl">
                      {(profile.firstName || 'U').charAt(0)}{(profile.lastName || 'S').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" disabled={!isEditing}>
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive updates and communications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="campaignUpdates">Campaign Updates</Label>
                      <p className="text-sm text-gray-500">Get notified about progress on campaigns you support</p>
                    </div>
                    <Switch
                      id="campaignUpdates"
                      checked={notifications.campaignUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, campaignUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="donationReceipts">Donation Receipts</Label>
                      <p className="text-sm text-gray-500">Receive email receipts for your donations</p>
                    </div>
                    <Switch
                      id="donationReceipts"
                      checked={notifications.donationReceipts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, donationReceipts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="monthlyReports">Monthly Impact Reports</Label>
                      <p className="text-sm text-gray-500">Monthly summary of your donation impact</p>
                    </div>
                    <Switch
                      id="monthlyReports"
                      checked={notifications.monthlyReports}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, monthlyReports: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newCampaigns">New Campaign Recommendations</Label>
                      <p className="text-sm text-gray-500">Discover new campaigns that match your interests</p>
                    </div>
                    <Switch
                      id="newCampaigns"
                      checked={notifications.newCampaigns}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newCampaigns: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Marketing Communications</Label>
                      <p className="text-sm text-gray-500">Platform updates, feature announcements, and tips</p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control what information is visible to others.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showProfile">Public Profile</Label>
                      <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                    </div>
                    <Switch
                      id="showProfile"
                      checked={privacy.showProfile}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showProfile: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showDonations">Show Donation History</Label>
                      <p className="text-sm text-gray-500">Display your donation amounts publicly</p>
                    </div>
                    <Switch
                      id="showDonations"
                      checked={privacy.showDonations}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showDonations: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showLeaderboard">Appear on Leaderboard</Label>
                      <p className="text-sm text-gray-500">Show your ranking on donor leaderboards</p>
                    </div>
                    <Switch
                      id="showLeaderboard"
                      checked={privacy.showLeaderboard}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showLeaderboard: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your saved payment methods for faster donations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {method.brand} ending in {method.last4}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {method.expiry}
                          {method.isDefault && <Badge className="ml-2">Default</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="space-x-2">
                      {!method.isDefault && (
                        <Button variant="outline" size="sm">Set as Default</Button>
                      )}
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Add New Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Recent Donations */}
            {donationHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>
                    Your latest contributions to campaigns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donationHistory.slice(0, 5).map((donation) => (
                      <div key={donation._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{donation.campaign.title}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(donation.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            LKR {donation.amount.toLocaleString()}
                          </div>
                          <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                            {donation.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>
                  Track your milestones and unlock new badges as you make an impact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Donation Achievement */}
                  <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
                    stats.donationCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Award className={`h-6 w-6 mt-1 ${stats.donationCount > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold">First Donor</h4>
                      <p className="text-sm text-gray-600 mb-2">Make your first donation to any campaign</p>
                      {stats.donationCount > 0 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Earned</Badge>
                      )}
                    </div>
                  </div>

                  {/* Regular Supporter Achievement */}
                  <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
                    stats.donationCount >= 5 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Award className={`h-6 w-6 mt-1 ${stats.donationCount >= 5 ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold">Regular Supporter</h4>
                      <p className="text-sm text-gray-600 mb-2">Make 5 or more donations ({stats.donationCount}/5)</p>
                      {stats.donationCount >= 5 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline">Progress: {stats.donationCount}/5</Badge>
                      )}
                    </div>
                  </div>

                  {/* Generous Donor Achievement */}
                  <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
                    stats.totalDonated >= 10000 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Award className={`h-6 w-6 mt-1 ${stats.totalDonated >= 10000 ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold">Generous Donor</h4>
                      <p className="text-sm text-gray-600 mb-2">Donate LKR 10,000 or more in total</p>
                      {stats.totalDonated >= 10000 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline">Progress: LKR {stats.totalDonated.toLocaleString()}/10,000</Badge>
                      )}
                    </div>
                  </div>

                  {/* Campaign Supporter Achievement */}
                  <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
                    stats.campaignsSupported >= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Award className={`h-6 w-6 mt-1 ${stats.campaignsSupported >= 3 ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold">Campaign Supporter</h4>
                      <p className="text-sm text-gray-600 mb-2">Support 3 different campaigns ({stats.campaignsSupported}/3)</p>
                      {stats.campaignsSupported >= 3 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline">Progress: {stats.campaignsSupported}/3</Badge>
                      )}
                    </div>
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

export default DonorProfile;