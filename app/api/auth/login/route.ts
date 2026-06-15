import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authenticator } from '@otplib/preset-default';
import prisma from '@/lib/db/prisma';
import { redis } from '@/lib/redis';
import { signAccessToken, signRefreshToken, hashToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  totp_code: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  let email = '';

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid inputs', code: 'INVALID_INPUTS', status: 400 },
        { status: 400 }
      );
    }

    email = parsed.data.email.toLowerCase();
    const { password, totp_code } = parsed.data;

    // 1. Brute-force rate limiting check (5 attempts per 15 minutes)
    const ipLimitKey = `login_fail_ip:${ip}`;
    const emailLimitKey = `login_fail_email:${email}`;

    const failedIpCount = Number(await redis.get(ipLimitKey)) || 0;
    const failedEmailCount = Number(await redis.get(emailLimitKey)) || 0;

    if (failedIpCount >= 5 || failedEmailCount >= 5) {
      // Log failed attempt
      await prisma.$executeRaw`SELECT set_config('app.current_role', 'super_admin', true)`;
      await prisma.loginAttempt.create({
        data: {
          email,
          ip_address: ip,
          success: false,
          failure_reason: 'rate_limited',
        },
      });

      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.', code: 'RATE_LIMIT_EXCEEDED', status: 429 },
        { status: 429 }
      );
    }

    // 2. Query user (bypass RLS for auth lookup by setting role temporarily)
    await prisma.$executeRaw`SELECT set_config('app.current_role', 'super_admin', true)`;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.status === 'suspended' || user.status === 'deleted') {
      await recordFailure(ip, email, 'user_not_found_or_inactive');
      return NextResponse.json(
        { error: 'Invalid email or password', code: 'INVALID_CREDENTIALS', status: 401 },
        { status: 401 }
      );
    }

    // 3. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await recordFailure(ip, email, 'invalid_password', user.id);
      return NextResponse.json(
        { error: 'Invalid email or password', code: 'INVALID_CREDENTIALS', status: 401 },
        { status: 401 }
      );
    }

    // 4. TOTP Verification for admins/super_admins
    const userRoleObj = user.user_roles[0]?.role;
    const userRole = userRoleObj?.name || 'visitor';
    const isAdminRole = userRole === 'admin' || userRole === 'super_admin';

    if (isAdminRole && user.totp_enabled) {
      if (!totp_code) {
        return NextResponse.json({
          totp_required: true,
          message: 'Two-factor authentication code required',
        });
      }

      const totpSecret = user.totp_secret || '';
      const totpVerified = authenticator.verify({
        token: totp_code,
        secret: totpSecret,
      });

      if (!totpVerified) {
        await recordFailure(ip, email, 'invalid_totp_code', user.id);
        return NextResponse.json(
          { error: 'Invalid two-factor authentication code', code: 'INVALID_TOTP', status: 401 },
          { status: 401 }
        );
      }
    }

    // 5. Successful Auth - Generate tokens
    const accessPayload = {
      userId: user.id,
      role: userRole,
      totpEnabled: user.totp_enabled,
    };

    const accessToken = signAccessToken(accessPayload);
    const refreshToken = signRefreshToken({ userId: user.id });
    const hashedRefresh = hashToken(refreshToken);

    // Save refresh token in database (using administrative role to bypass user RLS policies)
    await prisma.$executeRaw`SELECT set_config('app.current_role', 'super_admin', true)`;
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: hashedRefresh,
        ip_address: ip,
        user_agent: request.headers.get('user-agent'),
      },
    });

    // Save session in Upstash Redis cache (Edge access)
    await redis.set(
      `session:${user.id}:${hashedRefresh}`,
      { role: userRole, totpEnabled: user.totp_enabled },
      { ex: 7 * 24 * 3600 } // 7 days
    );

    // Record successful login
    await prisma.loginAttempt.create({
      data: {
        email,
        ip_address: ip,
        success: true,
        user_id: user.id,
        totp_used: user.totp_enabled && isAdminRole,
      },
    });

    // Clear failed login counters in Redis
    await redis.del(ipLimitKey);
    await redis.del(emailLimitKey);

    // Set RLS Context for any subsequent queries in this request lifecycle
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${user.id}, true)`;
    await prisma.$executeRaw`SELECT set_config('app.current_role', ${userRole}, true)`;

    // Write audit log entry
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        user_email: email,
        user_role: userRole,
        action: 'user_created', // fallback audit action or map correctly
        entity_type: 'users',
        entity_id: user.id,
        ip_address: ip,
        user_agent: request.headers.get('user-agent'),
        metadata: { login: 'success' },
      },
    });

    // 6. Return response with httpOnly Refresh Token cookie
    const response = NextResponse.json({
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: userRole,
        totp_enabled: user.totp_enabled,
      },
    });

    // httpOnly, Secure, SameSite=Strict cookie for refresh token
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    // Set non-httpOnly access_token cookie for initial middleware SSR check
    response.cookies.set('access_token', accessToken, {
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 mins in seconds
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred', code: 'SERVER_ERROR', status: 500 },
      { status: 500 }
    );
  }
}

async function recordFailure(ip: string, email: string, reason: string, userId?: string) {
  try {
    const ipLimitKey = `login_fail_ip:${ip}`;
    const emailLimitKey = `login_fail_email:${email}`;

    // Increment failed login Redis counters with 15-minute expiration
    const multi = redis.pipeline();
    multi.incr(ipLimitKey);
    multi.expire(ipLimitKey, 15 * 60);
    multi.incr(emailLimitKey);
    multi.expire(emailLimitKey, 15 * 60);
    await multi.exec();

    // Log to PostgreSQL
    await prisma.$executeRaw`SELECT set_config('app.current_role', 'super_admin', true)`;
    await prisma.loginAttempt.create({
      data: {
        email,
        ip_address: ip,
        success: false,
        failure_reason: reason,
        user_id: userId || null,
      },
    });
  } catch (err) {
    console.error('Error logging login failure:', err);
  }
}
