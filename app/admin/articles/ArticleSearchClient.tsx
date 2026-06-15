'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { IconSearch } from '@tabler/icons-react';

interface Channel {
  id: string;
  name: string;
  slug: string;
}

interface ArticleSearchClientProps {
  initialSearch: string;
  initialChannelId: string;
  initialStatus: string;
  channels: Channel[];
}

export function ArticleSearchClient({
  initialSearch,
  initialChannelId,
  initialStatus,
  channels,
}: ArticleSearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [channelId, setChannelId] = useState(initialChannelId);
  const [status, setStatus] = useState(initialStatus);

  const applyFilters = (newSearch: string, newChannelId: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (newSearch) {
      params.set('search', newSearch);
    } else {
      params.delete('search');
    }

    if (newChannelId) {
      params.set('channelId', newChannelId);
    } else {
      params.delete('channelId');
    }

    if (newStatus && newStatus !== 'all') {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, channelId, status);
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setChannelId(val);
    applyFilters(search, val, status);
  };

  const handleStatusTab = (newStatus: string) => {
    setStatus(newStatus);
    applyFilters(search, channelId, newStatus);
  };

  const statusTabs = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'In Review', value: 'in_review' },
    { label: 'Published', value: 'published' },
    { label: 'Retracted', value: 'retracted' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex border-b border-border/80 overflow-x-auto gap-2">
        {statusTabs.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleStatusTab(tab.value)}
              className={`px-4 py-2.5 text-label font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-rift-red text-rift-red bg-surface/20'
                  : 'border-transparent text-muted hover:text-off-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search headlines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border text-body-m text-off-white rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-border/80 transition-colors"
          />
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* Channel dropdown */}
        <div className="w-full md:w-64">
          <select
            value={channelId}
            onChange={handleChannelChange}
            className="w-full bg-surface border border-border text-body-m text-off-white rounded-lg px-4 py-2.5 outline-none focus:border-border/80 transition-colors cursor-pointer"
          >
            <option value="">All Channels</option>
            {channels.map((chan) => (
              <option key={chan.id} value={chan.id}>
                {chan.name}
              </option>
            ))}
          </select>
        </div>

        {isPending && (
          <span className="text-body-m text-muted animate-pulse font-mono">
            Filtering...
          </span>
        )}
      </div>
    </div>
  );
}

export default ArticleSearchClient;
