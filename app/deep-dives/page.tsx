import React from 'react';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import { DeepDivesClient } from './DeepDivesClient';
import { Pagination } from '@/components/ui/Pagination';
import { cachedQuery } from '@/lib/cache/queries';
import { CACHE_TTL } from '@/lib/cache/ttl';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DeepDivesIndexPage({ searchParams }: PageProps) {
  const { role } = await getSessionAndSetRls();
  const isVisitor = role === 'visitor';

  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1'));
  const ARTICLES_PER_PAGE = 20;

  // Fetch deep_dive articles with pagination
  const cacheKeyList = `cache:deep_dives:list:${currentPage}`;
  const cacheKeyCount = `cache:deep_dives:count`;

  const articles = isVisitor
    ? await cachedQuery(cacheKeyList, CACHE_TTL.DEEP_DIVES_LIST, () =>
        prisma.article.findMany({
          where: {
            content_tier: 'deep_dive',
            status: 'published',
          },
          include: {
            images: true,
          },
          orderBy: {
            published_at: 'desc',
          },
          skip: (currentPage - 1) * ARTICLES_PER_PAGE,
          take: ARTICLES_PER_PAGE,
        })
      )
    : await prisma.article.findMany({
        where: {
          content_tier: 'deep_dive',
          status: 'published',
        },
        include: {
          images: true,
        },
        orderBy: {
          published_at: 'desc',
        },
        skip: (currentPage - 1) * ARTICLES_PER_PAGE,
        take: ARTICLES_PER_PAGE,
      });

  const totalCount = isVisitor
    ? await cachedQuery(cacheKeyCount, CACHE_TTL.DEEP_DIVES_LIST, () =>
        prisma.article.count({
          where: {
            content_tier: 'deep_dive',
            status: 'published',
          },
        })
      )
    : await prisma.article.count({
        where: {
          content_tier: 'deep_dive',
          status: 'published',
        },
      });

  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  // Convert objects to plain JSON for client component
  const plainArticles = articles.map(art => ({
    id: art.id,
    slug: art.slug,
    headline: art.headline,
    deck: art.deck || '',
    body_html: art.body_html || '',
    content_tier: art.content_tier,
    deep_dive_format: art.deep_dive_format || '',
    related_sector: art.related_sector || '',
    is_human_authored: art.is_human_authored,
    read_time_minutes: art.read_time_minutes || 0,
    published_at: art.published_at
      ? (art.published_at instanceof Date
          ? art.published_at.toISOString()
          : new Date(art.published_at).toISOString())
      : '',
    image_url: art.images?.[0]?.image_url || '',
  }));

  // Convert resolvedParams for searchParams prop
  const pageParams: Record<string, string | undefined> = {};
  Object.entries(resolvedParams).forEach(([key, val]) => {
    if (typeof val === 'string') {
      pageParams[key] = val;
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <BreakingTicker />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <DeepDivesClient articles={plainArticles} />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/deep-dives"
            searchParams={pageParams}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
