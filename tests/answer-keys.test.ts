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
import { criteriaOfStoryText, matchableOf, matchDefects, missedText, toCheck } from '../dev/score-match';

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

  it('never counts a finding on another criterion, however many keywords it hits', () => {
    const access = { criteria: ['AC-8'], keywords: ['another customer', 'not signed in', 'unauthenticated'] };
    const renumbered = { criteria: ['AC-10'], words: 'another customer moves money while not signed in', about: 'the API answers another customer' };
    assert.deepEqual(matchDefects([access], [renumbered]), { best: [-1], unmatched: [0] });
  });

  it('every keyed defect names text of its story, and a contract\'s criteria follow it', () => {
    const stories = path.resolve(import.meta.dirname, '..', 'demo', 'stories');
    const plain = (s: string) => s.toLowerCase().replace(/\s+/g, ' ');
    for (const f of keyFiles()) {
      const k = JSON.parse(fs.readFileSync(path.join(KEYS_DIR, f), 'utf8')) as { key: string; defects: { id: string; storyText?: string[] }[] };
      const dir = path.join(stories, k.key);
      const story = plain(fs.readdirSync(dir).map((x) => fs.readFileSync(path.join(dir, x), 'utf8')).join(' '));
      for (const d of k.defects) {
        assert.ok(d.storyText?.length, `${k.key} ${d.id} names the part of the story it breaks`);
        for (const t of d.storyText!) assert.ok(story.includes(plain(t)), `${k.key} ${d.id}: "${t}" is in the story`);
      }
    }
    const criteria = [
      { id: 'AC-3', quote: 'Two brands   can\'t share a slug.', source: 'story.md#L21' },
      { id: 'AC-9', quote: 'Only administrators', source: 'story.md#L25' },
      { id: 'AC-1', quote: 'Each gets a name', source: 'story.md#L21' },
    ];
    const lineOf = (s: string) => (s.endsWith('L21') ? 'Each gets a name and a slug. Two brands can\'t share a slug.' : 'Only administrators manage the catalogue.');
    assert.deepEqual(criteriaOfStoryText(['two brands can\'t share'], criteria, lineOf), ['AC-3'], 'the criterion that quotes it, not its neighbour on the line');
    assert.deepEqual(criteriaOfStoryText(['manage the catalogue'], criteria, lineOf), ['AC-9'], 'else the one whose line holds it');
    assert.deepEqual(criteriaOfStoryText(['nothing like this'], criteria, lineOf), [], 'the contract doesn\'t cite it');
  });

  it('reads a finding with its tests\' titles as they ran', () => {
    const titles: Record<string, string> = { 'SCN-1.1': 'someone not signed in moves money', 'SCN-2': 'a page' };
    const m = matchableOf({ title: 'The API answers anyone', criteria: ['AC-8'], tests: ['SCN-1.1', 'SCN-9'], rationale: 'Without proof' }, (t) => titles[t]);
    assert.equal(m.about, 'the api answers anyone someone not signed in moves money');
    assert.match(m.words, /without proof$/);
    assert.deepEqual(matchDefects([{ criteria: ['AC-8'], keywords: ['not signed in'] }], [m]), { best: [0], unmatched: [] });
  });

  it('says why a defect is missed, and which finding to read', () => {
    const none = { criteria: [] }, cited = { criteria: ['AC-1'] };
    const finding = { id: 'APP-1', title: 'x' }, question = { test: 'SCN-1', restsOn: ['G1'] };
    assert.equal(missedText(cited), '❌ missed');
    assert.equal(missedText(none), '❌ missed: the contract cites no criterion for this part of the story', 'with no finding to name too');
    assert.equal(missedText(none, finding), '❌ missed: the contract cites no criterion for this part of the story; read APP-1 by hand (x)');
    assert.match(missedText(cited, undefined, question), /^❔ surfaced .*SCN-1, rests on G1/);
    assert.match(missedText(cited, finding, question), /^❌ missed; read APP-1 by hand \(x\); also surfaced/);
  });

  it('names the finding most about a missed defect, to read by hand', () => {
    const access = { criteria: ['AC-8'], keywords: ['another customer', 'not signed in', 'unauthenticated'] };
    const inPassing = { criteria: ['AC-3'], words: 'unlike another customer, who is not signed in', about: 'a fraction of a cent is accepted' };
    const one = { criteria: ['AC-10'], words: '', about: 'another customer sees the activity' };
    const two = { criteria: ['AC-10'], words: '', about: 'the API answers another customer and someone not signed in' };
    assert.equal(toCheck(access, [inPassing, one, two]), 2);
    assert.equal(toCheck(access, [inPassing]), -1, 'a rationale alone names nothing');
    assert.equal(toCheck(access, []), -1);
  });

  it('counts a keyword inside another once, and none inside a longer word, for what it names', () => {
    const pay = { criteria: ['AC-7'], keywords: ['bill pay', 'bill payment', 'over the balance'] };
    const phrase = { criteria: ['AC-9'], words: '', about: 'a bill payment makes no sense' };
    const both = { criteria: ['AC-9'], words: '', about: 'a bill payment over the balance' };
    assert.equal(toCheck(pay, [phrase, both]), 1, 'the phrase is one keyword, the other finding has two');
    const date = { criteria: ['AC-2'], keywords: ['date', 'one day early'] };
    assert.equal(toCheck(date, [{ criteria: ['AC-3'], words: '', about: 'the amount is not validated' }]), -1);
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
