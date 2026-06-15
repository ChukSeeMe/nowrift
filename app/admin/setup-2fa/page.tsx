import React from 'react';
import { getTotpSecret } from '@/app/admin/actions';
import Setup2faClient from '@/components/admin/Setup2faClient';

export const dynamic = 'force-dynamic';

export default async function Setup2faPage() {
  const totpInfo = await getTotpSecret();
  
  if (totpInfo.enabled) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-xl border border-border bg-surface text-center space-y-4">
        <h1 className="text-display-m font-bold text-off-white">2FA Already Enabled</h1>
        <p className="text-body-m text-muted">
          Two-factor authentication is already configured for this administrative user.
        </p>
      </div>
    );
  }

  return (
    <Setup2faClient secret={totpInfo.secret || ''} />
  );
}
