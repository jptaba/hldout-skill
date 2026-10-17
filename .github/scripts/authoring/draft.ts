/**
 * The test author's "finished" mark on a draft.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** A hash of the story's spec files as they are now. */
function specsHash(testsDir: string): string {
  const files = fs.existsSync(testsDir) ? fs.readdirSync(testsDir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.spec.ts')).sort() : [];
  const h = crypto.createHash('sha256');
  for (const f of files) h.update(f).update(fs.readFileSync(path.join(testsDir, f)));
  return h.digest('hex').slice(0, 16);
}

const finishedFile = (base: string) => path.join(base, 'draft-finished.json');
/**
 * The test author's last act: say the draft is finished (`heldout lint KEY … --draft-finished`, once it lints clean).
 * A draft whose author was cut off (a session limit, a crash) may lint clean and still be half of what was meant: the
 * freeze waits for this mark, and it holds only for the spec as it was when it was made.
 */
export function markDraftFinished(base: string, testsDir: string): void {
  fs.writeFileSync(finishedFile(base), `${JSON.stringify({ specs: specsHash(testsDir), at: new Date().toISOString() }, null, 2)}\n`);
}
export function draftFinished(base: string, testsDir: string): boolean {
  if (!fs.existsSync(finishedFile(base))) return false;
  try { return (JSON.parse(fs.readFileSync(finishedFile(base), 'utf8')) as { specs?: string }).specs === specsHash(testsDir); } catch { return false; }
}
