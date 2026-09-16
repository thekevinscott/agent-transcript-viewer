import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listJsonlFiles } from './list-jsonl-files';

vi.mock('node:fs');
vi.mock('node:path');

const tree: Record<string, string[]> = {
  root: ['b.jsonl', 'a.jsonl', 'notes.txt', 'nested'],
  'root/nested': ['c.jsonl'],
  empty: [],
};

beforeEach(() => {
  vi.mocked(join).mockImplementation((...parts: string[]) => parts.join('/'));
  vi.mocked(readdirSync).mockImplementation(((dir: string) => tree[dir]) as never);
  vi.mocked(statSync).mockImplementation(((path: string) => ({
    isDirectory: () => path === 'root/nested',
  })) as never);
});

describe('listJsonlFiles', () => {
  it('collects .jsonl files recursively, sorted, and ignores other extensions', () => {
    expect(listJsonlFiles('root')).toEqual([
      'root/a.jsonl',
      'root/b.jsonl',
      'root/nested/c.jsonl',
    ]);
  });

  it('returns nothing for a directory with no entries', () => {
    expect(listJsonlFiles('empty')).toEqual([]);
  });
});
