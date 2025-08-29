import React, { useState } from 'react';
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
import { User, Mail, Phone, MapPin, Camera, Bell, Shield, CreditCard, Award, Settings, Save } from 'lucide-react';

const DonorProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Kamal',
    lastName: 'Jayasinghe',
    email: 'kamaljayasinghe@email.com',
    phone: '+94 71 889 1234',
    bio: 'Passionate about making a difference in communities around the world.',
    location: 'Malabe, Colombo',
    joinDate: 'December 2023',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
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

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiry: '08/26',
      isDefault: false
    }
  ];

  const achievements = [
    { title: "First Donation", description: "Made your first donation", date: "Dec 2023", earned: true },
    { title: "Consistent Giver", description: "Donated for 3 consecutive months", date: "Jan 2024", earned: true },
    { title: "Community Builder", description: "Supported 10 different campaigns", date: "Jan 2024", earned: true },
    { title: "Water Champion", description: "Donated LKR 500+ to water causes", date: "Jan 2024", earned: true },
    { title: "Education Supporter", description: "Supported 5 education campaigns", date: null, earned: false },
    { title: "Major Donor", description: "Single donation over LKR 1,000", date: null, earned: false }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, save to backend
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <Button onClick={isEditing ? handleSave : () => setIsEditing(true)}>
              {isEditing ? (
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
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
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
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>
                  Track your milestones and unlock new badges as you make an impact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-4 rounded-lg border ${
                        achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Award className={`h-6 w-6 mt-1 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        {achievement.earned ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Earned {achievement.date}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Earned</Badge>
                        )}
                      </div>
                    </div>
                  ))}
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