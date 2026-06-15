import React from 'react';

interface AigenAuditPillProps {
  similarityScore: number;
  copyrightPassed: boolean;
  sourceCount: number;
  className?: string;
}

export function AigenAuditPill({
  similarityScore,
  copyrightPassed,
  sourceCount,
  className = '',
}: AigenAuditPillProps) {
  const isOk = copyrightPassed && similarityScore < 0.25;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label font-mono border transition-colors ${
        isOk
          ? 'text-grant-green border-grant-green/30 bg-grant-green/10'
          : 'text-sec-amber border-sec-amber/30 bg-sec-amber/10'
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-grant-green animate-pulse' : 'bg-sec-amber'}`} />
      <span>AI Audit: {Math.round(similarityScore * 100)}% Match</span>
    </div>
  );
}

export default AigenAuditPill;
