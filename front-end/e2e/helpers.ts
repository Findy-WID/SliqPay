/**
 * E2E Test Helpers for SliqPay
 * Reusable functions for Playwright tests
 */

/**
 * Generate a random email address
 */
export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test.user.${timestamp}.${random}@sliqpay-test.com`;
}

/**
 * Generate a random Sliq ID (username)
 */
export function generateRandomSliqId(): string {
  const adjectives = ['swift', 'bright', 'cool', 'fast', 'smart', 'wise', 'bold', 'keen'];
  const nouns = ['trader', 'payer', 'sender', 'user', 'wallet', 'crypto', 'coin', 'cash'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9999);
  return `${adjective}_${noun}${number}`;
}

/**
 * Generate a strong password that meets SliqPay requirements:
 * - 8-12 characters
 * - At least 1 number
 * - At least 1 uppercase letter
 */
export function generateStrongPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  // Ensure we have at least one of each required type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Fill remaining with mix of lowercase and numbers (6-10 more chars for 8-12 total)
  const remainingLength = Math.floor(Math.random() * 5) + 6; // 6-10 more chars
  const allChars = lowercase + numbers;
  for (let i = 0; i < remainingLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generate a fake 6-digit OTP code
 */
export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a fake BVN (11 digits)
 */
export function generateBVN(): string {
  return Math.floor(10000000000 + Math.random() * 90000000000).toString();
}

/**
 * Generate a fake NIN (11 digits)
 */
export function generateNIN(): string {
  return Math.floor(10000000000 + Math.random() * 90000000000).toString();
}

/**
 * Test user data interface
 */
export interface TestUser {
  email: string;
  sliqId: string;
  password: string;
  otp: string;
  residence: string;
  nationality: string;
  verificationType: 'bvn' | 'nin';
  verificationNumber: string;
}

/**
 * Generate complete test user data
 */
export function generateTestUser(): TestUser {
  const verificationType = Math.random() > 0.5 ? 'bvn' : 'nin';
  return {
    email: generateRandomEmail(),
    sliqId: generateRandomSliqId(),
    password: generateStrongPassword(),
    otp: generateOTPCode(),
    residence: 'Nigeria',
    nationality: 'Nigeria',
    verificationType,
    verificationNumber: verificationType === 'bvn' ? generateBVN() : generateNIN(),
  };
}

/**
 * Wait for a specific duration (useful for animations/transitions)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
