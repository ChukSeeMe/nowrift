import { NextRequest, NextResponse } from 'next/server';
import prisma, { setRlsContext } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector');
  const geo = searchParams.get('geo');
  const status = searchParams.get('status');
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sort = searchParams.get('sort') || 'deadline';
  const limit = 20;

  const userId = request.headers.get('x-user-id') || null;
  const userRole = request.headers.get('x-user-role') || 'visitor';

  try {
    await setRlsContext(userId, userRole);

    const skip = (page - 1) * limit;

    const where: any = {};

    if (!['admin', 'super_admin'].includes(userRole)) {
      where.status = {
        in: ['open', 'closing_soon', 'closed', 'awarded'],
      };
    }

    if (status) {
      where.status = status.toLowerCase();
    }

    if (sector) {
      where.sectors = {
        has: sector.toLowerCase(),
      };
    }

    if (geo) {
      where.geo_scope = {
        has: geo.toLowerCase(),
      };
    }

    let orderBy: any = { deadline: 'asc' };
    if (sort === 'amount') {
      orderBy = { funding_max: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { published_at: 'desc' };
    } else if (sort === 'deadline') {
      orderBy = { deadline: 'asc' };
    }

    const [grants, totalCount] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.grant.count({ where }),
    ]);

    return NextResponse.json({
      grants,
      pagination: {
        page,
        limit,
        total_count: totalCount,
        total_pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch grants error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve grants', code: 'DATABASE_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
