// Validation helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount > 0 && amount <= 1000000;
};

const isValidCurrency = (currency) => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];
  return validCurrencies.includes(currency);
};

const isValidCategory = (category) => {
  const validCategories = ['education', 'health', 'environment', 'poverty', 'disaster-relief', 'other'];
  return validCategories.includes(category);
};

const sanitizeString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength);
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const calculateDaysRemaining = (endDate) => {
  const today = new Date();
  const timeDiff = new Date(endDate).getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(daysDiff, 0);
};

const calculateProgressPercentage = (current, target) => {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

// Generate unique reference ID
const generateReferenceId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `IH-${timestamp}-${randomStr}`.toUpperCase();
};

module.exports = {
  isValidEmail,
  isValidAmount,
  isValidCurrency,
  isValidCategory,
  sanitizeString,
  formatCurrency,
  calculateDaysRemaining,
  calculateProgressPercentage,
  generateReferenceId
};
