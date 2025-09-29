import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { kv } from '@vercel/kv';
import { signup } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await signup(data);
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}
