import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, hashToken } from './lib/auth/jwt-edge';
import { redis } from './lib/redis';

// Sliding window rate limit implementation using Upstash Redis
async function rateLimit(ip: string, path: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const key = `ratelimit:${ip}:${path}`;

  try {
    const multi = redis.pipeline();
    multi.zremrangebyscore(key, 0, now - windowMs);
    multi.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    multi.zcard(key);
    multi.expire(key, 60);
    const results = await multi.exec();

    const currentRequests = (results[2] as number) || 0;
    const limit = 100;
    const remaining = Math.max(0, limit - currentRequests);
    const reset = 60; // Approximately 60 seconds

    return {
      success: currentRequests <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail-open in case Redis is down to preserve availability
    return { success: true, limit: 100, remaining: 100, reset: 0 };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate Limiting for Public API Routes
  if (pathname.startsWith('/api/v1/') && !pathname.startsWith('/api/v1/admin/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rate = await rateLimit(ip, pathname);

    if (!rate.success) {
      const response = NextResponse.json(
        { error: 'Too Many Requests', code: 'RATE_LIMIT_EXCEEDED', status: 429 },
        { status: 429 }
      );
      response.headers.set('Retry-After', rate.reset.toString());
      return response;
    }
  }

  // 2. Admin Auth Guard
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/v1/admin/')) {
    // Exclude /admin/login from authentication checks to avoid redirect loops
    if (pathname === '/admin/login' || pathname === '/api/v1/admin/login' || pathname === '/api/auth/login') {
      return NextResponse.next();
    }

    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    let payload = accessToken ? await verifyAccessToken(accessToken) : null;

    // Attempt to refresh if access token is invalid/expired and refresh token is present
    if (!payload && refreshToken) {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        const hashed = await hashToken(refreshToken);
        // Verify token session state in Upstash Redis cache
        const sessionData = await redis.get(`session:${refreshPayload.userId}:${hashed}`);

        if (sessionData) {
          const userRole = (sessionData as any).role || 'visitor';
          const totpEnabled = (sessionData as any).totpEnabled || false;

          payload = {
            userId: refreshPayload.userId,
            role: userRole,
            totpEnabled,
          };
        }
      }
    }

    // Unauthorized - redirect or return JSON error
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based 2FA enforcement: Admin and super_admin must have TOTP enabled
    const isAdminRole = payload.role === 'admin' || payload.role === 'super_admin';
    if (isAdminRole && !payload.totpEnabled && pathname !== '/admin/setup-2fa') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Two-Factor Authentication Setup Required', code: 'TOTP_SETUP_REQUIRED', status: 403 },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/admin/setup-2fa', request.url));
    }

    // Authorized - set routing headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-role', payload.role);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/v1/:path*'],
};
