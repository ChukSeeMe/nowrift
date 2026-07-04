import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/articles/HeroSlider';
import ArticleCard from '@/components/articles/ArticleCard';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import { Pagination } from '@/components/ui/Pagination';
import { cachedQuery } from '@/lib/cache/queries';
import { CACHE_TTL } from '@/lib/cache/ttl';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  // Set the Row Level Security (RLS) context using the incoming user session
  const { role } = await getSessionAndSetRls();
  const isVisitor = role === 'visitor';

  const resolvedParams = await searchParams;
  const channelSlug = typeof resolvedParams.channel === 'string' ? resolvedParams.channel : undefined;

  // 1. Fetch active channels for layout filters
  const channels = isVisitor
    ? await cachedQuery('cache:channels', CACHE_TTL.ARTICLE_LIST, () =>
        prisma.channel.findMany({
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
        })
      )
    : await prisma.channel.findMany({
        where: { is_active: true },
        orderBy: { sort_order: 'asc' },
      });

  // 2. Fetch 5 hero articles (mix of breaking, high relevance, and recent)
  const heroCacheKey = `cache:hero_articles:${channelSlug || 'overall'}`;
  const heroArticles = isVisitor
    ? await cachedQuery(heroCacheKey, CACHE_TTL.ARTICLE_LIST, () =>
        prisma.article.findMany({
          where: {
            status: 'published',
            content_tier: 'daily',
            ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
          },
          include: {
            channel: true,
            images: {
              where: { image_type: 'hero' },
              take: 1,
            },
          },
          orderBy: [
            { is_breaking: 'desc' },
            { relevance_score: 'desc' },
            { published_at: 'desc' },
          ],
          take: 5,
        })
      )
    : await prisma.article.findMany({
        where: {
          status: 'published',
          content_tier: 'daily',
          ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
        },
        include: {
          channel: true,
          images: {
            where: { image_type: 'hero' },
            take: 1,
          },
        },
        orderBy: [
          { is_breaking: 'desc' },
          { relevance_score: 'desc' },
          { published_at: 'desc' },
        ],
        take: 5,
      });

  const heroIds = heroArticles.map((art) => art.id);

  // 3. Fetch recent articles (exclude hero articles to avoid duplicate displays)
  const currentPage = Math.max(1, parseInt(typeof resolvedParams.page === 'string' ? resolvedParams.page : '1'));
  const ARTICLES_PER_PAGE = 20;

  const articlesCacheKey = `cache:home_articles:${channelSlug || 'all'}:${heroIds.join('-') || 'none'}:${currentPage}`;
  const countCacheKey = `cache:home_articles_count:${channelSlug || 'all'}:${heroIds.join('-') || 'none'}`;

  const articles = isVisitor
    ? await cachedQuery(articlesCacheKey, CACHE_TTL.ARTICLE_LIST, () =>
        prisma.article.findMany({
          where: {
            status: 'published',
            ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
            NOT: heroIds.length > 0 ? { id: { in: heroIds } } : undefined,
          },
          include: {
            channel: true,
            audit_record: true,
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
          status: 'published',
          ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
          NOT: heroIds.length > 0 ? { id: { in: heroIds } } : undefined,
        },
        include: {
          channel: true,
          audit_record: true,
          images: true,
        },
        orderBy: {
          published_at: 'desc',
        },
        skip: (currentPage - 1) * ARTICLES_PER_PAGE,
        take: ARTICLES_PER_PAGE,
      });

  const totalCount = isVisitor
    ? await cachedQuery(countCacheKey, CACHE_TTL.ARTICLE_LIST, () =>
        prisma.article.count({
          where: {
            status: 'published',
            ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
            NOT: heroIds.length > 0 ? { id: { in: heroIds } } : undefined,
          },
        })
      )
    : await prisma.article.count({
        where: {
          status: 'published',
          ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
          NOT: heroIds.length > 0 ? { id: { in: heroIds } } : undefined,
        },
      });

  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  // Convert resolvedParams for searchParams prop
  const pageParams: Record<string, string | undefined> = {};
  Object.entries(resolvedParams).forEach(([key, val]) => {
    if (typeof val === 'string') {
      pageParams[key] = val;
    } else if (Array.isArray(val)) {
      pageParams[key] = val[0];
    }
  });

  // 4. Fetch recent grants for the sidebar widget
  const recentGrants = isVisitor
    ? await cachedQuery('cache:recent_grants', CACHE_TTL.GRANTS_LIST, () =>
        prisma.grant.findMany({
          where: {
            status: { in: ['open', 'closing_soon'] },
          },
          orderBy: {
            published_at: 'desc',
          },
          take: 3,
        })
      )
    : await prisma.grant.findMany({
        where: {
          status: { in: ['open', 'closing_soon'] },
        },
        orderBy: {
          published_at: 'desc',
        },
        take: 3,
      });

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Dual-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed Column (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Featured Hero Article */}
            {/* Featured Hero Slider */}
            {heroArticles.length > 0 && (
              <HeroSlider articles={heroArticles as any} />
            )}


            {/* Channel Tabs Filter */}
            <div className="flex flex-wrap gap-2 border-b border-border/60 pb-4">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-label font-bold transition-all border ${
                  !channelSlug
                    ? 'bg-off-white text-near-black border-off-white'
                    : 'text-muted border-border hover:text-off-white hover:border-muted'
                }`}
              >
                All News
              </Link>
              {channels.map((chan) => {
                const isActive = channelSlug === chan.slug;
                return (
                  <Link
                    key={chan.id}
                    href={`/?channel=${chan.slug}`}
                    className={`px-3 py-1.5 rounded-lg text-label font-bold transition-all border`}
                    style={{
                      backgroundColor: isActive ? chan.color_hex : 'transparent',
                      color: isActive ? 'var(--color-near-black)' : 'var(--color-muted)',
                      borderColor: isActive ? chan.color_hex : 'var(--color-border)',
                    }}
                  >
                    {chan.name}
                  </Link>
                );
              })}
            </div>

            {/* Articles List */}
            <div className="flex flex-col gap-4">
              {articles.length > 0 ? (
                articles.map((art) => (
                  <ArticleCard key={art.id} article={art as any} />
                ))
              ) : (
                heroArticles.length === 0 && (
                  <div className="p-8 text-center bg-surface border border-border rounded-xl">
                    <p className="text-body-l text-muted">No published articles found in this channel.</p>
                  </div>
                )
              )}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/"
              searchParams={pageParams}
            />
          </div>

          {/* Sidebar Widgets Column (1/3 width) */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <NewsletterForm />

            {/* Featured Grants Sidebar Widget */}
            <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
              <h3 className="text-display-m font-bold text-off-white">Featured Funding</h3>
              <div className="flex flex-col gap-3">
                {recentGrants.length > 0 ? (
                  recentGrants.map((grant) => (
                    <Link
                      key={grant.id}
                      href={`/grants/${grant.slug}`}
                      className="group p-3 bg-near-black/35 hover:bg-near-black/60 border border-border/60 rounded-lg transition-colors flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-muted">
                          {grant.funder_name}
                        </span>
                        <span className="text-[10px] font-mono text-grant-green font-bold">
                          {grant.funding_max
                            ? `Up to ${new Intl.NumberFormat('en-GB', {
                                style: 'currency',
                                currency: grant.currency || 'GBP',
                                maximumFractionDigits: 0,
                              }).format(Number(grant.funding_max))}`
                            : 'Funding Unspecified'}
                        </span>
                      </div>
                      <h4 className="text-body-m font-bold text-off-white group-hover:text-rift-red transition-colors line-clamp-1">
                        {grant.title}
                      </h4>
                    </Link>
                  ))
                ) : (
                  <p className="text-body-m text-muted">No featured grants available.</p>
                )}
              </div>
              <Link
                href="/grants"
                className="text-label text-dev-blue font-bold hover:text-dev-blue/80 transition-colors inline-flex items-center gap-1.5 mt-1"
              >
                <span>View All Grants</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
