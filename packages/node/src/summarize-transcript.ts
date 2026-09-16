import { type TranscriptRecord } from './parse-transcript-text';
import { toInt } from './to-int';

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
      if (messageId) {
        if (seenMessageIds.has(messageId)) {
          continue;
        }
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
