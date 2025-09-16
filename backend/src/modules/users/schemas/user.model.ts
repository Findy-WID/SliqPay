export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdAt: Date;
  // Optional E.164 phone number
  phone?: string;
  // Optional referral code captured at signup
  referralCode?: string;
}
