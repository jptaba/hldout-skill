/**
 * The test author's "finished" mark on a draft, kept in the story's history.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { lastEvent, recordEvent } from '../core/history';
import type { StoryPaths } from '../core/paths';

/** A hash of the story's spec files as they are now. */
function specsHash(testsDir: string): string {
  const files = fs.existsSync(testsDir) ? fs.readdirSync(testsDir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.spec.ts')).sort() : [];
  const h = crypto.createHash('sha256');
  for (const f of files) h.update(f).update(fs.readFileSync(path.join(testsDir, f)));
  return h.digest('hex').slice(0, 16);
}

/**
 * The test author's last act: say the draft is finished (`heldout lint KEY … --draft-finished`, once it lints clean).
 * A draft whose author was cut off (a session limit, a crash) may lint clean and still be half of what was meant: the
 * freeze waits for this mark, and it holds only for the spec as it was when it was made.
 */
export function markDraftFinished(p: Pick<StoryPaths, 'history' | 'tests'>): void {
  recordEvent(p.history, 'draft-finished', { specs: specsHash(p.tests) });
}
export function draftFinished(p: Pick<StoryPaths, 'history' | 'tests'>): boolean {
  return lastEvent<{ specs: string }>(p.history, 'draft-finished')?.specs === specsHash(p.tests);
}
