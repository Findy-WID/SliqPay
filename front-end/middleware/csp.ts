import { NextResponse, type NextRequest } from 'next/server';

export function cspMiddleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();
  
  // Define CSP directives
  const csp = [
    // Default policy for all content
    "default-src 'self'",
    
    // For scripts - self, and no unsafe-eval
    "script-src 'self' 'unsafe-inline'",
    
    // For styles
    "style-src 'self' 'unsafe-inline'",
    
    // For images
    "img-src 'self' data: blob:",
    
    // For fonts
    "font-src 'self'",
    
    // For connections
    "connect-src 'self'",
    
    // Frame ancestors (embeds)
    "frame-ancestors 'self'",
    
    // Block form submissions to external URLs
    "form-action 'self'",
    
    // Don't allow embedding in frames
    "frame-src 'self'",
    
    // Base URI restrictions
    "base-uri 'self'",
    
    // Block plugins
    "object-src 'none'",
  ].join("; ");

  // Set the CSP header
  response.headers.set('Content-Security-Policy', csp);

  return response;
}