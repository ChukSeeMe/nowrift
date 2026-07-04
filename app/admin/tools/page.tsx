import React from 'react';
import prisma from '@/lib/db/prisma';
import { getAdminSession } from '@/lib/auth/jwt-edge';
import { redirect } from 'next/navigation';
import { ToolsListClient } from './ToolsListClient';

export const dynamic = 'force-dynamic';

export default async function AdminToolsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch tools from DB
  const tools = await prisma.tool.findMany({
    orderBy: { released_at: 'desc' },
  });

  // Convert decimal/date objects to plain JSON structure for client-side rendering safety
  const plainTools = tools.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
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
    is_active: t.is_active,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-xl text-off-white">Tools & Models Directory</h1>
          <p className="text-body-l text-muted">Manage the listing of state-of-the-art developer tools, AI models, and agents.</p>
        </div>
      </div>

      {/* Client List Wrapper */}
      <ToolsListClient initialTools={plainTools} />
    </div>
  );
}
