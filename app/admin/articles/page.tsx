import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db/prisma';
import ArticleSearchClient from './ArticleSearchClient';
import { getFallbackImage } from '@/lib/utils/image';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    channelId?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ArticlesAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status || 'all';
  const channelId = params.channelId || '';
  const search = params.search || '';
  const page = Math.max(1, Number(params.page) || 1);

  const where: any = {};
  if (status !== 'all') {
    where.status = status;
  }
  if (channelId) {
    where.channel_id = channelId;
  }
  if (search) {
    where.headline = {
      contains: search,
      mode: 'insensitive',
    };
  }

  const limit = 20;
  const skip = (page - 1) * limit;

  // Retrieve matching articles, count, and active channels list
  const [articles, totalCount, channels] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        channel: true,
        sources: true,
        images: { take: 1 },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
    prisma.channel.findMany({
      orderBy: { sort_order: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Status Badge Helper
  const getStatusBadge = (artStatus: string) => {
    const s = artStatus.toLowerCase();
    const classes: Record<string, string> = {
      draft: 'text-muted border-border bg-border/20',
      in_review: 'text-sec-amber border-sec-amber/30 bg-sec-amber/10',
      approved: 'text-dev-blue border-dev-blue/30 bg-dev-blue/10',
      published: 'text-grant-green border-grant-green/30 bg-grant-green/10',
      retracted: 'text-rift-red border-rift-red/30 bg-rift-red/10',
      archived: 'text-muted border-border/80 bg-near-black/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-label font-bold border ${classes[s] || classes.draft}`}>
        {artStatus.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-xl text-off-white">Articles Management</h1>
          <p className="text-body-l text-muted">Review, edit, and publish AI-synthesized updates.</p>
        </div>
      </div>

      {/* Filter Bar (Client side integration) */}
      <div className="p-6 rounded-xl border border-border bg-surface/50">
        <ArticleSearchClient
          initialSearch={search}
          initialChannelId={channelId}
          initialStatus={status}
          channels={channels}
        />
      </div>

      {/* Articles Table */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {articles.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-label text-muted bg-[#0d0d14]/40">
                  <th className="p-4 font-bold">Preview</th>
                  <th className="p-4 font-bold">Headline</th>
                  <th className="p-4 font-bold">Channel</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Relevance</th>
                  <th className="p-4 font-bold">Sources</th>
                  <th className="p-4 font-bold">Published At</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => {
                  const rawThumb = art.images?.[0]?.image_url;
                  const thumb = (rawThumb && rawThumb !== 'css_fallback') ? rawThumb : getFallbackImage(art.slug, art.headline, 48, 48);
                  const rel = art.relevance_score ?? 0;
                  const relColor = 
                    rel >= 0.8 ? 'text-grant-green' : 
                    rel >= 0.6 ? 'text-sec-amber' : 
                    'text-rift-red';

                  return (
                    <tr key={art.id} className="border-b border-border/40 hover:bg-surface/20 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-near-black border border-border/40 shrink-0">
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-off-white/95 max-w-md truncate">
                        <Link href={`/admin/articles/${art.id}`} className="hover:text-rift-red transition-colors">
                          {art.headline}
                        </Link>
                      </td>
                      <td className="p-4">
                        {art.channel && (
                          <span 
                            className="px-2 py-0.5 rounded text-label font-bold border"
                            style={{
                              color: art.channel.color_hex,
                              borderColor: `${art.channel.color_hex}30`,
                              backgroundColor: `${art.channel.color_hex}10`,
                            }}
                          >
                            {art.channel.name}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(art.status)}
                      </td>
                      <td className="p-4 font-mono font-bold text-body-m">
                        <span className={relColor}>{rel.toFixed(2)}</span>
                      </td>
                      <td className="p-4 text-body-m text-muted font-mono">
                        {art.sources.length}
                      </td>
                      <td className="p-4 text-body-m text-muted">
                        {art.published_at 
                          ? new Date(art.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'
                        }
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/articles/${art.id}`}
                          className="px-3 py-1.5 text-label font-bold border border-border text-muted hover:text-off-white hover:border-off-white/20 rounded transition-all"
                        >
                          Edit / Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-body-l text-muted">
              No articles found matching the filters.
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#0d0d14]/40 border-t border-border flex justify-between items-center">
            <span className="text-body-m text-muted">
              Showing page {page} of {totalPages} ({totalCount} total articles)
            </span>
            <div className="flex gap-2">
              <Link
                href={`/admin/articles?page=${page - 1}&status=${status}&channelId=${channelId}&search=${search}`}
                className={`px-3 py-1.5 text-label font-bold border border-border rounded transition-all ${
                  page <= 1 ? 'pointer-events-none opacity-50' : 'hover:text-off-white'
                }`}
              >
                Previous
              </Link>
              <Link
                href={`/admin/articles?page=${page + 1}&status=${status}&channelId=${channelId}&search=${search}`}
                className={`px-3 py-1.5 text-label font-bold border border-border rounded transition-all ${
                  page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:text-off-white'
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
