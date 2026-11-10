/**
 * Utility functions for form validation
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateEmail(email) {
  if (!email.includes("@")) {
    return "Please enter a valid email address.";
  }
  return null;
}

/**
 * Validates that password meets minimum length requirement
 * @param {string} password - Password to validate
 * @returns {string|null} Error message or null if valid
 */
export function validatePasswordLength(password) {
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

/**
 * Validates that two passwords match
 * @param {string} password - First password
 * @param {string} passwordConfirm - Password confirmation
 * @returns {string|null} Error message or null if valid
 */
export function validatePasswordMatch(password, passwordConfirm) {
  if (password !== passwordConfirm) {
    return "Passwords do not match.";
  }
  return null;
}

/**
 * Validates date of birth (checks if user is an adult)
 * @param {string} dob - Date of birth in ISO format (YYYY-MM-DD)
 * @returns {string|null} Error message or null if valid
 */
export function validateAdult(dob) {
  if (!dob) {
    return "Please enter your date of birth.";
  }

  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return "You must be at least 18 years old.";
  }

  if (age < 18) {
    return "You must be at least 18 years old.";
  }

  return null;
}
