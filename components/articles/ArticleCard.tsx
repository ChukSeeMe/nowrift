import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconRosetteFilled, IconFileText } from '@tabler/icons-react';
import ChannelTag from './ChannelTag';
import AigenAuditPill from './AigenAuditPill';
import SoWhatBox from './SoWhatBox';

interface ArticleCardProps {
  article: {
    slug: string;
    headline: string;
    deck?: string | null;
    published_at?: Date | string | null;
    view_count: number;
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
      similarity_score: number;
      copyright_passed: boolean;
      source_count: number;
    } | null;
    images?: Array<{
      image_url: string;
      alt_text?: string | null;
    }>;
  };
  className?: string;
}

export function ArticleCard({ article, className = '' }: ArticleCardProps) {
  const thumbnail = article.images?.[0]?.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="%231A1A24"/></svg>';
  const altText = article.images?.[0]?.alt_text || article.headline;

  const timeString = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
        if (article.so_what_founders) return { label: 'Founders Take', text: article.so_what_founders };
        return null;
    }
  };

  const soWhat = getSoWhatText();
  const sourceCount = article.audit_record?.source_count || 0;

  return (
    <article className={`p-4 bg-surface border border-border rounded-xl flex gap-4 hover:border-border/80 transition-all ${className}`}>
      <div className="w-[88px] h-[88px] relative shrink-0 rounded-lg overflow-hidden bg-near-black border border-border/40">
        <Image
          src={thumbnail}
          alt={altText}
          fill
          className="object-cover"
          sizes="88px"
        />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-label text-muted">
          {article.channel && (
            <ChannelTag name={article.channel.name} colorHex={article.channel.color_hex} />
          )}

          <span className="inline-flex items-center gap-1 text-dev-blue font-semibold">
            <IconRosetteFilled size={12} />
            Verified
          </span>

          <span>•</span>
          <span>{timeString}</span>

          {sourceCount > 0 && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 bg-border/40 px-1.5 py-0.5 rounded text-off-white/80">
                <IconFileText size={10} />
                {sourceCount} {sourceCount === 1 ? 'Source' : 'Sources'}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Link href={`/${article.slug}`}>
            <h3 className="text-display-m text-off-white hover:text-rift-red transition-colors cursor-pointer leading-snug">
              {article.headline}
            </h3>
          </Link>
          {article.deck && (
            <p className="text-body-m text-muted line-clamp-2 leading-relaxed">
              {article.deck}
            </p>
          )}
        </div>

        {soWhat && soWhat.text && (
          <SoWhatBox
            singleChannelLabel={soWhat.label}
            singleChannelText={soWhat.text}
            className="mt-1"
          />
        )}

        {article.audit_record && (
          <div className="mt-1 flex justify-start">
            <AigenAuditPill
              similarityScore={article.audit_record.similarity_score}
              copyrightPassed={article.audit_record.copyright_passed}
              sourceCount={sourceCount}
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default ArticleCard;
