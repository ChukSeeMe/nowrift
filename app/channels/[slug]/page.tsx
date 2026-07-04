import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/db/prisma'
import { getSessionAndSetRls } from '@/lib/auth/session'
import Nav from '@/components/layout/Nav'
import BreakingTicker from '@/components/layout/BreakingTicker'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/articles/ArticleCard'
import NewsletterForm from '@/components/newsletter/NewsletterForm'
import { Pagination } from '@/components/ui/Pagination'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  const channels = await prisma.channel.findMany({
    select: { slug: true }
  })
  return channels.map(c => ({ slug: c.slug }))
}

export default async function ChannelPage({ params, searchParams }: PageProps) {
  const { role } = await getSessionAndSetRls()
  const isVisitor = role === 'visitor'

  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const slug = resolvedParams.slug
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || '1'))
  const ARTICLES_PER_PAGE = 20

  // 1. Fetch channel details
  const channel = await prisma.channel.findUnique({
    where: { slug }
  })

  if (!channel) notFound()

  // 2. Fetch total article count and current page articles
  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: 'published',
        content_tier: 'daily',
        channel_id: channel.id,
      },
      include: {
        channel: true,
        audit_record: true,
        images: true,
      },
      orderBy: { published_at: 'desc' },
      skip: (currentPage - 1) * ARTICLES_PER_PAGE,
      take: ARTICLES_PER_PAGE,
    }),
    prisma.article.count({
      where: {
        status: 'published',
        content_tier: 'daily',
        channel_id: channel.id,
      }
    })
  ])

  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE)

  // 3. Fetch recent grants for the sidebar widget
  const recentGrants = await prisma.grant.findMany({
    where: {
      status: { in: ['open', 'closing_soon'] },
    },
    orderBy: {
      published_at: 'desc',
    },
    take: 3,
  })

  // Format resolved searchParams for Pagination component
  const pageParams: Record<string, string | undefined> = {}
  Object.entries(resolvedSearchParams).forEach(([key, val]) => {
    if (typeof val === 'string') {
      pageParams[key] = val
    } else if (Array.isArray(val)) {
      pageParams[key] = val[0]
    }
  })

  return (
    <div className="flex flex-col min-h-screen bg-near-black text-off-white">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Dual-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed Column (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Channel header widget */}
            <div className="mb-2 p-6 bg-surface border border-border/80 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span 
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: channel.color_hex }}
                />
                <h1 className="text-display-l md:text-display-xl font-extrabold text-off-white tracking-tight">
                  {channel.name}
                </h1>
              </div>
              
              <p className="text-body-l text-muted max-w-2xl leading-relaxed">
                {channel.description || `Latest ${channel.name} news, insights, and analysis.`}
              </p>
              
              <div className="flex items-center gap-2 text-label font-mono text-muted">
                <span>Total Coverage:</span>
                <span className="font-bold text-off-white">{totalCount} articles</span>
              </div>
            </div>

            {/* Articles List */}
            <div className="flex flex-col gap-4">
              {articles.length > 0 ? (
                articles.map((art) => (
                  <ArticleCard key={art.id} article={art as any} />
                ))
              ) : (
                <div className="p-12 text-center bg-surface border border-border/80 rounded-2xl">
                  <p className="text-body-l text-muted">No published articles found in this channel yet.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/channels/${slug}`}
                searchParams={pageParams}
              />
            )}
          </div>

          {/* Sidebar Widgets Column (1/3 width) */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <NewsletterForm />

            {/* Featured Grants Sidebar Widget */}
            <div className="bg-surface border border-border/80 rounded-xl p-5 flex flex-col gap-4">
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
  )
}
