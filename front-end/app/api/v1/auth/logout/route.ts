import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Create a response that will clear the access token cookie
    const response = NextResponse.json({ success: true });
    
    // Clear the auth cookie
    response.cookies.delete('accessToken');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}