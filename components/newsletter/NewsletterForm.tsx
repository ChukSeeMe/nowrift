'use client';

import React, { useState } from 'react';
import { IconMail, IconArrowRight, IconLoaderQuarter, IconCircleCheck } from '@tabler/icons-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Thanks for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Failed to connect. Please check your network.');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-surface to-surface/80 border border-border/80 rounded-2xl flex flex-col gap-4 shadow-xl">
      <div className="flex flex-col gap-2">
        <h3 className="text-display-m text-off-white font-bold tracking-tight">
          RIFT Digest
        </h3>
        <p className="text-body-m text-muted leading-relaxed">
          Get daily tech insights, AI audit breakdowns, and curated tech grant alerts direct to your inbox.
        </p>
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-3 bg-grant-green/10 border border-grant-green/30 p-4 rounded-xl text-grant-green text-body-m animate-fade-in">
          <IconCircleCheck size={20} className="shrink-0" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <IconMail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={status === 'loading'}
              className="w-full bg-near-black border border-border/80 rounded-xl py-3 pl-11 pr-4 text-body-m text-off-white placeholder:text-muted focus:outline-none focus:border-rift-red transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-off-white text-near-black hover:bg-off-white/90 disabled:bg-muted/30 disabled:text-muted rounded-xl text-label font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5"
          >
            {status === 'loading' ? (
              <IconLoaderQuarter className="animate-spin" size={16} />
            ) : (
              <>
                <span>Subscribe</span>
                <IconArrowRight size={14} />
              </>
            )}
          </button>

          {status === 'error' && (
            <p className="text-label text-rift-red font-bold animate-pulse mt-1">
              {message}
            </p>
          )}
        </form>
      )}

      <div className="h-px bg-border/40 w-full" />
      <p className="text-[11px] text-muted text-center leading-normal">
        No spam. Unsubscribe at any time. Powered by Beehiiv.
      </p>
    </div>
  );
}

export default NewsletterForm;
