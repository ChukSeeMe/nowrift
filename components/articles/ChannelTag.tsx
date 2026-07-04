import React from 'react';

interface ChannelTagProps {
  name: string;
  colorHex?: string;
  slug?: string;
  className?: string;
}

export function ChannelTag({ name, colorHex = '#FF3D3D', slug, className = '' }: ChannelTagProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-label font-bold text-near-black transition-colors ${className}`}
      style={{
        backgroundColor: colorHex,
        borderColor: colorHex,
      }}
    >
      {name}
    </span>
  );
}

export default ChannelTag;
