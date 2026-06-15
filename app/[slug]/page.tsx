import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { IconCalendar, IconEye, IconShare, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import ChannelTag from '@/components/articles/ChannelTag';
import SoWhatBox from '@/components/articles/SoWhatBox';
import AigenAuditPill from '@/components/articles/AigenAuditPill';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  // Set RLS Context based on user auth token
  const { userId, role } = await getSessionAndSetRls();
  
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Retrieve the article
  const article = await prisma.article.findUnique({
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
  const cleanHtml = DOMPurify.sanitize(article.body_html || '');
  
  const coverImage = article.images?.[0]?.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%231A1A24"/></svg>';
  const coverAlt = article.images?.[0]?.alt_text || article.headline;

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

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

        {/* Article Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {article.channel && (
              <ChannelTag name={article.channel.name} colorHex={article.channel.color_hex} />
            )}
            {article.is_breaking && (
              <span className="bg-rift-red text-near-black px-2 py-0.5 rounded text-label font-extrabold animate-pulse">
                ⚡ Breaking
              </span>
            )}
          </div>

          <h1 className="text-display-xl text-off-white leading-tight">
            {article.headline}
          </h1>

          {article.deck && (
            <p className="text-body-l text-muted font-light leading-relaxed">
              {article.deck}
            </p>
          )}

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/60 text-label text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <IconCalendar size={14} />
                {publishedDate}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <IconEye size={14} />
                {article.view_count + 1} Views
              </span>
            </div>
          </div>
        </header>

        {/* Big Cover Image */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-border/80 bg-surface">
          <Image
            src={coverImage}
            alt={coverAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 960px) 100vw, 960px"
          />
        </div>

        {/* Article Body & Sidebars */}
        <div className="flex flex-col gap-8">
          
          {/* Sanitized Body HTML */}
          <article 
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
            className="text-body-l text-off-white/90 space-y-5 
              [&>p]:leading-relaxed 
              [&>a]:text-rift-red [&>a]:underline hover:[&>a]:text-rift-red/80 
              [&>h2]:text-display-l [&>h2]:pt-6 [&>h2]:text-off-white
              [&>h3]:text-display-m [&>h3]:pt-4 [&>h3]:text-off-white
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2"
          />

          {/* So What Partitioned Box */}
          <SoWhatBox
            dev={article.so_what_dev}
            security={article.so_what_security}
            founders={article.so_what_founders}
            creators={article.so_what_creators}
            data={article.so_what_data}
            className="mt-4"
          />

          {/* Audit record pill */}
          {article.audit_record && (
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border/60 mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">AI Synthesis Model</span>
                <span className="text-body-m font-bold text-off-white">{article.audit_record.model_used}</span>
              </div>
              <AigenAuditPill
                similarityScore={article.audit_record.max_similarity_score}
                copyrightPassed={article.audit_record.copyright_passed}
                sourceCount={article.sources.length}
              />
            </div>
          )}

          {/* References & Citations */}
          {(article.sources.length > 0 || (Array.isArray(article.audit_record?.source_urls) && (article.audit_record.source_urls as string[]).length > 0)) && (
            <div className="p-6 bg-surface border border-border rounded-xl mt-4">
              <h3 className="text-display-m font-bold mb-4 text-off-white">Sources & Citations</h3>
              <ul className="space-y-3">
                {article.sources.length > 0 ? (
                  article.sources.map((src) => (
                    <li key={src.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-m">
                      <a
                        href={src.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dev-blue hover:text-dev-blue/80 hover:underline font-medium break-all"
                      >
                        {src.source_title || src.source_domain || src.source_url}
                      </a>
                      {src.similarity_score !== null && (
                        <span className="text-label text-muted shrink-0">
                          {Math.round(src.similarity_score * 100)}% Similarity
                        </span>
                      )}
                    </li>
                  ))
                ) : (
                  (article.audit_record!.source_urls as string[]).map((url, idx) => (
                    <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-m text-dev-blue font-medium break-all">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-dev-blue/80 hover:underline"
                      >
                        {url}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
