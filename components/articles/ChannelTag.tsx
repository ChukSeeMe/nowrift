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
      className={`inline-flex items-center px-2 py-0.5 rounded text-label font-medium border transition-colors ${className}`}
      style={{
        color: colorHex,
        borderColor: `${colorHex}30`, // ~20% opacity border
        backgroundColor: `${colorHex}0F`, // ~10% opacity background
      }}
    >
      {name}
    </span>
  );
}

export default ChannelTag;
