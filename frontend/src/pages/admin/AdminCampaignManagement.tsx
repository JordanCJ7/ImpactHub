import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService } from '@/services/admin';
import type { Campaign } from '@/services/admin';

const AdminCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');

  useEffect(() => {
    loadCampaigns();
    loadPendingCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllCampaigns();
      // Handle different response structures
      const campaignsData = Array.isArray(response) ? response : (response as any)?.campaigns || [];
      setCampaigns(campaignsData as Campaign[]);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setCampaigns([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCampaigns = async () => {
    try {
      const response = await adminService.getPendingCampaigns();
      // Handle different response structures  
      const pendingData = Array.isArray(response) ? response : (response as any)?.campaigns || [];
      setPendingCampaigns(pendingData as Campaign[]);
    } catch (error) {
      console.error('Failed to load pending campaigns:', error);
      setPendingCampaigns([]); // Set empty array on error
    }
  };

  const handleApproveCampaign = async (campaignId: string) => {
    try {
      await adminService.approveCampaign(campaignId);
      loadCampaigns();
      loadPendingCampaigns();
    } catch (error) {
      console.error('Failed to approve campaign:', error);
    }
  };

  const handleRejectCampaign = async (campaignId: string, reason: string) => {
    try {
      await adminService.rejectCampaign(campaignId, reason);
      loadCampaigns();
      loadPendingCampaigns();
    } catch (error) {
      console.error('Failed to reject campaign:', error);
    }
  };

  const handleSuspendCampaign = async (campaignId: string, reason: string) => {
    try {
      await adminService.suspendCampaign(campaignId, reason);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to suspend campaign:', error);
    }
  };

  const filteredCampaigns = Array.isArray(campaigns) ? campaigns.filter(campaign => {
    if (filter === 'all') return true;
    if (filter === 'pending') return campaign.status === 'pending';
    if (filter === 'active') return campaign.status === 'active';
    if (filter === 'suspended') return campaign.status === 'suspended';
    return true;
  }) : [];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return goal > 0 ? Math.round((raised / goal) * 100) : 0;
  };

  if (loading) {
    return <div className="p-6">Loading campaigns...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Campaign Management</h1>
      
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Created by: {campaign.creator.name} ({campaign.creator.email})
                      </p>
                      {campaign.creator.organizationName && (
                        <p className="text-sm text-muted-foreground">
                          Organization: {campaign.creator.organizationName}
                        </p>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Goal Amount</p>
                      <p className="text-2xl font-bold">LKR {campaign.goal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Amount Raised</p>
                      <p className="text-2xl font-bold">LKR {campaign.raised.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Progress</p>
                      <p className="text-2xl font-bold">{getProgressPercentage(campaign.raised, campaign.goal)}%</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
                    <div className="flex-1 md:flex-none">
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-1 md:flex-none">
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {campaign.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApproveCampaign(campaign._id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Please provide a reason for rejecting this campaign:');
                            if (reason) {
                              handleRejectCampaign(campaign._id, reason);
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {campaign.status === 'active' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          const reason = prompt('Please provide a reason for suspending this campaign:');
                          if (reason) {
                            handleSuspendCampaign(campaign._id, reason);
                          }
                        }}
                      >
                        Suspend
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCampaignManagement;