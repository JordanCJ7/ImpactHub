import React, { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Heart,
  Lock,
  CreditCard,
  DollarSign,
  Gift,
} from "lucide-react";
import type { CheckedState } from "@radix-ui/react-checkbox";

const Donate: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donationAmount, setDonationAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [coverFees, setCoverFees] = useState<CheckedState>(false);
  const [message, setMessage] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock campaign data
  const campaign = {
    id: 1,
    title: "Clean Water for Rural Communities",
    image: "/images/CleanWater.jpg",
    raised: 75420,
    goal: 100000,
    organizer: "Water for Life Foundation",
  };

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

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Navigate to confirmation page
    navigate(`/donation-confirmation/${campaign.id}`, {
      state: {
        amount: selectedAmount,
        totalAmount,
        coverFees,
        isAnonymous,
        message,
        campaignTitle: campaign.title,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
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
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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

                {/* Payment Method */}
                <div>
                  <Label className="text-base font-semibold">
                    Payment Method
                  </Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label
                        htmlFor="card"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Credit/Debit Card</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="cursor-pointer">
                        PayPal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="apple" id="apple" />
                      <Label htmlFor="apple" className="cursor-pointer">
                        Apple Pay
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="google" id="google" />
                      <Label htmlFor="google" className="cursor-pointer">
                        Google Pay
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Card Details */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails((prev) => ({
                            ...prev,
                            number: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails((prev) => ({
                              ...prev,
                              expiry: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={(e) =>
                            setCardDetails((prev) => ({
                              ...prev,
                              cvc: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="Kamal Jayasuriya"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

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
                      id="coverFees"
                      checked={coverFees}
                      onCheckedChange={(checked) => setCoverFees(checked)}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Donate anonymously
                    </Label>
                  </div>
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

                <p className="text-xs text-gray-500 text-center">
                  Your payment information is secure and encrypted. We never
                  store your card details.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    by {campaign.organizer}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rs. {campaign.raised.toLocaleString()} raised</span>
                      <span>Rs. {campaign.goal.toLocaleString()} goal</span>
                    </div>
                    <Progress
                      value={(campaign.raised / campaign.goal) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing fee</span>
                      <span>Rs. {processingFee.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>Rs. {totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="text-xs text-gray-500">
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
                <p className="text-xs text-gray-600">
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
