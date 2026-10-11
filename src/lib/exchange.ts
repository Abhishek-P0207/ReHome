/**
 * Pure exchange calculation logic according to ReHome business rules.
 *
 * Rules:
 * - The value of an item is its owner-set price if present, otherwise the midpoint of its AI range.
 * - If neither price nor AI range exists, value defaults to 0.
 * - diff = |vA - vB|
 * - tolerance = 10% of max(vA, vB) (i.e. 0.1 * max(vA, vB))
 * - If diff <= tolerance the result is an even swap.
 * - Otherwise the owner of the lower-valued item pays diff.
 */
import type { Item } from '@/types';

export interface ExchangeCalculationResult {
  even: boolean;
  topupAmount: number;
  payerId: string | null;
  valueA: number;
  valueB: number;
}

/**
 * Calculates the fair value of an item:
 * 1. Owner-set price if present.
 * 2. Midpoint of AI range (Math.round((min + max) / 2)) if AI exists.
 * 3. Fallback to 0 if neither exists.
 */
export function calculateItemValue(item: Partial<Item>): number {
  if (typeof item.price === 'number' && !isNaN(item.price)) {
    return item.price;
  }
  if (item.ai && typeof item.ai.min === 'number' && typeof item.ai.max === 'number') {
    return Math.round((item.ai.min + item.ai.max) / 2);
  }
  return 0;
}

/**
 * Computes swap outcome between Item A (owned by ownerAId) and Item B (owned by ownerBId).
 */
export function calculateExchange({
  itemA,
  itemB,
  ownerAId,
  ownerBId,
}: {
  itemA: Partial<Item>;
  itemB: Partial<Item>;
  ownerAId: string;
  ownerBId: string;
}): ExchangeCalculationResult {
  const valueA = calculateItemValue(itemA);
  const valueB = calculateItemValue(itemB);

  const diff = Math.abs(valueA - valueB);
  const maxValue = Math.max(valueA, valueB);
  const tolerance = maxValue * 0.1; // 10% tolerance

  // Tolerant to floating point rounding (diff <= tolerance within 1e-6)
  if (diff <= tolerance + 1e-6 || maxValue === 0) {
    return {
      even: true,
      topupAmount: 0,
      payerId: null,
      valueA,
      valueB,
    };
  }

  // The owner of the lower-valued item pays the diff
  const payerId = valueA < valueB ? ownerAId : ownerBId;

  return {
    even: false,
    topupAmount: diff,
    payerId,
    valueA,
    valueB,
  };
}
