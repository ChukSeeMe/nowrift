import { NextRequest, NextResponse } from 'next/server';
import prisma, { setRlsContext } from '@/lib/db/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const userId = request.headers.get('x-user-id') || null;
  const userRole = request.headers.get('x-user-role') || 'visitor';

  try {
    await setRlsContext(userId, userRole);

    const grant = await prisma.grant.findUnique({
      where: { slug },
      include: {
        source: true,
      },
    });

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found', code: 'GRANT_NOT_FOUND', status: 404 },
        { status: 404 }
      );
    }

    const isAdmin = ['admin', 'super_admin'].includes(userRole);
    if (!isAdmin && ['draft', 'cancelled'].includes(grant.status.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized to view this grant', code: 'UNAUTHORIZED_GRANT', status: 403 },
        { status: 403 }
      );
    }

    return NextResponse.json({ grant });
  } catch (error: any) {
    console.error('Fetch grant by slug error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve grant details', code: 'DATABASE_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
