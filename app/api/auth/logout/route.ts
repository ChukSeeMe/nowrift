import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { redis } from '@/lib/redis';
import { hashToken, verifyRefreshToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const refreshToken = request.cookies.get('refresh_token')?.value;

  try {
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      const payload = verifyRefreshToken(refreshToken);

      if (payload) {
        // Bypass RLS to perform the revocation of the refresh token session
        await prisma.$executeRaw`SELECT set_config('app.current_role', 'super_admin', true)`;

        // Revoke in database
        await prisma.refreshToken.updateMany({
          where: { token_hash: hashed },
          data: {
            revoked: true,
            revoked_at: new Date(),
            revoked_reason: 'user_logout',
          },
        });

        // Delete from Upstash Redis session cache
        await redis.del(`session:${payload.userId}:${hashed}`);

        // Write to audit log if user context is known
        await prisma.auditLog.create({
          data: {
            user_id: payload.userId,
            action: 'token_revoked',
            entity_type: 'refresh_tokens',
            ip_address: ip,
            user_agent: request.headers.get('user-agent'),
            metadata: { logout: 'success' },
          },
        });
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear authentication cookies
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('access_token', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred', code: 'SERVER_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
