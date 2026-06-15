'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpRequired, setTotpRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, string> = { email, password };
      if (totpRequired) {
        payload.totp_code = totpCode;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.totp_required) {
        setTotpRequired(true);
        setError(null);
        setLoading(false);
        return;
      }

      // Successful login
      // Wait a moment for cookies to register
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-near-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo size="md" className="text-off-white" />
          <h2 className="mt-6 text-display-l text-off-white text-center">
            Sign in to NowRift
          </h2>
          <p className="mt-2 text-body-m text-muted text-center">
            Authorized personnel and editorial staff only.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-border bg-surface shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg border border-rift-red/50 bg-rift-red/10 text-body-m text-rift-red">
                {error}
              </div>
            )}

            {!totpRequired ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-label text-muted mb-2 font-bold">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-near-black text-off-white placeholder-muted focus:outline-none focus:border-rift-red text-body-m transition-colors"
                    placeholder="name@nowrift.dev"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-label text-muted mb-2 font-bold">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-near-black text-off-white placeholder-muted focus:outline-none focus:border-rift-red text-body-m transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="totpCode" className="block text-label text-muted mb-2 font-bold">
                  2FA Verification Code
                </label>
                <input
                  id="totpCode"
                  name="totpCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-near-black text-off-white placeholder-muted focus:outline-none focus:border-rift-red text-body-m tracking-widest text-center text-lg transition-colors font-mono"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <p className="mt-2 text-xs text-muted">
                  Open your authenticator app and enter the 6-digit verification code.
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="relative flex w-full justify-center rounded-lg bg-rift-red px-4 py-3 text-body-m font-semibold text-off-white hover:bg-rift-red/90 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-off-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  totpRequired ? 'Verify & Sign In' : 'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
