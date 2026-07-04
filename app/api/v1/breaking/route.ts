import { NextRequest, NextResponse } from 'next/server';
import prisma, { setRlsContext } from '@/lib/db/prisma';
import { cachedQuery } from '@/lib/cache/queries';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || null;
  const userRole = request.headers.get('x-user-role') || 'visitor';

  try {
    const isVisitor = !['editor', 'senior_editor', 'admin', 'super_admin'].includes(userRole);
    if (!isVisitor) {
      await setRlsContext(userId, userRole);
    }

    const fetchFn = async () => {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      // Primary: genuinely breaking stories from the last 6 hours
      const breakingArticles = await prisma.article.findMany({
        where: {
          is_breaking: true,
          status: 'published',
          published_at: { gte: sixHoursAgo },
        },
        include: {
          channel: true,
        },
        orderBy: { published_at: 'desc' },
        take: 10,
      });

      let tickerArticles = [...breakingArticles];

      // Fallback: if < 5 articles, backfill with most recent breaking stories (regardless of time)
      if (tickerArticles.length < 5) {
        const backfillBreaking = await prisma.article.findMany({
          where: {
            is_breaking: true,
            status: 'published',
            NOT: {
              id: { in: tickerArticles.map(a => a.id) },
            },
          },
          include: {
            channel: true,
          },
          orderBy: { published_at: 'desc' },
          take: 5 - tickerArticles.length,
        });
        tickerArticles = [...tickerArticles, ...backfillBreaking];
      }

      // Final fallback: if still < 5 articles, add most recent regular published articles
      if (tickerArticles.length < 5) {
        const backfillRegular = await prisma.article.findMany({
          where: {
            status: 'published',
            NOT: {
              id: { in: tickerArticles.map(a => a.id) },
            },
          },
          include: {
            channel: true,
          },
          orderBy: { published_at: 'desc' },
          take: 5 - tickerArticles.length,
        });
        tickerArticles = [...tickerArticles, ...backfillRegular];
      }

      // Map output to expected frontend format: channel key contains name, slug, color_hex
      return tickerArticles.map(art => ({
        id: art.id,
        headline: art.headline,
        slug: art.slug,
        published_at: art.published_at ? art.published_at.toISOString() : null,
        channel: art.channel ? {
          name: art.channel.name,
          slug: art.channel.slug,
          color_hex: art.channel.color_hex,
        } : null,
      }));
    };

    const cacheKey = `cache:api:breaking:${userRole}`;
    const articles = isVisitor
      ? await cachedQuery(cacheKey, 60, fetchFn)
      : await fetchFn();

    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Fetch breaking articles error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve breaking articles', code: 'DATABASE_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
