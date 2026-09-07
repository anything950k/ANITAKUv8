export function getRatingDisplay(
  item?: { score?: number | string | null } | null
): string {
  if (!item || item.score === undefined || item.score === null) return 'N/A';
  const num = typeof item.score === 'string' ? parseFloat(item.score) : item.score;
  if (isNaN(num) || num <= 0) return 'N/A';

  // AniList scores are out of 100 (e.g., 88 -> 8.8) or out of 10
  if (num > 10) {
    return (num / 10).toFixed(1);
  }
  return num.toFixed(1);
}
