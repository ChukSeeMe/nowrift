import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import GrantStatusBadge from '@/components/grants/GrantStatusBadge';

export const dynamic = 'force-dynamic';

export default async function GrantsAdminPage() {
  const grants = await prisma.grant.findMany({
    orderBy: { created_at: 'desc' },
  });

  const formatAmount = (val: any, currency: string) => {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    
    const currencyMap: Record<string, string> = {
      GBP: '£',
      USD: '$',
      EUR: '€',
    };
    const symbol = currencyMap[currency] || '$';
    
    return symbol + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-xl text-off-white">Grants Management</h1>
          <p className="text-body-l text-muted">Manage active funding opportunities, status states, and featured toggles.</p>
        </div>

        <Link
          href="/admin/grants/new"
          className="px-4 py-2.5 text-label font-bold bg-off-white hover:bg-off-white/90 text-near-black rounded-lg transition-colors cursor-pointer"
        >
          Add Grant Manually
        </Link>
      </div>

      {/* Grants Table */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {grants.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-label text-muted bg-[#0d0d14]/40">
                  <th className="p-4 font-bold">Title</th>
                  <th className="p-4 font-bold">Funder</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Sectors</th>
                  <th className="p-4 font-bold">Deadline</th>
                  <th className="p-4 font-bold">Funding Range</th>
                  <th className="p-4 font-bold text-center">Featured</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((grant) => {
                  const minFormatted = formatAmount(grant.funding_min, grant.currency);
                  const maxFormatted = formatAmount(grant.funding_max, grant.currency);
                  let fundingRange = 'Unspecified';
                  if (minFormatted && maxFormatted) {
                    fundingRange = minFormatted === maxFormatted ? minFormatted : `${minFormatted} - ${maxFormatted}`;
                  } else if (maxFormatted) {
                    fundingRange = `Up to ${maxFormatted}`;
                  } else if (minFormatted) {
                    fundingRange = `From ${minFormatted}`;
                  }

                  const deadlineLabel = grant.deadline 
                    ? new Date(grant.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Rolling';

                  return (
                    <tr key={grant.id} className="border-b border-border/40 hover:bg-surface/20 transition-colors">
                      <td className="p-4 font-semibold text-off-white/95 max-w-sm truncate">
                        <Link href={`/grants/${grant.slug}`} target="_blank" className="hover:text-rift-red transition-colors inline-flex items-center gap-1">
                          {grant.title}
                        </Link>
                      </td>
                      <td className="p-4 text-body-m text-off-white/80">
                        {grant.funder_name}
                      </td>
                      <td className="p-4">
                        <GrantStatusBadge status={grant.status} deadline={grant.deadline} />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {grant.sectors.slice(0, 3).map((sec, idx) => (
                            <span 
                              key={idx} 
                              className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-semibold border border-border/50 bg-[#0d0d14]/40 text-muted"
                            >
                              {sec.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-body-m text-muted font-mono">
                        {deadlineLabel}
                      </td>
                      <td className="p-4 text-body-m text-grant-green font-bold font-mono">
                        {fundingRange}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${grant.is_featured ? 'bg-grant-green' : 'bg-[#1E1E2A]'}`} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/grants/edit/${grant.id}`}
                            className="px-2 py-1 text-label font-bold border border-border text-muted hover:text-off-white hover:border-off-white/20 rounded transition-all"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-body-l text-muted">
              No grant opportunities currently registered. Add one manually!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
