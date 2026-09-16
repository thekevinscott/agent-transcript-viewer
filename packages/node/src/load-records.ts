import { readFileSync, statSync } from 'node:fs';

import { listJsonlFiles } from './list-jsonl-files';
import { parseTranscriptText, type TranscriptRecord } from './parse-transcript-text';

export function loadRecords(path: string): TranscriptRecord[] {
  if (statSync(path).isDirectory()) {
    return listJsonlFiles(path).flatMap((file) => parseTranscriptText(readFileSync(file, 'utf-8')));
  }
  return parseTranscriptText(readFileSync(path, 'utf-8'));
}
