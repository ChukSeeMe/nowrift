'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAndEnableTotp } from '@/app/admin/actions';

interface Setup2faClientProps {
  secret: string;
}

export function Setup2faClient({ secret }: Setup2faClientProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || isNaN(Number(code))) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await verifyAndEnableTotp(code);
      if (res.success) {
        alert('Two-factor authentication enabled successfully!');
        router.push('/admin');
        router.refresh();
      } else {
        setError(res.error || 'Invalid verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-xl border border-border bg-surface space-y-6">
      <div>
        <h1 className="text-display-m font-bold text-off-white">Set Up Two-Factor Authentication</h1>
        <p className="text-body-m text-muted leading-relaxed mt-1">
          For security, administrative accounts must enable 2FA using a TOTP app (e.g. Google Authenticator, 1Password, Duo).
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-border bg-[#0d0d14] rounded-lg space-y-3">
          <span className="text-label text-muted font-bold block">1. Add this secret key manually to your TOTP app:</span>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-lg font-bold text-dev-blue text-center bg-near-black border border-border/60 py-2.5 rounded select-all block">
              {secret}
            </span>
            <span className="text-[10px] text-muted text-center uppercase tracking-wide">
              Click to select and copy secret key
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">2. Enter the 6-digit verification code from your app</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="bg-near-black border border-border rounded-lg px-4 py-3 text-center text-xl font-bold font-mono text-off-white outline-none focus:border-border/80 tracking-widest"
            />
          </div>

          {error && (
            <p className="text-body-m text-rift-red font-semibold text-center bg-rift-red/5 border border-rift-red/20 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-3 text-label font-bold bg-off-white hover:bg-off-white/90 text-near-black rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Setup2faClient;
