import { describe, expect, it } from 'vitest';

import { VIEWER_NAME, loadRecords, parseTranscriptText, summarizeTranscript } from './index';

describe('frontend workspace entry point', () => {
  it('exports the viewer name', () => {
    expect(VIEWER_NAME).toBe('agent-transcript-viewer');
  });

  it('re-exports the transcript parsing surface', () => {
    expect(loadRecords).toBeTypeOf('function');
    expect(parseTranscriptText).toBeTypeOf('function');
    expect(summarizeTranscript).toBeTypeOf('function');
  });
});
