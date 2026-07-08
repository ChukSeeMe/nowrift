import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { 
  IconCalendar, 
  IconEye, 
  IconHourglass, 
  IconArrowLeft,
  IconGift,
  IconNews,
  IconUser,
  IconSparkles
} from '@tabler/icons-react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import ChannelTag from '@/components/articles/ChannelTag';
import { getFallbackImage } from '@/lib/utils/image';
import ArticleImage from '@/components/articles/ArticleImage';
import BodyImageErrorListener from '@/components/articles/BodyImageErrorListener';
import { cachedQuery } from '@/lib/cache/queries';
import { CACHE_TTL } from '@/lib/cache/ttl';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const FORMAT_CONFIG: { [key: string]: { name: string; color: string } } = {
  roundup: { name: 'Weekly Roundup', color: '#A855F7' },
  sector: { name: 'Sector Deep Dive', color: '#3B82F6' },
  explainer: { name: 'Explainer', color: '#10B981' },
  interview: { name: 'Founder Interview', color: '#F59E0B' },
  report: { name: 'State of Report', color: '#EF4444' },
};

export default async function DeepDiveDetailPage({ params }: PageProps) {
  // Set RLS Context
  const { role } = await getSessionAndSetRls();
  const isVisitor = role === 'visitor';

  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Retrieve the deep dive article
  const cacheKey = `cache:deep_dive:${slug}`;
  const article = isVisitor
    ? await cachedQuery(cacheKey, CACHE_TTL.DEEP_DIVES_LIST, () =>
        prisma.article.findFirst({
          where: { 
            slug,
            content_tier: 'deep_dive',
            status: 'published',
          },
          include: {
            audit_record: true,
            images: true,
          },
        })
      )
    : await prisma.article.findFirst({
        where: { 
          slug,
          content_tier: 'deep_dive',
          status: 'published',
        },
        include: {
          audit_record: true,
          images: true,
        },
      });

  if (!article) {
    notFound();
  }

  // Increment view count
  try {
    await prisma.article.update({
      where: { id: article.id },
      data: { view_count: { increment: 1 } },
    });
  } catch (err) {
    console.error('Failed to increment view count:', err);
  }

  // Sanitize the body HTML
  const cleanHtml = article.body_html || '';

  // Cover image logic - explicitly check for type 'hero' first
  const heroImage = article.images?.find(img => img.image_type === 'hero');
  const rawCoverUrl = heroImage?.image_url;
  const coverImage = (rawCoverUrl && rawCoverUrl !== 'css_fallback') ? rawCoverUrl : getFallbackImage(article.slug, article.headline, 800, 450);
  const coverAlt = heroImage?.alt_text || article.headline;

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Get format config
  const formatConfig = FORMAT_CONFIG[article.deep_dive_format || ''] || { name: 'Deep Dive', color: '#6B7280' };

  // Fetch conditional links:
  // 1. Sector Dives: Live grants in this sector
  let liveGrants: any[] = [];
  if (article.deep_dive_format === 'sector' && article.related_sector) {
    liveGrants = await prisma.grant.findMany({
      where: {
        sectors: { has: article.related_sector },
        status: { in: ['open', 'closing_soon'] },
      },
      orderBy: { published_at: 'desc' },
      take: 5,
    });
  }

  // 2. Roundups: Linked cards back to each daily article referenced
  let referencedArticles: any[] = [];
  if (article.deep_dive_format === 'roundup' && article.source_article_ids && article.source_article_ids.length > 0) {
    referencedArticles = await prisma.article.findMany({
      where: {
        id: { in: article.source_article_ids },
        status: 'published',
      },
      include: {
        channel: true,
      },
      orderBy: { published_at: 'desc' },
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Back to Hub link */}
        <Link
          href="/deep-dives"
          className="inline-flex items-center gap-2 text-label text-muted hover:text-off-white transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>Back to Deep Dives</span>
        </Link>

        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <ChannelTag name={formatConfig.name} colorHex={formatConfig.color} />
            {article.is_human_authored && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-dev-blue uppercase tracking-wider">
                <IconUser size={12} />
                Human Authored
              </span>
            )}
          </div>

          <h1 className="text-display-xl text-off-white leading-tight font-extrabold">
            {article.headline}
          </h1>

          {article.deck && (
            <p className="text-body-l text-muted font-light leading-relaxed">
              {article.deck}
            </p>
          )}

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/60 text-label text-muted font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <IconCalendar size={14} />
                {publishedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <IconHourglass size={14} />
                {article.read_time_minutes || 5} min read
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>{article.view_count + 1} Views</span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-border/80 bg-surface">
            <ArticleImage
              src={coverImage}
              alt={coverAlt}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8">
          
          <article 
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
            className="text-body-l text-off-white/90 space-y-6 
              [&>p]:leading-relaxed 
              [&>a]:text-rift-red [&>a]:underline hover:[&>a]:text-rift-red/80 
              [&>h2]:text-display-l [&>h2]:pt-6 [&>h2]:text-off-white [&>h2]:font-bold
              [&>h3]:text-display-m [&>h3]:pt-4 [&>h3]:text-off-white [&>h3]:font-bold
              [&>h4]:text-display-s [&>h4]:pt-3 [&>h4]:text-off-white [&>h4]:font-semibold
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2
              [&>table]:w-full [&>table]:border-collapse [&>table]:my-6
              [&>table_tr]:border-b [&>table_tr]:border-border/40
              [&>table_th]:p-3 [&>table_th]:text-left [&>table_th]:text-label [&>table_th]:text-muted [&>table_th]:bg-[#0d0d14]
              [&>table_td]:p-3 [&>table_td]:text-body-m [&>table_td]:text-off-white/80"
          />

          {/* Article Gallery (if multiple images exist) */}
          {article.images && article.images.filter(img => img.image_url !== 'css_fallback').length > 1 && (
            <div className="flex flex-col gap-6 p-6 rounded-xl bg-surface border border-border/60 mt-4">
              <h3 className="text-display-m font-bold text-off-white">Article Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {article.images.filter(img => img.image_url !== 'css_fallback').slice(1).map((img, idx) => (
                  <div key={img.id} className="flex flex-col gap-2">
                    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-border/80 bg-near-black">
                      <ArticleImage
                        src={img.image_url}
                        alt={img.alt_text || `Gallery image ${idx + 2}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Sections */}

          {/* 1. Sector Dive: Live Grants Panel */}
          {article.deep_dive_format === 'sector' && article.related_sector && (
            <div className="p-6 bg-surface border border-border rounded-xl space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <IconGift className="text-dev-blue" size={22} />
                <h3 className="text-display-m font-bold text-off-white">
                  Live Grants in {article.related_sector.toUpperCase()}
                </h3>
              </div>
              
              {liveGrants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {liveGrants.map((grant) => (
                    <div key={grant.id} className="p-4 border border-border/40 bg-near-black/50 rounded-lg hover:border-border transition-colors flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="text-body-m font-bold text-off-white line-clamp-1">
                          {grant.title}
                        </h4>
                        <p className="text-label text-muted mt-1 font-mono">
                          Funder: {grant.funder_name}
                        </p>
                      </div>
                      <Link 
                        href="/grants"
                        className="text-label text-dev-blue hover:underline font-bold self-start mt-2"
                      >
                        View Details &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body-m text-muted">No open grant applications currently indexed in this sector.</p>
              )}
            </div>
          )}

          {/* 2. Roundup: Referenced Daily Articles */}
          {article.deep_dive_format === 'roundup' && referencedArticles.length > 0 && (
            <div className="p-6 bg-surface border border-border rounded-xl space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <IconNews className="text-purple-400" size={22} />
                <h3 className="text-display-m font-bold text-off-white">
                  Referenced Daily Articles
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {referencedArticles.map((art) => (
                  <div key={art.id} className="p-4 border border-border/40 bg-near-black/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-body-m font-bold text-off-white">
                        {art.headline}
                      </h4>
                      <p className="text-label text-muted mt-0.5 line-clamp-1">
                        {art.deck}
                      </p>
                    </div>
                    <Link 
                      href={`/${art.slug}`}
                      className="text-label text-purple-400 hover:underline font-bold shrink-0"
                    >
                      Read Article &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}



        </div>
      </main>

      <BodyImageErrorListener />
      <Footer />
    </div>
  );
}
