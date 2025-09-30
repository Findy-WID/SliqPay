import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: 'Validation failed', details: parsed.error.flatten() } }, { status: 400 });
    }
    const { email, password } = parsed.data;
    const result = await login(email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ error: { message: error.message } }, { status });
  }
}