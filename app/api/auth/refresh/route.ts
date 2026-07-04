import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { redis } from '@/lib/redis';
import { verifyRefreshToken, signAccessToken, hashToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Refresh token missing', code: 'MISSING_REFRESH_TOKEN', status: 401 },
      { status: 401 }
    );
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 },
        { status: 401 }
      );
    }

    const hashed = hashToken(refreshToken);

    // Query PostgreSQL using administrative context to check session validity
    await prisma.$executeRaw`SELECT set_config('app.current_role', 'super_admin', true)`;
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token_hash: hashed },
      include: {
        user: {
          include: {
            user_roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!dbToken || dbToken.revoked || dbToken.expires_at < new Date()) {
      return NextResponse.json(
        { error: 'Session expired or revoked', code: 'SESSION_REVOKED', status: 401 },
        { status: 401 }
      );
    }

    const userRole = dbToken.user.user_roles[0]?.role.name || 'visitor';

    // Generate new Access Token
    const accessPayload = {
      userId: dbToken.user.id,
      role: userRole,
      totpEnabled: dbToken.user.totp_enabled,
    };
    const newAccessToken = signAccessToken(accessPayload);

    // Refresh Edge session state in Upstash Redis cache
    await redis.set(
      `session:${dbToken.user.id}:${hashed}`,
      { role: userRole, totpEnabled: dbToken.user.totp_enabled },
      { ex: Math.max(0, Math.ceil((dbToken.expires_at.getTime() - Date.now()) / 1000)) }
    );

    const response = NextResponse.json({
      access_token: newAccessToken,
      user: {
        id: dbToken.user.id,
        email: dbToken.user.email,
        display_name: dbToken.user.display_name,
        role: userRole,
      },
    });

    // Set updated access token cookie for initial middleware SSR check
    response.cookies.set('access_token', newAccessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred', code: 'SERVER_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
