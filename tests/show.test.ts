/**
 * Reading a story's record with `heldout show`, instead of a script of one's own.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');

function project(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-show-'));
  fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({
    defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/', accounts: { existing: [{ username: 'admin@shop.test', password: '${env:ADMIN_PW}', role: 'admin', shared: true }] } } },
  }));
  const story = path.join(root, 'output', 'shop', 'ABC-1');
  fs.mkdirSync(path.join(story, '5-run'), { recursive: true });
  fs.mkdirSync(path.join(story, '2-contract'), { recursive: true });
  fs.writeFileSync(path.join(story, '2-contract', 'contract.json'), JSON.stringify({
    key: 'ABC-1', title: 'Search', acceptanceCriteria: [{ id: 'AC-1', layer: 'api', text: 'finds', outcomes: ['200'], source: 'story.md#L3', quote: 'finds' }, { id: 'AC-2', layer: 'ui', text: 'sorts', outcomes: ['sorted'], source: 'story.md#L4', quote: 'sorts' }],
    auth: { mechanism: 'cookie session', credentials: 'a user', source: 'story.md#L9' }, testData: { strategy: 'seed', cleanup: 'delete' },
    rules: [], errorModel: [], endpoints: [], gaps: [{ id: 'G1', element: 'the route', kind: 'mechanics', required: false, affects: ['AC-2'], tried: [], resolution: 'open' }], coverage: [], sourcesRead: [],
  }));
  const entry = (scenario: string, status: string, extra = {}) => ({ scenario, title: `${scenario}: x`, file: 'a.spec.ts', status, tags: [], requirementRefs: ['AC-1'], otherFailures: [], evidence: { attempts: 1 }, ...extra });
  fs.writeFileSync(path.join(story, '5-run', '01-eval.json'), JSON.stringify({
    key: 'ABC-1', run: '01-eval', generatedAt: 'now', summary: { total: 2, passed: 1, failed: 1, flaky: 0, skipped: 0 },
    entries: [entry('SCN-001', 'passed'), entry('SCN-002', 'failed', { error: { headline: '[REQ AC-1] finds' }, auto: { category: 'APPLICATION_DEFECT', confidence: 'high', signals: [], next: '' } }),
      entry('SCN-003', 'failed', { requirementRefs: ['AC-2'], error: { headline: '[REQ AC-2] sorts' }, auto: { category: 'APPLICATION_DEFECT', confidence: 'high', signals: [], next: '' },
        evidence: { attempts: 1, api: { request: { method: 'GET', url: 'https://shop.test/api/a', headers: { Authorization: '***' } }, response: { status: 500, body: 'x' } } } })],
    meta: { label: 'eval', startedAt: '2026-10-01T10:00:00Z', grep: null, skill: 'abc' },
  }));
  fs.writeFileSync(path.join(story, 'history.jsonl'), `${JSON.stringify({ at: '2026-10-01T10:00:00Z', event: 'run', skill: 'abc', run: '01-eval' })}\n`);
  fs.mkdirSync(path.join(story, '3-tests'), { recursive: true });
  fs.mkdirSync(path.join(story, '4-hardening'), { recursive: true });
  fs.writeFileSync(path.join(story, '3-tests', 'abc-1.spec.ts'), "test('SCN-009: the draft', async () => {});\n");
  fs.writeFileSync(path.join(story, '4-hardening', 'forms.spec.ts'), [
    "const BASE = 'a' +", "  'b';", 'const NOSEMI = 1', "test.describe('forms', () => {",
    '  // cases: size=a|b', '  const CASES = [', "    { name: 'a' },", "    { name: 'b' },", '  ];',
    '  for (const row of CASES) {', "    test(`SCN-010.1: rows ${row.name}`, { tag: '@AC-3' }, async () => { void BASE; });", '  }',
    "  test('SCN-011: next', async () => { void 1; });", "  test('SCN-012: next', async () => {", '    void 2;', '  }, 30000);',
    "  test('SCN-013: last', async () => { void NOSEMI; });", '});', '',
  ].join('\n'));
  fs.writeFileSync(path.join(story, '4-hardening', 'tables.spec.ts'), [
    "test.describe('one', () => {", "  test('SCN-020: first', async () => {", '    void 1;', '  });', '',
    '  // cases: size=a|b', '  const WIDE = [', '    {', "      name: 'a',", '    },', '    {', "      name: 'b',", '    },', '  ];',
    '  for (const row of WIDE) {', "    test(`SCN-021.1: rows ${row.name}`, async () => { void 2; });", '  }', '});', '',
    "test.describe('two', () => {", '  test.beforeEach(async () => {', '    void 3;', '  });', "  test('SCN-022: under a hook', async () => {", '    void 4;', '  });', '});', '',
  ].join('\n'));
  fs.writeFileSync(path.join(story, '4-hardening', 'edges.spec.ts'), [
    'async function createThing() {', '  const res = await 1;', '  const body = res;', '  return body;', '}', '',
    "test.describe('edges', () => {", '  const SHARED = 1;', '',
    "  test('SCN-030: a literal at the margin', async () => {", '    const xml = `', '<a>', '}', '</a>`;', "    expect(xml, '[REQ AC-1] literal').toBe(SHARED);", '  });', '',
    "  test('SCN-031: a comment at the margin', async () => {", '    const res = 1;', '// await old();', "    expect(res, '[REQ AC-1] comment').toBe(1);", '  });', '});', '',
  ].join('\n'));
  fs.writeFileSync(path.join(story, '4-hardening', 'abc-1.spec.ts'), [
    "import { test } from 'x';", '',
    'const REQ = {', "  MSG: 'found',", '} as const;',
    'const sum = (a: number) => a + 1;',
    'async function ready() {', '  return 1;', '}', '',
    "test.describe('ABC-1', () => {",
    '  // from story.md#L3',
    "  test('SCN-001: finds', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async () => {",
    '    await ready();', '    expect(REQ.MSG).toBe(1);', '  });', '',
    '  // cases: size=a|b',
    "  const ROWS = ['a', 'b'];",
    '  for (const [i, row] of ROWS.entries()) {',
    "    test(`SCN-002.${i + 1}: rows (${row})`, { tag: ['@AC-1'] }, async () => { sum(1); });",
    '  }', '',
    "  test('SCN-003: last', { tag: ['@AC-2'] }, async () => {", '    sum(2);', '  });',
    '});', '',
  ].join('\n'));
  return root;
}
const show = (cwd: string, ...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, 'show', ...args], { cwd, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });

describe('heldout show', () => {
  const root = project();
  it('prints the criteria and gaps asked for', () => {
    const r = show(root, 'ABC-1', 'contract', '--ac', 'AC-2', '--gaps', 'open');
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /AC-2 \[ui\] sorts/);
    assert.doesNotMatch(r.stdout, /AC-1 \[api\]/);
    assert.match(r.stdout, /G1 mechanics · open/);
  });
  it('gives the profile with its secrets as references', () => {
    const r = show(root, 'config');
    assert.match(r.stdout, /existing admin@shop\.test \(admin\) shared password \$\{env:ADMIN_PW\}/);
  });
  it('lists a run\'s failures and the pending decisions, and one test in full as JSON', () => {
    assert.match(show(root, 'ABC-1', 'run', '--failed').stdout, /SCN-002\s+failed\s+APPLICATION_DEFECT \(auto, high\)/);
    assert.match(show(root, 'ABC-1', 'triage', '--pending').stdout, /2 pending/);
    assert.equal(JSON.parse(show(root, 'ABC-1', 'run', '01-eval', '--test', 'SCN-002').stdout).scenario, 'SCN-002');
  });
  it('outlines the draft until the freeze', () => {
    const out = show(root, 'ABC-1', 'spec');
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, /SCN-009/);
    assert.doesNotMatch(out.stdout, /SCN-001/);
    // Everything after this reads the hardened copy.
    fs.writeFileSync(path.join(root, 'output', 'shop', 'ABC-1', '3-tests', 'freeze.json'), '{}');
  });
  it('outlines the tests as they stand, with each one\'s lines, tags and what the file declares', () => {
    const out = show(root, 'ABC-1', 'spec');
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, /4-hardening[\\/]abc-1\.spec\.ts/);
    assert.doesNotMatch(out.stdout, /SCN-009/, 'the hardened copy, not the draft');
    assert.match(out.stdout, /declared: REQ 3-5, sum 6-6, ready 7-9/);
    assert.match(out.stdout, /SCN-001\s+12-16\s+@AC-1 @type:functional @layer:api @P1 finds/, 'every tag');
    const files = JSON.parse(show(root, 'ABC-1', 'spec', '--json').stdout) as { file: string; declarations: { name: string; from: number; to: number }[]; tests: { name: string; from: number; to: number; tags: string[] }[] }[];
    assert.deepEqual(files[0].tests.map((t) => [t.name, t.from, t.to]), [['SCN-001', 12, 16], ['SCN-002', 18, 22], ['SCN-003', 24, 26]]);
    assert.ok(files[0].tests[0].tags.includes('@type:functional'));
  });
  it('keeps a table\'s rows with it, tests with no blank line apart, and declarations to their own lines', () => {
    const forms = (JSON.parse(show(root, 'ABC-1', 'spec', '--json').stdout) as { file: string; declarations: { name: string; from: number; to: number }[]; tests: { name: string; from: number; to: number; tags: string[] }[] }[]).find((f) => f.file.endsWith('forms.spec.ts'))!;
    assert.deepEqual(forms.declarations.map((d) => [d.name, d.from, d.to]), [['BASE', 1, 2], ['NOSEMI', 3, 3], ['CASES', 6, 9]]);
    assert.deepEqual(forms.tests.map((t) => [t.name, t.from, t.to]), [['SCN-010', 5, 12], ['SCN-011', 13, 13], ['SCN-012', 14, 16], ['SCN-013', 17, 17]]);
    assert.deepEqual(forms.tests[0].tags, ['@AC-3'], 'a tag given as one string');
  });
  it('takes rows that span lines with their table, and lists a hook apart from the test before it', () => {
    const files = JSON.parse(show(root, 'ABC-1', 'spec', '--json').stdout) as { file: string; declarations: { name: string }[]; hooks: { name: string; from: number; to: number }[]; tests: { name: string; from: number; to: number }[] }[];
    const tables = files.find((f) => f.file.endsWith('tables.spec.ts'))!;
    assert.deepEqual(tables.tests.map((t) => [t.name, t.from, t.to]), [['SCN-020', 2, 4], ['SCN-021', 6, 17], ['SCN-022', 24, 26]]);
    assert.deepEqual(tables.hooks, [{ name: 'test.beforeEach', from: 21, to: 23 }]);
    assert.ok(tables.declarations.some((d) => d.name === 'WIDE'), 'a describe body\'s rows');
    assert.match(show(root, 'ABC-1', 'spec', '--test', 'SCN-022').stdout, /Hooks in the file: test\.beforeEach 21-23/);
  });
  it('never cuts a test short at a literal or a comment at the margin, and lists no helper\'s locals', () => {
    const edges = (JSON.parse(show(root, 'ABC-1', 'spec', '--json').stdout) as { file: string; declarations: { name: string }[]; tests: { name: string; from: number; to: number }[] }[]).find((f) => f.file.endsWith('edges.spec.ts'))!;
    assert.deepEqual(edges.tests.map((t) => [t.name, t.from, t.to]), [['SCN-030', 10, 16], ['SCN-031', 18, 22]]);
    assert.deepEqual(edges.declarations.map((d) => d.name), ['createThing', 'SHARED'], 'a helper\'s locals and a test\'s own are not the file\'s');
    assert.match(show(root, 'ABC-1', 'spec', '--test', 'SCN-030').stdout, /\[REQ AC-1\] literal/);
    const comment = show(root, 'ABC-1', 'spec', '--test', 'SCN-031').stdout;
    assert.match(comment, /\[REQ AC-1\] comment/);
    assert.doesNotMatch(comment, /Declared in the file: .*res/);
  });
  it('prints the contract\'s auth and test data on their own', () => {
    const out = show(root, 'ABC-1', 'contract', '--auth').stdout;
    assert.match(out, /Auth\n\s+cookie session · a user \(story\.md#L9\)/);
    assert.match(out, /Test data\n\s+seed · cleanup: delete/);
    assert.doesNotMatch(out, /AC-1 \[api\]/);
  });
  it('prints one test by its lines, a table by a case\'s id, and where the declarations it uses are', () => {
    const one = show(root, 'ABC-1', 'spec', '--test', 'SCN-001').stdout;
    assert.match(one, /:12-16\n\s+12 {2}\s+\/\/ from story\.md#L3/);
    assert.match(one, /Declared in the file: REQ 3-5, ready 7-9/);
    assert.doesNotMatch(one, /SCN-002|sum 6-6/);
    const row = show(root, 'ABC-1', 'spec', '--test', 'SCN-002.2').stdout;
    assert.match(row, /const ROWS/, 'the rows and the loop belong to the table');
    assert.match(row, /Declared in the file: sum 6-6/);
    const missing = show(root, 'ABC-1', 'spec', '--test', 'SCN-777');
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /SCN-777 is not in .*have: .*SCN-001, SCN-002, SCN-003/);
  });
  it('prints one group of failures as the report has it, and says which groups there are', () => {
    const g = show(root, 'ABC-1', 'triage', '--group', '1');
    assert.equal(g.status, 0, g.stderr);
    assert.match(g.stdout, /Group 1 of 2, 01-eval: SCN-002/);
    assert.match(g.stdout, /## SCN-002: x/);
    assert.match(g.stdout, /Error: `\[REQ AC-1\] finds`/);
    assert.doesNotMatch(g.stdout, /## SCN-00[13]/);
    assert.deepEqual(JSON.parse(show(root, 'ABC-1', 'triage', '--group', '2', '--json').stdout).tests, ['SCN-003']);
    assert.match(show(root, 'ABC-1', 'triage', '--group', '9').stderr, /no group 9 \(groups: 1-2\)/);
  });
  it('gives a signed-in failure\'s replay with the real place of its chain', () => {
    assert.match(show(root, 'ABC-1', 'triage', '--group', '2').stdout, /--chain \S*6-triage\/chains\/01-eval\/scn-003\.chain\.json/);
  });
  it('heldout triage says which group each failure is in, as --group numbers them', () => {
    const t = spawnSync(process.execPath, [TSX, DISPATCHER, 'triage', 'ABC-1'], { cwd: root, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });
    assert.equal(t.status, 0, t.stderr);
    assert.match(t.stdout, /g1\s+SCN-002/);
    assert.match(t.stdout, /g2\s+SCN-003/);
    assert.match(t.stdout, /show ABC-1 triage 01-eval --group <n> \(1-2\)/);
  });
  it('gives the run\'s environment warning with the group and in heldout triage', () => {
    const file = path.join(root, 'output', 'shop', 'ABC-1', '5-run', '01-eval.json');
    fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, 'utf8')), environmentNote: 'the host answered 429' }));
    assert.match(show(root, 'ABC-1', 'triage', '--group', '1').stdout, /⚠ Environment: the host answered 429/);
    const t = spawnSync(process.execPath, [TSX, DISPATCHER, 'triage', 'ABC-1'], { cwd: root, encoding: 'utf8', env: { ...process.env, npm_lifecycle_event: '' } });
    assert.match(t.stdout, /⚠ Environment: the host answered 429/);
  });
  it('prints the history, and as JSON', () => {
    assert.match(show(root, 'ABC-1', 'history').stdout, /run\s+\{"run":"01-eval"\}/);
    assert.equal(JSON.parse(show(root, 'ABC-1', 'history', '--json').stdout)[0].event, 'run');
  });
});
