import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type TranscriptRecord = Record<string, unknown>;

export interface TranscriptMetadata {
  sessionId: string | null;
  cwd: string | null;
  version: string | null;
  gitBranch: string | null;
}

export interface UsageTotals {
  totalInput: number;
  totalCacheCreation: number;
  totalCacheRead: number;
  totalOutput: number;
  apiCalls: number;
}

export interface TranscriptSummary {
  metadata: TranscriptMetadata;
  usage: UsageTotals;
}

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

function listJsonlFiles(dir: string): string[] {
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

export function loadRecords(path: string): TranscriptRecord[] {
  if (statSync(path).isDirectory()) {
    return listJsonlFiles(path).flatMap((file) => parseTranscriptText(readFileSync(file, 'utf-8')));
  }
  return parseTranscriptText(readFileSync(path, 'utf-8'));
}

function toInt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  return 0;
}

export function summarizeTranscript(records: TranscriptRecord[]): TranscriptSummary {
  const metadata: TranscriptMetadata = { sessionId: null, cwd: null, version: null, gitBranch: null };
  const usage: UsageTotals = { totalInput: 0, totalCacheCreation: 0, totalCacheRead: 0, totalOutput: 0, apiCalls: 0 };
  const seenMessageIds = new Set<string>();

  for (const record of records) {
    const type = record.type;
    if (type === 'system' && record.subtype === 'init') {
      metadata.sessionId = (record.sessionId as string) || metadata.sessionId;
      metadata.cwd = (record.cwd as string) || metadata.cwd;
      metadata.version = (record.version as string) || metadata.version;
      metadata.gitBranch = (record.gitBranch as string) || metadata.gitBranch;
    } else if (type === 'assistant') {
      const message = (record.message as Record<string, unknown>) || {};
      const messageId = message.id as string | undefined;
      if (messageId && seenMessageIds.has(messageId)) {
        continue;
      }
      if (messageId) {
        seenMessageIds.add(messageId);
      }
      const messageUsage = (message.usage as Record<string, unknown>) || {};
      usage.totalInput += toInt(messageUsage.input_tokens);
      usage.totalCacheCreation += toInt(messageUsage.cache_creation_input_tokens);
      usage.totalCacheRead += toInt(messageUsage.cache_read_input_tokens);
      usage.totalOutput += toInt(messageUsage.output_tokens);
      usage.apiCalls += 1;
    }
  }

  return { metadata, usage };
}
