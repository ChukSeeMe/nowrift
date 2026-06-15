import React from 'react';
import Link from 'next/link';
import { IconCalendar, IconBuilding, IconGlobe } from '@tabler/icons-react';
import GrantStatusBadge from './GrantStatusBadge';

interface GrantCardProps {
  grant: {
    slug: string;
    title: string;
    funder_name: string;
    funder_logo_url?: string | null;
    status: string;
    funding_min?: any | null;
    funding_max?: any | null;
    currency: string;
    sectors: string[];
    geo_scope: string[];
    summary: string;
    deadline?: Date | string | null;
  };
  className?: string;
}

export function GrantCard({ grant, className = '' }: GrantCardProps) {
  const formatAmount = (val: any) => {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return new Intl.NumberFormat('en-US', {
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

  let deadlineLabel = 'Rolling Deadline';
  let deadlineColor = 'text-muted';

  if (grant.deadline) {
    const deadlineDate = new Date(grant.deadline);
    deadlineLabel = deadlineDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0 && daysLeft <= 14) {
      deadlineColor = 'text-rift-red font-bold';
    } else if (daysLeft > 0 && daysLeft <= 30) {
      deadlineColor = 'text-sec-amber font-bold';
    } else if (daysLeft <= 0) {
      deadlineColor = 'text-muted line-through';
      deadlineLabel = 'Closed';
    }
  }

  return (
    <div className={`p-5 bg-surface border border-border rounded-xl flex flex-col gap-4 hover:border-border/80 transition-all ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-near-black border border-border/60 flex items-center justify-center text-muted shrink-0">
            <IconBuilding size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-label text-muted font-bold tracking-wider">{grant.funder_name}</span>
          </div>
        </div>
        <GrantStatusBadge status={grant.status} deadline={grant.deadline} />
      </div>

      <Link href={`/grants/${grant.slug}`}>
        <h3 className="text-display-m text-off-white hover:text-rift-red transition-colors cursor-pointer leading-snug">
          {grant.title}
        </h3>
      </Link>

      <p className="text-body-m text-muted line-clamp-2 leading-relaxed">
        {grant.summary}
      </p>

      <div className="flex flex-wrap gap-1.5 items-center">
        {grant.geo_scope.map((geo, idx) => (
          <span
            key={`geo-${idx}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label bg-border/40 border border-border text-off-white/80 font-bold"
          >
            <IconGlobe size={10} />
            {geo.toUpperCase()}
          </span>
        ))}

        {grant.sectors.map((sector, idx) => (
          <span
            key={`sec-${idx}`}
            className="inline-flex items-center px-2 py-0.5 rounded text-label bg-near-black border border-border/30 text-muted"
          >
            {sector.replace('-', ' ')}
          </span>
        ))}
      </div>

      <div className="h-px bg-border/40 w-full" />

      <div className="flex items-center justify-between text-label">
        <div className="flex flex-col">
          <span className="text-muted tracking-wider mb-0.5">FUNDING AMOUNT</span>
          <span className="text-grant-green font-bold text-sm">{fundingLabel}</span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-muted tracking-wider mb-0.5">DEADLINE</span>
          <div className="flex items-center gap-1.5">
            <IconCalendar size={12} className={deadlineColor} />
            <span className={deadlineColor}>{deadlineLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrantCard;
