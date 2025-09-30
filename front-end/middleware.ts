import { NextResponse, NextRequest } from 'next/server';
import { cspMiddleware } from './middleware/csp';

// Routes that require auth
const protectedPrefixes = ['/dashboard'];
// API routes that require auth
const protectedApiRoutes = ['/api/v1/accounts', '/api/v1/transactions'];
// Auth pages that redirect to dashboard if already logged in
const authPages = ['/auth/login', '/auth/signup'];
// Auth pages that are always accessible
const publicAuthPages = ['/auth/forgotpassword', '/auth/resetpassword'];
// Public API routes
const publicApiRoutes = ['/api/v1/auth/login', '/api/v1/auth/signup', '/api/v1/auth/forgotpassword', '/api/v1/auth/resetpassword'];

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

  // If accessing protected API route while not authenticated -> return 401
  if (protectedApiRoutes.some(p => pathname.startsWith(p)) && !publicApiRoutes.includes(pathname)) {
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // If authenticated and hits auth page (except reset pages) -> redirect to dashboard
  if (isAuthed && authPages.includes(pathname) && !publicAuthPages.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Apply CSP headers to the response
  const response = NextResponse.next();
  
  // Define CSP directives
  const csp = [
    // Default policy for all content
    "default-src 'self'",
    
    // Allow scripts from self and inline scripts (needed for Next.js)
    "script-src 'self' 'unsafe-inline'",
    
    // Allow styles from self and inline styles (needed for styled-components and other libraries)
    "style-src 'self' 'unsafe-inline'",
    
    // For images - allow self, data URIs (for small images), and blob (for processed images)
    "img-src 'self' data: blob:",
    
    // For fonts - allow self
    "font-src 'self'",
    
    // For connections - allow self (for API calls)
    "connect-src 'self'",
    
    // Block embedding in frames except from same origin
    "frame-ancestors 'self'",
    
    // Allow forms to be submitted only to same origin
    "form-action 'self'",
    
    // Block plugins like Flash, Java, etc.
    "object-src 'none'",
  ].join("; ");

  // Set the CSP header
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/api/v1/:path*', '/']
};
