import React from 'react';
import prisma from '@/lib/db/prisma';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import ToolsClient from './ToolsClient';
import { cachedQuery } from '@/lib/cache/queries';
import { CACHE_TTL } from '@/lib/cache/ttl';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI & Developer Tools Directory | NowRift',
  description: 'A curated index of frontier AI models, code editors, security utilities, and developer tools for modern technology builders.',
};

export default async function ToolsPage() {
  // Fetch active tools from DB
  const tools = await cachedQuery('cache:tools:list', CACHE_TTL.TOOLS_LIST, () =>
    prisma.tool.findMany({
      where: { is_active: true },
      orderBy: { released_at: 'desc' },
    })
  );

  const plainTools = tools.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    url: t.url,
    icon: t.icon,
    color: t.color,
    released_at: t.released_at
      ? (t.released_at instanceof Date
          ? t.released_at.toISOString()
          : new Date(t.released_at).toISOString())
      : '',
    pricing: t.pricing,
    type: t.type,
    developer: t.developer ?? undefined,
    prompt_text: t.prompt_text ?? undefined,
    stars: t.stars ?? undefined,
    metadata: t.metadata ? JSON.parse(JSON.stringify(t.metadata)) : {},
  }));

  return (
    <div className="flex flex-col min-h-screen bg-near-black text-off-white font-body">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
        {/* Page Header */}
        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 className="text-display-xl font-bold tracking-tight text-off-white">
            Developer Tools Directory
          </h1>
          <p className="text-body-l text-muted leading-relaxed">
            A curated index of frontier AI models, autonomous agents, code editors, and startup stack tools updated in real-time.
          </p>
        </div>

        <ToolsClient initialTools={plainTools} />
      </main>

      <Footer />
    </div>
  );
}
