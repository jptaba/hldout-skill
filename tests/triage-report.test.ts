import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { likeness, renderTriageMd, short } from '../.github/scripts/triage-report';
import type { TriageEntry, TriageReport } from '../.github/scripts/triage-model';

const ROOT = path.resolve('some-project');
const RUN = path.join(ROOT, 'output', 'shop', 'ABC-1', 'runs', '02-eval');
const ART = 'output/shop/ABC-1/runs/02-eval/artifacts';

function failure(scenario: string, o: { ac?: string; url?: string; status?: number; body?: unknown; locator?: string; headline?: string; final?: TriageEntry['final'] } = {}): TriageEntry {
  return {
    scenario, title: `${scenario}: a test`, file: 'abc-1.spec.ts', status: 'failed', tags: [], requirementRefs: [o.ac ?? 'AC-1'], testType: 'negative', layer: 'api',
    failingStep: 'Then the request is refused', otherFailures: [],
    error: { headline: o.headline ?? `[REQ ${o.ac ?? 'AC-1'}] the request is refused`, expected: '"4xx"', received: '200', locator: o.locator, message: '' },
    evidence: {
      attempts: 1,
      screenshot: `${ART}/${scenario}/test-failed-1.png`, trace: `${ART}/${scenario}/trace.zip`, errorContext: `${ART}/${scenario}/error-context.md`,
      ...(o.url ? { api: { request: { method: 'POST', url: o.url }, response: { status: o.status ?? 200, body: o.body ?? { ok: true } } }, apiCalls: 1 } : {}),
    },
    auto: { category: 'APPLICATION_DEFECT', confidence: 'high', signals: ['Requirement assertion failed.', 'Expected: "4xx"', 'Received: 200'], next: 'Confirm live.' },
    ...(o.final ? { final: o.final } : {}),
  } as TriageEntry;
}
const passed = (scenario: string): TriageEntry => ({ scenario, title: scenario, file: 'abc-1.spec.ts', status: 'passed', tags: [], requirementRefs: ['AC-1'], otherFailures: [], evidence: { attempts: 1 } } as TriageEntry);
const report = (entries: TriageEntry[]): TriageReport => ({
  key: 'ABC-1', run: '02-eval', generatedAt: '2026-01-01T00:00:00.000Z', entries,
  summary: { total: entries.length, passed: entries.filter((e) => e.status === 'passed').length, failed: entries.filter((e) => e.status === 'failed').length, flaky: 0, skipped: 0 },
});

describe('the triage report', () => {
  it('shows what an HTML page says, on one line, and cuts long bodies', () => {
    const page = '<!DOCTYPE html>\n<html><head><title>Shop | Error</title><style>p { color: red }</style></head>\n<body><h1>Error!</h1>\n<p>An internal error has occurred.</p><script>var x = "<p>no</p>";</script></body></html>';
    assert.equal(short(page), '(an HTML page) Error! An internal error has occurred.');
    assert.equal(short({ a: 1 }), '{"a":1}');
    assert.equal(short('x'.repeat(700)).length, 601);
    assert.equal(short(undefined), '');
  });

  it('puts failures of the same criterion, call and status together, whatever records they name', () => {
    const a = failure('SCN-001', { url: 'https://shop.test/api/accounts/12345/transfer?amount=0' });
    const b = failure('SCN-002', { url: 'https://shop.test/api/accounts/67890/transfer?amount=-5' });
    assert.equal(likeness(a), 'AC-1 · POST /api/accounts/<n>/transfer → 200');
    assert.equal(likeness(a), likeness(b));
    assert.notEqual(likeness(a), likeness(failure('SCN-003', { url: 'https://shop.test/api/accounts/12345/transfer', status: 500 })));
    assert.notEqual(likeness(a), likeness(failure('SCN-004', { ac: 'AC-2', url: 'https://shop.test/api/accounts/12345/transfer' })));
    // Without a call, the locator; without that, the assertion.
    assert.equal(likeness(failure('SCN-005', { locator: "getByRole('alert')" })), "AC-1 · getByRole('alert')");
    assert.equal(likeness(failure('SCN-006', { headline: '[REQ AC-1] the page says why' })), 'AC-1 · [REQ AC-1] the page says why');
  });

  it('writes the first failure of a group in full and the others as what differs', () => {
    const md = renderTriageMd(report([
      passed('SCN-000'),
      failure('SCN-001', { url: 'https://shop.test/api/accounts/12345/transfer?amount=0' }),
      failure('SCN-002', { url: 'https://shop.test/api/accounts/67890/transfer?amount=-5' }),
      failure('SCN-003', { url: 'https://shop.test/api/accounts/12345/transfer', status: 500, body: 'boom' }),
    ]), RUN, ROOT);
    assert.match(md, /\*\*1\/4 passed\*\*, 3 failed/);
    assert.match(md, /^Passed \(1\): SCN-000$/m);
    assert.doesNotMatch(md, /^\| SCN-000 \|/m, 'a test that passed has no row of its own');
    assert.match(md, /## Failures that look alike \(3 failures, 2 groups\)/);
    assert.match(md, /\| 1 \| AC-1 · POST \/api\/accounts\/<n>\/transfer → 200 \| SCN-001, SCN-002 \|/);
    const [, first, second, third] = md.split(/^## SCN-00\d: a test$/m);
    assert.match(first, /- Requirement refs: AC-1/);
    assert.match(first, /\*\*Auto: APPLICATION_DEFECT \(high\)\*\*/);
    assert.doesNotMatch(first, /^- Expected: "4xx"$/m, 'the signals do not repeat the expected value');
    assert.match(first, /replay: `npm run heldout -- api-probe --key ABC-1 POST "https:\/\/shop\.test\/api\/accounts\/12345\/transfer\?amount=0" --out output\/shop\/ABC-1\/runs\/02-eval\/confirm\/scn-001\.md`/);
    assert.match(second, /- Like SCN-001 \(group 1\)/);
    assert.match(second, /response body: as SCN-001/);
    assert.doesNotMatch(second, /\*\*Auto:/);
    assert.match(second, /- Evidence: test-failed-1\.png, trace\.zip, error-context\.md in \[this folder\]\(artifacts\/SCN-002\/\)/);
    assert.match(third, /- Requirement refs: AC-1/, 'another status is another group, written in full');
  });

  it('writes a decision out once and names it after that', () => {
    const final = { category: 'APPLICATION_DEFECT' as const, severity: 'Major', rationale: 'A transfer of zero is accepted.', confirmedAt: '2026-01-01T00:00:00.000Z' };
    const md = renderTriageMd(report([
      failure('SCN-001', { url: 'https://shop.test/api/transfer', final }),
      failure('SCN-002', { url: 'https://shop.test/api/transfer', final }),
      failure('SCN-003', { locator: "getByRole('alert')", final }),
    ]), RUN, ROOT);
    assert.equal(md.match(/A transfer of zero is accepted\./g)?.length, 1);
    assert.equal(md.match(/\*\*Confirmed: APPLICATION_DEFECT \/ Major\*\* — as SCN-001\./g)?.length, 2);
    assert.doesNotMatch(md, /replay:/, 'a confirmed failure needs no replay hint');
  });

  it('reads a page test apart from a direct call, and repeats a body only when it is the same', () => {
    const call = failure('SCN-001', { url: 'https://shop.test/api/accounts/12345/history', body: [{ account: 12345 }] });
    const other = failure('SCN-002', { url: 'https://shop.test/api/accounts/67890/history', body: [{ account: 67890 }] });
    const page = { ...failure('SCN-003', { url: 'https://shop.test/api/accounts/12345/history', body: [{ account: 12345 }] }), layer: 'ui' };
    assert.notEqual(likeness(call), likeness(page));
    const md = renderTriageMd(report([call, other, page]), RUN, ROOT);
    assert.match(md, /2 groups/);
    assert.doesNotMatch(md, /response body: as SCN-001/, 'a body that names another record is shown, not referred to');
    assert.match(md, /response body: `\[\{"account":67890\}\]`/);
  });

  it('names the matcher, and the call that made the state a failed read-back looked at', () => {
    const e = failure('SCN-001', { url: 'https://shop.test/api/accounts/12345' });
    e.error!.matcher = 'toContain';
    const post = { request: { method: 'POST', url: 'https://shop.test/api/transfer?amount=1.005' }, response: { status: 200 } };
    const get = { request: { method: 'GET', url: 'https://shop.test/api/accounts/12345' }, response: { status: 500, body: 'boom' } };
    e.evidence.api = get; e.evidence.apiSequence = [post, get]; e.evidence.apiRelevantIndex = 1;
    const md = renderTriageMd(report([e]), RUN, ROOT);
    assert.match(md, /- Expected \(toContain\): `"4xx"`/);
    assert.match(md, /the call before it: `POST https:\/\/shop\.test\/api\/transfer\?amount=1\.005` → \*\*200\*\*/);
  });

  it('has no group table when every failure stands alone', () => {
    const md = renderTriageMd(report([failure('SCN-001', { url: 'https://shop.test/api/a' }), failure('SCN-002', { url: 'https://shop.test/api/b' })]), RUN, ROOT);
    assert.doesNotMatch(md, /look alike/);
  });
});
