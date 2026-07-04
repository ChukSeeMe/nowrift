'use client';

import { useEffect } from 'react';

export function BodyImageErrorListener() {
  useEffect(() => {
    const handleImageError = (e: ErrorEvent) => {
      const target = e.target as HTMLElement;
      if (
        target && 
        target.tagName === 'IMG' && 
        (target.closest('.article-body') || target.classList.contains('image-css-fallback'))
      ) {
        const img = target as HTMLImageElement;
        
        // Prevent infinite loops
        if (img.dataset.failed) return;
        img.dataset.failed = 'true';

        // Replace the failed img with a beautiful CSS gradient placeholder div
        const div = document.createElement('div');
        div.className = img.className + ' image-css-fallback';
        div.setAttribute('role', 'img');
        div.setAttribute('aria-label', img.getAttribute('alt') || '');
        div.style.background = 'linear-gradient(135deg, #09090b 0%, #1e293b 100%)';
        div.style.minHeight = '200px';
        div.style.width = '100%';
        div.style.display = 'block';
        div.style.borderRadius = img.style.borderRadius || '6px';
        
        img.parentNode?.replaceChild(div, img);
      }
    };

    // Use capturing phase (true) so the error event bubbles up to window
    window.addEventListener('error', handleImageError, true);
    return () => window.removeEventListener('error', handleImageError, true);
  }, []);

  return null;
}

export default BodyImageErrorListener;
