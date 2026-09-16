export function toInt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  return 0;
}
