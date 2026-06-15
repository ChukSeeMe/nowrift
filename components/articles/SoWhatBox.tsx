import React from 'react';

interface SoWhatBoxProps {
  dev?: string | null;
  security?: string | null;
  founders?: string | null;
  creators?: string | null;
  data?: string | null;
  singleChannelLabel?: string;
  singleChannelText?: string | null;
  className?: string;
}

export function SoWhatBox({
  dev,
  security,
  founders,
  creators,
  data,
  singleChannelLabel,
  singleChannelText,
  className = '',
}: SoWhatBoxProps) {
  if (singleChannelText) {
    return (
      <div className={`p-4 rounded-lg bg-surface border border-border/80 flex flex-col gap-1.5 ${className}`}>
        <span className="text-label text-rift-red font-bold flex items-center gap-1">
          ⚡ {singleChannelLabel || 'So What?'}
        </span>
        <p className="text-body-m text-off-white/90 leading-relaxed">
          {singleChannelText}
        </p>
      </div>
    );
  }

  const sections = [
    { label: 'Developer Impact', text: dev, color: 'var(--color-dev-blue)' },
    { label: 'Security Analysis', text: security, color: 'var(--color-sec-amber)' },
    { label: 'Founders Take', text: founders, color: 'var(--color-founders-purple)' },
    { label: 'Creators Insights', text: creators, color: 'var(--color-creators-teal)' },
    { label: 'Data Science Perspective', text: data, color: '#F09595' },
  ].filter(s => !!s.text);

  if (sections.length === 0) return null;

  return (
    <div className={`rounded-xl border border-border bg-surface overflow-hidden ${className}`}>
      <div className="px-4 py-3 bg-near-black/20 border-b border-border flex items-center justify-between">
        <span className="text-label text-off-white font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rift-red animate-pulse" />
          The "So What?" Perspective
        </span>
        <span className="text-label text-muted">Audience-Specific Impact</span>
      </div>
      <div className="divide-y divide-border/40">
        {sections.map((sec, idx) => (
          <div key={idx} className="p-4 flex flex-col md:flex-row gap-2 md:gap-6 items-start hover:bg-near-black/5 transition-colors">
            <div className="w-48 shrink-0 flex items-center gap-2">
              <span className="w-1 h-3 rounded-full" style={{ backgroundColor: sec.color }} />
              <span className="text-label text-off-white font-bold tracking-wide">
                {sec.label}
              </span>
            </div>
            <p className="text-body-m text-off-white/80 leading-relaxed">
              {sec.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SoWhatBox;
