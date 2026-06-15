import React from 'react';
import prisma from '@/lib/db/prisma';
import AgentsAdminClient from '@/components/admin/AgentsAdminClient';

export const revalidate = 30;

export default async function AgentsAdminPage() {
  // Retrieve configs
  const configs = await prisma.agentConfig.findMany();

  // Retrieve last 20 runs for log
  const runs = await prisma.agentRun.findMany({
    orderBy: { created_at: 'desc' },
    take: 20,
  });

  // Fetch the absolute most recent run for each agent to display metrics in cards
  const allAgents = [
    'scraper', 'synthesiser', 'image_fetcher', 'publisher', 'social_poster', 
    'seo_agent', 'grant_monitor', 'social_monitor', 'social_replier', 
    'social_community', 'social_trend', 'social_strategy'
  ];

  const recentRunsForCards: Record<string, any> = {};

  await Promise.all(
    allAgents.map(async (agentName) => {
      const run = await prisma.agentRun.findFirst({
        where: { agent_name: agentName as any },
        orderBy: { created_at: 'desc' },
      });
      if (run) {
        recentRunsForCards[agentName] = run;
      }
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-xl text-off-white">Background Agents</h1>
        <p className="text-body-l text-muted">Configure active schedules, triggers, and inspect execution costs.</p>
      </div>

      <AgentsAdminClient
        configs={configs}
        runs={runs}
        recentRunsForCards={recentRunsForCards}
      />
    </div>
  );
}
