import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { getSessionAndSetRls } from '@/lib/auth/session';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import GrantStatusBadge from '@/components/grants/GrantStatusBadge';
import { IconArrowLeft, IconCalendar, IconExternalLink, IconMapPin, IconCategory, IconUsers, IconBriefcase } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GrantDetailPage({ params }: PageProps) {
  // Bind RLS context
  await getSessionAndSetRls();

  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const grant = await prisma.grant.findUnique({
    where: { slug },
  });

  if (!grant) {
    notFound();
  }

  // Increment view count
  try {
    await prisma.grant.update({
      where: { id: grant.id },
      data: { view_count: { increment: 1 } },
    });
  } catch (err) {
    console.error('Failed to increment grant view count:', err);
  }

  const formatAmount = (val: any) => {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: grant.currency || 'GBP',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const minFormatted = formatAmount(grant.funding_min);
  const maxFormatted = formatAmount(grant.funding_max);

  let fundingLabel = 'Funding Unspecified';
  if (minFormatted && maxFormatted) {
    fundingLabel = `${minFormatted} - ${maxFormatted}`;
  } else if (maxFormatted) {
    fundingLabel = `Up to ${maxFormatted}`;
  } else if (minFormatted) {
    fundingLabel = `From ${minFormatted}`;
  }

  const deadlineDate = grant.deadline ? new Date(grant.deadline) : null;
  const deadlineLabel = deadlineDate
    ? deadlineDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Rolling / Unspecified';

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Back link */}
        <Link
          href="/grants"
          className="inline-flex items-center gap-2 text-label text-muted hover:text-off-white transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>Back to Grants Hub</span>
        </Link>

        {/* Header Section */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-label text-muted font-bold tracking-wider">{grant.funder_name}</span>
            <GrantStatusBadge status={grant.status} deadline={grant.deadline} />
          </div>

          <h1 className="text-display-xl text-off-white leading-tight">
            {grant.title}
          </h1>

          {/* Key metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-surface border border-border mt-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-near-black border border-border/80 flex items-center justify-center text-grant-green">
                <IconBriefcase size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Funding Available</span>
                <span className="text-body-l font-bold text-grant-green">{fundingLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-near-black border border-border/80 flex items-center justify-center text-sec-amber">
                <IconCalendar size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Application Deadline</span>
                <span className="text-body-l font-bold text-off-white">{deadlineLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-near-black border border-border/80 flex items-center justify-center text-dev-blue">
                <IconMapPin size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Geographic Scope</span>
                <span className="text-body-l font-bold text-off-white uppercase">{grant.geo_scope.join(', ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-near-black border border-border/80 flex items-center justify-center text-founders-purple">
                <IconCategory size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Target Sectors</span>
                <span className="text-body-l font-bold text-off-white capitalize">
                  {grant.sectors.join(', ').replace(/-/g, ' ')}
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* Content Section */}
        <div className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-3">
            <h3 className="text-display-m text-off-white font-bold">Summary</h3>
            <p className="text-body-l text-off-white/80 leading-relaxed font-light">
              {grant.summary}
            </p>
          </div>

          {grant.eligibility_detail && (
            <div className="flex flex-col gap-3">
              <h3 className="text-display-m text-off-white font-bold font-headlines">Eligibility Criteria</h3>
              <p className="text-body-l text-off-white/80 leading-relaxed font-light">
                {grant.eligibility_detail}
              </p>
            </div>
          )}

          {grant.how_to_apply && (
            <div className="flex flex-col gap-3">
              <h3 className="text-display-m text-off-white font-bold font-headlines">How to Apply</h3>
              <p className="text-body-l text-off-white/80 leading-relaxed font-light">
                {grant.how_to_apply}
              </p>
            </div>
          )}

          {/* Eligibility tags list */}
          {grant.eligibility_tags.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              <span className="text-label text-muted font-bold">Eligibility Tags</span>
              <div className="flex flex-wrap gap-2">
                {grant.eligibility_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-label bg-near-black border border-border/60 text-off-white/95 uppercase font-mono font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Actions */}
          <div className="flex flex-col sm:flex-row gap-4 py-8 mt-4 border-t border-border/60">
            {grant.apply_url && (
              <a
                href={grant.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-off-white text-near-black hover:bg-off-white/95 rounded-xl text-label font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Apply to Funder</span>
                <IconExternalLink size={16} />
              </a>
            )}
            
            {grant.funder_url && (
              <a
                href={grant.funder_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface hover:bg-surface/80 text-off-white border border-border rounded-xl text-label font-bold uppercase tracking-wider transition-colors"
              >
                <span>Funder Homepage</span>
                <IconExternalLink size={16} />
              </a>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
