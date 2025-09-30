import { NextRequest, NextResponse } from 'next/server';
import { signup } from '@/lib/auth';
import { z } from 'zod';

const signupSchema = z.object({
  fname: z.string().trim().min(1, 'First name is required'),
  lname: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  refCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: 'Validation failed', details: parsed.error.flatten() } }, { status: 400 });
    }
    const { fname, lname, email, password, phone, refCode } = parsed.data;
    const result = await signup(fname, lname, email, password, phone, refCode);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ error: { message: error.message } }, { status });
  }
}