/**
 * The answer keys are pinned (docs/governance-plan.md, GM4): every key in demo/answer-keys/ matches its SHA-256 in
 * demo/answer-keys/HASHES, so a key can't change after a round has used it without a new pin in the same commit.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { KEYS_DIR, keyFiles, keyHash, pinProblems, readPins } from '../dev/answer-keys';

const dirs: string[] = [];
after(() => { for (const d of dirs) fs.rmSync(d, { recursive: true, force: true }); });

describe('answer keys', () => {
  it('every key matches its pin', () => {
    assert.ok(keyFiles().length >= 14, 'the demo keys are there');
    assert.deepEqual(pinProblems(), []);
  });

  it('catches an edited, an unpinned and a removed key; line endings are no change', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-keys-'));
    dirs.push(dir);
    for (const f of keyFiles()) fs.copyFileSync(path.join(KEYS_DIR, f), path.join(dir, f));
    fs.copyFileSync(path.join(KEYS_DIR, 'HASHES'), path.join(dir, 'HASHES'));
    const [first, second, third] = keyFiles(dir);
    assert.deepEqual(pinProblems(dir), []);
    fs.writeFileSync(path.join(dir, first), fs.readFileSync(path.join(dir, first), 'utf8').replace(/\n/g, '\r\n'));
    assert.deepEqual(pinProblems(dir), [], 'CRLF hashes as LF');
    const key = JSON.parse(fs.readFileSync(path.join(dir, second), 'utf8')) as { expectedVerdict: string };
    fs.writeFileSync(path.join(dir, second), JSON.stringify({ ...key, expectedVerdict: key.expectedVerdict === 'PASS' ? 'FAIL' : 'PASS' }, null, 2));
    fs.rmSync(path.join(dir, third));
    fs.writeFileSync(path.join(dir, 'NEW-1.json'), '{}');
    assert.deepEqual(pinProblems(dir).sort(), [`${second}: changed since it was pinned`, `${third}: pinned but gone`, 'NEW-1.json: not pinned'].sort());
    assert.equal(readPins(path.join(dir, 'HASHES')).get(first), keyHash(path.join(KEYS_DIR, first)));
    // A key pinned twice is a problem, whichever line would win.
    fs.appendFileSync(path.join(dir, 'HASHES'), `${keyHash(path.join(KEYS_DIR, first))}  ${first}\n`);
    assert.ok(pinProblems(dir).includes(`${first}: pinned more than once`));
  });
});
