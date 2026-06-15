import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false, role: 'visitor' });
  }

  const payload = verifyAccessToken(accessToken);
  if (!payload) {
    return NextResponse.json({ authenticated: false, role: 'visitor' });
  }

  return NextResponse.json({
    authenticated: true,
    userId: payload.userId,
    role: payload.role,
  });
}
