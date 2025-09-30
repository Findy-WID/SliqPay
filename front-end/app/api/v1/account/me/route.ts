import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publicUser, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ user: publicUser(user) });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  const body = await req.json();
  const { fname, lname, phone } = body;
  const updateData: any = {};
  if (fname) updateData.first_name = fname;
  if (lname) updateData.last_name = lname;
  if (phone) updateData.phone = phone;
  const user = await prisma.user.update({
    where: { id: payload.sub },
    data: updateData,
  });
  return NextResponse.json({ user: publicUser(user) });
}