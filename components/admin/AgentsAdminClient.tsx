'use client';

import React, { useState } from 'react';
import { toggleAgentEnabled } from '@/app/admin/actions';
import { IconCpu, IconRefresh, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface AgentConfigData {
  agent_name: string;
  is_enabled: boolean;
}

interface AgentRunData {
  id: string;
  agent_name: string;
  status: string;
  started_at: Date | string | null;
  completed_at: Date | string | null;
  items_processed: number;
  cost_usd: any;
  error_message: string | null;
  metadata: any;
}

interface AgentsAdminClientProps {
  configs: AgentConfigData[];
  runs: AgentRunData[];
  recentRunsForCards: Record<string, AgentRunData>;
}

export function AgentsAdminClient({ configs, runs, recentRunsForCards }: AgentsAdminClientProps) {
  const [loading, setLoading] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  // List of all 12 system agents
  const allAgents = [
    { name: 'scraper', label: 'News Scraper Agent' },
    { name: 'synthesiser', label: 'AI Synthesis Agent' },
    { name: 'image_fetcher', label: 'Image Assets Agent' },
    { name: 'publisher', label: 'News Publisher Agent' },
    { name: 'social_poster', label: 'Social Poster Agent' },
    { name: 'seo_agent', label: 'SEO Metadata Agent' },
    { name: 'grant_monitor', label: 'Grant Monitor Agent' },
    { name: 'social_monitor', label: 'Social Monitor Agent' },
    { name: 'social_replier', label: 'Social Replier Agent' },
    { name: 'social_community', label: 'Social Community Agent' },
    { name: 'social_trend', label: 'Social Trend Analyzer' },
    { name: 'social_strategy', label: 'Social Strategist Agent' },
  ];

  const handleToggle = async (agentName: string, currentEnabled: boolean) => {
    setLoading(true);
    try {
      const res = await toggleAgentEnabled(agentName, !currentEnabled);
      if (res.success) {
        alert(`${agentName} status updated!`);
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Toggle failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrigger = async (agentName: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/internal/agents/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Internal Auth checks
          'Authorization': `Bearer mock_internal_api_secret`,
        },
        body: JSON.stringify({ agent: agentName }),
      });
      if (res.ok) {
        alert(`Successfully triggered manual run for ${agentName}`);
      } else {
        alert(`Failed to trigger ${agentName}. Check server connections.`);
      }
    } catch (err) {
      alert(`Trigger request sent for ${agentName} (simulated)`);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandRun = (id: string) => {
    setExpandedRunId(expandedRunId === id ? null : id);
  };

  // Status Color indicators helper
  const getCardStatusColor = (agentName: string, lastRun: AgentRunData | null) => {
    if (!lastRun) return 'bg-muted/30 border-muted/20'; // never run

    if (lastRun.status === 'running') {
      return 'bg-sec-amber animate-pulse';
    }

    if (lastRun.status === 'failed') {
      return 'bg-rift-red';
    }

    if (lastRun.status === 'completed') {
      const lastRunTime = lastRun.completed_at ? new Date(lastRun.completed_at).getTime() : 0;
      const hoursSinceRun = (Date.now() - lastRunTime) / (1000 * 60 * 60);
      if (hoursSinceRun > 24) {
        return 'bg-muted/80'; // grey if not run in 24h
      }
      return 'bg-grant-green'; // green if healthy recent completed
    }

    return 'bg-muted/30';
  };

  const formatRelativeTime = (date: Date | string | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* 12 Agent status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allAgents.map((agent) => {
          const config = configs.find(c => c.agent_name === agent.name) || { agent_name: agent.name, is_enabled: true };
          const lastRun = recentRunsForCards[agent.name] || null;

          const statusColor = getCardStatusColor(agent.name, lastRun);
          const lastRunTimeText = lastRun ? formatRelativeTime(lastRun.started_at) : 'Never';
          const itemsCount = lastRun ? lastRun.items_processed : 0;
          const cost = lastRun ? Number(lastRun.cost_usd) : 0;

          return (
            <div
              key={agent.name}
              className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between min-h-[180px]"
            >
              {/* Top row status */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
                  <span className="text-body-m font-bold text-off-white">{agent.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.is_enabled}
                  onChange={() => handleToggle(agent.name, config.is_enabled)}
                  disabled={loading}
                  className="w-4 h-4 cursor-pointer accent-grant-green"
                  title="Enable/Disable Agent"
                />
              </div>

              {/* Center row metrics */}
              <div className="my-4 text-xs space-y-1 text-muted">
                <div className="flex justify-between">
                  <span>Last Executed</span>
                  <span className="text-off-white font-mono">{lastRunTimeText}</span>
                </div>
                {lastRun && (
                  <>
                    <div className="flex justify-between">
                      <span>Items Processed</span>
                      <span className="text-off-white font-mono">{itemsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Execution Cost</span>
                      <span className="text-grant-green font-mono">${cost.toFixed(4)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action trigger button */}
              <button
                disabled={loading || !config.is_enabled}
                onClick={() => handleManualTrigger(agent.name)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-label font-bold border border-border hover:border-off-white/20 text-off-white hover:bg-near-black/20 rounded transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                <IconRefresh size={12} />
                <span>Trigger Run</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Expandable Agent Run Logs */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="p-5 border-b border-border/80 bg-near-black/20">
          <h2 className="text-display-m text-off-white font-bold flex items-center gap-2">
            <IconCpu size={20} className="text-muted" />
            Agent Run Logs
          </h2>
        </div>

        <div className="overflow-x-auto">
          {runs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-label text-muted bg-[#0d0d14]/40">
                  <th className="p-4 font-bold">Agent</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Started At</th>
                  <th className="p-4 font-bold text-center">Duration</th>
                  <th className="p-4 font-bold text-center">Items</th>
                  <th className="p-4 font-bold text-right">Cost</th>
                  <th className="p-4 font-bold"></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const isExpanded = expandedRunId === run.id;
                  const duration = run.completed_at && run.started_at 
                    ? Math.max(0, Math.floor((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000))
                    : null;
                  const durationText = duration !== null ? `${duration}s` : '—';

                  const statusColor = 
                    run.status === 'completed' ? 'text-grant-green border-grant-green/20 bg-grant-green/5' :
                    run.status === 'failed' ? 'text-rift-red border-rift-red/20 bg-rift-red/5' :
                    'text-sec-amber border-sec-amber/20 bg-sec-amber/5';

                  return (
                    <React.Fragment key={run.id}>
                      <tr 
                        onClick={() => toggleExpandRun(run.id)}
                        className="border-b border-border/40 hover:bg-surface/20 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-semibold text-off-white/95">
                          {run.agent_name.toUpperCase()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-label font-mono font-bold border ${statusColor}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="p-4 text-body-m text-muted font-mono">
                          {run.started_at ? new Date(run.started_at).toLocaleString() : '—'}
                        </td>
                        <td className="p-4 text-center text-body-m text-muted font-mono">
                          {durationText}
                        </td>
                        <td className="p-4 text-center text-body-m text-off-white font-mono">
                          {run.items_processed}
                        </td>
                        <td className="p-4 text-right text-body-m text-grant-green font-bold font-mono">
                          ${Number(run.cost_usd).toFixed(4)}
                        </td>
                        <td className="p-4 text-muted text-right">
                          {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-[#0c0c12]/50 border-b border-border/40">
                          <td colSpan={7} className="p-4">
                            <div className="space-y-4 text-xs font-mono">
                              {run.error_message && (
                                <div className="p-3 border border-rift-red/35 bg-rift-red/5 rounded-lg text-rift-red">
                                  <strong>Error Message:</strong> {run.error_message}
                                </div>
                              )}
                              <div className="p-4 bg-near-black/70 border border-border/80 rounded-lg space-y-2">
                                <span className="text-muted block text-label font-bold border-b border-border/40 pb-1">Metadata Payload JSONB:</span>
                                <pre className="overflow-x-auto text-muted select-all">
                                  {JSON.stringify(run.metadata || {}, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-body-l text-muted">
              No agent execution logs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentsAdminClient;
