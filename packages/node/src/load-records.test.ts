import { readFileSync, statSync } from 'node:fs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listJsonlFiles } from './list-jsonl-files';
import { loadRecords } from './load-records';
import { parseTranscriptText } from './parse-transcript-text';

vi.mock('node:fs');
vi.mock('./list-jsonl-files');
vi.mock('./parse-transcript-text');

function directory(isDirectory: boolean): void {
  vi.mocked(statSync).mockReturnValue({ isDirectory: () => isDirectory } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(readFileSync).mockImplementation(((path: string) => `text of ${path}`) as never);
  vi.mocked(parseTranscriptText).mockImplementation((text: string) => [{ text }]);
});

describe('loadRecords', () => {
  it('parses a single file read as UTF-8', () => {
    directory(false);

    expect(loadRecords('one.jsonl')).toEqual([{ text: 'text of one.jsonl' }]);
    expect(readFileSync).toHaveBeenCalledWith('one.jsonl', 'utf-8');
    expect(listJsonlFiles).not.toHaveBeenCalled();
  });

  it('concatenates every .jsonl file under a directory', () => {
    directory(true);
    vi.mocked(listJsonlFiles).mockReturnValue(['dir/a.jsonl', 'dir/b.jsonl']);

    expect(loadRecords('dir')).toEqual([{ text: 'text of dir/a.jsonl' }, { text: 'text of dir/b.jsonl' }]);
    expect(listJsonlFiles).toHaveBeenCalledWith('dir');
    expect(readFileSync).toHaveBeenCalledWith('dir/a.jsonl', 'utf-8');
  });
});
