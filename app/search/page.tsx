import React from 'react';
import Link from 'next/link';
import { IconSearch, IconArrowLeft, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import ArticleCard from '@/components/articles/ArticleCard';
import GrantCard from '@/components/grants/GrantCard';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  // Bind database RLS context
  const { role } = await getSessionAndSetRls();

  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : '';
  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : 'article';
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const limit = 10; // 10 results per page for compact display
  const skip = (page - 1) * limit;

  let results: any[] = [];
  let totalCount = 0;
  let totalPages = 0;

  if (q) {
    if (type === 'grant') {
      const where: any = {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
          { funder_name: { contains: q, mode: 'insensitive' } },
        ],
      };

      if (!['admin', 'super_admin'].includes(role)) {
        where.status = {
          in: ['open', 'closing_soon', 'closed', 'awarded'],
        };
      }

      [results, totalCount] = await Promise.all([
        prisma.grant.findMany({
          where,
          orderBy: { deadline: 'asc' },
          skip,
          take: limit,
        }),
        prisma.grant.count({ where }),
      ]);
    } else {
      const where: any = {
        OR: [
          { headline: { contains: q, mode: 'insensitive' } },
          { deck: { contains: q, mode: 'insensitive' } },
          { body_html: { contains: q, mode: 'insensitive' } },
        ],
      };

      if (!['editor', 'senior_editor', 'admin', 'super_admin'].includes(role)) {
        where.status = 'published';
      }

      [results, totalCount] = await Promise.all([
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
    }

    totalPages = Math.ceil(totalCount / limit);
  }

  // Helpers for pagination links
  const getPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('type', type);
    params.set('page', targetPage.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-label text-muted hover:text-off-white transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>Back to Feed</span>
        </Link>

        {/* Search Header and Form */}
        <div className="flex flex-col gap-4">
          <h1 className="text-display-xl text-off-white">Search</h1>
          
          <form action="/search" method="GET" className="flex items-center gap-3">
            <input type="hidden" name="type" value={type} />
            <div className="relative flex-grow">
              <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Type keywords to search..."
                className="w-full bg-surface border border-border/80 rounded-xl py-3.5 pl-12 pr-4 text-body-l text-off-white placeholder:text-muted focus:outline-none focus:border-rift-red transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-off-white text-near-black hover:bg-off-white/90 rounded-xl text-label font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Search Type Filter Tabs */}
        <div className="flex border-b border-border/60">
          <Link
            href={`/search?q=${encodeURIComponent(q)}&type=article`}
            className={`px-4 py-3 text-label font-bold border-b-2 transition-all ${
              type === 'article'
                ? 'border-rift-red text-off-white'
                : 'border-transparent text-muted hover:text-off-white'
            }`}
          >
            Articles
          </Link>
          <Link
            href={`/search?q=${encodeURIComponent(q)}&type=grant`}
            className={`px-4 py-3 text-label font-bold border-b-2 transition-all ${
              type === 'grant'
                ? 'border-rift-red text-off-white'
                : 'border-transparent text-muted hover:text-off-white'
            }`}
          >
            Grants
          </Link>
        </div>

        {/* Search Results */}
        <div className="flex flex-col gap-6">
          {q ? (
            results.length > 0 ? (
              <div className="flex flex-col gap-4">
                <p className="text-body-m text-muted">
                  Found {totalCount} {results.length === 1 ? 'result' : 'results'} for &ldquo;{q}&rdquo;
                </p>
                
                {/* Result cards rendering */}
                <div className="flex flex-col gap-4">
                  {type === 'grant'
                    ? results.map((grant) => (
                        <GrantCard key={grant.id} grant={grant as any} />
                      ))
                    : results.map((art) => (
                        <ArticleCard key={art.id} article={art as any} />
                      ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-border/40 text-label text-muted">
                    {page > 1 ? (
                      <Link
                        href={getPageUrl(page - 1)}
                        className="inline-flex items-center gap-1 hover:text-off-white transition-colors"
                      >
                        <IconChevronLeft size={16} />
                        <span>Previous</span>
                      </Link>
                    ) : (
                      <span className="opacity-40 cursor-not-allowed inline-flex items-center gap-1">
                        <IconChevronLeft size={16} />
                        <span>Previous</span>
                      </span>
                    )}

                    <span>Page {page} of {totalPages}</span>

                    {page < totalPages ? (
                      <Link
                        href={getPageUrl(page + 1)}
                        className="inline-flex items-center gap-1 hover:text-off-white transition-colors"
                      >
                        <span>Next</span>
                        <IconChevronRight size={16} />
                      </Link>
                    ) : (
                      <span className="opacity-40 cursor-not-allowed inline-flex items-center gap-1">
                        <span>Next</span>
                        <IconChevronRight size={16} />
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-surface border border-border rounded-xl">
                <p className="text-body-l text-muted">No results found for &ldquo;{q}&rdquo;.</p>
              </div>
            )
          ) : (
            <div className="p-12 text-center bg-surface border border-dashed border-border/80 rounded-xl">
              <p className="text-body-l text-muted">Enter search keywords above to search NowRift articles and grants.</p>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
