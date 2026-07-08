'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  IconCalendar, 
  IconHourglass, 
  IconSparkles, 
  IconUser,
  IconBookmark
} from '@tabler/icons-react';
import ChannelTag from '@/components/articles/ChannelTag';
import { getFallbackImage } from '@/lib/utils/image';

interface PlainArticle {
  id: string;
  slug: string;
  headline: string;
  deck: string;
  body_html: string;
  content_tier: string;
  deep_dive_format: string;
  related_sector: string;
  is_human_authored: boolean;
  read_time_minutes: number;
  published_at: string;
  image_url?: string;
}

interface DeepDivesClientProps {
  articles: PlainArticle[];
}

const FORMAT_CONFIG: { [key: string]: { name: string; color: string } } = {
  roundup: { name: 'Weekly Roundup', color: '#A855F7' },
  sector: { name: 'Sector Deep Dive', color: '#3B82F6' },
  explainer: { name: 'Explainer', color: '#10B981' },
  interview: { name: 'Founder Interview', color: '#F59E0B' },
  report: { name: 'State of Report', color: '#EF4444' },
};

export function DeepDivesClient({ articles }: DeepDivesClientProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  const filteredArticles = useMemo(() => {
    if (selectedFormat === 'all') return articles;
    return articles.filter(art => art.deep_dive_format === selectedFormat);
  }, [articles, selectedFormat]);

  const featuredArticle = useMemo(() => {
    if (filteredArticles.length === 0) return null;
    return filteredArticles[0]; // most recent one
  }, [filteredArticles]);

  const gridArticles = useMemo(() => {
    if (filteredArticles.length <= 1) return [];
    return filteredArticles.slice(1);
  }, [filteredArticles]);

  const formatFilters = [
    { label: 'All Deep Dives', value: 'all' },
    { label: 'Roundups', value: 'roundup' },
    { label: 'Sector Dives', value: 'sector' },
    { label: 'Explainers', value: 'explainer' },
    { label: 'Interviews', value: 'interview' },
    { label: 'Reports', value: 'report' },
  ];

  const getFormatBadge = (format: string) => {
    const config = FORMAT_CONFIG[format] || { name: 'Deep Dive', color: '#6B7280' };
    return <ChannelTag name={config.name} colorHex={config.color} />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-10">
      {/* Header and Introduction */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <h1 className="text-display-2xl text-off-white font-extrabold tracking-tight">
          New Rift <span className="bg-gradient-to-r from-rift-red to-[#A855F7] bg-clip-text text-transparent">Deep Dives</span>
        </h1>
        <p className="text-body-xl text-muted font-light leading-relaxed">
          Going beyond daily events to unpack structural trends, sectoral maps, developer primers, and exclusive founder interviews. What it means for the next six months, not six hours.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-border/40 pb-4">
        {formatFilters.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedFormat(tab.value)}
            className={`px-4 py-2 text-body-m font-bold rounded-lg border transition-all cursor-pointer ${
              selectedFormat === tab.value
                ? 'bg-off-white text-near-black border-off-white'
                : 'bg-surface border-border/80 text-muted hover:border-border hover:text-off-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Pinned Card */}
      {featuredArticle && (
        <section className="border border-border/80 rounded-2xl overflow-hidden bg-surface flex flex-col lg:flex-row hover:border-border transition-all">
          <div className="lg:w-1/2 aspect-[16/10] relative bg-near-black">
            <Image
              src={featuredArticle.image_url && featuredArticle.image_url !== 'css_fallback' 
                ? featuredArticle.image_url 
                : getFallbackImage(featuredArticle.slug, featuredArticle.headline, 800, 500)}
              alt={featuredArticle.headline}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {getFormatBadge(featuredArticle.deep_dive_format)}
              {featuredArticle.is_human_authored && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-dev-blue uppercase tracking-wider">
                  <IconUser size={12} />
                  Human Authored
                </span>
              )}
            </div>

            <div className="space-y-3">
              <Link href={`/deep-dives/${featuredArticle.slug}`}>
                <h2 className="text-display-xl text-off-white hover:text-rift-red transition-colors cursor-pointer leading-tight font-extrabold">
                  {featuredArticle.headline}
                </h2>
              </Link>
              {featuredArticle.deck && (
                <p className="text-body-l text-muted font-light leading-relaxed">
                  {featuredArticle.deck}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-label text-muted font-mono pt-4 border-t border-border/40">
              <span className="flex items-center gap-1.5">
                <IconCalendar size={14} />
                {formatDate(featuredArticle.published_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <IconHourglass size={14} />
                {featuredArticle.read_time_minutes} min read
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Remaining Pieces */}
      {gridArticles.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-display-m font-bold text-off-white flex items-center gap-2">
            <IconBookmark size={20} className="text-rift-red" />
            <span>More Deep Dives</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((art) => (
              <article 
                key={art.id} 
                className="border border-border/60 rounded-xl overflow-hidden bg-surface hover:border-border/80 transition-all flex flex-col h-full"
              >
                <div className="aspect-[16/9] relative bg-near-black border-b border-border/40">
                  <Image
                    src={art.image_url && art.image_url !== 'css_fallback' 
                      ? art.image_url 
                      : getFallbackImage(art.slug, art.headline, 600, 340)}
                    alt={art.headline}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {getFormatBadge(art.deep_dive_format)}
                      {art.is_human_authored && (
                        <span className="text-[10px] font-mono text-dev-blue uppercase font-bold">
                          Human
                        </span>
                      )}
                    </div>
                    <Link href={`/deep-dives/${art.slug}`}>
                      <h4 className="text-display-m font-bold text-off-white hover:text-rift-red transition-colors cursor-pointer line-clamp-2 leading-snug">
                        {art.headline}
                      </h4>
                    </Link>
                    {art.deck && (
                      <p className="text-body-m text-muted line-clamp-3 leading-relaxed font-light">
                        {art.deck}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-label text-muted font-mono pt-4 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <IconCalendar size={12} />
                      {formatDate(art.published_at).split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconHourglass size={12} />
                      {art.read_time_minutes} min
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {filteredArticles.length === 0 && (
        <div className="p-16 border border-dashed border-border rounded-2xl text-center text-body-l text-muted bg-surface/50">
          No articles found under this format query. Check back soon for fresh deep dives!
        </div>
      )}
    </div>
  );
}
