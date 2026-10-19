/**
 * The answer keys' pins (this repository only, never copied by init): each key in demo/answer-keys/ is pinned by its
 * SHA-256 in demo/answer-keys/HASHES, so a score names the exact key it was measured against and an edited key is
 * caught (tests/answer-keys.test.ts, and dev/score.ts refuses to score with it).
 *
 *   npx tsx dev/answer-keys.ts            check every key against its pin (exit 1 on a mismatch)
 *   npx tsx dev/answer-keys.ts --pin      write the pins for the keys as they are now
 *
 * Changing a key is a guardrail change with an ADR (AGENTS.md); its new pin goes in the same commit.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const KEYS_DIR = path.resolve(import.meta.dirname, '..', 'demo', 'answer-keys');
export const PINS_FILE = path.join(KEYS_DIR, 'HASHES');

/** A key's hash: of its text with LF line endings, so a checkout's line endings don't change it. */
export function keyHash(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

export const keyFiles = (dir = KEYS_DIR) => fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

/** The pins: file name → hash, from lines "<sha256>  <file>". */
export function readPins(file = PINS_FILE): Map<string, string> {
  if (!fs.existsSync(file)) return new Map();
  return new Map(fs.readFileSync(file, 'utf8').split(/\r?\n/).map((l) => /^([0-9a-f]{64}) {2}(\S+)$/.exec(l)).filter((m): m is RegExpExecArray => m !== null).map((m) => [m[2], m[1]]));
}

/**
 * What doesn't match its pin: a key changed, unpinned, a pin for a key that is gone, or a key pinned twice. [] when
 * every key matches.
 */
export function pinProblems(dir = KEYS_DIR, pins = readPins(path.join(dir, 'HASHES'))): string[] {
  const files = keyFiles(dir);
  const pinFile = path.join(dir, 'HASHES');
  const named = fs.existsSync(pinFile) ? fs.readFileSync(pinFile, 'utf8').split(/\r?\n/).map((l) => /^[0-9a-f]{64} {2}(\S+)$/.exec(l)?.[1]).filter((f): f is string => f !== undefined) : [];
  return [
    ...[...new Set(named.filter((f, i) => named.indexOf(f) !== i))].map((f) => `${f}: pinned more than once`),
    ...files.filter((f) => !pins.has(f)).map((f) => `${f}: not pinned`),
    ...files.filter((f) => pins.has(f) && pins.get(f) !== keyHash(path.join(dir, f))).map((f) => `${f}: changed since it was pinned`),
    ...[...pins.keys()].filter((f) => !files.includes(f)).map((f) => `${f}: pinned but gone`),
  ];
}

function main(args: string[]): number {
  if (args.includes('--pin')) {
    fs.writeFileSync(PINS_FILE, keyFiles().map((f) => `${keyHash(path.join(KEYS_DIR, f))}  ${f}`).join('\n') + '\n');
    console.log(`✔ pinned ${keyFiles().length} answer key(s) in ${path.relative(process.cwd(), PINS_FILE)}`);
    return 0;
  }
  const problems = pinProblems();
  for (const p of problems) console.error(`✖ ${p}`);
  if (!problems.length) console.log(`✔ ${keyFiles().length} answer key(s) match their pins`);
  return problems.length ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exitCode = main(process.argv.slice(2));
