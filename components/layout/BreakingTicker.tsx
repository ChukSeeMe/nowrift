'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ChannelTag from '../articles/ChannelTag';

interface BreakingArticle {
  slug: string;
  headline: string;
  channel?: {
    name: string;
    color_hex: string;
  } | null;
}

export function BreakingTicker() {
  const [articles, setArticles] = useState<BreakingArticle[]>([]);

  const fetchBreaking = async () => {
    try {
      const res = await fetch('/api/v1/articles?breaking=true');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Failed to fetch breaking news:', err);
    }
  };

  useEffect(() => {
    fetchBreaking();
    const interval = setInterval(fetchBreaking, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  if (articles.length === 0) return null;

  // Duplicate list to achieve seamless infinite looping
  const scrolledItems = [...articles, ...articles];

  return (
    <div className="w-full h-10 bg-surface border-b border-border/80 overflow-hidden flex items-center relative z-30 select-none">
      {/* Pinned Red Label */}
      <div className="h-full px-4 flex items-center bg-rift-red text-near-black font-extrabold text-label tracking-wider shrink-0 z-10 shadow-lg shadow-near-black">
        ⚡ BREAKING
      </div>

      {/* Scrolling Area */}
      <div className="flex-1 h-full overflow-hidden relative">
        <div className="animate-ticker flex items-center h-full">
          {scrolledItems.map((article, idx) => (
            <Link
              key={`${article.slug}-${idx}`}
              href={`/${article.slug}`}
              className="mx-8 flex items-center gap-3 whitespace-nowrap text-body-m font-bold text-off-white/95 hover:text-rift-red transition-colors shrink-0"
            >
              {article.channel && (
                <ChannelTag
                  name={article.channel.name}
                  colorHex={article.channel.color_hex}
                  className="scale-90"
                />
              )}
              <span>{article.headline}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BreakingTicker;
