import { describe, expect, it } from 'vitest';

import { toInt } from './to-int';

describe('toInt', () => {
  it('truncates a finite number toward zero', () => {
    expect(toInt(3.9)).toBe(3);
    expect(toInt(-3.9)).toBe(-3);
  });

  it('returns zero for a non-finite number', () => {
    expect(toInt(Number.NaN)).toBe(0);
    expect(toInt(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('returns zero for anything that is not a number', () => {
    expect(toInt('7')).toBe(0);
    expect(toInt(undefined)).toBe(0);
  });
});
