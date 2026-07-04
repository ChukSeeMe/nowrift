'use client';

import { useState } from 'react';
import { getFallbackImage } from '@/lib/utils/image';

interface ArticleImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function ArticleImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
}: ArticleImageProps) {
  const [hasError, setHasError] = useState(false);

  // If there's an error loading the image or src is missing, fall back to dynamic SVG gradient
  if (hasError || !src) {
    const fallbackSrc = getFallbackImage(alt, alt, width || 800, height || 450);
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={`${className} image-css-fallback`}
        width={width}
        height={height}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
}

export default ArticleImage;
