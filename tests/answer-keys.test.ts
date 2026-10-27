/**
 * The answer keys are pinned: every key in demo/answer-keys/ matches its SHA-256 in demo/answer-keys/HASHES, so a
 * key can't change after a round has used it without a new pin in the same commit.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { KEYS_DIR, keyFiles, keyHash, pinProblems, readPins } from '../dev/answer-keys';
import { matchDefects } from '../dev/score-match';

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

describe('scoring against a key', () => {
  const negative = { criteria: ['AC-3'], keywords: ['negative amount', 'transfer', 'accepted'] };
  const fraction = { criteria: ['AC-3'], keywords: ['fraction of a cent', 'rounding'] };
  const others = { criteria: ['AC-8'], keywords: ['another customer'] };

  it('gives each defect the finding that hits most of its keywords, not the first that hits one', () => {
    const findings = [
      { criteria: ['AC-3'], words: 'an amount with a fraction of a cent is accepted' },
      { criteria: ['AC-3'], words: 'zero and negative amounts are accepted; a negative amount transfer moves money the wrong way' },
    ];
    assert.deepEqual(matchDefects([negative, fraction], findings), { best: [1, 0], unmatched: [] });
  });

  it('on a tie gives a defect the finding that is not already another defect\'s best', () => {
    const empty = { criteria: ['AC-3'], keywords: ['internal error', 'what is wrong', 'empty amount'] };
    const findings = [
      { criteria: ['AC-3'], words: 'A fraction of a cent: an internal error, rounding' },
      { criteria: ['AC-3'], words: 'An empty or text amount gets an internal error, not what is wrong' },
    ];
    // On "internal error" alone both findings tie; the fraction finding is the fraction defect's only best.
    const tie = { ...empty, keywords: ['internal error'] };
    assert.deepEqual(matchDefects([fraction, tie], findings).best, [0, 1]);
    assert.deepEqual(matchDefects([tie, fraction], findings).best, [1, 0], 'whatever the order of the key');
    assert.deepEqual(matchDefects([fraction, empty], findings).best, [0, 1], 'a strict best');
  });

  it('counts a finding real when it is a best match or hits two keywords, not on one generic keyword', () => {
    const findings = [
      { criteria: ['AC-8'], words: 'Another customer moves money out of an account while not signed in' },
      { criteria: ['AC-8'], words: 'another customer reads an account history while not signed in' },
      { criteria: ['AC-3'], words: 'another customer' },
      { criteria: ['AC-3'], words: 'the transfer page uses the wrong font' },
      { criteria: ['AC-3'], words: 'a negative amount transfer is accepted' },
    ];
    const signedOut = { ...others, keywords: ['another customer', 'not signed in'] };
    // 1 is no defect's best but hits two keywords; 3 hits one generic keyword only; 2 shares no criterion.
    assert.deepEqual(matchDefects([{ ...signedOut, keywords: ['another customer', 'not signed in', 'moves money'] }, negative], findings),
      { best: [0, 4], unmatched: [2, 3] });
    assert.deepEqual(matchDefects([signedOut], [findings[0], { criteria: ['AC-8'], words: 'nothing in common' }]), { best: [0], unmatched: [1] }, 'shared criterion, no keyword');
    assert.deepEqual(matchDefects([negative], []), { best: [-1], unmatched: [] });
  });
});
