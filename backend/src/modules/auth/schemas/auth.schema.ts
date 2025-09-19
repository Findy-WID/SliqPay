import { z } from 'zod';

const E164_REGEX = /^\+[1-9]\d{1,14}$/;
const notEmailLike = (val: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

function sanitizePhone(input: string): string {
  const trimmed = input.trim();
  const keepPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d+]/g, '');
  const normalized = keepPlus ? `+${digits.replace(/\+/g, '')}` : digits.replace(/\+/g, '');
  return normalized;
}

const phoneSchema = z
  .preprocess((v) => {
    if (typeof v !== 'string') return undefined;
    const s = sanitizePhone(v);
    return s.length ? s : undefined;
  }, z.string().regex(E164_REGEX, { message: 'Phone must be in E.164 format, e.g. +2348012345678' })
    .refine((v) => notEmailLike(v), { message: 'Phone number cannot be an email address' }))
  .optional();

export const signupSchema = z.object({
  body: z.object({
    fname: z.string().trim().min(1),
    lname: z.string().trim().min(1),
    email: z.string().trim().email(),
    password: z.string().min(8),
    phone: phoneSchema,
    refCode: z.string().trim().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
  })
});

export const forgotSchema = z.object({
  body: z.object({
    email: z.string().trim().email()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password: z.string().min(8)
  })
});

export const resetSchema = z.object({
  body: z.object({
    token: z.string().trim().min(10),
    password: z.string().min(8)
  })
});

export type SignupInput = z.infer<typeof signupSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotInput = z.infer<typeof forgotSchema>['body'];
export type ResetInput = z.infer<typeof resetSchema>['body'];
