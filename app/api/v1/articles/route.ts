import { NextRequest, NextResponse } from 'next/server';
import prisma, { setRlsContext } from '@/lib/db/prisma';
import { cachedQuery } from '@/lib/cache/queries';
import { CACHE_TTL } from '@/lib/cache/ttl';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel');
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 20));
  const breaking = searchParams.get('breaking') === 'true';

  const userId = request.headers.get('x-user-id') || null;
  const userRole = request.headers.get('x-user-role') || 'visitor';

  try {
    const isVisitor = !['editor', 'senior_editor', 'admin', 'super_admin'].includes(userRole);
    if (!isVisitor) {
      await setRlsContext(userId, userRole);
    }

    const skip = (page - 1) * limit;

    const where: any = {};

    // Enforce publication constraints based on role
    if (isVisitor) {
      where.status = 'published';
    }

    if (breaking) {
      where.is_breaking = true;
    }

    if (channel) {
      where.channel = {
        slug: channel,
      };
    }

    const fetchFn = async () => {
      const [articlesList, count] = await Promise.all([
        prisma.article.findMany({
          where,
          include: {
            channel: true,
            images: {
              take: 1,
            },
            audit_record: true,
          },
          orderBy: {
            published_at: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.article.count({ where }),
      ]);
      return { articlesList, count };
    };

    const cacheKey = `cache:api:articles:${channel || 'all'}:${page}:${limit}:${breaking}`;
    const { articlesList, count } = isVisitor
      ? await cachedQuery(cacheKey, CACHE_TTL.ARTICLE_LIST, fetchFn)
      : await fetchFn();

    return NextResponse.json({
      articles: articlesList,
      pagination: {
        page,
        limit,
        total_count: count,
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch articles error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve articles', code: 'DATABASE_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
