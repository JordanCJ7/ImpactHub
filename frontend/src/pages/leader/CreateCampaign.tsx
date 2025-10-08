import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Removed unused Tabs/Badge imports
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Save, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Camera,
  X,
  Loader2
} from 'lucide-react';
import { campaignService } from '@/services/campaigns';
import { uploadService } from '@/services/upload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
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
    shortDescription: '',
    story: '',
    goal: '',
    category: '',
    endDate: '',
    location: {
      country: '',
      state: '',
      city: ''
    },
    images: [] as string[],
    tags: [] as string[],
    beneficiaries: {
      count: 0,
      description: ''
    },
    organizationName: '',
    organizationEmail: '',
    timeline: '',
    budget: '',
    risks: '',
    features: {
      allowAnonymousDonations: true,
      allowRecurringDonations: false,
      sendUpdatesToDonors: true,
      allowComments: true
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[]
    }
  });

  // Auto-populate organization fields from user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizationName: user.profile?.organization?.name || user.name || '',
        organizationEmail: user.profile?.organization?.email || user.email || ''
      }));
    }
  }, [user]);

  // Load draft if provided via query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const draftId = params.get('draft');
    if (draftId) {
      (async () => {
        try {
          const res = await campaignService.getCampaignById(draftId);
          const c = (res as any).data || res;
          if (c && (c.status === 'draft' || c.status === 'active')) {
            setCurrentDraftId(draftId);
            // Map API campaign to form fields
            setFormData(prev => ({
              ...prev,
              title: c.title || '',
              description: c.description || '',
              shortDescription: c.shortDescription || '',
              story: c.story || '',
              goal: (c.goal ?? c.targetAmount ?? '').toString(),
              category: c.category || '',
              endDate: c.endDate ? new Date(c.endDate).toISOString().slice(0,10) : '',
              location: typeof c.location === 'string' ? { country: '', state: '', city: c.location } : (c.location || { country: '', state: '', city: '' }),
              images: Array.isArray(c.images) ? (typeof c.images[0] === 'string' ? c.images : c.images.map((img: any) => img.url)) : [],
              tags: c.tags || [],
              beneficiaries: c.beneficiaries || { count: 0, description: '' },
              organizationName: c.organizationName || prev.organizationName,
              organizationEmail: c.organizationEmail || prev.organizationEmail,
              timeline: c.timeline || '',
              budget: c.budget || '',
              risks: c.risks || '',
              features: c.features || prev.features,
              seo: c.seo || prev.seo
            }));
            // Also set uploadedImages from urls for display/removal consistency
            const urls = Array.isArray(c.images) ? (typeof c.images[0] === 'string' ? c.images : c.images.map((img: any) => img.url)) : [];
            setUploadedImages(urls.map((url: string) => ({ filename: url.split('/').pop() || url, url, originalName: url.split('/').pop() || 'image', size: 0 })));
          }
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [location.search]);

  const steps = [
    { title: 'Basic Info', description: 'Campaign title, goal, and category' },
    { title: 'Story & Media', description: 'Tell your story with images and details' },
    { title: 'Planning', description: 'Timeline, budget, and implementation' },
    { title: 'Review', description: 'Review and publish your campaign' }
  ];

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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validation = uploadService.validateImageFiles(files);
    if (!validation.valid) {
      toast({
        title: "Upload Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Check if total images would exceed limit
    if (uploadedImages.length + files.length > 5) {
      toast({
        title: "Upload Error",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImages(true);
    try {
      const result = await uploadService.uploadCampaignImages(files);
      
      if (result.error) {
        toast({
          title: "Upload Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.data) {
        // Add uploaded images to state
        const newImages = result.data.images.map(img => ({
          filename: img.filename,
          url: img.url,
          originalName: img.originalName,
          size: img.size
        }));
        
        setUploadedImages(prev => [...prev, ...newImages]);
        
        // Update form data with image URLs
        const imageUrls = newImages.map(img => img.url);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls]
        }));

        toast({
          title: "Success",
          description: `${files.length} image(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Remove uploaded image
  const handleRemoveImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    
    try {
      // Delete from server
      const result = await uploadService.deleteCampaignImage(imageToRemove.filename);
      
      if (result.error) {
        toast({
          title: "Delete Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Remove from state
      const newUploadedImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newUploadedImages);
      
      // Update form data
      const newImageUrls = newUploadedImages.map(img => img.url);
      setFormData(prev => ({
        ...prev,
        images: newImageUrls
      }));

      toast({
        title: "Success",
        description: "Image removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete Error",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    // Validate all steps against backend rules before submitting
    const errors = validateAllFields();

    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors.join(' '),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const campaignData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        story: formData.story,
        goal: parseFloat(formData.goal),
        category: formData.category,
        endDate: formData.endDate ? `${formData.endDate}T00:00:00.000Z` : '',
        location: {
          country: formData.location.country,
          state: formData.location.state,
          city: formData.location.city
        },
        beneficiaries: {
          count: formData.beneficiaries.count || 0,
          description: formData.beneficiaries.description || ''
        },
        images: formData.images.length > 0 ? formData.images : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        organizationName: formData.organizationName,
        organizationEmail: formData.organizationEmail,
        timeline: formData.timeline,
        budget: formData.budget,
        risks: formData.risks || undefined,
        features: formData.features,
        seo: {
          metaTitle: formData.seo.metaTitle || undefined,
          metaDescription: formData.seo.metaDescription || undefined,
          keywords: formData.seo.keywords.length > 0 ? formData.seo.keywords : undefined
        }
      };

      let response;
      if (currentDraftId) {
        // Publish existing draft
        response = await campaignService.publishCampaign(currentDraftId, campaignData);
      } else {
        response = await campaignService.createCampaign(campaignData);
      }

      if (response.error) {
        const details = (response as any).data?.details || [];
        const detailText = Array.isArray(details)
          ? details.map((d: any) => d.msg || d.message).join(', ')
          : undefined;
        toast({
          title: 'Error',
          description: detailText ? `${response.error}: ${detailText}` : response.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Published!',
        description: 'Your campaign has been submitted and is now active (pending admin approval workflows).',
      });

      navigate('/leader/dashboard');
    } catch (error: any) {
      console.error('Create campaign error:', error);
      const errorMessage = error.response?.data?.error || "Failed to create campaign. Please try again.";
      const errorDetails = error.response?.data?.details;
      
      toast({
        title: "Error",
        description: errorDetails ? 
          `${errorMessage}: ${errorDetails.map((d: any) => d.msg).join(', ')}` : 
          errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Centralized validation used for Publish and Save Draft enablement
  const validateAllFields = (): string[] => {
    const errors: string[] = [];
    if (!(formData.title && formData.title.trim().length >= 10 && formData.title.trim().length <= 100)) {
      errors.push('Title must be between 10 and 100 characters.');
    }
    if (!(formData.description && formData.description.trim().length >= 50 && formData.description.trim().length <= 5000)) {
      errors.push('Description must be between 50 and 5000 characters.');
    }
    if (!formData.organizationName || formData.organizationName.trim().length < 2) {
      errors.push('Organization name is required and must be at least 2 characters.');
    }
    if (!formData.organizationEmail || !formData.organizationEmail.includes('@')) {
      errors.push('Valid organization email is required.');
    }
    const goalNumber = parseFloat(formData.goal);
    if (!(formData.goal && !Number.isNaN(goalNumber) && goalNumber >= 100)) {
      errors.push('Goal must be a valid number and at least 100.');
    }
    if (!formData.category) {
      errors.push('Category is required.');
    }
    if (!formData.endDate) {
      errors.push('End date is required.');
    } else {
      const end = new Date(`${formData.endDate}T00:00:00.000Z`);
      if (Number.isNaN(end.getTime()) || end.getTime() <= Date.now()) {
        errors.push('End date must be a valid future date.');
      }
    }
    if (!formData.story || formData.story.trim().length < 10) {
      errors.push('Campaign story is required and must be at least 10 characters.');
    }
    if (!formData.timeline || formData.timeline.trim().length < 10) {
      errors.push('Implementation timeline is required.');
    }
    if (!formData.budget || formData.budget.trim().length < 10) {
      errors.push('Budget breakdown is required.');
    }
    return errors;
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const draftPayload: any = {
        // Send whatever is currently filled; backend accepts partials
        title: formData.title || undefined,
        description: formData.description || undefined,
        shortDescription: formData.shortDescription || undefined,
        story: formData.story || undefined,
        goal: formData.goal ? parseFloat(formData.goal) : undefined,
        category: formData.category || undefined,
        endDate: formData.endDate ? `${formData.endDate}T00:00:00.000Z` : undefined,
        location: formData.location?.country || formData.location?.city || formData.location?.state ? {
          country: formData.location.country,
          state: formData.location.state,
          city: formData.location.city,
        } : undefined,
        beneficiaries: (formData.beneficiaries.description || formData.beneficiaries.count) ? {
          count: formData.beneficiaries.count,
          description: formData.beneficiaries.description
        } : undefined,
        images: formData.images && formData.images.length > 0 ? formData.images : undefined,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
        organizationName: formData.organizationName || undefined,
        organizationEmail: formData.organizationEmail || undefined,
        timeline: formData.timeline || undefined,
        budget: formData.budget || undefined,
        risks: formData.risks || undefined,
        features: formData.features,
        seo: {
          metaTitle: formData.seo.metaTitle || undefined,
          metaDescription: formData.seo.metaDescription || undefined,
          keywords: formData.seo.keywords && formData.seo.keywords.length > 0 ? formData.seo.keywords : undefined,
        }
      };

      let res;
      if (currentDraftId) {
        // Save changes to existing draft
        res = await campaignService.updateCampaign(currentDraftId, draftPayload);
      } else {
        res = await campaignService.createDraft(draftPayload);
        const createdId = (res as any).data?.campaign?._id;
        if (createdId) setCurrentDraftId(createdId);
      }
      if ((res as any)?.error) {
        throw new Error((res as any).error);
      }

      toast({
        title: 'Draft Saved',
        description: 'Your campaign draft has been saved. You can continue later from your dashboard.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save draft.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.title && formData.title.length >= 10 && formData.title.length <= 100 &&
               formData.description && formData.description.length >= 50 && formData.description.length <= 5000 &&
               formData.goal && parseFloat(formData.goal) >= 100 &&
               formData.category && formData.endDate &&
               formData.organizationName && formData.organizationName.trim().length >= 2 &&
               formData.organizationEmail && formData.organizationEmail.includes('@');
      case 1:
        return formData.story && formData.story.length >= 10;
      case 2:
        return formData.timeline && formData.timeline.trim().length >= 10 &&
               formData.budget && formData.budget.trim().length >= 10;
      default:
        return true;
    }
  };

  return (
  <div className="min-h-screen bg-background">
      {/* Header */}
  <div className="bg-card border border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/leader/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Create New Campaign</h1>
                <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
              </div>
            </div>
            {/* Removed Save Draft & Preview controls from header */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${ 
                  index <= currentStep 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'border-border text-muted-foreground'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${ 
                    index < currentStep ? 'bg-indigo-600' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
                <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a compelling campaign title"
                    className="mt-1"
                  />
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="goal">Funding Goal (LKR) *</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={formData.goal}
                      onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                      placeholder="50000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Campaign End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="mt-1"
                      min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                      <Input
                        placeholder="Country"
                        value={formData.location.country}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: { ...prev.location, country: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="State/Province"
                        value={formData.location.state}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: { ...prev.location, state: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="City"
                        value={formData.location.city}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: { ...prev.location, city: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Short Description (50-5000 chars) *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly describe your campaign (at least 50 characters)"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Summary (Optional)</Label>
                  <Textarea
                    id="shortDescription" 
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="A brief one-line summary for preview cards (max 200 characters)"
                    rows={2}
                    maxLength={200}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="organizationName">Organization Name (Auto-filled from your profile)</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    readOnly
                    className="bg-muted"
                    placeholder="Please update your organization name in your profile settings"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This is automatically filled from your profile. Update your profile to change this.
                  </p>
                </div>

                <div>
                  <Label htmlFor="organizationEmail">Organization Contact Email (Auto-filled)</Label>
                  <Input
                    id="organizationEmail"
                    type="email"
                    value={formData.organizationEmail}
                    readOnly
                    className="bg-muted"
                    placeholder="Update your organization email in your profile"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Uses your organization email from profile, or defaults to your email.
                  </p>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                      setFormData(prev => ({ ...prev, tags: tags.slice(0, 10) })); // Limit to 10 tags
                    }}
                    placeholder="Enter tags separated by commas (e.g., healthcare, emergency, children)"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Add relevant tags to help people find your campaign. Max 10 tags.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Story & Media */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="story">Campaign Story *</Label>
                  <Textarea
                    id="story"
                    value={formData.story}
                    onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                    placeholder="Tell the full story of your campaign. What problem are you solving? Why is it important? How will donations be used?"
                    rows={8}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Campaign Images</Label>
                  <div className="mt-2 space-y-4">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Upload images to make your campaign more compelling (Max 5 images, 5MB each)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploadingImages || uploadedImages.length >= 5}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={isUploadingImages || uploadedImages.length >= 5}
                      >
                        {isUploadingImages ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {isUploadingImages ? 'Uploading...' : 'Choose Images'}
                      </Button>
                      {uploadedImages.length >= 5 && (
                        <p className="text-sm text-orange-600 mt-2">
                          Maximum of 5 images reached
                        </p>
                      )}
                    </div>

                    {/* Uploaded Images Preview */}
                    {uploadedImages.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Uploaded Images ({uploadedImages.length}/5)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={uploadService.getCampaignImageUrl(image.filename)}
                                alt={image.originalName}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                                <p className="truncate">{image.originalName}</p>
                                <p>{(image.size / 1024 / 1024).toFixed(1)} MB</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="beneficiaries-count">Number of Beneficiaries</Label>
                  <Input
                    id="beneficiaries-count"
                    type="number"
                    min="0"
                    value={formData.beneficiaries.count}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      beneficiaries: { ...prev.beneficiaries, count: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="How many people will benefit?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="beneficiaries">Who Will Benefit?</Label>
                  <Textarea
                    id="beneficiaries"
                    value={formData.beneficiaries.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      beneficiaries: { ...prev.beneficiaries, description: e.target.value }
                    }))}
                    placeholder="Describe who will benefit from this campaign and how many people will be impacted"
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Planning */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="timeline">Implementation Timeline *</Label>
                  <Textarea
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="Describe your timeline for implementing the project. Include key milestones and dates."
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget Breakdown *</Label>
                  <Textarea
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="Provide a detailed breakdown of how the funds will be used. Be specific about costs."
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="risks">Potential Risks & Mitigation</Label>
                  <Textarea
                    id="risks"
                    value={formData.risks}
                    onChange={(e) => setFormData(prev => ({ ...prev, risks: e.target.value }))}
                    placeholder="What are the potential risks or challenges? How will you address them?"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Campaign Features */}
                  <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Campaign Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Anonymous Donations</Label>
                        <p className="text-sm text-muted-foreground">Let donors choose to donate anonymously</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.features.allowAnonymousDonations}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, allowAnonymousDonations: e.target.checked }
                        }))}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Recurring Donations</Label>
                        <p className="text-sm text-muted-foreground">Enable monthly recurring donations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.features.allowRecurringDonations}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, allowRecurringDonations: e.target.checked }
                        }))}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Send Updates to Donors</Label>
                        <p className="text-sm text-muted-foreground">Automatically notify donors about campaign progress</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.features.sendUpdatesToDonors}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, sendUpdatesToDonors: e.target.checked }
                        }))}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Comments</Label>
                        <p className="text-sm text-muted-foreground">Let supporters leave encouraging messages</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.features.allowComments}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, allowComments: e.target.checked }
                        }))}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">SEO & Discovery (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input
                        id="metaTitle"
                        value={formData.seo.metaTitle}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, metaTitle: e.target.value }
                        }))}
                        placeholder="Custom title for search engines (defaults to campaign title)"
                        maxLength={60}
                      />
                    </div>

                    <div>
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={formData.seo.metaDescription}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, metaDescription: e.target.value }
                        }))}
                        placeholder="Brief description for search engine results"
                        maxLength={160}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="keywords">SEO Keywords</Label>
                      <Input
                        id="keywords"
                        value={formData.seo.keywords.join(', ')}
                        onChange={(e) => {
                          const keywords = e.target.value.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
                          setFormData(prev => ({
                            ...prev,
                            seo: { ...prev.seo, keywords: keywords.slice(0, 10) }
                          }));
                        }}
                        placeholder="Enter keywords separated by commas"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-foreground" />
                    <h3 className="font-semibold text-foreground">Review Your Campaign</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    Please review all information carefully. Once published, some details cannot be changed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-muted-foreground">Title:</span> {formData.title}</div>
                      <div><span className="text-muted-foreground">Goal:</span> LKR {formData.goal}</div>
                      <div><span className="text-muted-foreground">End Date:</span> {formData.endDate}</div>
                      <div><span className="text-muted-foreground">Category:</span> {formData.category}</div>
                      <div><span className="text-muted-foreground">Location:</span> {[formData.location.city, formData.location.state, formData.location.country].filter(Boolean).join(', ')}</div>
                      <div><span className="text-muted-foreground">Organization:</span> {formData.organizationName}</div>
                      <div><span className="text-muted-foreground">Org Email:</span> {formData.organizationEmail}</div>
                      {formData.tags.length > 0 && <div><span className="text-muted-foreground">Tags:</span> {formData.tags.join(', ')}</div>}
                      </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Content & Planning</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-muted-foreground">Description:</span> {formData.description.substring(0, 100)}...</div>
                      <div><span className="text-muted-foreground">Story length:</span> {formData.story.length} characters</div>
                      <div><span className="text-muted-foreground">Timeline:</span> {formData.timeline.length > 0 ? '✓ Provided' : '✗ Missing'}</div>
                      <div><span className="text-muted-foreground">Budget:</span> {formData.budget.length > 0 ? '✓ Provided' : '✗ Missing'}</div>
                      <div><span className="text-muted-foreground">Risks:</span> {formData.risks.length > 0 ? '✓ Provided' : 'Not specified'}</div>
                      <div><span className="text-muted-foreground">Beneficiaries:</span> {formData.beneficiaries.count > 0 ? `${formData.beneficiaries.count} people` : 'Count not specified'}</div>
                      {formData.beneficiaries.description && <div><span className="text-muted-foreground">Who benefits:</span> {formData.beneficiaries.description.substring(0, 50)}...</div>}
                      <div><span className="text-muted-foreground">Images:</span> {formData.images.length} uploaded</div>
                      </div>
                  </div>
                </div>

                {/* Campaign Features Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Campaign Settings</h4>
                  <div className="text-sm space-y-1">
                    <div>Anonymous donations: {formData.features.allowAnonymousDonations ? 'Enabled' : 'Disabled'}</div>
                    <div>Recurring donations: {formData.features.allowRecurringDonations ? 'Enabled' : 'Disabled'}</div>
                    <div>Donor updates: {formData.features.sendUpdatesToDonors ? 'Enabled' : 'Disabled'}</div>
                    <div>Comments: {formData.features.allowComments ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-foreground" />
                    <h3 className="font-semibold text-foreground">Ready to Publish</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    Your campaign will be reviewed by our team and published within 24 hours.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              {/* Save Draft only on final step and only when all details are valid */}
              <Button 
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSubmitting || validateAllFields().length > 0}
              >
                {isSavingDraft ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Publishing...' : 'Publish Campaign'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;