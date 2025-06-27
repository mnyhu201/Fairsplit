/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password meets requirements
 * @param {string} password - The password to validate
 * @returns {Object} Object containing validation result and any error message
 */
export const validatePassword = (password) => {
  const result = { valid: true, message: '' };
  
  if (!password || password.length < 8) {
    result.valid = false;
    result.message = 'Password must be at least 8 characters long';
    return result;
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    result.valid = false;
    result.message = 'Password must contain at least one uppercase letter';
    return result;
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    result.valid = false;
    result.message = 'Password must contain at least one lowercase letter';
    return result;
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    result.valid = false;
    result.message = 'Password must contain at least one number';
    return result;
  }
  
  return result;
};

/**
 * Validate request form data
 * @param {Object} requestData - The request data to validate
 * @returns {Object} Object containing validation result and any error messages
 */
export const validateRequestData = (requestData) => {
  const errors = {};
  
  if (!requestData.title || requestData.title.trim() === '') {
    errors.title = 'Title is required';
  }
  
  if (!requestData.description || requestData.description.trim() === '') {
    errors.description = 'Description is required';
  }
  
  if (!requestData.amount || isNaN(requestData.amount) || requestData.amount <= 0) {
    errors.amount = 'A valid amount greater than 0 is required';
  }
  
  if (!requestData.date) {
    errors.date = 'Date is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}; 