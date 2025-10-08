import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Heart, TrendingUp, MessageCircle, Gift, CheckCircle2, Settings, Filter, MoreHorizontal } from 'lucide-react';

const LeaderNotifications: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'campaign_update',
      title: 'Campaign Update: Clean Water Project',
      message: 'Great news! The first well has been successfully drilled in Kimani village. Water quality tests show excellent results.',
      timestamp: '2 hours ago',
      read: false,
      campaign: 'Clean Water for Rural Communities',
      avatar: '/images/CleanWater.jpg',
      icon: TrendingUp
    },
    {
      id: 2,
      type: 'donation_receipt',
      title: 'Donation Receipt',
      message: 'Thank you for your $150 donation to Clean Water for Rural Communities. Your receipt is ready for download.',
      timestamp: '1 day ago',
      read: false,
      campaign: 'Clean Water for Rural Communities',
      avatar: null,
      icon: Gift
    },
    {
      id: 3,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'Congratulations! You\'ve earned the "Consistent Giver" badge for donating 3 months in a row.',
      timestamp: '2 days ago',
      read: true,
      campaign: null,
      avatar: null,
      icon: Heart
    },
    {
      id: 4,
      type: 'campaign_update',
      title: 'Education Campaign Progress',
      message: 'The school construction is now 60% complete. Thanks to donors like you, we\'re making real progress!',
      timestamp: '3 days ago',
      read: true,
      campaign: 'Education for Every Child',
      avatar: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=50&h=50&fit=crop',
      icon: TrendingUp
    },
    {
      id: 5,
      type: 'new_campaign',
      title: 'New Campaign Recommendation',
      message: 'Based on your donation history, you might be interested in "Emergency Food Relief" - helping families affected by natural disasters.',
      timestamp: '5 days ago',
      read: true,
      campaign: 'Emergency Food Relief',
      avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=50&h=50&fit=crop',
      icon: MessageCircle
    },
    {
      id: 6,
      type: 'monthly_report',
      title: 'Your January Impact Report',
      message: 'See how your donations helped 89 people this month. Your total impact now reaches 1,247 lives!',
      timestamp: '1 week ago',
      read: true,
      campaign: null,
      avatar: null,
      icon: TrendingUp
    }
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'campaign_update': return 'Campaign Update';
      case 'donation_receipt': return 'Receipt';
      case 'achievement': return 'Achievement';
      case 'new_campaign': return 'Recommendation';
      case 'monthly_report': return 'Report';
      default: return 'Notification';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'campaign_update': return 'bg-blue-100 text-blue-800';
      case 'donation_receipt': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'new_campaign': return 'bg-purple-100 text-purple-800';
      case 'monthly_report': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'campaigns') return notification.type === 'campaign_update';
    if (filter === 'achievements') return notification.type === 'achievement';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    // In a real app, this would update the backend
    console.log('Marking all as read');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  Stay updated on your campaigns and achievements
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white">
                      {unreadCount} unread
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter notifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="campaigns">Campaign Updates</SelectItem>
                <SelectItem value="achievements">Achievements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card key={notification.id} className={`transition-colors duration-200 ${!notification.read ? 'border-l-4 border-l-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon or Avatar */}
                  <div className="flex-shrink-0">
                    {notification.avatar ? (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.avatar} alt="Campaign" />
                        <AvatarFallback>
                          <notification.icon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <notification.icon className="h-5 w-5 text-indigo-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{notification.timestamp}</span>
                        {notification.campaign && (
                          <>
                            <span>•</span>
                            <span className="font-medium">{notification.campaign}</span>
                          </>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "We'll notify you when there are updates on your campaigns."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeaderNotifications;