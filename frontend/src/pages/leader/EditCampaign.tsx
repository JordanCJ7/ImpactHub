import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Camera,
  X,
  Loader2,
  Upload
} from 'lucide-react';
import { campaignService } from '@/services/campaigns';
import { uploadService } from '@/services/upload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { resolveCampaignImageUrl } from '@/lib/imageUtils';

const EditCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<{
    filename: string;
    url: string;
    originalName: string;
    size: number;
    file?: File;
  }>>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    goal: '',
    category: '',
    endDate: '',
    location: '',
    beneficiariesCount: '',
    beneficiariesDescription: '',
    organizationName: '',
    organizationEmail: '',
    allowAnonymousDonations: true,
    allowRecurringDonations: false,
    sendUpdatesToDonors: true,
    allowComments: true
  });

  const categories = [
    'Health & Medical',
    'Education', 
    'Environment',
    'Emergency Relief',
    'Animals & Wildlife',
    'Community Development',
    'Children & Youth',
    'Arts & Culture',
    'Sports & Recreation',
    'Technology'
  ];

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      if (!id) {
        navigate('/leader/campaigns');
        return;
      }

      try {
        setLoading(true);
        const res = await campaignService.getCampaignById(id);
        
        if ((res as any).error) {
          toast({
            title: 'Error',
            description: 'Failed to load campaign. You may not have permission to edit this campaign.',
            variant: 'destructive'
          });
          navigate('/leader/campaigns');
          return;
        }

        const campaignData = (res as any).data;
        setCampaign(campaignData);

        // Check if user owns this campaign
        const creatorId = typeof campaignData.creator === 'string' ? campaignData.creator : campaignData.creator?._id;
        const userId = (user as any)?._id || (user as any)?.id;
        if (creatorId !== userId) {
          toast({
            title: 'Access Denied',
            description: 'You can only edit your own campaigns.',
            variant: 'destructive'
          });
          navigate('/leader/campaigns');
          return;
        }

        // Populate form data
        setFormData({
          title: campaignData.title || '',
          description: campaignData.description || '',
          story: campaignData.story || '',
          goal: (campaignData.goal || campaignData.targetAmount || '').toString(),
          category: campaignData.category || '',
          endDate: campaignData.endDate ? new Date(campaignData.endDate).toISOString().split('T')[0] : '',
          location: campaignData.location || '',
          beneficiariesCount: (campaignData.beneficiaries?.count || '').toString(),
          beneficiariesDescription: campaignData.beneficiaries?.description || '',
          organizationName: campaignData.organizationName || '',
          organizationEmail: campaignData.organizationEmail || '',
          allowAnonymousDonations: campaignData.features?.allowAnonymousDonations ?? true,
          allowRecurringDonations: campaignData.features?.allowRecurringDonations ?? false,
          sendUpdatesToDonors: campaignData.features?.sendUpdatesToDonors ?? true,
          allowComments: campaignData.features?.allowComments ?? true
        });

        // Load existing images
        if (campaignData.images && campaignData.images.length > 0) {
          const existingImages = campaignData.images.map((img: any, index: number) => {
            const imageUrl = typeof img === 'string' ? img : img.url;
            return {
              filename: `existing-${index}`,
              url: imageUrl,
              originalName: `Campaign Image ${index + 1}`,
              size: 0,
              isExisting: true
            };
          });
          setUploadedImages(existingImages);
        }

      } catch (error) {
        console.error('Error loading campaign:', error);
        toast({
          title: 'Error',
          description: 'Failed to load campaign data.',
          variant: 'destructive'
        });
        navigate('/leader/campaigns');
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [id, user, navigate, toast]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      setIsSubmitting(true);
      const filesArray = Array.from(files);

      const response = await uploadService.uploadCampaignImages(filesArray);
      
      if (response.data?.success) {
        const newImages = response.data.images.map((img: any) => ({
          filename: img.filename,
          url: img.url,
          originalName: img.originalName,
          size: img.size
        }));
        
        setUploadedImages(prev => [...prev, ...newImages]);
        toast({
          title: 'Success',
          description: `${newImages.length} image(s) uploaded successfully`,
        });
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload images',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = (filename: string) => {
    setUploadedImages(prev => prev.filter(img => img.filename !== filename));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('Campaign title is required');
    if (!formData.description.trim()) errors.push('Campaign description is required');
    if (!formData.goal || parseFloat(formData.goal) <= 0) errors.push('Valid goal amount is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.endDate) errors.push('End date is required');
    if (!formData.organizationName.trim()) errors.push('Organization name is required');
    if (!formData.organizationEmail.trim()) errors.push('Organization email is required');

    // Check if end date is in the future
    if (formData.endDate && new Date(formData.endDate) <= new Date()) {
      errors.push('End date must be in the future');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: validationErrors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        story: formData.story.trim(),
        goal: parseFloat(formData.goal),
        category: formData.category,
        endDate: formData.endDate,
        // Handle location as string for now - backend should accept either format
        location: formData.location.trim() || undefined,
        organizationName: formData.organizationName.trim(),
        organizationEmail: formData.organizationEmail.trim(),
        images: uploadedImages.map(img => img.url),
        beneficiaries: {
          count: parseInt(formData.beneficiariesCount) || 0,
          description: formData.beneficiariesDescription.trim()
        },
        features: {
          allowAnonymousDonations: formData.allowAnonymousDonations,
          allowRecurringDonations: formData.allowRecurringDonations,
          sendUpdatesToDonors: formData.sendUpdatesToDonors,
          allowComments: formData.allowComments
        }
      } as any;

      const response = await campaignService.updateCampaign(id!, updateData);

      if ((response as any).error) {
        throw new Error((response as any).error);
      }

      toast({
        title: 'Success',
        description: 'Campaign updated successfully',
      });

      navigate('/leader/campaigns');

    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update campaign',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
  <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
  <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => navigate('/leader/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background">
      {/* Header */}
  <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/leader/campaigns')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
                <p className="text-gray-600">Update your campaign details and settings.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/campaigns/${id}`)}
              >
                View Public Page
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Campaign
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about your campaign.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a compelling campaign title"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Briefly describe your campaign"
                    rows={4}
                    maxLength={5000}
                  />
                </div>

                <div>
                  <Label htmlFor="story">Full Story</Label>
                  <Textarea
                    id="story"
                    value={formData.story}
                    onChange={(e) => handleInputChange('story', e.target.value)}
                    placeholder="Tell the complete story behind your campaign"
                    rows={6}
                    maxLength={10000}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal">Goal Amount (LKR) *</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={formData.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      placeholder="100000"
                      min="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Images</CardTitle>
                <CardDescription>Upload images to make your campaign more compelling.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Upload Images</p>
                      <p className="text-sm text-gray-600">
                        Click to select images or drag and drop<br />
                        Supports: JPG, PNG, WebP (max 5MB each)
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Images */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={image.filename} className="relative group">
                          <img
                            src={resolveCampaignImageUrl({ images: [image.url] })}
                            alt={image.originalName}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveImage(image.filename)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index === 0 && 'Primary'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organization Details */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Information about the organization running this campaign.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    placeholder="Your organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="organizationEmail">Organization Email *</Label>
                  <Input
                    id="organizationEmail"
                    type="email"
                    value={formData.organizationEmail}
                    onChange={(e) => handleInputChange('organizationEmail', e.target.value)}
                    placeholder="contact@organization.org"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Status */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="capitalize font-medium">{campaign.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Raised</span>
                    <span className="font-medium">LKR{(campaign.raised || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Donors</span>
                    <span className="font-medium">{campaign.analytics?.donorCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Beneficiaries */}
            <Card>
              <CardHeader>
                <CardTitle>Beneficiaries</CardTitle>
                <CardDescription>Who will benefit from this campaign?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="beneficiariesCount">Number of Beneficiaries</Label>
                  <Input
                    id="beneficiariesCount"
                    type="number"
                    value={formData.beneficiariesCount}
                    onChange={(e) => handleInputChange('beneficiariesCount', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="beneficiariesDescription">Beneficiaries Description</Label>
                  <Textarea
                    id="beneficiariesDescription"
                    value={formData.beneficiariesDescription}
                    onChange={(e) => handleInputChange('beneficiariesDescription', e.target.value)}
                    placeholder="Describe who will benefit from your campaign"
                    rows={3}
                    maxLength={1500}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCampaign;