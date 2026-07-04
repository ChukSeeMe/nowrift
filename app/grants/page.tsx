import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import GrantCard from '@/components/grants/GrantCard';
import GrantAlertForm from '@/components/grants/GrantAlertForm';
import { IconFilter, IconBuildingBridge, IconCoins, IconTimeline } from '@tabler/icons-react';
import { Pagination } from '@/components/ui/Pagination';
import { cachedQuery } from '@/lib/cache/queries';
import { CACHE_TTL } from '@/lib/cache/ttl';

interface PageProps {
  searchParams: Promise<{
    sector?: string;
    geo?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function GrantsPage({ searchParams }: PageProps) {
  // Bind RLS Context based on cookies and headers
  const { role } = await getSessionAndSetRls();
  const isVisitor = role === 'visitor';

  const resolvedParams = await searchParams;
  const sector = typeof resolvedParams.sector === 'string' ? resolvedParams.sector : undefined;
  const geo = typeof resolvedParams.geo === 'string' ? resolvedParams.geo : undefined;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  // Build the database query filter
  const filter: any = {};
  
  if (sector) {
    filter.sectors = { has: sector };
  }
  if (geo) {
    filter.geo_scope = { has: geo };
  }
  if (status) {
    filter.status = status;
  } else {
    // Show only open or closing_soon grants by default for visitors, or any active status
    filter.status = { in: ['open', 'closing_soon', 'closed'] };
  }

  // Fetch filtered grants list with pagination
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1'));
  const GRANTS_PER_PAGE = 20;

  const cacheKeyGrants = `cache:grants:list:${sector || 'all'}:${geo || 'all'}:${status || 'all'}:${currentPage}`;
  const cacheKeyCount = `cache:grants:count:${sector || 'all'}:${geo || 'all'}:${status || 'all'}`;

  const grants = isVisitor
    ? await cachedQuery(cacheKeyGrants, CACHE_TTL.GRANTS_LIST, () =>
        prisma.grant.findMany({
          where: filter,
          orderBy: [
            { is_featured: 'desc' },
            { published_at: 'desc' }
          ],
          skip: (currentPage - 1) * GRANTS_PER_PAGE,
          take: GRANTS_PER_PAGE,
        })
      )
    : await prisma.grant.findMany({
        where: filter,
        orderBy: [
          { is_featured: 'desc' },
          { published_at: 'desc' }
        ],
        skip: (currentPage - 1) * GRANTS_PER_PAGE,
        take: GRANTS_PER_PAGE,
      });

  const totalCount = isVisitor
    ? await cachedQuery(cacheKeyCount, CACHE_TTL.GRANTS_LIST, () =>
        prisma.grant.count({
          where: filter,
        })
      )
    : await prisma.grant.count({
        where: filter,
      });

  const totalPages = Math.ceil(totalCount / GRANTS_PER_PAGE);

  // Convert resolvedParams for searchParams prop
  const pageParams: Record<string, string | undefined> = {};
  Object.entries(resolvedParams).forEach(([key, val]) => {
    if (typeof val === 'string') {
      pageParams[key] = val;
    }
  });

  // Calculate statistics across all active (open / closing_soon) grants
  const activeGrantsStats = isVisitor
    ? await cachedQuery('cache:active_grants_stats', CACHE_TTL.GRANTS_LIST, () =>
        prisma.grant.findMany({
          where: {
            status: { in: ['open', 'closing_soon'] }
          },
          select: {
            status: true,
            funding_max: true,
          }
        })
      )
    : await prisma.grant.findMany({
        where: {
          status: { in: ['open', 'closing_soon'] }
        },
        select: {
          status: true,
          funding_max: true,
        }
      });

  const totalOpenCount = activeGrantsStats.filter(g => g.status === 'open').length;
  const totalClosingSoonCount = activeGrantsStats.filter(g => g.status === 'closing_soon').length;
  const totalFundingValue = activeGrantsStats.reduce((sum, g) => sum + (g.funding_max ? Number(g.funding_max) : 0), 0);

  // Lists for sidebar filters
  const sectorsList = [
    { value: 'ai', label: 'AI & Machine Learning' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'fintech', label: 'FinTech' },
    { value: 'healthtech', label: 'HealthTech' },
    { value: 'agritech', label: 'AgriTech' },
    { value: 'edtech', label: 'EdTech' },
    { value: 'cleantech', label: 'CleanTech' },
  ];

  const regionsList = [
    { value: 'uk', label: 'United Kingdom' },
    { value: 'us', label: 'United States' },
    { value: 'eu', label: 'Europe' },
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'africa', label: 'Africa (Overall)' },
    { value: 'global', label: 'Global' },
  ];

  const statusList = [
    { value: 'open', label: 'Open' },
    { value: 'closing_soon', label: 'Closing Soon' },
    { value: 'closed', label: 'Closed' },
  ];

  // Helper to build URL query strings
  const getFilterUrl = (key: 'sector' | 'geo' | 'status', value?: string) => {
    const params = new URLSearchParams();
    if (sector && key !== 'sector') params.set('sector', sector);
    if (geo && key !== 'geo') params.set('geo', geo);
    if (status && key !== 'status') params.set('status', status);
    
    if (value) {
      params.set(key, value);
    }
    const query = params.toString();
    return query ? `/grants?${query}` : '/grants';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-5 bg-surface border border-border rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-grant-green/10 text-grant-green flex items-center justify-center border border-grant-green/20">
              <IconBuildingBridge size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-label text-muted">OPEN OPPORTUNITIES</span>
              <span className="text-display-l text-off-white font-bold">{totalOpenCount}</span>
            </div>
          </div>

          <div className="p-5 bg-surface border border-border rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rift-red/10 text-rift-red flex items-center justify-center border border-rift-red/20">
              <IconTimeline size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-label text-muted">CLOSING SOON</span>
              <span className="text-display-l text-off-white font-bold">{totalClosingSoonCount}</span>
            </div>
          </div>

          <div className="p-5 bg-surface border border-border rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-dev-blue/10 text-dev-blue flex items-center justify-center border border-dev-blue/20">
              <IconCoins size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-label text-muted">ACTIVE FUNDING VALUE</span>
              <span className="text-display-l text-grant-green font-bold">
                {new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                  maximumFractionDigits: 0,
                }).format(totalFundingValue)}
              </span>
            </div>
          </div>

        </div>

        {/* Filters and List layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar (1/4 width) */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            
            {/* Filter controls */}
            <div className="p-5 bg-surface border border-border rounded-xl flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <IconFilter size={18} className="text-rift-red" />
                <span className="text-label text-off-white font-bold tracking-wider">Search Filters</span>
                {(sector || geo || status) && (
                  <Link href="/grants" className="ml-auto text-[10px] uppercase font-mono text-rift-red hover:underline font-bold">
                    Clear
                  </Link>
                )}
              </div>

              {/* Sectors filter list */}
              <div className="flex flex-col gap-2">
                <span className="text-label text-muted font-bold mb-1">Sector</span>
                <div className="flex flex-col gap-1.5">
                  {sectorsList.map((sec) => {
                    const isActive = sector === sec.value;
                    return (
                      <Link
                        key={sec.value}
                        href={getFilterUrl('sector', isActive ? undefined : sec.value)}
                        className={`text-body-m font-medium transition-colors px-2.5 py-1.5 rounded-lg border ${
                          isActive 
                            ? 'bg-off-white/10 text-off-white border-border/80' 
                            : 'text-muted border-transparent hover:text-off-white hover:bg-near-black/20'
                        }`}
                      >
                        {sec.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Geography filter list */}
              <div className="flex flex-col gap-2">
                <span className="text-label text-muted font-bold mb-1">Geography</span>
                <div className="flex flex-col gap-1.5">
                  {regionsList.map((reg) => {
                    const isActive = geo === reg.value;
                    return (
                      <Link
                        key={reg.value}
                        href={getFilterUrl('geo', isActive ? undefined : reg.value)}
                        className={`text-body-m font-medium transition-colors px-2.5 py-1.5 rounded-lg border ${
                          isActive 
                            ? 'bg-off-white/10 text-off-white border-border/80' 
                            : 'text-muted border-transparent hover:text-off-white hover:bg-near-black/20'
                        }`}
                      >
                        {reg.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Status filter list */}
              <div className="flex flex-col gap-2">
                <span className="text-label text-muted font-bold mb-1">Status</span>
                <div className="flex flex-col gap-1.5">
                  {statusList.map((st) => {
                    const isActive = status === st.value;
                    return (
                      <Link
                        key={st.value}
                        href={getFilterUrl('status', isActive ? undefined : st.value)}
                        className={`text-body-m font-medium transition-colors px-2.5 py-1.5 rounded-lg border ${
                          isActive 
                            ? 'bg-off-white/10 text-off-white border-border/80' 
                            : 'text-muted border-transparent hover:text-off-white hover:bg-near-black/20'
                        }`}
                      >
                        {st.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Grant Alerts Subscribe Widget */}
            <GrantAlertForm />

          </div>

          {/* Grants Grid (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h2 className="text-display-m text-off-white font-bold">
                Available Grants ({totalCount})
              </h2>
            </div>

            {grants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grants.map((grant) => (
                  <GrantCard key={grant.id} grant={grant as any} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-surface border border-border rounded-xl">
                <p className="text-body-l text-muted">No funding opportunities found matching selected filters.</p>
                <Link href="/grants" className="text-rift-red hover:underline text-body-m font-bold mt-2 inline-block">
                  View All Grants
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/grants"
                searchParams={pageParams}
              />
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
