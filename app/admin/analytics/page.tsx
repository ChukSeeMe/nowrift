import React from 'react';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-xl text-off-white">Platform Analytics</h1>
        <p className="text-body-l text-muted">Track views, click-through rates, subscription trends, and API metrics.</p>
      </div>

      <div className="p-12 rounded-xl border border-border bg-surface text-center text-body-l text-muted">
        Analytics reporting pipelines are managed in the external Plausible Dashboard. Embed scripts are active on public client pages.
      </div>
    </div>
  );
}
