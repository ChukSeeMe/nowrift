'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { updateGrant } from '@/app/admin/actions';

interface GrantData {
  id: string;
  title: string;
  funder_name: string;
  funder_url: string | null;
  status: string;
  funding_min: any;
  funding_max: any;
  currency: string;
  geo_scope: string[];
  sectors: string[];
  eligibility_tags: string[];
  summary: string;
  deadline: Date | string | null;
  apply_url: string | null;
  is_featured: boolean;
}

interface GrantEditFormClientProps {
  grant: GrantData;
}

export function GrantEditFormClient({ grant }: GrantEditFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states populated from initial grant
  const [title, setTitle] = useState(grant.title);
  const [funderName, setFunderName] = useState(grant.funder_name);
  const [funderUrl, setFunderUrl] = useState(grant.funder_url || '');
  const [status, setStatus] = useState(grant.status);
  const [fundingMin, setFundingMin] = useState(grant.funding_min ? grant.funding_min.toString() : '');
  const [fundingMax, setFundingMax] = useState(grant.funding_max ? grant.funding_max.toString() : '');
  const [currency, setCurrency] = useState(grant.currency);
  const [geoScope, setGeoScope] = useState(grant.geo_scope.join(', '));
  const [sectors, setSectors] = useState(grant.sectors.join(', '));
  const [eligibilityTags, setEligibilityTags] = useState(grant.eligibility_tags.join(', '));
  const [summary, setSummary] = useState(grant.summary);
  const [deadline, setDeadline] = useState(
    grant.deadline ? new Date(grant.deadline).toISOString().substring(0, 10) : ''
  );
  const [applyUrl, setApplyUrl] = useState(grant.apply_url || '');
  const [isFeatured, setIsFeatured] = useState(grant.is_featured);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !funderName || !summary) {
      alert('Please fill out all required fields (Title, Funder Name, Summary)');
      return;
    }

    setLoading(true);
    try {
      const formattedGeo = geoScope.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const formattedSectors = sectors.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const formattedEligibility = eligibilityTags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

      const res = await updateGrant(grant.id, {
        title,
        funder_name: funderName,
        funder_url: funderUrl,
        status,
        funding_min: fundingMin ? Number(fundingMin) : undefined,
        funding_max: fundingMax ? Number(fundingMax) : undefined,
        currency,
        geo_scope: formattedGeo,
        sectors: formattedSectors,
        eligibility_tags: formattedEligibility,
        summary,
        deadline: deadline ? new Date(deadline) : undefined,
        apply_url: applyUrl,
        is_featured: isFeatured,
      });

      if (res.success) {
        alert('Grant updated successfully!');
        router.push('/admin/grants');
      } else {
        alert('Failed to update grant');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during grant edit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/grants" className="text-muted hover:text-off-white transition-colors">
          <IconArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-display-xl text-off-white">Edit Funding Program</h1>
          <p className="text-body-l text-muted">Modify registration details, dates, and features tags.</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-border bg-surface space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Grant Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Innovate UK AI Innovation"
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Funder Name *</label>
            <input
              type="text"
              required
              value={funderName}
              onChange={(e) => setFunderName(e.target.value)}
              placeholder="e.g. Innovate UK"
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Funder URL</label>
            <input
              type="url"
              value={funderUrl}
              onChange={(e) => setFunderUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Apply URL / Portal Link</label>
            <input
              type="url"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              placeholder="https://apply.example.com"
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80 cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closing_soon">Closing Soon</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Deadline Date</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Currency *</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80 cursor-pointer"
            >
              <option value="GBP">GBP (£)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-label text-muted font-bold">Min Funding</label>
              <input
                type="number"
                value={fundingMin}
                onChange={(e) => setFundingMin(e.target.value)}
                placeholder="0"
                className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label text-muted font-bold">Max Funding</label>
              <input
                type="number"
                value={fundingMax}
                onChange={(e) => setFundingMax(e.target.value)}
                placeholder="50000"
                className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Geographic Scope (Comma-separated)</label>
            <input
              type="text"
              value={geoScope}
              onChange={(e) => setGeoScope(e.target.value)}
              placeholder="e.g. uk, eu, global"
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Sectors (Comma-separated)</label>
            <input
              type="text"
              value={sectors}
              onChange={(e) => setSectors(e.target.value)}
              placeholder="e.g. ai, agritech, healthtech"
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Eligibility Tags (Comma-separated)</label>
            <input
              type="text"
              value={eligibilityTags}
              onChange={(e) => setEligibilityTags(e.target.value)}
              placeholder="e.g. startup, sme, university"
              className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80"
            />
          </div>

          <div className="flex items-center justify-between border border-border rounded-lg p-4 bg-near-black/25">
            <div className="flex flex-col">
              <span className="text-label text-off-white font-bold">Featured Grant</span>
              <span className="text-[10px] text-muted leading-tight mt-0.5">Highlight on main grants screen</span>
            </div>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-grant-green"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label text-muted font-bold">Program Summary *</label>
          <textarea
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="A concise description of what funding is available..."
            className="bg-near-black border border-border rounded-lg p-3 text-body-m text-off-white outline-none focus:border-border/80"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border/60">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-label font-bold bg-grant-green text-near-black hover:bg-grant-green/95 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default GrantEditFormClient;
