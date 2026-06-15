import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import ArticleHero from '@/components/articles/ArticleHero';
import ArticleCard from '@/components/articles/ArticleCard';
import NewsletterForm from '@/components/newsletter/NewsletterForm';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  // Set the Row Level Security (RLS) context using the incoming user session
  await getSessionAndSetRls();

  const resolvedParams = await searchParams;
  const channelSlug = typeof resolvedParams.channel === 'string' ? resolvedParams.channel : undefined;

  // 1. Fetch active channels for layout filters
  const channels = await prisma.channel.findMany({
    where: { is_active: true },
    orderBy: { sort_order: 'asc' },
  });

  // 2. Fetch featured article (marked is_featured: true or latest published)
  let featuredArticle = await prisma.article.findFirst({
    where: {
      status: 'published',
      is_featured: true,
      ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
    },
    include: {
      channel: true,
      audit_record: true,
      images: true,
    },
    orderBy: {
      published_at: 'desc',
    },
  });

  // Fallback to latest published if no featured found for this channel/overall
  if (!featuredArticle) {
    featuredArticle = await prisma.article.findFirst({
      where: {
        status: 'published',
        ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
      },
      include: {
        channel: true,
        audit_record: true,
        images: true,
      },
      orderBy: {
        published_at: 'desc',
      },
    });
  }

  // 3. Fetch recent articles (exclude featured to avoid duplicate displays)
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      ...(channelSlug ? { channel: { slug: channelSlug } } : {}),
      NOT: featuredArticle ? { id: featuredArticle.id } : undefined,
    },
    include: {
      channel: true,
      audit_record: true,
      images: true,
    },
    orderBy: {
      published_at: 'desc',
    },
    take: 10,
  });

  // 4. Fetch recent grants for the sidebar widget
  const recentGrants = await prisma.grant.findMany({
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
            {featuredArticle && (
              <ArticleHero article={featuredArticle as any} />
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
                <div className="p-8 text-center bg-surface border border-border rounded-xl">
                  <p className="text-body-l text-muted">No published articles found in this channel.</p>
                </div>
              )}
            </div>
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
