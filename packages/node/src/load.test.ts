import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadRecords, summarizeTranscript } from './load';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesRoot = join(here, '..', '..', '..', 'tests', 'fixtures');
const transcripts = join(fixturesRoot, 'transcripts');
const expected = join(fixturesRoot, 'expected');

function loadExpected(name: string): { records: unknown[]; summary: unknown } {
  return JSON.parse(readFileSync(join(expected, `${name}.json`), 'utf-8'));
}

describe.each([
  ['sample_transcript', 'sample_transcript.jsonl'],
  ['blank_lines', 'blank_lines.jsonl'],
  ['malformed_lines', 'malformed_lines.jsonl'],
  ['multi_file', 'multi_file'],
])('parity with design-snapshot load.py: %s', (name, fixtureRelPath) => {
  it('produces identical records, metadata, and usage totals', () => {
    const golden = loadExpected(name);
    const records = loadRecords(join(transcripts, fixtureRelPath));
    const summary = summarizeTranscript(records);
    expect(records).toEqual(golden.records);
    expect(summary).toEqual(golden.summary);
  });
});

describe('loadRecords', () => {
  it('skips blank lines and keeps malformed lines as raw records', () => {
    const records = loadRecords(join(transcripts, 'malformed_lines.jsonl'));
    expect(records.map((r) => (r as { type: string }).type)).toEqual(['user', 'raw', 'assistant', 'raw']);
  });

  it('reads every .jsonl file under a directory, recursively, sorted', () => {
    const records = loadRecords(join(transcripts, 'multi_file')) as { message: { content: string } }[];
    expect(records.map((r) => r.message.content)).toEqual(['a1', 'b1', 'b2', 'c1']);
  });
});
