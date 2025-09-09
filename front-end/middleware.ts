import { NextResponse, NextRequest } from 'next/server';

// Routes that require auth
const protectedPrefixes = ['/dashboard'];
// Auth pages
const authPages = ['/auth/login', '/auth/signup'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('accessToken');
  const isAuthed = !!token;

  // If accessing protected route while not authenticated -> redirect to login
  if (protectedPrefixes.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isAuthed) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  // If authenticated and hits auth page -> redirect to dashboard
  if (isAuthed && authPages.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
};
