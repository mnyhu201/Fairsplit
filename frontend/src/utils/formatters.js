/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a date string
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string (e.g. "Jan 15, 2023")
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Format a date with time
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}; 