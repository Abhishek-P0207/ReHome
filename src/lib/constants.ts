/**
 * ReHome application constants.
 */

export const CATEGORIES = [
  'Kitchen',
  'Footwear',
  'Phones',
  'Furniture',
  'Books',
  'Music',
  'Clothing',
  'Home',
  'Electronics',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
] as const;

export const CITIES = [
  'Chennai',
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
] as const;

export const DEFAULT_CITY = 'Chennai';
