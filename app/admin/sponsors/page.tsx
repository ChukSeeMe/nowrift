import React from 'react';
import prisma from '@/lib/db/prisma';
import SponsorsAdminClient from '@/components/admin/SponsorsAdminClient';

export const dynamic = 'force-dynamic';

export default async function SponsorsAdminPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Compute Current Month Totals
  const [currentMonthPaid, currentMonthOutstanding] = await Promise.all([
    prisma.sponsorPlacement.aggregate({
      where: {
        payment_status: 'paid',
        created_at: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),
    prisma.sponsorPlacement.aggregate({
      where: {
        payment_status: { in: ['pending', 'invoiced', 'overdue'] },
        created_at: { gte: startOfMonth }
      },
      _sum: { amount: true }
    })
  ]);

  const billed = Number(currentMonthPaid._sum.amount ?? 0) + Number(currentMonthOutstanding._sum.amount ?? 0);
  const received = Number(currentMonthPaid._sum.amount ?? 0);
  const outstanding = Number(currentMonthOutstanding._sum.amount ?? 0);

  // Fetch Comparison Months (Historical Revenue Trend)
  const comparisonMonths = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const agg = await prisma.sponsorPlacement.aggregate({
      where: {
        payment_status: 'paid',
        created_at: { gte: d, lte: end }
      },
      _sum: { amount: true }
    });
    comparisonMonths.push({
      name: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: Number(agg._sum.amount ?? 0)
    });
  }

  // Fetch all sponsors with active placements count
  const sponsors = await prisma.sponsor.findMany({
    include: {
      _count: {
        select: { placements: true }
      }
    },
    orderBy: { company_name: 'asc' }
  });

  // Fetch last 20 placements
  const placements = await prisma.sponsorPlacement.findMany({
    orderBy: { created_at: 'desc' },
    take: 20,
    include: {
      sponsor: true,
      issue: true,
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-xl text-off-white">Sponsorship Campaign CRM</h1>
        <p className="text-body-l text-muted">Manage campaign rates, monitor sponsor billing, and log issue placements.</p>
      </div>

      <SponsorsAdminClient
        sponsors={sponsors}
        placements={placements}
        billed={billed}
        received={received}
        outstanding={outstanding}
        comparisonMonths={comparisonMonths}
      />
    </div>
  );
}
