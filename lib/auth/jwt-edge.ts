import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'mock_jwt_secret_must_be_very_long_for_security';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mock_jwt_refresh_secret_must_be_very_long_for_security';

const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const JWT_REFRESH_SECRET_KEY = new TextEncoder().encode(JWT_REFRESH_SECRET);

export interface AccessPayload {
  userId: string;
  role: string;
  totpEnabled: boolean;
}

export interface RefreshPayload {
  userId: string;
}

export async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as unknown as AccessPayload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET_KEY);
    return payload as unknown as RefreshPayload;
  } catch (error) {
    return null;
  }
}

import { cookies } from 'next/headers';

export interface AdminSession {
  userId: string;
  role: string;
  totp_enabled: boolean;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    if (!accessToken) return null;

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return null;

    return {
      userId: payload.userId,
      role: payload.role,
      totp_enabled: payload.totpEnabled,
    };
  } catch (error) {
    return null;
  }
}

export async function hashToken(token: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
