import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  compact?: boolean;
}

export function Logo({ className = '', size = 'md', compact = false }: LogoProps) {
  const dimensions = {
    sm: { width: compact ? 32 : 120, height: 32 },
    md: { width: compact ? 48 : 180, height: 48 },
    lg: { width: compact ? 64 : 240, height: 64 },
    xl: { width: compact ? 96 : 360, height: 96 },
  };

  const { width, height } = dimensions[size];

  if (compact) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <text
          x="12"
          y="72"
          fill="currentColor"
          fontSize="48"
          fontFamily="var(--font-headlines), sans-serif"
          fontWeight="bold"
        >
          N
        </text>
        <text
          x="52"
          y="72"
          fill="currentColor"
          fontSize="48"
          fontFamily="var(--font-headlines), sans-serif"
          fontWeight="bold"
        >
          R
        </text>
        <g transform="rotate(14 50 50)">
          <rect x="44" y="15" width="4" height="70" fill="var(--color-rift-red, #FF3D3D)" />
          <rect x="52" y="15" width="4" height="70" fill="var(--color-rift-red, #FF3D3D)" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="10"
        y="58"
        fill="currentColor"
        fontSize="54"
        fontFamily="var(--font-headlines), sans-serif"
        fontWeight="bold"
        letterSpacing="-1.5"
      >
        NOW
      </text>

      <g transform="rotate(14 150 40)">
        <rect x="142" y="10" width="5" height="60" fill="var(--color-rift-red, #FF3D3D)" rx="1" />
        <rect x="153" y="10" width="5" height="60" fill="var(--color-rift-red, #FF3D3D)" rx="1" />
      </g>

      <text
        x="175"
        y="58"
        fill="currentColor"
        fontSize="54"
        fontFamily="var(--font-headlines), sans-serif"
        fontWeight="bold"
        letterSpacing="-1.5"
      >
        RIFT
      </text>
    </svg>
  );
}
export default Logo;
