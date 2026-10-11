import { describe, it, expect } from '@jest/globals';
import { calculateItemValue, calculateExchange } from '../exchange';
import type { Item } from '@/types';

describe('calculateItemValue', () => {
  it('returns owner-set price when present', () => {
    const item = {
      price: 4500,
      ai: { min: 3800, max: 5500, confidence: 'high' as const, reasoning: '', mock: true as const },
    };
    expect(calculateItemValue(item)).toBe(4500);
  });

  it('returns AI midpoint when owner price is not set', () => {
    const item = {
      price: undefined,
      ai: { min: 2500, max: 3500, confidence: 'high' as const, reasoning: '', mock: true as const },
    };
    expect(calculateItemValue(item)).toBe(3000);
  });

  it('returns 0 when neither price nor AI is present', () => {
    const item = { price: undefined, ai: undefined };
    expect(calculateItemValue(item)).toBe(0);
  });
});

describe('calculateExchange', () => {
  const userA = 'user-ravi';
  const userB = 'user-asha';

  it('identifies an even swap when values are identical', () => {
    const itemA = { price: 3000 };
    const itemB = { price: 3000 };

    const result = calculateExchange({
      itemA,
      itemB,
      ownerAId: userA,
      ownerBId: userB,
    });

    expect(result.even).toBe(true);
    expect(result.topupAmount).toBe(0);
    expect(result.payerId).toBeNull();
    expect(result.valueA).toBe(3000);
    expect(result.valueB).toBe(3000);
  });

  it('identifies an even swap at within 10% tolerance (e.g. 1000 vs 950)', () => {
    // max is 1000, 10% is 100, diff is 50 <= 100 -> even
    const itemA = { price: 1000 };
    const itemB = { price: 950 };

    const result = calculateExchange({
      itemA,
      itemB,
      ownerAId: userA,
      ownerBId: userB,
    });

    expect(result.even).toBe(true);
    expect(result.topupAmount).toBe(0);
    expect(result.payerId).toBeNull();
  });

  it('handles a tie at exactly 10% tolerance (e.g. 1000 vs 900)', () => {
    // max is 1000, 10% is 100, diff is 100 == 100 -> even swap
    const itemA = { price: 1000 };
    const itemB = { price: 900 };

    const result = calculateExchange({
      itemA,
      itemB,
      ownerAId: userA,
      ownerBId: userB,
    });

    expect(result.even).toBe(true);
    expect(result.topupAmount).toBe(0);
    expect(result.payerId).toBeNull();
  });

  it('calculates top-up where Owner A pays (A has lower value beyond 10%)', () => {
    // Ravi offers air fryer (3000 AI midpoint), Asha offers guitar (4500)
    // max is 4500, tolerance is 450. diff is 1500 > 450.
    // Ravi (itemA) has lower value -> Ravi pays 1500
    const airFryer = {
      ai: { min: 2500, max: 3500, confidence: 'high' as const, reasoning: '', mock: true as const },
    };
    const guitar = { price: 4500 };

    const result = calculateExchange({
      itemA: airFryer,
      itemB: guitar,
      ownerAId: userA,
      ownerBId: userB,
    });

    expect(result.even).toBe(false);
    expect(result.topupAmount).toBe(1500);
    expect(result.payerId).toBe(userA);
    expect(result.valueA).toBe(3000);
    expect(result.valueB).toBe(4500);
  });

  it('calculates top-up where Owner B pays (B has lower value beyond 10%)', () => {
    const itemA = { price: 5000 };
    const itemB = { price: 2000 };

    const result = calculateExchange({
      itemA,
      itemB,
      ownerAId: userA,
      ownerBId: userB,
    });

    expect(result.even).toBe(false);
    expect(result.topupAmount).toBe(3000);
    expect(result.payerId).toBe(userB);
    expect(result.valueA).toBe(5000);
    expect(result.valueB).toBe(2000);
  });

  it('handles missing AI value and price gracefully', () => {
    const itemA = { price: 2000 };
    const itemB = {}; // 0 value

    const result = calculateExchange({
      itemA,
      itemB,
      ownerAId: userA,
      ownerBId: userB,
    });

    expect(result.even).toBe(false);
    expect(result.topupAmount).toBe(2000);
    expect(result.payerId).toBe(userB);
    expect(result.valueA).toBe(2000);
    expect(result.valueB).toBe(0);
  });
});
