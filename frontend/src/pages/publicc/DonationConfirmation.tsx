import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Download, Share2, Mail, Twitter, Facebook, Heart, Home } from 'lucide-react';

const DonationConfirmation: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const donationData = location.state;

  // Mock data if no state is passed
  const donation = donationData || {
    amount: 100,
    totalAmount: 103.20,
    coverFees: true,
    isAnonymous: false,
    message: "Happy to support this important cause!",
    campaignTitle: "Clean Water for Rural Communities"
  };

  const donationId = `DON-${Date.now().toString().slice(-8)}`;
  const donationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your generous donation of <span className="font-semibold text-green-600">LKR{donation.amount}</span> has been successfully processed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donation Details</CardTitle>
                <CardDescription>
                  Your contribution receipt and transaction information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Donation ID:</span>
                    <div className="font-mono font-semibold">{donationId}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <div className="font-semibold">{donationDate}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Campaign:</span>
                    <div className="font-semibold">{donation.campaignTitle}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Donation Amount:</span>
                    <span className="font-semibold">LKR {donation.amount}</span>
                  </div>
                  {donation.coverFees && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing Fee (covered by you):</span>
                      <span>LKR {(donation.totalAmount - donation.amount).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Charged:</span>
                    <span>LKR {donation.totalAmount}</span>
                  </div>
                </div>

                {donation.message && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-gray-600 text-sm">Your Message:</span>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                        "{donation.message}"
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Immediate Impact</h4>
                    <p className="text-gray-600 text-sm">Your donation is immediately available to the campaign organizer to make a difference.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Regular Updates</h4>
                    <p className="text-gray-600 text-sm">You'll receive email updates about the campaign's progress and how your donation is being used.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Impact Reports</h4>
                    <p className="text-gray-600 text-sm">Once the campaign is complete, you'll get a detailed impact report showing the results.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Your Impact</CardTitle>
                <CardDescription>
                  Inspire others to join you in making a difference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Campaign
                </Button>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Continue Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/campaigns">
                    <Heart className="mr-2 h-4 w-4" />
                    Find More Campaigns
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link to="/donor/dashboard">
                    View Dashboard
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Return Home
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tax Info */}
            <Card>
              <CardContent className="text-center p-4">
                <h4 className="font-semibold mb-2">Tax Deductible</h4>
                <p className="text-xs text-gray-600">
                  This donation may be tax deductible. Please consult your tax advisor and keep your receipt for your records.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationConfirmation;