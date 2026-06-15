import { NextRequest, NextResponse } from 'next/server';
import prisma, { setRlsContext } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'article';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = 20;

  const userId = request.headers.get('x-user-id') || null;
  const userRole = request.headers.get('x-user-role') || 'visitor';

  try {
    await setRlsContext(userId, userRole);

    const skip = (page - 1) * limit;

    if (!q.trim()) {
      return NextResponse.json({ results: [], pagination: { page, limit, total_count: 0, total_pages: 0 } });
    }

    if (type === 'grant') {
      const where: any = {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
          { funder_name: { contains: q, mode: 'insensitive' } },
        ],
      };

      if (!['admin', 'super_admin'].includes(userRole)) {
        where.status = {
          in: ['open', 'closing_soon', 'closed', 'awarded'],
        };
      }

      const [grants, totalCount] = await Promise.all([
        prisma.grant.findMany({
          where,
          orderBy: { deadline: 'asc' },
          skip,
          take: limit,
        }),
        prisma.grant.count({ where }),
      ]);

      return NextResponse.json({
        results: grants,
        pagination: {
          page,
          limit,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / limit),
        },
      });
    } else {
      const where: any = {
        OR: [
          { headline: { contains: q, mode: 'insensitive' } },
          { deck: { contains: q, mode: 'insensitive' } },
          { body_html: { contains: q, mode: 'insensitive' } },
        ],
      };

      if (!['editor', 'senior_editor', 'admin', 'super_admin'].includes(userRole)) {
        where.status = 'published';
      }

      const [articles, totalCount] = await Promise.all([
        prisma.article.findMany({
          where,
          include: {
            channel: true,
            images: { take: 1 },
            audit_record: true,
          },
          orderBy: { published_at: 'desc' },
          skip,
          take: limit,
        }),
        prisma.article.count({ where }),
      ]);

      return NextResponse.json({
        results: articles,
        pagination: {
          page,
          limit,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / limit),
        },
      });
    }
  } catch (error: any) {
    console.error('Search query error:', error);
    return NextResponse.json(
      { error: 'Search failed', code: 'DATABASE_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
