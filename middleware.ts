import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Helper to add standard security headers
  const applySecurityHeaders = (res: NextResponse) => {
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return res;
  };

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = token ? await verifySessionToken(token) : false;

  // 1. Protect Admin UI Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    // If on login page and already authenticated, redirect to /admin
    if (isLoginPage) {
      if (isValid) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)));
      }
      return applySecurityHeaders(NextResponse.next());
    }

    // If on protected admin route and NOT authenticated, redirect to /admin/login
    if (!isValid) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  // 2. Protect Admin-Only API Routes (/api/*)
  const isAdminOnlyApi =
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/customers') ||
    (pathname.startsWith('/api/products') && method !== 'GET') ||
    (pathname.startsWith('/api/settings') && method !== 'GET') ||
    (pathname.startsWith('/api/testimonials/') && method !== 'GET');

  if (isAdminOnlyApi && !isValid) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Unauthorized: Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      )
    );
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/orders/:path*',
    '/api/customers/:path*',
    '/api/products/:path*',
    '/api/settings/:path*',
    '/api/testimonials/:path*',
  ],
};
