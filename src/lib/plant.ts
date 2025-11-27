
/**
 * Format plant age for display
 * @param acquiredAt - The date when the plant was acquired
 * @returns Formatted age string
 */
export function formatPlantAge(acquiredAt: Date | null | undefined): string {
  if (!acquiredAt) return 'Not set';

  const acquired = new Date(acquiredAt);
  const now = new Date();
  const diffMs = now.getTime() - acquired.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Less than a day';
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;

  const months = Math.floor(diffDays / 30.44);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;

  const years = Math.floor(months / 12);
  if (years === 0) return 'Less than a year';
  if (years === 1) return '1 year';
  if (years >= 50) return '50 years and more';

  return `${years} years`;
}
