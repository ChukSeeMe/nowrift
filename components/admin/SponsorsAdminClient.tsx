'use client';

import React, { useState } from 'react';
import { createSponsor, updatePaymentStatus } from '@/app/admin/actions';

interface SponsorData {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  website_url: string | null;
  status: string;
  rate_per_slot: any;
  _count?: {
    placements: number;
  };
}

interface PlacementData {
  id: string;
  slot_position: string;
  amount: any;
  payment_status: string;
  created_at: Date;
  sponsor: {
    company_name: string;
  };
  issue: {
    subject: string;
  };
}

interface SponsorsAdminClientProps {
  sponsors: SponsorData[];
  placements: PlacementData[];
  billed: number;
  received: number;
  outstanding: number;
  comparisonMonths: Array<{ name: string; amount: number }>;
}

export function SponsorsAdminClient({
  sponsors,
  placements,
  billed,
  received,
  outstanding,
  comparisonMonths,
}: SponsorsAdminClientProps) {
  const [loading, setLoading] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ratePerSlot, setRatePerSlot] = useState('');

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    setLoading(true);
    try {
      const res = await createSponsor({
        company_name: companyName,
        contact_name: contactName,
        contact_email: contactEmail,
        website_url: websiteUrl,
        rate_per_slot: ratePerSlot ? Number(ratePerSlot) : 0,
      });

      if (res.success) {
        alert('Sponsor created successfully!');
        setCompanyName('');
        setContactName('');
        setContactEmail('');
        setWebsiteUrl('');
        setRatePerSlot('');
        window.location.reload();
      } else {
        alert('Failed to create sponsor');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating sponsor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (placementId: string, newStatus: string) => {
    setLoading(true);
    try {
      const res = await updatePaymentStatus(placementId, newStatus as any);
      if (res.success) {
        alert('Payment status updated successfully');
        window.location.reload();
      } else {
        alert('Failed to update status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating payment status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Revenue row stats & bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-surface flex flex-col justify-between">
          <span className="text-label text-muted font-bold tracking-wider mb-4 block">Current Month Sponsorship Sales</span>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted">Total Billed</span>
              <span className="text-display-m font-bold text-off-white mt-1">£{billed.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Total Received</span>
              <span className="text-display-m font-bold text-grant-green mt-1">£{received.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Outstanding Balance</span>
              <span className="text-display-m font-bold text-sec-amber mt-1">£{outstanding.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Previous 3 months comparison bar */}
        <div className="p-6 rounded-xl border border-border bg-surface flex flex-col justify-between">
          <span className="text-label text-muted font-bold tracking-wider mb-4 block">Historical Revenue Trend</span>
          <div className="space-y-3">
            {comparisonMonths.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-off-white">{m.name}</span>
                  <span className="text-muted">£{m.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-near-black rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-dev-blue rounded-full"
                    style={{ width: `${Math.min(100, m.amount > 0 ? (m.amount / Math.max(...comparisonMonths.map(x=>x.amount), 1)) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsors CRM table */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="p-5 border-b border-border/80 bg-near-black/20">
          <h2 className="text-display-m text-off-white font-bold">Sponsors CRM</h2>
        </div>

        <div className="overflow-x-auto">
          {sponsors.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-label text-muted bg-[#0d0d14]/40">
                  <th className="p-4 font-bold">Company</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Rate/Slot</th>
                  <th className="p-4 font-bold text-center">Placements</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map((sp) => (
                  <tr key={sp.id} className="border-b border-border/40 hover:bg-surface/20 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-off-white/95 leading-normal">{sp.company_name}</span>
                        {sp.website_url && (
                          <a href={sp.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-dev-blue hover:underline">
                            {sp.website_url}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-body-m text-off-white">{sp.contact_name || '—'}</span>
                        <span className="text-xs text-muted">{sp.contact_email || '—'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-label font-bold border ${
                        sp.status === 'active' ? 'text-grant-green border-grant-green/20 bg-grant-green/5' :
                        sp.status === 'prospect' ? 'text-dev-blue border-dev-blue/20 bg-dev-blue/5' :
                        'text-muted border-border bg-border/20'
                      }`}>
                        {sp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-body-m text-off-white">
                      £{Number(sp.rate_per_slot).toLocaleString()}
                    </td>
                    <td className="p-4 text-center font-mono text-body-m text-muted">
                      {sp._count?.placements || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-body-l text-muted">
              No sponsors registered. Use the form below to add one!
            </div>
          )}
        </div>
      </div>

      {/* Add sponsor form inline below */}
      <div className="p-6 rounded-xl border border-border bg-surface/50 space-y-4">
        <h3 className="text-display-m text-off-white font-bold">Add Sponsor Profile</h3>
        <form onSubmit={handleCreateSponsor} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted font-bold tracking-wider">COMPANY NAME *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe"
              className="bg-near-black border border-border rounded-lg px-3 py-2 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted font-bold tracking-wider">CONTACT NAME</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. John Doe"
              className="bg-near-black border border-border rounded-lg px-3 py-2 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted font-bold tracking-wider">CONTACT EMAIL</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="john@stripe.com"
              className="bg-near-black border border-border rounded-lg px-3 py-2 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted font-bold tracking-wider">WEBSITE URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://stripe.com"
              className="bg-near-black border border-border rounded-lg px-3 py-2 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted font-bold tracking-wider">RATE PER SLOT (£) *</label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                value={ratePerSlot}
                onChange={(e) => setRatePerSlot(e.target.value)}
                placeholder="500"
                className="bg-near-black border border-border rounded-lg px-3 py-2 text-body-m text-off-white outline-none focus:border-border/80 w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-label font-bold bg-off-white hover:bg-off-white/90 text-near-black rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent placements table */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="p-5 border-b border-border/80 bg-near-black/20">
          <h2 className="text-display-m text-off-white font-bold font-mono">Recent Ad Placements</h2>
        </div>

        <div className="overflow-x-auto">
          {placements.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-label text-muted bg-[#0d0d14]/40">
                  <th className="p-4 font-bold">Issue subject</th>
                  <th className="p-4 font-bold">Sponsor</th>
                  <th className="p-4 font-bold">Slot Position</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                  <th className="p-4 font-bold">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((pl) => (
                  <tr key={pl.id} className="border-b border-border/40 hover:bg-surface/20 transition-colors">
                    <td className="p-4 font-semibold text-off-white/95">
                      {pl.issue?.subject || '—'}
                    </td>
                    <td className="p-4 text-body-m text-off-white/80">
                      {pl.sponsor.company_name}
                    </td>
                    <td className="p-4 text-label font-mono text-muted text-xs">
                      {pl.slot_position.toUpperCase()}
                    </td>
                    <td className="p-4 text-right font-mono text-body-m text-off-white">
                      £{Number(pl.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={pl.payment_status}
                        onChange={(e) => handleStatusChange(pl.id, e.target.value)}
                        disabled={loading}
                        className={`px-2 py-1 border rounded text-body-m outline-none font-bold cursor-pointer ${
                          pl.payment_status === 'paid' ? 'text-grant-green border-grant-green/30 bg-grant-green/10' :
                          pl.payment_status === 'pending' ? 'text-sec-amber border-sec-amber/30 bg-sec-amber/10' :
                          'text-muted border-border bg-near-black'
                        }`}
                      >
                        <option value="pending">PENDING</option>
                        <option value="invoiced">INVOICED</option>
                        <option value="paid">PAID</option>
                        <option value="overdue">OVERDUE</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-body-l text-muted">
              No sponsor campaign placements logged.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SponsorsAdminClient;
