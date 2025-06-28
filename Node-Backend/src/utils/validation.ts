/**
 * Basic email validation using regex
 * Only checks format, doesn't verify if email actually exists
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Username validation
 */
export function isValidUsername(username: string): boolean {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Password validation
 */
export function isValidPassword(password: string): boolean {
  // Password should be at least 6 characters
  return password.length >= 6;
} 