'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  IconArrowLeft, 
  IconCheck, 
  IconX, 
  IconExternalLink,
  IconAlertCircle,
  IconRosetteFilled
} from '@tabler/icons-react';
import { 
  updateArticleContent, 
  approveArticle, 
  rejectArticle, 
  retractArticle 
} from '@/app/admin/actions';
import SoWhatBox from '@/components/articles/SoWhatBox';
import AigenAuditPill from '@/components/articles/AigenAuditPill';

interface Channel {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
}

interface ArticleEditorClientProps {
  article: {
    id: string;
    slug: string;
    headline: string;
    deck: string | null;
    body_html: string | null;
    status: string;
    is_breaking: boolean;
    channel_id: string | null;
    so_what_dev: string | null;
    so_what_security: string | null;
    so_what_founders: string | null;
    so_what_creators: string | null;
    so_what_data: string | null;
    audit_record?: {
      model_used: string;
      source_count: number;
      source_urls: any;
      max_similarity_score: number;
      copyright_passed: boolean;
      compliance_notes: string | null;
      r2_audit_path: string | null;
      ingested_at: Date;
    } | null;
  };
  channels: Channel[];
}

export function ArticleEditorClient({ article, channels }: ArticleEditorClientProps) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Form states
  const [headline, setHeadline] = useState(article.headline);
  const [deck, setDeck] = useState(article.deck || '');
  const [bodyHtml, setBodyHtml] = useState(article.body_html || '');
  const [channelId, setChannelId] = useState(article.channel_id || '');
  const [isBreaking, setIsBreaking] = useState(article.is_breaking);
  
  // So What states
  const [soWhatDev, setSoWhatDev] = useState(article.so_what_dev || '');
  const [soWhatSecurity, setSoWhatSecurity] = useState(article.so_what_security || '');
  const [soWhatFounders, setSoWhatFounders] = useState(article.so_what_founders || '');
  const [soWhatCreators, setSoWhatCreators] = useState(article.so_what_creators || '');
  const [soWhatData, setSoWhatData] = useState(article.so_what_data || '');

  // Rejection panel state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const currentChannel = channels.find(c => c.id === channelId);

  // Save edits
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateArticleContent(article.id, {
        headline,
        deck,
        body_html: bodyHtml,
        channel_id: channelId || undefined,
        is_breaking: isBreaking,
        so_what_dev: soWhatDev,
        so_what_security: soWhatSecurity,
        so_what_founders: soWhatFounders,
        so_what_creators: soWhatCreators,
        so_what_data: soWhatData,
      });
      if (res.success) {
        alert('Changes saved successfully');
      } else {
        alert('Failed to save changes');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving changes');
    } finally {
      setLoading(false);
    }
  };

  // Status transitions
  const handleApprovePublish = async () => {
    if (!confirm('Are you sure you want to approve and publish this article?')) return;
    setLoading(true);
    try {
      const res = await approveArticle(article.id);
      if (res.success) {
        alert('Article published!');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    setLoading(true);
    try {
      const res = await updateArticleContent(article.id, {
        status: 'in_review',
      });
      if (res.success) {
        alert('Submitted for review!');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason) return;
    setLoading(true);
    try {
      const res = await rejectArticle(article.id, rejectReason);
      if (res.success) {
        alert('Rejection confirmed. Article status is set to Draft.');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetract = async () => {
    if (!confirm('Are you sure you want to retract this published article?')) return;
    setLoading(true);
    try {
      const res = await retractArticle(article.id);
      if (res.success) {
        alert('Article retracted.');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Retraction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this article?')) return;
    setLoading(true);
    try {
      const res = await updateArticleContent(article.id, {
        status: 'archived',
      });
      if (res.success) {
        alert('Article archived.');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Archiving failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDraft = async () => {
    setLoading(true);
    try {
      const res = await updateArticleContent(article.id, {
        status: 'draft',
      });
      if (res.success) {
        alert('Restored to draft status.');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Restore failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-screen overflow-hidden -m-8">
      {/* Top Header Controls */}
      <div className="bg-[#0d0d14] px-8 py-4 border-b border-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles" className="text-muted hover:text-off-white transition-colors">
            <IconArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-display-m font-bold text-off-white">Editorial Review</h1>
            <p className="text-body-m text-muted text-xs">ID: {article.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-label text-muted font-bold mr-2">
            Status: <span className="text-off-white">{article.status.replace('_', ' ').toUpperCase()}</span>
          </span>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-label font-bold bg-[#1A1A24] border border-border hover:border-off-white/20 text-off-white rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            Save Edits
          </button>
        </div>
      </div>

      {/* Main split dashboard panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Preview (60% width) */}
        <div className="w-3/5 p-8 overflow-y-auto border-r border-[#1E1E2A] bg-near-black flex flex-col gap-6">
          <span className="text-label text-muted font-bold border-b border-border/40 pb-2">Public Feed Preview</span>
          
          <article className="max-w-3xl mx-auto w-full flex flex-col gap-6">
            <header className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {currentChannel && (
                  <span 
                    className="px-2 py-0.5 rounded text-label font-bold border"
                    style={{
                      color: currentChannel.color_hex,
                      borderColor: `${currentChannel.color_hex}30`,
                      backgroundColor: `${currentChannel.color_hex}10`,
                    }}
                  >
                    {currentChannel.name}
                  </span>
                )}
                {isBreaking && (
                  <span className="bg-rift-red text-near-black px-2 py-0.5 rounded text-label font-extrabold animate-pulse">
                    ⚡ Breaking
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-dev-blue text-label font-bold">
                  <IconRosetteFilled size={12} />
                  Verified
                </span>
              </div>

              <h1 className="text-display-xl leading-tight text-off-white">
                {headline || 'Headline placeholder...'}
              </h1>

              {deck && (
                <p className="text-body-l text-muted font-medium italic border-l-2 border-border/80 pl-4 py-1">
                  {deck}
                </p>
              )}
            </header>

            <div className="h-px bg-border/40 w-full" />

            {/* So What Section */}
            <SoWhatBox
              dev={soWhatDev}
              security={soWhatSecurity}
              founders={soWhatFounders}
              creators={soWhatCreators}
              data={soWhatData}
            />

            {/* Body Html */}
            <div 
              className="prose prose-invert text-body-l text-off-white/90 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: bodyHtml || '<p>Body content preview...</p>' }}
            />

            {/* AI Audit Pill */}
            {article.audit_record && (
              <div className="flex justify-start border-t border-border/40 pt-6">
                <AigenAuditPill
                  similarityScore={article.audit_record.max_similarity_score}
                  copyrightPassed={article.audit_record.copyright_passed}
                  sourceCount={article.audit_record.source_count}
                />
              </div>
            )}
          </article>
        </div>

        {/* Right Panel: Controls & Aigen details (40% width) */}
        <div className="w-2/5 overflow-y-auto bg-surface/30 flex flex-col justify-between relative border-l border-[#1E1E2A]">
          <div className="p-6 space-y-6 pb-24">
            <span className="text-label text-muted font-bold block border-b border-border/40 pb-2">Editorial Edit Controls</span>

            {/* Standard inputs */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-label text-muted font-bold">Headline</label>
                <textarea
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  rows={3}
                  className="bg-surface border border-border rounded-lg p-3 text-body-m text-off-white outline-none focus:border-border/80 resize-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label text-muted font-bold">Deck / Excerpt</label>
                <textarea
                  value={deck}
                  onChange={(e) => setDeck(e.target.value)}
                  rows={3}
                  className="bg-surface border border-border rounded-lg p-3 text-body-m text-muted outline-none focus:border-border/80 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-label text-muted font-bold">Channel</label>
                  <select
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="bg-surface border border-border rounded-lg p-2.5 text-body-m text-off-white outline-none focus:border-border/80 cursor-pointer"
                  >
                    <option value="">No Channel</option>
                    {channels.map((chan) => (
                      <option key={chan.id} value={chan.id}>
                        {chan.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between border border-border rounded-lg p-3 bg-surface/50">
                  <span className="text-label text-muted font-bold">Breaking News</span>
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-rift-red"
                  />
                </div>
              </div>
            </div>

            {/* Collapsible So What inputs */}
            <div className="space-y-4">
              <span className="text-label text-muted font-bold block border-b border-border/40 pb-2">"So What" Takeaways</span>
              
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-dev-blue">Developer Impact Takeaway</span>
                  <textarea
                    value={soWhatDev}
                    onChange={(e) => setSoWhatDev(e.target.value)}
                    rows={2}
                    className="bg-surface border border-border rounded-lg p-3 text-body-m text-off-white outline-none focus:border-border/80"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-sec-amber">Security Risk Takeaway</span>
                  <textarea
                    value={soWhatSecurity}
                    onChange={(e) => setSoWhatSecurity(e.target.value)}
                    rows={2}
                    className="bg-surface border border-border rounded-lg p-3 text-body-m text-off-white outline-none focus:border-border/80"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-founders-purple">Founders Takeaway</span>
                  <textarea
                    value={soWhatFounders}
                    onChange={(e) => setSoWhatFounders(e.target.value)}
                    rows={2}
                    className="bg-surface border border-border rounded-lg p-3 text-body-m text-off-white outline-none focus:border-border/80"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-creators-teal">Creators Takeaway</span>
                  <textarea
                    value={soWhatCreators}
                    onChange={(e) => setSoWhatCreators(e.target.value)}
                    rows={2}
                    className="bg-surface border border-border rounded-lg p-3 text-body-m text-off-white outline-none focus:border-border/80"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[#F09595]">ML / Data Science Takeaway</span>
                  <textarea
                    value={soWhatData}
                    onChange={(e) => setSoWhatData(e.target.value)}
                    rows={2}
                    className="bg-surface border border-border rounded-lg p-3 text-body-m text-off-white outline-none focus:border-border/80"
                  />
                </div>
              </div>
            </div>

            {/* AIGen Audit panel */}
            {article.audit_record && (
              <div className="p-4 border border-border bg-near-black/35 rounded-xl space-y-4">
                <span className="text-label text-muted font-bold block border-b border-border/40 pb-2">AI Generation Audit Trail</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted block">LLM Model</span>
                    <span className="font-mono text-off-white">{article.audit_record.model_used}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Ingested At</span>
                    <span className="text-off-white">
                      {new Date(article.audit_record.ingested_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Similarity Match</span>
                    <span className={`font-mono font-bold ${
                      article.audit_record.max_similarity_score > 0.15 ? 'text-rift-red' : 'text-grant-green'
                    }`}>
                      {Math.round(article.audit_record.max_similarity_score * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Copyright Validation</span>
                    <span className="flex items-center gap-1">
                      {article.audit_record.copyright_passed ? (
                        <>
                          <IconCheck size={14} className="text-grant-green" />
                          <span className="text-grant-green font-bold">Passed</span>
                        </>
                      ) : (
                        <>
                          <IconX size={14} className="text-rift-red" />
                          <span className="text-rift-red font-bold">Flagged</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Sources list */}
                <div className="space-y-1">
                  <span className="text-xs text-muted block">Sources ({article.audit_record.source_count})</span>
                  <div className="space-y-1 overflow-y-auto max-h-24">
                    {(() => {
                      try {
                        const urls = Array.isArray(article.audit_record.source_urls) 
                          ? article.audit_record.source_urls 
                          : JSON.parse(article.audit_record.source_urls as string || '[]');
                        return urls.map((url: string, idx: number) => (
                          <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-dev-blue hover:underline flex items-center gap-1 truncate"
                          >
                            <IconExternalLink size={10} className="shrink-0" />
                            <span className="truncate">{url}</span>
                          </a>
                        ));
                      } catch (err) {
                        return <span className="text-xs text-muted">No source URLs</span>;
                      }
                    })()}
                  </div>
                </div>

                {article.audit_record.r2_audit_path && (
                  <div className="text-xs border-t border-border/40 pt-2 flex items-center justify-between">
                    <span className="text-muted">Storage Path</span>
                    <a 
                      href={article.audit_record.r2_audit_path} 
                      className="text-dev-blue hover:underline"
                    >
                      Audit Record Log File
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky status action footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-[#0d0d14] flex flex-col gap-2 shrink-0 z-10">
            {isRejecting && (
              <form onSubmit={handleRejectConfirm} className="flex gap-2 mb-2 p-2 border border-border/80 bg-surface rounded-lg">
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  className="flex-1 bg-near-black text-body-m text-off-white border border-border rounded px-2 py-1 outline-none"
                >
                  <option value="">Select Rejection Reason...</option>
                  <option value="hallucination">Hallucination / Fact Check Failed</option>
                  <option value="poor_synthesis">Poor Synthesis / Low Quality</option>
                  <option value="copyright">Potential Copyright Issue</option>
                  <option value="irrelevant">Irrelevant to Channel Audience</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-label font-bold bg-rift-red text-off-white rounded hover:bg-rift-red/90 transition-all cursor-pointer"
                >
                  Reject
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

            <div className="flex gap-2">
              {/* Transitions */}
              {article.status === 'draft' && (
                <button
                  onClick={handleSubmitForReview}
                  disabled={loading}
                  className="flex-1 py-3 text-label font-bold text-center text-near-black bg-off-white hover:bg-off-white/95 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  Submit for Review
                </button>
              )}

              {article.status === 'in_review' && (
                <>
                  <button
                    onClick={handleApprovePublish}
                    disabled={loading}
                    className="flex-1 py-3 text-label font-bold text-center text-near-black bg-grant-green hover:bg-grant-green/95 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => setIsRejecting(true)}
                    disabled={loading}
                    className="flex-1 py-3 text-label font-bold text-center text-rift-red border border-rift-red/40 hover:bg-rift-red/5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    Reject to Draft
                  </button>
                </>
              )}

              {article.status === 'approved' && (
                <button
                  onClick={handleApprovePublish}
                  disabled={loading}
                  className="flex-1 py-3 text-label font-bold text-center text-near-black bg-grant-green hover:bg-grant-green/95 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  Publish Now
                </button>
              )}

              {article.status === 'published' && (
                <>
                  <button
                    onClick={handleRetract}
                    disabled={loading}
                    className="flex-1 py-3 text-label font-bold text-center text-rift-red border border-rift-red/40 hover:bg-rift-red/5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    Retract
                  </button>
                  <button
                    onClick={handleArchive}
                    disabled={loading}
                    className="flex-1 py-3 text-label font-bold text-center text-muted border border-border hover:bg-surface/50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    Archive
                  </button>
                </>
              )}

              {article.status === 'retracted' && (
                <button
                  onClick={handleRestoreDraft}
                  disabled={loading}
                  className="flex-1 py-3 text-label font-bold text-center text-near-black bg-off-white hover:bg-off-white/95 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  Restore to Draft
                </button>
              )}

              {article.status === 'archived' && (
                <button
                  onClick={handleRestoreDraft}
                  disabled={loading}
                  className="flex-1 py-3 text-label font-bold text-center text-near-black bg-off-white hover:bg-off-white/95 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  Restore to Draft
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleEditorClient;
