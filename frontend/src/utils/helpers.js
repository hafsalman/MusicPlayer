/**
 * Format milliseconds to m:ss
 */
export function formatDuration(ms) {
  if (!ms || isNaN(ms)) return '--:--';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to m:ss
 */
export function formatSeconds(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Format large follower numbers
 */
export function formatFollowers(n) {
  if (!n) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

/**
 * Get the best image URL from an array of Spotify image objects
 */
export function getBestImage(images, preferredSize = 'medium') {
  if (!images || images.length === 0) return null;
  if (images.length === 1) return images[0].url;
  // Spotify returns images sorted largest to smallest
  if (preferredSize === 'small') return images[images.length - 1]?.url || images[0].url;
  if (preferredSize === 'large') return images[0].url;
  return images[Math.floor(images.length / 2)]?.url || images[0].url;
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, maxLen = 30) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

/**
 * Generate a color from a string (for genre cards etc)
 */
export function colorFromString(str) {
  const colors = [
    '#7c3aed', '#db2777', '#0891b2', '#059669',
    '#d97706', '#dc2626', '#4f46e5', '#0284c7',
    '#6366f1', '#be185d'  // replaced duplicate #7c3aed with #6366f1
  ];
  const hash = str.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
