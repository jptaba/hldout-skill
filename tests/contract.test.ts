import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  checkContract, checkSuiteAgainstContract, locateQuote, normaliseText, openQuestions, oracleDigest,
  requirementRevision, shapeFindings, skeletonContract, toDiscover, type RequirementContract,
} from '../.github/scripts/contract-model';
import { checkIntegrity, snapshotDraft } from '../.github/scripts/integrity-check';

const STORY = `---
key: ABC-9
summary: "Widget API"
fetchedAt: 2026-01-01T00:00:00Z
---
# ABC-9: Widget API

Acceptance criteria:
1. **AC-1**: \`POST /api/widgets\` creates a widget and responds **201 Created**.
2. AC 2 - A widget without a name is rejected with 422.
* Given a signed-in user, when they open the Widgets page, then their widgets are listed.
`;
const RULES = 'id,rule\nR1,name is 1-40 characters\n';

function fixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-'));
  fs.mkdirSync(path.join(dir, 'linked'));
  fs.writeFileSync(path.join(dir, 'story.md'), STORY);
  fs.writeFileSync(path.join(dir, 'linked', 'rules.csv'), RULES);
  return dir;
}

function goodContract(dir: string): RequirementContract {
  return {
    key: 'ABC-9', title: 'Widget API', revision: requirementRevision(dir),
    sourcesRead: [{ file: 'story.md', read: true }, { file: 'linked/rules.csv', read: true }],
    acceptanceCriteria: [
      { id: 'AC-1', text: 'POST /api/widgets creates a widget → 201', quote: 'POST /api/widgets creates a widget and responds 201 Created', source: 'story.md#L9', layer: 'api', outcomes: ['201'], endpoints: ['POST /api/widgets'] },
      { id: 'AC-2', text: 'A widget without a name is rejected with 422', quote: 'A widget without a name is rejected with 422.', source: 'story.md#L10', layer: 'api', outcomes: ['422'], endpoints: ['POST /api/widgets'] },
      { id: 'AC-3', text: 'Given a signed-in user, when they open the Widgets page, then their widgets are listed.', quote: 'Given a signed-in user, when they open the Widgets page, then their widgets are listed.', source: 'story.md#L11', layer: 'ui', outcomes: ['their widgets are listed'], entryPoint: 'Widgets page' },
    ],
    endpoints: [{ method: 'POST', path: '/api/widgets', auth: 'required', source: 'story.md#L9' }],
    rules: [{ id: 'R1', text: 'name is 1-40 characters', source: 'linked/rules.csv#L2' }],
    errorModel: [], auth: { mechanism: 'Bearer token', source: 'G1' }, testData: { strategy: 'create via API' },
    gaps: [{ id: 'G1', element: 'auth header scheme', kind: 'mechanics', required: true, affects: ['AC-1'],
      tried: [{ where: 'story', result: 'not stated' }, { where: 'aut', result: 'Bearer accepted' }], resolution: 'discovered-in-aut', value: 'Authorization: Bearer', evidence: 'hardening/api-auth.md' }],
    coverage: [
      { lines: 'story.md#L8', as: 'context' }, { lines: 'story.md#L9', as: 'AC-1' }, { lines: 'story.md#L10', as: 'AC-2' },
      { lines: 'story.md#L11', as: 'AC-3' }, { lines: 'linked/rules.csv#L1-L2', as: 'R1' },
    ],
  };
}
const codes = (fs: { code: string }[]) => fs.map((f) => f.code);

describe('requirement contract', () => {
  it('starts empty and bound to the fetched revision', () => {
    const dir = fixture();
    const c = skeletonContract('ABC-9', dir);
    assert.equal(c.title, 'Widget API');
    assert.deepEqual(c.sourcesRead, [{ file: 'story.md', read: false }, { file: 'linked/rules.csv', read: false }]);
    assert.deepEqual([c.acceptanceCriteria, c.endpoints, c.coverage], [[], [], []]);
    assert.deepEqual(c.revision, requirementRevision(dir));
  });

  it('is the same revision when a checkout turns the text to CRLF line endings', () => {
    const dir = fixture();
    const before = requirementRevision(dir);
    for (const f of ['story.md', 'linked/rules.csv']) {
      const file = path.join(dir, f);
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\r?\n/g, '\r\n'));
    }
    assert.deepEqual(requirementRevision(dir), before);
  });

  it('normalises markdown, quotes and whitespace for quote anchoring', () => {
    assert.equal(normaliseText('**AC-1**:  `POST`\n“x” — y'), 'ac-1: post "x" - y');
    assert.equal(normaliseText('distinct slug (**201**).'), normaliseText('distinct slug (201).'));
    const dir = fixture();
    assert.deepEqual(locateQuote(dir, 'story.md#L9', 'POST /api/widgets creates a widget and responds 201 Created'), { found: true, near: true });
    assert.equal(locateQuote(dir, 'story.md#L2', 'POST /api/widgets creates a widget and responds 201 Created').near, false);
    assert.equal(locateQuote(dir, 'story.md', 'widgets are deleted after 30 days').found, false);
    assert.match(locateQuote(dir, 'nope.md', 'anything at all').reason ?? '', /does not exist/);
  });

  it('accepts a complete, anchored, covered and grounded contract', () => {
    const dir = fixture();
    assert.deepEqual(checkContract(goodContract(dir), dir).filter((f) => f.level === 'error'), []);
  });

  it('rejects invented criteria, unread sources, missing outcomes and undeclared endpoints', () => {
    const dir = fixture();
    const c = goodContract(dir);
    c.acceptanceCriteria[1].quote = 'Widgets are archived after 30 days';
    c.acceptanceCriteria[0].outcomes = [];
    c.acceptanceCriteria[0].endpoints = ['GET /api/widgets'];
    c.sourcesRead[1].read = false;
    const f = codes(checkContract(c, dir));
    for (const code of ['quote-not-found', 'no-outcome', 'endpoint-undeclared', 'source-unread']) assert.ok(f.includes(code), code);
  });

  it('never lets expected behaviour be discovered from the AUT, and enforces the ladder', () => {
    const dir = fixture();
    const c = goodContract(dir);
    c.gaps.push({ id: 'G2', element: 'status for a duplicate name', kind: 'oracle', required: true, affects: ['AC-2'],
      tried: [{ where: 'aut', result: 'returns 409' }], resolution: 'discovered-in-aut', value: '409', evidence: 'probe' });
    const f = codes(checkContract(c, dir));
    assert.ok(f.includes('oracle-from-aut'));
    assert.ok(f.includes('gap-ladder'));
  });

  it('open oracle gaps are questions for the user and must be surfaced in the specs', () => {
    const dir = fixture();
    const c = goodContract(dir);
    c.gaps.push({ id: 'G3', element: 'maximum widgets per user', kind: 'oracle', required: true, affects: ['AC-1'], tried: [{ where: 'story', result: 'silent' }, { where: 'linked', result: 'silent' }], resolution: 'open' });
    assert.equal(checkContract(c, dir).find((x) => x.code === 'oracle-gap-open')?.level, 'warn');
    assert.deepEqual(openQuestions(c).map((g) => g.id), ['G3']);
    const suite = { openQuestions: [] as string[], assumptions: [], scenarios: [{ id: 'SCN-001', acs: ['AC-1'], needsClarification: false }] };
    assert.ok(codes(checkSuiteAgainstContract(c, suite)).includes('open-gap-not-surfaced'));
    suite.openQuestions = ['G3: how many widgets may a user own?'];
    assert.deepEqual(checkSuiteAgainstContract(c, suite), []);
  });

  it('an assumption that asserts nothing needs no @assumes tag when marked "(not asserted)"', () => {
    const dir = fixture();
    const c = goodContract(dir);
    c.gaps.push({ id: 'G3', element: 'status of a rejected widget', kind: 'oracle', required: false, affects: ['AC-1'], tried: [{ where: 'linked', result: 'silent' }, { where: 'story', result: 'silent' }], resolution: 'assumed', value: 'no status asserted' });
    assert.ok(!codes(checkContract(c, dir)).includes('gap-ladder-order')); // the story and what it links are one rung
    const suite = { openQuestions: [] as string[], assumptions: ['G3: no status is asserted'], scenarios: [{ id: 'SCN-001', acs: ['AC-1'], needsClarification: false }] };
    assert.ok(codes(checkSuiteAgainstContract(c, suite)).includes('assumption-not-tagged'));
    suite.assumptions = ['G3: no status is asserted (not asserted)'];
    assert.deepEqual(checkSuiteAgainstContract(c, suite), []);
  });

  it('open mechanics gaps are discovered from the application, never asked of the user', () => {
    const dir = fixture();
    const c = goodContract(dir);
    c.gaps.push({ id: 'G4', element: 'route of the widget page', kind: 'mechanics', required: true, affects: ['AC-1'], tried: [{ where: 'story', result: 'no route' }], resolution: 'open' });
    assert.equal(checkContract(c, dir).find((x) => x.code === 'mechanics-to-discover')?.level, 'warn');
    assert.deepEqual(openQuestions(c), []);
    assert.deepEqual(toDiscover(c).map((g) => g.id), ['G4']);
    const suite = { openQuestions: [] as string[], assumptions: [], scenarios: [{ id: 'SCN-001', acs: ['AC-1'], needsClarification: false }] };
    assert.deepEqual(checkSuiteAgainstContract(c, suite), []);
  });

  it('requires R<n> and E<n> ids on rules and error cases', () => {
    const dir = fixture();
    const c = goodContract(dir);
    c.rules = [{ id: 'rule one', text: 'x', source: 'story.md#L10' }];
    c.errorModel = [{ id: '', case: 'duplicate', status: 409, source: 'story.md#L10' }];
    const f = codes(checkContract(c, dir));
    assert.ok(f.includes('rule-id') && f.includes('error-id'));
  });

  it('goes stale when the story or an attachment changes', () => {
    const dir = fixture();
    const c = goodContract(dir);
    fs.writeFileSync(path.join(dir, 'story.md'), STORY.replace('fetchedAt: 2026-01-01T00:00:00Z', 'fetchedAt: 2027-01-01T00:00:00Z'));
    assert.ok(!codes(checkContract(c, dir)).includes('contract-stale'), 'the fetch timestamp alone is not a revision');
    fs.writeFileSync(path.join(dir, 'linked', 'rules.csv'), `${RULES}R2,new rule\n`);
    assert.ok(codes(checkContract(c, dir)).includes('contract-stale'));
  });

  it('freezes the oracle part with the draft: changing expected outcomes violates integrity, mechanics do not', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-int-'));
    fs.mkdirSync(path.join(dir, 'tests'));
    fs.writeFileSync(path.join(dir, 'tests', 'a.spec.ts'), "expect(r.status, '[REQ AC-1] created').toBe(201);\n");
    const c = goodContract(fixture());
    snapshotDraft(path.join(dir, 'tests'), path.join(dir, 'draft'), oracleDigest(c));
    const mech = structuredClone(c);
    mech.testData = { strategy: 'changed' }; mech.acceptanceCriteria[0].entryPoint = '/x'; mech.endpoints[0].requestFields = ['name'];
    assert.equal(checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), undefined, oracleDigest(mech)).status, 'PRESERVED');
    const oracle = structuredClone(c);
    oracle.acceptanceCriteria[0].outcomes = ['200'];
    const r = checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), undefined, oracleDigest(oracle));
    assert.equal(r.status, 'VIOLATED');
    assert.equal(r.contractChanged, true);
  });
});

describe('images the story shows', () => {
  it('requires a transcript with its origin instead of quoting an image directly', () => {
    const dir = fixture();
    fs.writeFileSync(path.join(dir, 'linked', 'mockup.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const c = goodContract(dir);
    c.revision = requirementRevision(dir);
    c.sourcesRead.push({ file: 'linked/mockup.png', read: true });
    c.acceptanceCriteria.push({ id: 'AC-4', text: 'The Save button is disabled until the form is valid', quote: 'Save button is disabled until the form is valid', source: 'linked/mockup.png', layer: 'ui', outcomes: ['disabled'], entryPoint: '/form' });
    c.coverage.push({ lines: 'story.md#L9', as: 'AC-4' });
    assert.ok(codes(checkContract(c, dir)).includes('quote-from-binary'));
    fs.mkdirSync(path.join(dir, 'transcripts'));
    fs.writeFileSync(path.join(dir, 'transcripts', 'mockup.png.md'), 'transcribedFrom: linked/mockup.png\n\nNote on the mock-up: "Save button is disabled until the form is valid"\n');
    c.acceptanceCriteria[3].source = 'transcripts/mockup.png.md#L3';
    c.coverage.push({ lines: 'transcripts/mockup.png.md#L3', as: 'AC-4' });
    const f = checkContract(c, dir);
    assert.deepEqual(f.filter((x) => x.level === 'error'), []);
    assert.ok(codes(f).includes('quote-from-transcript'));
  });
});

describe('contract shape', () => {
  it('reports a wrongly typed field instead of crashing', () => {
    const c = { acceptanceCriteria: [], endpoints: [], rules: [], errorModel: [], gaps: [], coverage: [], sourcesRead: [], testData: { strategy: 'x', constraints: 'one string' } } as unknown as RequirementContract;
    assert.deepEqual(shapeFindings(c).map((f) => f.message), ['testData.constraints must be a list (JSON array), got string']);
  });
  it('matches quotes across HTML entities', () => {
    assert.equal(normaliseText('Welcome &lt;username&gt;'), normaliseText('Welcome <username>'));
  });
});
