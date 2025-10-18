import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveImageUrl } from '@/lib/imageUtils';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, MapPin, Camera, Bell, Shield, Target, Award, Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService, campaignService, analyticsService } from '@/services';

const LeaderProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({
    totalRaised: 0,
    campaignCount: 0,
    activeCampaigns: 0,
    leaderLevel: 'Rising Star'
  });

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    organizationName: '',
    organizationEmail: '',
    joinDate: '',
    avatar: ''
  });

  const [notifications, setNotifications] = useState({
    campaignUpdates: true,
    donationAlerts: true,
    monthlyReports: true,
    systemUpdates: true,
    marketing: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showDonations: true
  });

  const [campaignHistory, setCampaignHistory] = useState<any[]>([]);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile
      if (user) {
        setProfile({
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: user.profile?.phone || '',
          bio: user.profile?.bio || '',
          location: user.profile?.address ? `${user.profile.address.city || ''}, ${user.profile.address.state || ''}, ${user.profile.address.country || ''}`.replace(/^, |, $/, '') : '',
          organizationName: user.profile?.organization?.name || '',
          organizationEmail: user.profile?.organization?.email || '',
          joinDate: new Date(user.profile?.dateOfBirth || Date.now()).toLocaleDateString(),
          avatar: user.avatar || ''
        });
      }

      // Load campaign statistics (placeholder for now)
      setStats({
        totalRaised: 15000,
        campaignCount: 3,
        activeCampaigns: 2,
        leaderLevel: 'Rising Star'
      });

      // Load campaign history from API for this leader
      try {
        const myCampaignsRes = await campaignService.getMyCampaigns(1, 20);
        if (!myCampaignsRes.error && myCampaignsRes.data && Array.isArray(myCampaignsRes.data.campaigns)) {
          setCampaignHistory(myCampaignsRes.data.campaigns);
          setStats(prev => ({
            ...prev,
            totalRaised: myCampaignsRes.data.campaigns.reduce((acc: number, c: any) => acc + (c.raised || 0), 0),
            campaignCount: myCampaignsRes.data.campaigns.length,
            activeCampaigns: myCampaignsRes.data.campaigns.filter((c: any) => c.status === 'active').length
          }));
        } else {
          // fallback to empty
          setCampaignHistory([]);
        }
      } catch (campErr) {
        console.error('Failed to load leader campaigns:', campErr);
        setCampaignHistory([]);
      }

    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);

      // Structure the data correctly for the backend
      const updateData = {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        profile: {
          bio: profile.bio,
          phone: profile.phone,
          address: {
            city: profile.location.split(',')[0]?.trim() || '',
            state: profile.location.split(',')[1]?.trim() || '',
            country: profile.location.split(',')[2]?.trim() || ''
          },
          organization: {
            name: profile.organizationName,
            email: profile.organizationEmail
          }
        }
      };

      // Use the auth/me endpoint instead of users/profile/:email for consistency
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state and global user context
        updateUser(data.user);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, GIF).');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError(null);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload avatar using fetch directly since we need to send FormData
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Update the profile state with new avatar URL
        setProfile(prev => ({ ...prev, avatar: data.avatar }));
        
        // Fetch updated user data to get the base64 avatar
        try {
          const userResponse = await authService.getCurrentUser();
          if (userResponse.data) {
            updateUser(userResponse.data);
          }
        } catch (userError) {
          console.error('Failed to fetch updated user data:', userError);
          // Fallback: just update the avatar field
          if (user) {
            updateUser({ ...user, avatar: data.avatar });
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'New Leader': return 'bg-gray-100 text-gray-800';
      case 'Rising Star': return 'bg-blue-100 text-blue-800';
      case 'Champion': return 'bg-green-100 text-green-800';
      case 'Hero': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Campaign Leader Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and campaign settings</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Overview Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={profile.avatar ? resolveImageUrl(profile.avatar) : undefined} 
                    alt={`${profile.firstName} ${profile.lastName}`} 
                  />
                  <AvatarFallback className="text-lg">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={triggerFileInput}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getLevelBadgeColor(stats.leaderLevel)}>
                    {stats.leaderLevel}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Campaign Leader since {profile.joinDate}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold text-foreground">LKR {stats.totalRaised.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold text-foreground">{stats.campaignCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Leader Level</p>
                  <p className="text-lg font-bold text-foreground">{stats.leaderLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and organization information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="City, State, Country"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Organization Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={profile.organizationName}
                      onChange={(e) => setProfile(prev => ({ ...prev, organizationName: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Your organization or charity name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationEmail">Organization Email</Label>
                    <Input
                      id="organizationEmail"
                      type="email"
                      value={profile.organizationEmail}
                      onChange={(e) => setProfile(prev => ({ ...prev, organizationEmail: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Organization contact email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Tell supporters about yourself and your mission..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign History</CardTitle>
                <CardDescription>
                  View all your campaigns and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignHistory.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                        <p className="text-sm text-muted-foreground">Created on {new Date(campaign.date).toLocaleDateString()}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            LKR {campaign.raised.toLocaleString()} / LKR {campaign.goal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/campaigns/${campaign._id || campaign.id}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={key} className="text-base">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {key === 'campaignUpdates' && 'Get notified about campaign updates and milestones'}
                        {key === 'donationAlerts' && 'Receive alerts when donations are made to your campaigns'}
                        {key === 'monthlyReports' && 'Monthly summary of your campaign performance'}
                        {key === 'systemUpdates' && 'Important platform updates and announcements'}
                        {key === 'marketing' && 'Marketing emails and promotional content'}
                      </p>
                    </div>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={() => handleNotificationChange(key as keyof typeof notifications)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your profile visibility and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="public">Public - Visible to everyone</option>
                      <option value="supporters">Supporters Only - Visible to your donors</option>
                      <option value="private">Private - Only visible to you</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Contact Information Display</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Email Address</Label>
                        <p className="text-sm text-gray-600">Allow supporters to see your email</p>
                      </div>
                      <Switch
                        checked={privacy.showEmail}
                        onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Phone Number</Label>
                        <p className="text-sm text-gray-600">Allow supporters to see your phone number</p>
                      </div>
                      <Switch
                        checked={privacy.showPhone}
                        onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Campaign Statistics</Label>
                        <p className="text-sm text-gray-600">Display your total raised amount and campaign count</p>
                      </div>
                      <Switch
                        checked={privacy.showDonations}
                        onCheckedChange={(checked) => handlePrivacyChange('showDonations', checked)}
                      />
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

export default LeaderProfile;
