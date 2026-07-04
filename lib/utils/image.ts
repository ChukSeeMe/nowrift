/**
 * Generates a premium, high-resolution SVG linear gradient data URI
 * based on the keywords in the slug and headline, eliminating stock photos.
 */
export function getFallbackImage(slug: string, headline: string, width = 800, height = 450): string {
  const s = (slug || '').toLowerCase();
  const h = (headline || '').toLowerCase();

  // Curated premium gradient color pairs tailored to each category
  const gradients = {
    developers: { start: '#09090b', end: '#1e3a8a' },     // Slate to Deep Blue
    cybersecurity: { start: '#09090b', end: '#064e3b' },  // Slate to Dark Emerald
    founders: { start: '#09090b', end: '#581c87' },       // Slate to Deep Violet
    creators: { start: '#09090b', end: '#881337' },       // Slate to Rose/Burgundy
    datascience: { start: '#09090b', end: '#115e59' },    // Slate to Teal
    general: { start: '#09090b', end: '#1e293b' }         // Slate to Dark Grey
  };

  let palette = gradients.general;

  // Keyword check to map to the best category gradient
  if (
    s.includes('developer') || s.includes('copilot') || s.includes('code') || s.includes('github') || 
    s.includes('compiler') || s.includes('asml') || s.includes('lithography') || s.includes('chip') ||
    h.includes('developer') || h.includes('copilot') || h.includes('code') || h.includes('github') || 
    h.includes('compiler') || h.includes('asml') || h.includes('lithography') || h.includes('chip')
  ) {
    palette = gradients.developers;
  } else if (
    s.includes('cyber') || s.includes('security') || s.includes('hack') || s.includes('exploit') || 
    s.includes('vulnerability') || s.includes('defense') ||
    h.includes('cyber') || h.includes('security') || h.includes('hack') || h.includes('exploit') || 
    h.includes('vulnerability') || h.includes('defense')
  ) {
    palette = gradients.cybersecurity;
  } else if (
    s.includes('founder') || s.includes('startup') || s.includes('funding') || s.includes('raises') || 
    s.includes('seed') || s.includes('venture') || s.includes('valuation') || s.includes('ipo') ||
    h.includes('founder') || h.includes('startup') || h.includes('funding') || h.includes('raises') || 
    h.includes('seed') || h.includes('venture') || h.includes('valuation') || h.includes('ipo')
  ) {
    palette = gradients.founders;
  } else if (
    s.includes('creator') || s.includes('design') || s.includes('social') || s.includes('media') || 
    s.includes('pinterest') || s.includes('threads') || s.includes('artist') || s.includes('youtube') ||
    h.includes('creator') || h.includes('design') || h.includes('social') || h.includes('media') || 
    h.includes('pinterest') || h.includes('threads') || h.includes('artist') || h.includes('youtube')
  ) {
    palette = gradients.creators;
  } else if (
    s.includes('data') || s.includes('ai') || s.includes('model') || s.includes('intelligence') || 
    s.includes('inference') || s.includes('baseten') || s.includes('llm') || s.includes('deepmind') ||
    h.includes('data') || h.includes('ai') || h.includes('model') || h.includes('intelligence') || 
    h.includes('inference') || h.includes('baseten') || h.includes('llm') || h.includes('deepmind')
  ) {
    palette = gradients.datascience;
  }

  // Create SVG string
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="fallback-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.start}" />
        <stop offset="100%" stop-color="${palette.end}" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#fallback-grad)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
