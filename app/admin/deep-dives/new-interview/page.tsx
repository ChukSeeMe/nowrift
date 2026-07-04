'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFounderInterview } from '@/app/admin/actions';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';

const SECTORS = [
  'ai', 'agritech', 'cleantech', 'fashiontech', 'healthtech', 'fintech',
  'edtech', 'proptech', 'legaltech', 'spacetech', 'robotics', 'cybersecurity',
  'foodtech', 'mobility', 'energytech', 'biotech', 'retailtech', 'hrtech',
  'martech', 'govtech', 'insurtech', 'creativetech', 'deeptech', 'aquatech'
];

export default function NewFounderInterviewPage() {
  const router = useRouter();
  const [headline, setHeadline] = useState('');
  const [deck, setDeck] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [readTimeMinutes, setReadTimeMinutes] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!headline.trim() || !deck.trim() || !bodyHtml.trim()) {
      setError('Please fill in all required fields (Headline, Deck, Content HTML).');
      setLoading(false);
      return;
    }

    if (selectedSectors.length === 0) {
      setError('Please select at least one related sector.');
      setLoading(false);
      return;
    }

    try {
      const res = await createFounderInterview({
        headline,
        deck,
        body_html: bodyHtml,
        sectors: selectedSectors,
        read_time_minutes: readTimeMinutes || undefined,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/deep-dives');
        }, 1500);
      } else {
        setError('Failed to create the interview. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-body-m text-muted hover:text-off-white transition-colors"
        >
          <IconArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div>
        <h1 className="text-display-xl text-off-white">Publish Founder Interview</h1>
        <p className="text-body-l text-muted">Publish a human-authored deep dive interview directly to the Deep Dives hub.</p>
      </div>

      {success ? (
        <div className="p-6 rounded-xl bg-grant-green/10 border border-grant-green/30 text-grant-green flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-grant-green/20 flex items-center justify-center">
            <IconCheck size={20} />
          </div>
          <div>
            <h3 className="text-display-s font-bold">Interview Published Successfully!</h3>
            <p className="text-body-m opacity-90 mt-0.5">Redirecting to the Deep Dives page...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 border border-border rounded-xl bg-surface space-y-6">
          {error && (
            <div className="p-3 rounded bg-rift-red/10 border border-rift-red/30 text-rift-red text-body-m font-medium">
              {error}
            </div>
          )}

          {/* Headline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label text-muted font-bold">Headline *</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white font-semibold"
              placeholder="e.g. In Conversation with Alex Wright of Voxel Labs: The Future of Spatial Robotics"
              required
            />
          </div>

          {/* Deck */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label text-muted font-bold">Deck (Short Summary) *</label>
            <textarea
              value={deck}
              onChange={(e) => setDeck(e.target.value)}
              rows={2}
              className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white resize-none"
              placeholder="One sentence deck that draws the reader in (max 160 characters)..."
              required
            />
          </div>

          {/* Body HTML */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label text-muted font-bold">Content (HTML format) *</label>
            <textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={12}
              className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white font-mono"
              placeholder="<p>Use <h3> for questions and <p> for responses...</p>"
              required
            />
            <span className="text-[11px] text-muted">Use clean HTML structure. Example: <code>&lt;h3&gt;Question?&lt;/h3&gt; &lt;p&gt;Answer content...&lt;/p&gt;</code></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Read Time (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label text-muted font-bold">Read Time (Minutes - Optional)</label>
              <input
                type="number"
                min={1}
                value={readTimeMinutes || ''}
                onChange={(e) => setReadTimeMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white"
                placeholder="Leave blank to auto-calculate (word count / 200)"
              />
            </div>
          </div>

          {/* Sectors Multi-Select Grid */}
          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Related Sectors * (Select at least one)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SECTORS.map(sector => {
                const isSelected = selectedSectors.includes(sector);
                return (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => handleSectorToggle(sector)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-off-white/10 border-off-white text-off-white font-semibold'
                        : 'bg-[#0d0d14] border-border/60 text-muted hover:border-border hover:text-off-white'
                    }`}
                  >
                    <span className="text-body-m capitalize">{sector}</span>
                    {isSelected && <IconCheck size={14} className="text-off-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Link
              href="/admin"
              className="px-4 py-2 border border-border text-muted hover:text-off-white hover:border-off-white/20 rounded-lg transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-off-white hover:bg-off-white/90 text-near-black rounded-lg font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Publishing...' : 'Publish Interview'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
