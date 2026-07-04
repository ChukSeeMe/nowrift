'use client';

import React, { useState } from 'react';

interface FaviconProps {
  domain: string | null;
}

export default function Favicon({ domain }: FaviconProps) {
  const [error, setError] = useState(false);

  if (error || !domain) {
    return null;
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      className="w-4 h-4 rounded-sm shrink-0"
      onError={() => setError(true)}
    />
  );
}
