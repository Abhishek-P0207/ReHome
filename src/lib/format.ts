/**
 * Formatting utilities for INR currency and dates.
 */
import { formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format currency amount in INR with en-IN numbering convention (e.g. ₹1,50,000)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format relative time (e.g. "2 hours ago", "yesterday")
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
}
