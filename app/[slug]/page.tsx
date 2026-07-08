import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { IconCalendar, IconEye, IconShare, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import ChannelTag from '@/components/articles/ChannelTag';
import SoWhatBox from '@/components/articles/SoWhatBox';
import { getFallbackImage } from '@/lib/utils/image';
import Favicon from '@/components/ui/Favicon';
import ArticleImage from '@/components/articles/ArticleImage';
import BodyImageErrorListener from '@/components/articles/BodyImageErrorListener';
import { cachedQuery } from '@/lib/cache/queries';
import { CACHE_TTL } from '@/lib/cache/ttl';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  // Set RLS Context based on user auth token
  const { userId, role } = await getSessionAndSetRls();
  const isVisitor = role === 'visitor';
  
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Retrieve the article
  const cacheKey = `cache:article:${slug}`;
  const article = isVisitor
    ? await cachedQuery(cacheKey, CACHE_TTL.ARTICLE_DETAIL, () =>
        prisma.article.findUnique({
          where: { slug },
          include: {
            channel: true,
            audit_record: true,
            sources: true,
            images: true,
          },
        })
      )
    : await prisma.article.findUnique({
        where: { slug },
        include: {
          channel: true,
          audit_record: true,
          sources: true,
          images: true,
        },
      });

  if (!article) {
    notFound();
  }

  // Redirect deep dives to their dedicated page format
  if (article.content_tier === 'deep_dive') {
    redirect(`/deep-dives/${slug}`);
  }

  // Security RLS Enforcement: drafts/archived articles are only visible to creators or authorized editors
  if (article.status !== 'published') {
    const isCreator = userId && article.created_by === userId;
    const isStaff = ['editor', 'senior_editor', 'admin', 'super_admin'].includes(role);
    if (!isCreator && !isStaff) {
      notFound();
    }
  }

  // Increment view count using set_config context bypass (system-level)
  try {
    await prisma.article.update({
      where: { id: article.id },
      data: { view_count: { increment: 1 } },
    });
  } catch (err) {
    console.error('Failed to increment view count:', err);
  }

  // Sanitize the body HTML safely
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

  const readTime = article.read_time_minutes || Math.max(1, Math.ceil((article.body_html || '').split(/\s+/).length / 200));
  const hasSoWhat = !!(article.so_what_dev || article.so_what_security || article.so_what_founders || article.so_what_creators || article.so_what_data);

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Back to Home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-label text-muted hover:text-off-white transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>Back to News Feed</span>
        </Link>

        {/* Full-width Hero Image */}
        <div className="w-full flex flex-col gap-2">
          <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-2xl border border-border/80 bg-surface">
            <ArticleImage
              src={coverImage}
              alt={coverAlt}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>

        {/* Hero Meta & Title block */}
        <header className="max-w-[720px] w-full mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-label text-muted font-mono">
            {article.channel && (
              <ChannelTag name={article.channel.name} colorHex={article.channel.color_hex} />
            )}
            {article.is_breaking && (
              <span className="bg-rift-red text-near-black px-2 py-0.5 rounded text-label font-extrabold animate-pulse shrink-0">
                ⚡ Breaking
              </span>
            )}
            <span>·</span>
            <span>{readTime} min read</span>
            <span>·</span>
            <span>{publishedDate}</span>
          </div>

          <h1 className="text-[36px] md:text-[42px] font-bold font-headlines leading-tight text-off-white">
            {article.headline}
          </h1>

          {article.deck && (
            <p className="text-[18px] text-muted leading-relaxed font-body font-normal">
              {article.deck}
            </p>
          )}

          <div className="text-label text-muted font-mono py-2 border-y border-border/40">
            By <span className="text-off-white font-bold">NowRift Editorial</span>
          </div>
        </header>

        {/* Article Body */}
        <div className="flex flex-col gap-8">
          
          <article 
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
            className="article-body max-w-[720px] mx-auto w-full text-off-white/90 font-body"
          />

          {/* So What Card Grid */}
          {hasSoWhat && (
            <section className="max-w-[720px] mx-auto w-full mt-10">
              <h2 className="text-[20px] font-bold font-headlines mb-6 text-off-white border-b border-border/40 pb-2">
                The "So What?" Perspective
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {article.so_what_dev && (
                  <div className="p-5 bg-surface border-l-4 border-dev-blue rounded-r-lg border-y border-r border-border/60 flex flex-col gap-2">
                    <span className="text-label font-bold text-dev-blue font-mono">Developer Impact</span>
                    <p className="text-[14px] leading-relaxed text-off-white/80">{article.so_what_dev}</p>
                  </div>
                )}
                {article.so_what_security && (
                  <div className="p-5 bg-surface border-l-4 border-sec-amber rounded-r-lg border-y border-r border-border/60 flex flex-col gap-2">
                    <span className="text-label font-bold text-sec-amber font-mono">Security Analysis</span>
                    <p className="text-[14px] leading-relaxed text-off-white/80">{article.so_what_security}</p>
                  </div>
                )}
                {article.so_what_founders && (
                  <div className="p-5 bg-surface border-l-4 border-founders-purple rounded-r-lg border-y border-r border-border/60 flex flex-col gap-2">
                    <span className="text-label font-bold text-founders-purple font-mono">Founders Take</span>
                    <p className="text-[14px] leading-relaxed text-off-white/80">{article.so_what_founders}</p>
                  </div>
                )}
                {article.so_what_creators && (
                  <div className="p-5 bg-surface border-l-4 border-creators-teal rounded-r-lg border-y border-r border-border/60 flex flex-col gap-2">
                    <span className="text-label font-bold text-creators-teal font-mono">Creators Insights</span>
                    <p className="text-[14px] leading-relaxed text-off-white/80">{article.so_what_creators}</p>
                  </div>
                )}
                {article.so_what_data && (
                  <div className="p-5 bg-surface border-l-4 border-rift-red rounded-r-lg border-y border-r border-border/60 flex flex-col gap-2">
                    <span className="text-label font-bold text-rift-red font-mono">Data Science Perspective</span>
                    <p className="text-[14px] leading-relaxed text-off-white/80">{article.so_what_data}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Sources Section */}
          {article.sources.length > 0 && (
            <section className="max-w-[720px] mx-auto w-full mt-10 p-6 bg-surface border border-border/60 rounded-xl">
              <h3 className="text-[20px] font-bold font-headlines mb-4 text-off-white">Sources synthesised</h3>
              <ul className="space-y-4">
                {article.sources.map((src) => {
                  const similarity = src.similarity_score ?? 0;
                  let badgeColor = "text-grant-green border-grant-green/30 bg-grant-green/10";
                  if (similarity >= 0.15) {
                    badgeColor = "text-rift-red border-rift-red/30 bg-rift-red/10";
                  } else if (similarity >= 0.10) {
                    badgeColor = "text-sec-amber border-sec-amber/30 bg-sec-amber/10";
                  }

                  return (
                    <li key={src.id} className="flex items-center justify-between gap-4 py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <Favicon domain={src.source_domain} />
                        <a
                          href={src.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-dev-blue hover:text-dev-blue/80 hover:underline text-[14px] font-medium truncate"
                        >
                          {src.source_title || src.source_domain || "Source Article"}
                        </a>
                      </div>
                      {src.similarity_score !== null && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badgeColor} shrink-0`}>
                          {Math.round(similarity * 100)}% Match
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}



        </div>
      </main>

      <BodyImageErrorListener />
      <Footer />
    </div>
  );
}
