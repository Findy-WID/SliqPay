import { z } from 'zod';

// E.164: "+" + country code (1-3 digits) + subscriber number, max 15 digits total (excluding "+")
export const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export function sanitizePhone(input: string): string {
  // Remove spaces, hyphens, parentheses, and dots; keep leading "+"
  const trimmed = input.trim();
  const keepPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d+]/g, '');
  // If multiple plus signs slipped in, keep only the first at start
  const normalized = keepPlus ? `+${digits.replace(/\+/g, '')}` : digits.replace(/\+/g, '');
  return normalized;
}

const notEmailLike = (val: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

export const signupSchema = z.object({
  fname: z.string().trim().min(1, 'First name is required'),
  lname: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  cPassword: z.string().min(1, 'Please confirm your password'),
  phone: z
    .string()
    .transform((v) => sanitizePhone(v))
    .refine((v) => v.length === 0 || E164_REGEX.test(v), {
      message: 'Phone must be in E.164 format, e.g. +2348012345678',
    })
    .refine((v) => v.length === 0 || notEmailLike(v), {
      message: 'Phone number cannot be an email address',
    })
    .optional()
    .default(''),
}).refine((data) => data.password === data.cPassword, {
  message: 'Passwords do not match',
  path: ['cPassword'],
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
