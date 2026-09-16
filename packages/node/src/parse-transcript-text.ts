export type TranscriptRecord = Record<string, unknown>;

function splitLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}

export function parseTranscriptText(text: string): TranscriptRecord[] {
  const records: TranscriptRecord[] = [];
  for (const line of splitLines(text)) {
    if (!line.trim()) {
      continue;
    }
    try {
      records.push(JSON.parse(line) as TranscriptRecord);
    } catch {
      records.push({ type: 'raw', line });
    }
  }
  return records;
}
