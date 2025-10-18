/**
 * Mock Payment Simulator - Simulates Stripe-like payment processing
 * This replaces Stripe integration for development and testing
 */

// Test card numbers for different scenarios (following Stripe's test card format)
const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED_CARD: '4000000000000069',
  PROCESSING_ERROR: '4000000000000119',
  REQUIRES_AUTH: '4000002500003155'
};

/**
 * Luhn algorithm to validate card numbers
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} - Whether the card number is valid
 */
function validateCardNumber(cardNumber) {
  // Remove spaces and non-digits
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Card must be 13-19 digits
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate expiry date
 * @param {string} expiryMonth - Month (01-12)
 * @param {string} expiryYear - Year (YY or YYYY)
 * @returns {boolean} - Whether the expiry is valid and not expired
 */
function validateExpiry(expiryMonth, expiryYear) {
  const month = parseInt(expiryMonth, 10);
  let year = parseInt(expiryYear, 10);
  
  // Validate month
  if (month < 1 || month > 12) {
    return false;
  }
  
  // Convert YY to YYYY if needed
  if (year < 100) {
    year += 2000;
  }
  
  // Check if expired
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed
  
  if (year < currentYear) {
    return false;
  }
  
  if (year === currentYear && month < currentMonth) {
    return false;
  }
  
  return true;
}

/**
 * Validate CVV/CVC
 * @param {string} cvv - CVV code
 * @param {string} cardNumber - Card number (for determining if Amex)
 * @returns {boolean} - Whether the CVV is valid
 */
function validateCVV(cvv, cardNumber) {
  const cleaned = cvv.replace(/\D/g, '');
  
  // American Express has 4-digit CVV, others have 3
  const isAmex = cardNumber && cardNumber.replace(/\D/g, '').startsWith('34') || 
                 cardNumber && cardNumber.replace(/\D/g, '').startsWith('37');
  
  const expectedLength = isAmex ? 4 : 3;
  
  return cleaned.length === expectedLength;
}

/**
 * Get card brand from card number
 * @param {string} cardNumber - Card number
 * @returns {string} - Card brand (visa, mastercard, amex, etc.)
 */
function getCardBrand(cardNumber) {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^(?:2131|1800|35)/.test(cleaned)) return 'jcb';
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'diners';
  
  return 'unknown';
}

/**
 * Simulate payment processing
 * @param {Object} paymentDetails - Payment details
 * @returns {Object} - Payment result
 */
async function processPayment(paymentDetails) {
  const {
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
    cardholderName,
    amount,
    currency = 'LKR'
  } = paymentDetails;
  
  // Validate card number
  if (!validateCardNumber(cardNumber)) {
    return {
      success: false,
      error: 'invalid_card_number',
      message: 'The card number is invalid.'
    };
  }
  
  // Validate expiry
  if (!validateExpiry(expiryMonth, expiryYear)) {
    return {
      success: false,
      error: 'invalid_expiry',
      message: 'The card has expired or the expiry date is invalid.'
    };
  }
  
  // Validate CVV
  if (!validateCVV(cvv, cardNumber)) {
    return {
      success: false,
      error: 'invalid_cvv',
      message: 'The CVV is invalid.'
    };
  }
  
  // Validate cardholder name
  if (!cardholderName || cardholderName.trim().length < 2) {
    return {
      success: false,
      error: 'invalid_name',
      message: 'Please enter a valid cardholder name.'
    };
  }
  
  // Validate amount
  if (!amount || amount <= 0) {
    return {
      success: false,
      error: 'invalid_amount',
      message: 'The amount must be greater than zero.'
    };
  }
  
  // Simulate processing delay (realistic)
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const cleanedCard = cardNumber.replace(/\D/g, '');
  
  // Check test card scenarios
  if (cleanedCard === TEST_CARDS.DECLINE) {
    return {
      success: false,
      error: 'card_declined',
      message: 'Your card was declined.'
    };
  }
  
  if (cleanedCard === TEST_CARDS.INSUFFICIENT_FUNDS) {
    return {
      success: false,
      error: 'insufficient_funds',
      message: 'Your card has insufficient funds.'
    };
  }
  
  if (cleanedCard === TEST_CARDS.EXPIRED_CARD) {
    return {
      success: false,
      error: 'expired_card',
      message: 'Your card has expired.'
    };
  }
  
  if (cleanedCard === TEST_CARDS.PROCESSING_ERROR) {
    return {
      success: false,
      error: 'processing_error',
      message: 'An error occurred while processing your card.'
    };
  }
  
  // Successful payment
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const last4 = cleanedCard.slice(-4);
  const brand = getCardBrand(cardNumber);
  
  return {
    success: true,
    transactionId,
    amount,
    currency,
    card: {
      last4,
      brand,
      expiryMonth,
      expiryYear
    },
    cardholderName,
    processedAt: new Date().toISOString()
  };
}

/**
 * Generate a mock session ID
 * @returns {string} - Mock session ID
 */
function generateSessionId() {
  return `cs_mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate a mock payment intent ID
 * @returns {string} - Mock payment intent ID
 */
function generatePaymentIntentId() {
  return `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

module.exports = {
  validateCardNumber,
  validateExpiry,
  validateCVV,
  getCardBrand,
  processPayment,
  generateSessionId,
  generatePaymentIntentId,
  TEST_CARDS
};
