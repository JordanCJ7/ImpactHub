import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Heart,
  Lock,
  DollarSign,
} from "lucide-react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { resolveCampaignImageUrl } from "@/lib/imageUtils";
import { useAuth } from "@/contexts/AuthContext";

const Donate: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [donationAmount, setDonationAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [coverFees, setCoverFees] = useState<CheckedState>(false);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/campaigns/${id}`);
        if (response.ok) {
          const campaignData = await response.json();
          setCampaign(campaignData);
        } else {
          console.error('Failed to fetch campaign');
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const presetAmounts = [500, 1000, 2000, 2500, 5000, 10000];
  const selectedAmount =
    donationAmount === "custom"
      ? parseFloat(customAmount) || 0
      : parseFloat(donationAmount) || 0;
  const processingFee = selectedAmount * 0.029 + 0.3;
  const totalAmount = selectedAmount + (coverFees ? processingFee : 0);

  const handleDonate = async () => {
    if (!selectedAmount || selectedAmount <= 0) return;

    setIsProcessing(true);

    try {
      const requestBody = {
        campaignId: id,
        amount: selectedAmount,
        currency: 'LKR',
        donorEmail: user?.email || '',
        donorName: user?.name || '',
        isAnonymous,
        message
      };

      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donations/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify(requestBody)
      });

      const data = await resp.json();
      if (!resp.ok) throw { message: data.error || 'Failed to create checkout session', data };

      // Check if this is a local mock payment or external redirect
      if (data.isLocal && data.sessionId) {
        // Navigate to our mock payment page
        navigate(`/payment/${data.sessionId}`);
      } else if (data.url) {
        // External redirect (e.g., real Stripe)
        window.location.href = data.url;
      } else {
        throw new Error('Invalid payment session response');
      }
    } catch (err: any) {
      console.error('Donation error:', err);

      if (err && err.data) {
        console.error('Backend response data:', err.data);
        const body = err.data;
        const msg = (body.error ? body.error + '\n' : '') + (body.detail || body.stripeRaw || err.message || 'Failed to initiate donation');
        alert(msg);
        return;
      }

      alert(err?.message || 'Failed to initiate donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" asChild>
            <Link to={`/campaigns/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaign
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-red-600" />
                  <span>Make a Donation</span>
                </CardTitle>
                <CardDescription>
                  Your contribution will make a real difference in people's
                  lives.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Donation Amount */}
                <div>
                  <Label className="text-base font-semibold">
                    Choose your donation amount
                  </Label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {presetAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={
                          donationAmount === amount.toString()
                            ? "default"
                            : "outline"
                        }
                        onClick={() => {
                          setDonationAmount(amount.toString());
                          setCustomAmount("");
                        }}
                        className="h-12"
                      >
                        Rs. {amount}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Button
                      variant={
                        donationAmount === "custom" ? "default" : "outline"
                      }
                      onClick={() => setDonationAmount("custom")}
                      className="w-full h-12 mb-3"
                    >
                      Custom Amount
                    </Button>

                    {donationAmount === "custom" && (
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-10"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="coverFees"
                      checked={coverFees}
                      onCheckedChange={setCoverFees}
                    />
                    <Label htmlFor="coverFees" className="text-sm">
                      Cover processing fees (Rs. {processingFee.toFixed(2)}) so
                      100% of my donation goes to this cause
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Donate anonymously
                    </Label>
                  </div>
                  
                  {!isAnonymous && user && (
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      <p>Your donation will be credited to: <strong>{user.name}</strong> ({user.email})</p>
                    </div>
                  )}
                  
                  {!isAnonymous && !user && (
                    <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p>💡 <strong>Tip:</strong> <Link to="/auth" className="text-blue-600 hover:underline">Sign in</Link> to track your donations and get updates!</p>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Leave a message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Share why this cause matters to you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Donate Button */}
                <Button
                  className="w-full h-12 text-lg"
                  variant="primaryGradient"
                  onClick={handleDonate}
                  disabled={
                    !selectedAmount || selectedAmount <= 0 || isProcessing
                  }
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Donate Rs. {totalAmount.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your payment information is secure and encrypted. We never
                  store your card details.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Summary */}
          <div className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Loading campaign...</p>
                </CardContent>
              </Card>
            ) : campaign ? (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={resolveCampaignImageUrl(campaign)}
                    alt={campaign.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      by {campaign.organizationName || campaign.organizer}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Rs. {(campaign.currentAmount || 0).toLocaleString()} raised</span>
                        <span>Rs. {(campaign.targetAmount || 0).toLocaleString()} goal</span>
                      </div>
                      <Progress
                        value={campaign.targetAmount > 0 ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Campaign not found</p>
                </CardContent>
              </Card>
            )}

            {/* Donation Summary */}
            {selectedAmount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Donation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Your donation</span>
                    <span className="font-semibold">
                      Rs. {selectedAmount.toFixed(2)}
                    </span>
                  </div>

                  {coverFees && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Processing fee</span>
                      <span>Rs. {processingFee.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>Rs. {totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {coverFees
                      ? "100%"
                      : Math.round(
                          ((selectedAmount - (!coverFees ? processingFee : 0)) /
                            selectedAmount) *
                            100
                        ) + "%"}{" "}
                    of your donation goes directly to this cause
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Badge */}
            <Card>
              <CardContent className="text-center p-4">
                <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Secure Donation</h4>
                <p className="text-xs text-muted-foreground">
                  Your payment is protected by bank-level security and
                  encryption.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
