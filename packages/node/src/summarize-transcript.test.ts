import { beforeEach, describe, expect, it, vi } from 'vitest';

import { summarizeTranscript } from './summarize-transcript';
import { toInt } from './to-int';

vi.mock('./to-int');

beforeEach(() => {
  vi.mocked(toInt).mockImplementation((value: unknown) => (typeof value === 'number' ? value : 0));
});

describe('summarizeTranscript', () => {
  it('takes metadata from the init record and keeps it against later blanks', () => {
    const { metadata, usage } = summarizeTranscript([
      { type: 'system', subtype: 'init', sessionId: 's1', cwd: '/w', version: '1.2', gitBranch: 'main' },
      { type: 'system', subtype: 'init' },
      { type: 'system', subtype: 'compact_boundary', sessionId: 'ignored' },
      { type: 'user', subtype: 'init', sessionId: 'ignored' },
    ]);

    expect(metadata).toEqual({ sessionId: 's1', cwd: '/w', version: '1.2', gitBranch: 'main' });
    expect(usage.apiCalls).toBe(0);
  });

  it('leaves metadata null when no init record appears', () => {
    expect(summarizeTranscript([]).metadata).toEqual({
      sessionId: null,
      cwd: null,
      version: null,
      gitBranch: null,
    });
  });

  it('sums usage once per message id and counts an api call per assistant record', () => {
    const message = {
      id: 'm1',
      usage: {
        input_tokens: 10,
        cache_creation_input_tokens: 20,
        cache_read_input_tokens: 30,
        output_tokens: 40,
      },
    };

    expect(
      summarizeTranscript([
        { type: 'assistant', message },
        { type: 'assistant', message },
        { type: 'assistant' },
        { type: 'assistant' },
      ]).usage,
    ).toEqual({
      totalInput: 10,
      totalCacheCreation: 20,
      totalCacheRead: 30,
      totalOutput: 40,
      apiCalls: 3,
    });
  });
});
