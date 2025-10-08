import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { campaignService } from '@/services/campaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveCampaignImageUrl, resolveImageUrl } from '@/lib/imageUtils';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Flag, Users, Clock, MapPin, CheckCircle, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CampaignDetails: React.FC = () => {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [localLiked, setLocalLiked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('likedCampaigns');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const progressPercentage = campaign ? (campaign.raised / campaign.goal) * 100 : 0;
  const daysLeft = campaign ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000*60*60*24))) : 0;

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await campaignService.getCampaignById(id);
        if (res.error) {
          setError(res.error);
          setCampaign(null);
        } else {
          const c: any = (res as any).data || res;
          setCampaign(c);
          // initialize liked state from campaign analytics or local fallback
          setIsLiked(!!(((c?.analytics as any)?.liked ?? localLiked[id || ''])));
        }
      } catch (err) {
        console.error('Failed to load campaign:', err);
        setError('Failed to load campaign.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  // Persist localLiked when it changes
  useEffect(() => {
    try {
      localStorage.setItem('likedCampaigns', JSON.stringify(localLiked));
    } catch (e) {
      // ignore
    }
  }, [localLiked]);

  // Optimistic toggle handler for like/unlike
  const handleToggleLike = async () => {
    if (!id) return;
    const currentlyLiked = isLiked;

    // optimistic
    setIsLiked(!currentlyLiked);
    setLocalLiked(prev => ({ ...prev, [id]: !currentlyLiked }));

    try {
      const res: any = await campaignService.toggleLike(id, !!currentlyLiked);
      if (res && res.error) {
        // rollback
        setIsLiked(currentlyLiked);
        setLocalLiked(prev => ({ ...prev, [id]: currentlyLiked }));
      }
      if (res && res.data && (res.data as any).campaign) {
        const updated = (res.data as any).campaign;
        setCampaign(prev => ({ ...prev, ...updated }));
        // Update local fallback: remove this id since server is authoritative
        setLocalLiked(prev => {
          const next = { ...prev };
          delete next[id];
          try { localStorage.setItem('likedCampaigns', JSON.stringify(next)); } catch (e) { /* ignore */ }
          return next;
        });
        // set isLiked from authoritative value
        setIsLiked(!!updated.analytics?.liked);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
      // rollback
      setIsLiked(currentlyLiked);
      setLocalLiked(prev => ({ ...prev, [id]: currentlyLiked }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <div className="mt-2 text-muted-foreground">Loading campaign...</div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground">Campaign not found</h3>
          <p className="text-muted-foreground mt-2">{error || 'This campaign may have been removed or is unavailable.'}</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/campaigns')}>Back to campaigns</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
  <div className="bg-card border-b">
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
                <img src={resolveCampaignImageUrl(campaign)} alt={campaign.title} className="w-full h-64 md:h-80 object-cover rounded-t-lg" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {campaign.verified && <Badge className="bg-green-600 text-white">Verified</Badge>}
                  <Badge className="bg-blue-600 text-white">{campaign.category}</Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl mb-2">{campaign.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{campaign.location ? (typeof campaign.location === 'string' ? campaign.location : [campaign.location.city, campaign.location.state, campaign.location.country].filter(Boolean).join(', ')) : ''}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000*60*60*24)))} days left</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleLike}
                      className={isLiked ? 'text-red-600' : ''}
                    >
                      <Heart className="h-4 w-4 mr-2" style={{ fill: isLiked ? 'currentColor' : 'none' }} />
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
                    <TabsTrigger value="updates">Updates ({(campaign.updates || []).length})</TabsTrigger>
                    <TabsTrigger value="donors">Donors ({campaign.analytics?.donorCount ?? campaign.donors ?? 0})</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <CardContent>
                  <TabsContent value="story" className="space-y-6">
                      <div className="prose max-w-none">
                      <p className="text-lg text-foreground mb-6">{campaign.description}</p>
                      
                      {campaign.story && (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Campaign Story</h3>
                          <div className="text-foreground mb-6 whitespace-pre-wrap">{campaign.story}</div>
                        </>
                      )}
                      
                      {campaign.beneficiaries && (campaign.beneficiaries.description || campaign.beneficiaries.count > 0) && (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Who Will Benefit</h3>
                          <div className="bg-muted p-4 rounded-lg mb-6">
                            {campaign.beneficiaries.count > 0 && (
                              <div className="flex items-center text-foreground mb-2">
                                <Users className="h-5 w-5 mr-2" />
                                <span className="font-semibold">{campaign.beneficiaries.count.toLocaleString()} people will benefit</span>
                              </div>
                            )}
                            {campaign.beneficiaries.description && (
                              <p className="text-muted-foreground">{campaign.beneficiaries.description}</p>
                            )}
                          </div>
                        </>
                      )}
                      
                      {campaign.timeline && (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Project Timeline</h3>
                          <div className="bg-muted p-4 rounded-lg mb-6">
                            <div className="whitespace-pre-wrap text-foreground">{campaign.timeline}</div>
                          </div>
                        </>
                      )}
                      
                      {campaign.budget && (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Budget Breakdown</h3>
                          <div className="bg-muted p-4 rounded-lg mb-6">
                            <div className="whitespace-pre-wrap text-foreground">{campaign.budget}</div>
                          </div>
                        </>
                      )}
                      
                      {campaign.risks && (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Risks & Mitigation</h3>
                          <div className="bg-muted p-4 rounded-lg mb-6">
                            <div className="whitespace-pre-wrap text-foreground">{campaign.risks}</div>
                          </div>
                        </>
                      )}
                      
                      {campaign.tags && campaign.tags.length > 0 && (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Campaign Tags</h3>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {campaign.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-muted">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="updates" className="space-y-6">
                    {(campaign.updates || []).map((update: any) => (
                      <div key={update._id || update.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{new Date(update.createdAt || update.date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-3">{update.title}</h4>
                        <p className="text-foreground mb-4">{update.content}</p>
                        {(update.images || []).length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(update.images || []).map((image: any, index: number) => (
                              <img
                                key={index}
                                src={resolveImageUrl(image)}
                                alt={`Update ${update._id || update.id} image ${index + 1}`}
                                className="rounded-lg w-full h-48 object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="donors" className="space-y-4">
                    {((campaign.recentDonors && campaign.recentDonors.length > 0) ? campaign.recentDonors : (campaign.analytics && campaign.analytics.recentDonors) || []).map((donor: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={donor.avatar ? resolveImageUrl(donor.avatar) : undefined} alt={donor.name} />
                            <AvatarFallback>{donor.name?.charAt(0) || 'D'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{donor.name}</div>
                            <div className="text-sm text-muted-foreground">{donor.time || new Date(donor.createdAt || Date.now()).toLocaleString()}</div>
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
          <div className="space-y-6 overflow-visible">
            {/* Donation Card */}
            <Card className="top-4 z-10 mb-6">
              <CardHeader>
                <div className="text-3xl font-bold text-foreground">
                  LKR {campaign.raised.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  raised of LKR {campaign.goal.toLocaleString()} goal
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{Math.round(progressPercentage)}% funded</span>
                  <span>{daysLeft} days left</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{campaign.analytics?.donorCount ?? campaign.donors ?? 0}</div>
                    <div className="text-sm text-muted-foreground">donors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{daysLeft}</div>
                    <div className="text-sm text-muted-foreground">days left</div>
                  </div>
                </div>
                
                <Separator />
                
                <Button asChild className="w-full" size="lg" variant="primaryGradient">
                  <Link to={`/donate/${campaign._id || campaign.id}`}>
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
                    <AvatarImage src={campaign.organizer?.avatar ? resolveImageUrl(campaign.organizer.avatar) : undefined} alt={campaign.organizer?.name || 'Organizer'} />
                    <AvatarFallback>{campaign.organizer?.name?.charAt(0) || 'O'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{campaign.organizer?.name || 'Organizer'}</h4>
                      {campaign.organizer?.verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{campaign.organizer?.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                      <span>Founded {campaign.organizer?.founded}</span>
                      <span>{campaign.organizer?.projectsCompleted ?? 0} projects completed</span>
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