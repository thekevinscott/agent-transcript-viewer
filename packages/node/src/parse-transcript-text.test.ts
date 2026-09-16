import { describe, expect, it } from 'vitest';

import { parseTranscriptText } from './parse-transcript-text';

describe('parseTranscriptText', () => {
  it('parses one record per JSON line', () => {
    expect(parseTranscriptText('{"a":1}\n{"a":2}')).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('splits on CRLF, CR, and LF alike', () => {
    expect(parseTranscriptText('{"a":1}\r\n{"a":2}\r{"a":3}\n{"a":4}')).toHaveLength(4);
  });

  it('skips blank and whitespace-only lines', () => {
    expect(parseTranscriptText('\n  \n{"a":1}\n')).toEqual([{ a: 1 }]);
  });

  it('keeps an unparseable line as a raw record', () => {
    expect(parseTranscriptText('not json')).toEqual([{ type: 'raw', line: 'not json' }]);
  });

  it('returns nothing for empty text', () => {
    expect(parseTranscriptText('')).toEqual([]);
  });
});
