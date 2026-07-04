import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconRosetteFilled, IconFileText } from '@tabler/icons-react';
import ChannelTag from './ChannelTag';
import SoWhatBox from './SoWhatBox';
import { getFallbackImage } from '@/lib/utils/image';

interface ArticleHeroProps {
  article: {
    slug: string;
    headline: string;
    deck?: string | null;
    published_at?: Date | string | null;
    so_what_dev?: string | null;
    so_what_security?: string | null;
    so_what_founders?: string | null;
    so_what_creators?: string | null;
    so_what_data?: string | null;
    channel?: {
      name: string;
      slug: string;
      color_hex: string;
    } | null;
    audit_record?: {
      max_similarity_score: number;
      copyright_passed: boolean;
      source_count: number;
    } | null;
    images?: Array<{
      image_url: string;
      alt_text?: string | null;
      image_type?: string;
    }>;
  };
  className?: string;
}

export function ArticleHero({ article, className = '' }: ArticleHeroProps) {
  const heroImage = article.images?.find(img => img.image_type === 'hero');
  const rawUrl = heroImage?.image_url || article.images?.[0]?.image_url;
  const imageUrl = (rawUrl && rawUrl !== 'css_fallback') ? rawUrl : getFallbackImage(article.slug, article.headline, 800, 450);
  const altText = heroImage?.alt_text || article.headline;

  const timeString = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const getSoWhatText = () => {
    switch (article.channel?.slug) {
      case 'developers':
        return { label: 'Dev Impact', text: article.so_what_dev };
      case 'cybersecurity':
        return { label: 'Security Risk', text: article.so_what_security };
      case 'founders':
        return { label: 'Founders Take', text: article.so_what_founders };
      case 'creators':
        return { label: 'Creators Take', text: article.so_what_creators };
      case 'data-science':
        return { label: 'ML Insight', text: article.so_what_data };
      default:
        if (article.so_what_dev) return { label: 'Dev Impact', text: article.so_what_dev };
        return null;
    }
  };

  const soWhat = getSoWhatText();
  const sourceCount = article.audit_record?.source_count || 0;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-border bg-surface flex flex-col min-h-[480px] group ${className}`}>
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={altText}
          fill
          priority
          className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 66vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/70 to-near-black/10 z-10" />
      </div>

      <div className="relative z-20 flex-1 flex flex-col justify-end p-6 md:p-8 gap-4 mt-40">
        <div className="flex flex-wrap items-center gap-3 text-label text-off-white/80">
          {article.channel && (
            <ChannelTag name={article.channel.name} colorHex={article.channel.color_hex} />
          )}

          <span className="inline-flex items-center gap-1 text-dev-blue font-bold">
            <IconRosetteFilled size={14} className="shrink-0" />
            Verified Report
          </span>

          <span className="text-muted">•</span>
          <span>{timeString}</span>

          {sourceCount > 0 && (
            <>
              <span className="text-muted">•</span>
              <span className="inline-flex items-center gap-1 bg-border/40 px-2 py-0.5 rounded text-off-white">
                <IconFileText size={12} className="shrink-0" />
                {sourceCount} {sourceCount === 1 ? 'Source' : 'Sources'}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 max-w-4xl">
          <Link href={`/${article.slug}`}>
            <h1 className="text-display-xl text-off-white hover:text-rift-red transition-colors cursor-pointer leading-tight">
              {article.headline}
            </h1>
          </Link>
          {article.deck && (
            <p className="text-body-l text-off-white/80 leading-relaxed font-light">
              {article.deck}
            </p>
          )}
        </div>

        {soWhat && soWhat.text && (
          <div className="max-w-2xl">
            <SoWhatBox
              singleChannelLabel={soWhat.label}
              singleChannelText={soWhat.text}
              className="bg-near-black/60 backdrop-blur-md border-border/40"
            />
          </div>
        )}


      </div>
    </div>
  );
}

export default ArticleHero;
