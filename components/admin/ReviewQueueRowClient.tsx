'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { approveArticle, rejectArticle } from '@/app/admin/actions';

interface ReviewQueueRowClientProps {
  article: {
    id: string;
    slug: string;
    headline: string;
    relevance_score: number | null;
    created_at: Date;
    channel: {
      name: string;
      color_hex: string;
    } | null;
    images?: Array<{
      image_url: string;
    }>;
    sources?: Array<any>;
  };
}

export function ReviewQueueRowClient({ article }: ReviewQueueRowClientProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve and publish this article?')) return;
    setLoading(true);
    try {
      const res = await approveArticle(article.id);
      if (!res.success) {
        alert('Approval failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during approval');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason) {
      alert('Please specify a rejection reason');
      return;
    }
    setLoading(true);
    try {
      const res = await rejectArticle(article.id, rejectReason);
      if (res.success) {
        setIsRejecting(false);
      } else {
        alert('Rejection failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during rejection');
    } finally {
      setLoading(false);
    }
  };

  const score = article.relevance_score ?? 0;
  const scoreColor = 
    score >= 0.8 ? 'text-grant-green border-grant-green/20 bg-grant-green/5' :
    score >= 0.6 ? 'text-sec-amber border-sec-amber/20 bg-sec-amber/5' :
    'text-rift-red border-rift-red/20 bg-rift-red/5';

  const timeInQueue = Math.max(0, Math.floor((Date.now() - new Date(article.created_at).getTime()) / (1000 * 60 * 60)));
  const timeInQueueText = timeInQueue === 0 ? 'Just now' : `${timeInQueue}h ago`;

  const thumb = article.images?.[0]?.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%231A1A24"/></svg>';
  const sourceCount = article.sources?.length || 0;

  return (
    <tr className="border-b border-border/40 hover:bg-surface/20 transition-colors">
      <td className="p-4">
        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-near-black border border-border/40 shrink-0">
          <Image
            src={thumb}
            alt=""
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      </td>
      <td className="p-4 font-semibold text-off-white/95 max-w-sm truncate">
        {article.headline}
      </td>
      <td className="p-4">
        {article.channel && (
          <span 
            className="px-2 py-0.5 rounded text-label font-bold border"
            style={{
              color: article.channel.color_hex,
              borderColor: `${article.channel.color_hex}30`,
              backgroundColor: `${article.channel.color_hex}10`,
            }}
          >
            {article.channel.name}
          </span>
        )}
      </td>
      <td className="p-4">
        <span className={`px-2 py-0.5 rounded text-label font-bold border ${scoreColor}`}>
          {score.toFixed(2)}
        </span>
      </td>
      <td className="p-4 text-body-m text-muted font-mono">
        {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
      </td>
      <td className="p-4 text-body-m text-muted">
        {timeInQueueText}
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-2 relative">
          {!isRejecting ? (
            <div className="flex items-center gap-2">
              <button
                disabled={loading}
                onClick={handleApprove}
                className="px-2.5 py-1 text-label font-bold bg-grant-green text-near-black rounded hover:bg-grant-green/95 transition-all cursor-pointer disabled:opacity-50"
              >
                Approve
              </button>
              <Link
                href={`/admin/articles/${article.id}`}
                className="px-2.5 py-1 text-label font-bold border border-border text-muted hover:text-off-white hover:border-off-white/20 rounded transition-all"
              >
                Review
              </Link>
              <button
                disabled={loading}
                onClick={() => setIsRejecting(true)}
                className="px-2.5 py-1 text-label font-bold border border-rift-red/40 text-rift-red hover:bg-rift-red/10 rounded transition-all cursor-pointer disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ) : (
            <form onSubmit={handleReject} className="flex items-center gap-2 bg-surface p-2 border border-border rounded-lg shadow-lg">
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                className="bg-near-black text-body-m text-off-white border border-border rounded px-2 py-1 outline-none focus:border-rift-red"
              >
                <option value="">Select Reason...</option>
                <option value="hallucination">Hallucination / Fact Check Failed</option>
                <option value="poor_synthesis">Poor Synthesis / Low Quality</option>
                <option value="copyright">Potential Copyright Issue</option>
                <option value="irrelevant">Irrelevant to Channel Audience</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-2.5 py-1 text-label font-bold bg-rift-red text-off-white rounded hover:bg-rift-red/90 transition-all cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="px-2 py-1 text-label font-bold text-muted hover:text-off-white transition-all cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </td>
    </tr>
  );
}

export default ReviewQueueRowClient;
