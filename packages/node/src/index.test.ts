import { describe, expect, it } from 'vitest';

import { VIEWER_NAME } from './index';

describe('frontend workspace placeholder', () => {
  it('exports the viewer name', () => {
    expect(VIEWER_NAME).toBe('agent-transcript-viewer');
  });
});
