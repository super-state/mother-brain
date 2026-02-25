import type { Logger } from 'pino';

// ---------------------------------------------------------------------------
// Commitment Intent Detector
// ---------------------------------------------------------------------------
// Scans LLM output for timed action promises and extracts structured
// commitment objects. Uses regex pattern matching (no LLM call — $0 cost).
// ---------------------------------------------------------------------------

export type CommitmentType = 'one_time' | 'recurring';

export interface DetectedCommitment {
  type: CommitmentType;
  promiseText: string;       // The matched phrase from LLM output
  actionDescription: string; // What needs to happen
  schedule?: string;         // Cron pattern for recurring (e.g., "0 7 * * *")
  executeAt?: string;        // ISO timestamp for one-time (or "now")
}

// Recurring patterns: "every day at 7am", "daily at 9pm", "every morning", etc.
const RECURRING_PATTERNS: Array<{
  regex: RegExp;
  extractSchedule: (match: RegExpMatchArray) => string;
}> = [
  {
    // "every day at 7am" / "every day at 7:30pm"
    regex: /(?:every\s+day|daily)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    extractSchedule: (m) => {
      let hour = parseInt(m[1], 10);
      const minute = m[2] ? parseInt(m[2], 10) : 0;
      if (m[3]?.toLowerCase() === 'pm' && hour < 12) hour += 12;
      if (m[3]?.toLowerCase() === 'am' && hour === 12) hour = 0;
      return `${minute} ${hour} * * *`;
    },
  },
  {
    // "every morning" (defaults to 7am)
    regex: /every\s+morning/i,
    extractSchedule: () => '0 7 * * *',
  },
  {
    // "every evening" (defaults to 6pm)
    regex: /every\s+evening/i,
    extractSchedule: () => '0 18 * * *',
  },
  {
    // "every hour"
    regex: /every\s+hour/i,
    extractSchedule: () => '0 * * * *',
  },
  {
    // "every N hours"
    regex: /every\s+(\d+)\s+hours?/i,
    extractSchedule: (m) => `0 */${m[1]} * * *`,
  },
  {
    // "every N minutes"
    regex: /every\s+(\d+)\s+minutes?/i,
    extractSchedule: (m) => `*/${m[1]} * * * *`,
  },
  {
    // "every week" / "weekly" (defaults to Monday 9am)
    regex: /(?:every\s+week|weekly)/i,
    extractSchedule: () => '0 9 * * 1',
  },
];

// One-time promise patterns: "I'll do X", "I will send you X", "Let me do X"
const PROMISE_PATTERNS: RegExp[] = [
  /I'?ll\s+(?:send|get|fetch|find|compile|prepare|create|build|write|generate|research|look up|check|analyze|review|summarize)\s+(.{5,120})/i,
  /I\s+will\s+(?:send|get|fetch|find|compile|prepare|create|build|write|generate|research|look up|check|analyze|review|summarize)\s+(.{5,120})/i,
  /(?:Let me|I'm going to|I'll go ahead and)\s+(?:send|get|fetch|find|compile|prepare|create|build|write|generate|research|look up|check|analyze|review|summarize)\s+(.{5,120})/i,
];

// Time references for one-time commitments
const TIME_PATTERNS: Array<{
  regex: RegExp;
  toTimestamp: (match: RegExpMatchArray) => string;
}> = [
  {
    // "at 7am" / "at 3:30pm"
    regex: /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
    toTimestamp: (m) => {
      let hour = parseInt(m[1], 10);
      const minute = m[2] ? parseInt(m[2], 10) : 0;
      if (m[3]?.toLowerCase() === 'pm' && hour < 12) hour += 12;
      if (m[3]?.toLowerCase() === 'am' && hour === 12) hour = 0;
      const now = new Date();
      now.setHours(hour, minute, 0, 0);
      if (now.getTime() < Date.now()) now.setDate(now.getDate() + 1);
      return now.toISOString();
    },
  },
  {
    // "in N minutes"
    regex: /in\s+(\d+)\s+minutes?/i,
    toTimestamp: (m) => new Date(Date.now() + parseInt(m[1], 10) * 60_000).toISOString(),
  },
  {
    // "in N hours"
    regex: /in\s+(\d+)\s+hours?/i,
    toTimestamp: (m) => new Date(Date.now() + parseInt(m[1], 10) * 3_600_000).toISOString(),
  },
  {
    // "tomorrow" (defaults to 9am next day)
    regex: /tomorrow/i,
    toTimestamp: () => {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(9, 0, 0, 0);
      return t.toISOString();
    },
  },
  {
    // "right now" / "now" / "right away" / "immediately"
    regex: /(?:right now|right away|immediately|straightaway)/i,
    toTimestamp: () => 'now',
  },
];

/**
 * Scan an LLM response for commitment intent.
 *
 * Returns an array of detected commitments (usually 0 or 1).
 * Keeps scanning cost at $0 — pure regex, no LLM call.
 */
export function detectCommitments(llmOutput: string, logger: Logger): DetectedCommitment[] {
  const commitments: DetectedCommitment[] = [];

  // 1. Check for recurring commitments first (more specific)
  for (const pattern of RECURRING_PATTERNS) {
    const match = llmOutput.match(pattern.regex);
    if (match) {
      const schedule = pattern.extractSchedule(match);

      // Find the surrounding promise context
      const promiseContext = extractPromiseContext(llmOutput, match.index ?? 0);

      commitments.push({
        type: 'recurring',
        promiseText: match[0],
        actionDescription: promiseContext || match[0],
        schedule,
      });

      logger.debug({ type: 'recurring', schedule, match: match[0] }, 'Detected recurring commitment');
    }
  }

  // 2. Check for one-time promises (only if no recurring found for same phrase)
  if (commitments.length === 0) {
    for (const promiseRegex of PROMISE_PATTERNS) {
      const match = llmOutput.match(promiseRegex);
      if (match) {
        const actionDesc = match[1]?.trim() || match[0];

        // Try to find a time reference
        let executeAt = 'now';
        for (const timePat of TIME_PATTERNS) {
          const timeMatch = llmOutput.match(timePat.regex);
          if (timeMatch) {
            executeAt = timePat.toTimestamp(timeMatch);
            break;
          }
        }

        commitments.push({
          type: 'one_time',
          promiseText: match[0],
          actionDescription: actionDesc,
          executeAt,
        });

        logger.debug({ type: 'one_time', executeAt, match: match[0] }, 'Detected one-time commitment');
        break; // Only first promise per response
      }
    }
  }

  return commitments;
}

/** Extract surrounding sentence context for a match position. */
function extractPromiseContext(text: string, matchIndex: number): string {
  // Find sentence boundaries around the match
  const before = text.lastIndexOf('.', matchIndex);
  const after = text.indexOf('.', matchIndex);
  const start = before >= 0 ? before + 1 : 0;
  const end = after >= 0 ? after : text.length;
  return text.slice(start, end).trim();
}
