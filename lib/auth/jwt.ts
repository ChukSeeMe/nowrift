import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'mock_jwt_secret_must_be_very_long_for_security';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mock_jwt_refresh_secret_must_be_very_long_for_security';

export interface AccessPayload {
  userId: string;
  role: string;
  totpEnabled: boolean;
}

export interface RefreshPayload {
  userId: string;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function verifyAccessToken(token: string): AccessPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AccessPayload;
  } catch (error) {
    return null;
  }
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string): RefreshPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshPayload;
  } catch (error) {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
