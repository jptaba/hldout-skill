/**
 * The project folder and small file helpers every command uses.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** The project the command runs in: its working directory. */
export const ROOT = process.cwd();

export function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function writeFile(file: string, content: string | Buffer): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Project-relative POSIX path (for reports and links). */
export const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join('/');

export const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

/** Content hash of a text file, line endings ignored (git on Windows checks out CRLF; editors may normalise either way). */
export function fileHash(file: string): string {
  return createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 16);
}
