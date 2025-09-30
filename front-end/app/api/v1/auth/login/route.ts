import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    console.log("Processing login request");
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      console.log("Login validation failed:", parsed.error.flatten());
      return NextResponse.json({ error: { message: 'Validation failed', details: parsed.error.flatten() } }, { status: 400 });
    }
    const { email, password } = parsed.data;
    console.log("Attempting login for:", email);
    const result = await login(email, password);
    console.log("Login successful for:", email);
    
    // Create a response with the token set as a cookie
    const response = NextResponse.json(result);
    response.cookies.set({
      name: 'accessToken',
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only in production
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes in seconds
    });
    
    return response;
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ error: { message: error.message } }, { status });
  }
}