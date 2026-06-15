import React from 'react';
import prisma from '@/lib/db/prisma';
import ReviewQueueRowClient from '@/components/admin/ReviewQueueRowClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch KPI data
  const [
    pendingReview,
    publishedToday,
    totalSubscribers,
    activeGrants,
    agentRuns,
    revenueSum,
  ] = await Promise.all([
    prisma.article.count({ where: { status: 'in_review' } }),
    prisma.article.count({
      where: {
        status: 'published',
        published_at: { gte: startOfDay },
      },
    }),
    prisma.newsletterSubscriber.count({ where: { status: 'active' } }),
    prisma.grant.count({ where: { status: { in: ['open', 'closing_soon'] } } }),
    prisma.agentRun.findMany({
      distinct: ['agent_name'],
      orderBy: { created_at: 'desc' },
      take: 12,
      select: {
        agent_name: true,
        status: true,
        created_at: true,
        cost_usd: true,
      },
    }),
    prisma.sponsorPlacement.aggregate({
      where: {
        payment_status: 'paid',
        created_at: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
  ]);

  // Review queue: status = 'in_review', limit 10
  const reviewQueue = await prisma.article.findMany({
    where: { status: 'in_review' },
    include: {
      channel: true,
      sources: true,
      images: {
        take: 1,
      },
    },
    orderBy: { created_at: 'desc' },
    take: 10,
  });

  // Calculate agent health (OK if no failures in the last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const failedRunsCount = await prisma.agentRun.count({
    where: {
      status: 'failed',
      created_at: { gte: oneDayAgo },
    },
  });
  const allAgentsOk = failedRunsCount === 0;

  const totalMonthlyRev = Number(revenueSum._sum.amount ?? 0);

  const kpis = [
    {
      title: 'Pending Review',
      value: pendingReview,
      alert: pendingReview > 0,
      description: 'Items awaiting editorial review',
    },
    {
      title: 'Published Today',
      value: publishedToday,
      description: 'Articles successfully published today',
    },
    {
      title: 'Active Subscribers',
      value: totalSubscribers.toLocaleString(),
      description: 'Subscribed newsletter readers',
    },
    {
      title: 'Open Grants',
      value: activeGrants,
      description: 'Active tech funding programs',
    },
    {
      title: 'Agent Health',
      value: allAgentsOk ? 'Healthy' : 'Issues',
      indicator: allAgentsOk ? 'bg-grant-green' : 'bg-rift-red',
      description: allAgentsOk ? 'All agents ran successfully' : 'Agent failures in last 24h',
    },
    {
      title: 'Revenue This Month',
      value: `£${totalMonthlyRev.toLocaleString()}`,
      description: 'Paid sponsorship campaigns',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-display-xl text-off-white">Editorial Dashboard</h1>
        <p className="text-body-l text-muted">Manage article queue, active programs, and platform statuses.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between min-h-[120px]"
          >
            <span className="text-label text-muted font-bold tracking-wider">{kpi.title}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-display-l font-bold text-off-white">
                {kpi.value}
              </span>
              {kpi.alert && (
                <span className="h-2 w-2 rounded-full bg-rift-red animate-pulse" />
              )}
              {kpi.indicator && (
                <span className={`h-2.5 w-2.5 rounded-full ${kpi.indicator}`} />
              )}
            </div>
            <p className="text-body-m text-muted mt-2 text-xs leading-normal">
              {kpi.description}
            </p>
          </div>
        ))}
      </div>

      {/* Review Queue Section */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="p-5 border-b border-border/80 bg-near-black/20 flex justify-between items-center">
          <h2 className="text-display-m text-off-white font-bold flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rift-red" />
            Review Queue
          </h2>
          <span className="text-label text-muted">
            {reviewQueue.length} pending items
          </span>
        </div>

        <div className="overflow-x-auto">
          {reviewQueue.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-label text-muted bg-[#0d0d14]/40">
                  <th className="p-4 font-bold">Preview</th>
                  <th className="p-4 font-bold">Headline</th>
                  <th className="p-4 font-bold">Channel</th>
                  <th className="p-4 font-bold">Relevance</th>
                  <th className="p-4 font-bold">Sources</th>
                  <th className="p-4 font-bold">Queue Time</th>
                  <th className="p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewQueue.map((article) => (
                  <ReviewQueueRowClient key={article.id} article={article} />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-body-l text-muted">
              No articles currently in review queue. Excellent work!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
