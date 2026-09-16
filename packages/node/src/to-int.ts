export function toInt(value: unknown): number {
  return Number.isFinite(value) ? Math.trunc(value as number) : 0;
}
