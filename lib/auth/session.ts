import { cookies, headers } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import prisma from '@/lib/db/prisma';

export async function getSessionAndSetRls() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  
  let userId: string | null = null;
  let role = 'visitor';
  
  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      userId = payload.userId;
      role = payload.role;
    }
  }

  const headersList = await headers();
  const requestIp = headersList.get('x-forwarded-for')?.split(',')[0].trim() || 
                    headersList.get('x-real-ip') || 
                    '127.0.0.1';

  if (role !== 'visitor') {
    await prisma.$executeRaw`
      SELECT set_config('app.current_user_id', ${userId ?? ''}, true),
             set_config('app.current_role', ${role}, true),
             set_config('app.request_ip', ${requestIp}, true)
    `;
  }

  return { userId, role, requestIp };
}
