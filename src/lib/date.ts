/**
 * Format relative time for future dates
 * @param date - The date to format
 * @returns Formatted relative time string (e.g., "Tomorrow", "in 3 days", "in 2 weeks")
 */
export function formatRelativeTime(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `in ${diffDays} days`;
  if (diffDays < 14) return `in 1 week`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `in ${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  if (diffDays < 60) return 'in 1 month';
  const months = Math.floor(diffDays / 30);
  return `in ${months} month${months > 1 ? 's' : ''}`;
}

