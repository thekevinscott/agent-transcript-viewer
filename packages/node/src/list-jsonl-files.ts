import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function listJsonlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listJsonlFiles(full));
    } else if (entry.endsWith('.jsonl')) {
      out.push(full);
    }
  }
  return out.sort();
}
