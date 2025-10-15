import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Lock, CreditCard, AlertCircle } from 'lucide-react';

const MockPayment: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Form validation
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donations/session/${sessionId}`
        );

        if (!response.ok) {
          throw new Error('Session not found');
        }

        const data = await response.json();
        setSessionData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load payment session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const validateCardNumber = (number: string): boolean => {
    // Luhn algorithm
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setErrors({ ...errors, cardNumber: '' });
  };

  const handleExpiryChange = (value: string, type: 'month' | 'year') => {
    const cleaned = value.replace(/\D/g, '');
    if (type === 'month') {
      const month = cleaned.substring(0, 2);
      setExpiryMonth(month);
      setErrors({ ...errors, expiry: '' });
    } else {
      const year = cleaned.substring(0, 2);
      setExpiryYear(year);
      setErrors({ ...errors, expiry: '' });
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(cleaned);
    setErrors({ ...errors, cvv: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    // Validate card number
    if (!cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Validate expiry
    const month = parseInt(expiryMonth, 10);
    const year = parseInt(expiryYear, 10);

    if (!expiryMonth || !expiryYear) {
      newErrors.expiry = 'Expiry date is required';
    } else if (month < 1 || month > 12) {
      newErrors.expiry = 'Invalid month';
    } else {
      // Check if expired
      const now = new Date();
      const currentYear = now.getFullYear() % 100; // Last 2 digits
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = 'Card has expired';
      }
    }

    // Validate CVV
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    // Validate cardholder name
    if (!cardholderName || cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donations/process-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiryMonth,
            expiryYear,
            cvv,
            cardholderName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Payment failed');
      }

      // Payment successful - redirect to success page
      navigate(`/donation-success?session_id=${sessionId}`);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading payment details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/campaigns')} className="mt-4 w-full">
              Return to Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header with Lock Icon */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Lock className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">Secure payment</span>
          </div>
          <h1 className="text-2xl font-bold">Complete your donation</h1>
        </div>

        {/* Campaign Summary */}
        {sessionData && (
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Donating to</CardDescription>
              <CardTitle className="text-base">{sessionData.campaign?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold">
                  {sessionData.currency} {sessionData.amount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Pay with card</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <div className="ml-2">{error}</div>
                </Alert>
              )}

              {/* Test Cards Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs">
                <p className="font-semibold mb-1">Test Cards:</p>
                <p>Success: 4242 4242 4242 4242</p>
                <p>Decline: 4000 0000 0000 0002</p>
                <p>Use any future expiry & any CVV</p>
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  className={errors.cardNumber ? 'border-red-500' : ''}
                />
                {errors.cardNumber && (
                  <p className="text-xs text-red-500">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="expiryMonth"
                      type="text"
                      placeholder="MM"
                      value={expiryMonth}
                      onChange={(e) => handleExpiryChange(e.target.value, 'month')}
                      maxLength={2}
                      className={errors.expiry ? 'border-red-500' : ''}
                    />
                    <span className="flex items-center">/</span>
                    <Input
                      id="expiryYear"
                      type="text"
                      placeholder="YY"
                      value={expiryYear}
                      onChange={(e) => handleExpiryChange(e.target.value, 'year')}
                      maxLength={2}
                      className={errors.expiry ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.expiry && (
                    <p className="text-xs text-red-500">{errors.expiry}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength={4}
                    className={errors.cvv ? 'border-red-500' : ''}
                  />
                  {errors.cvv && <p className="text-xs text-red-500">{errors.cvv}</p>}
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => {
                    setCardholderName(e.target.value);
                    setErrors({ ...errors, cardholderName: '' });
                  }}
                  className={errors.cardholderName ? 'border-red-500' : ''}
                />
                {errors.cardholderName && (
                  <p className="text-xs text-red-500">{errors.cardholderName}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={processing}
                size="lg"
              >
                {processing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  `Pay ${sessionData?.currency} ${sessionData?.amount.toLocaleString()}`
                )}
              </Button>

              {/* Security Notice */}
              <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Your payment is secure and encrypted</span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Powered by */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Powered by ImpactHub Mock Payment Gateway</p>
          <p className="mt-1">No real charges will be made</p>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
