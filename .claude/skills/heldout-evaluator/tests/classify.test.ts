import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { classify, looseRegexMatch, parseError, relevantExchange, type ApiExchange } from '../scripts/lib/classify';
import type { Endpoint } from '../scripts/lib/gherkin';

const pw = (lines: string[]) => lines.join('\n');
const endpoints: Endpoint[] = [{ method: 'GET', path: '/api/message' }, { method: 'GET', path: '/api/room/{id}' }, { method: 'POST', path: '/api/message' }];
const exchange = (method: string, url: string, status: number): ApiExchange => ({ request: { method, url }, response: { status } });

describe('parseError', () => {
  it('extracts REQ tag, matcher, expected, received and locator', () => {
    const e = parseError(pw(['Error: [REQ AC-2] locked-account error message', '', 'expect(locator).toHaveText(expected) failed', '',
      "Locator:  getByRole('alert')", 'Expected: "Your account has been locked."', 'Received: "Epic sadface: Sorry"']));
    assert.equal(e.reqTag, 'AC-2');
    assert.equal(e.matcher, 'toHaveText');
    assert.equal(e.expected, '"Your account has been locked."');
    assert.equal(e.received, '"Epic sadface: Sorry"');
    assert.equal(e.locator, "getByRole('alert')");
  });
  it('strips ANSI colour codes', () => {
    assert.equal(parseError('\u001b[31mError: boom\u001b[39m').headline, 'boom');
  });
});

describe('classify — UI', () => {
  it('REQ assertion with a different received value → APPLICATION_DEFECT (high)', () => {
    const r = classify(parseError(pw(['Error: [REQ AC-3] error text', 'expect(locator).toHaveText(expected) failed', 'Expected: "A"', 'Received: "B"'])));
    assert.equal(r.category, 'APPLICATION_DEFECT');
    assert.equal(r.confidence, 'high');
  });
  it('element missing but text present with another role → SCRIPT_DEFECT (high)', () => {
    const e = parseError(pw(['TimeoutError: locator.click: Timeout 10000ms exceeded.', "  - waiting for getByRole('link', { name: 'Checkout' })"]));
    const r = classify(e, { snapshot: '- button "Checkout" [ref=e33]' });
    assert.equal(r.category, 'SCRIPT_DEFECT');
    assert.equal(r.confidence, 'high');
  });
  it('nameless locator not found but the expected text is on the page → SCRIPT_DEFECT', () => {
    const e = parseError(pw(['Error: [REQ AC-2] message', 'expect(locator).toContainText(expected) failed', "Locator: getByRole('alert')",
      'Expected substring: "Your username is invalid!"', 'Received: <element(s) not found>', 'Timeout: 5000ms']));
    assert.equal(classify(e, { snapshot: '- text:  Your username is invalid!\n- button "Login"' }).category, 'SCRIPT_DEFECT');
  });
  it('element missing and text absent → NEEDS_INVESTIGATION', () => {
    const e = parseError(pw(['TimeoutError: locator.click: Timeout 10000ms exceeded.', "  - waiting for getByRole('button', { name: 'Pay' })"]));
    assert.equal(classify(e, { snapshot: '- heading "Cart"' }).category, 'NEEDS_INVESTIGATION');
  });
  it('strict REQ assertion whose element is missing → APPLICATION_DEFECT (the locator is the requirement)', () => {
    const e = parseError(pw(['Error: [REQ AC-1 strict] Message field has an accessible label', 'expect(locator).toBeVisible() failed',
      "Locator: getByRole('textbox', { name: 'Message', exact: true })", 'Expected: visible', 'Received: <element(s) not found>']));
    assert.equal(classify(e, { snapshot: '- text: Message' }).category, 'APPLICATION_DEFECT');
  });
  it('located element with empty text → NEEDS_INVESTIGATION (probably wrong element)', () => {
    const e = parseError(pw(['Error: [REQ AC-3] errors mention Name', 'expect(locator).toContainText(expected) failed', 'Expected pattern: /Name/i', 'Received string: ""']));
    assert.equal(classify(e).category, 'NEEDS_INVESTIGATION');
  });
  it('regex over-strict (word boundary) but content present → SCRIPT_DEFECT', () => {
    const e = parseError(pw(['Error: [REQ AC-3] errors mention Email', 'expect(locator).toContainText(expected) failed', 'Expected pattern: /\\bEmail\\b/i', 'Received string: "blankEmail may not be blank"']));
    assert.equal(classify(e).category, 'SCRIPT_DEFECT');
  });
  it('strict mode violation → SCRIPT_DEFECT', () => {
    assert.equal(classify(parseError('Error: strict mode violation: getByRole(\'button\') resolved to 3 elements')).category, 'SCRIPT_DEFECT');
  });
  it('network error → ENVIRONMENT_ISSUE', () => {
    assert.equal(classify(parseError('Error: page.goto: net::ERR_NAME_NOT_RESOLVED')).category, 'ENVIRONMENT_ISSUE');
  });
  it('flaky → FLAKY', () => {
    assert.equal(classify(parseError('Error: whatever'), { flaky: true }).category, 'FLAKY');
  });
});

describe('classify — API', () => {
  const statusErr = (expected: number, received: number, tag = 'AC-8') =>
    parseError(pw([`Error: [REQ ${tag}] status`, 'expect(received).toBe(expected)', `Expected: ${expected}`, `Received: ${received}`]));
  it('undeclared endpoint → SCRIPT_DEFECT (high)', () => {
    const r = classify(statusErr(200, 404), { api: exchange('GET', 'https://x.test/api/messages', 404), endpoints });
    assert.equal(r.category, 'SCRIPT_DEFECT');
  });
  it('declared endpoint returning 5xx where the requirement says otherwise → APPLICATION_DEFECT', () => {
    const r = classify(statusErr(404, 500, 'AC-12'), { api: exchange('GET', 'https://x.test/api/room/100001', 500), endpoints });
    assert.equal(r.category, 'APPLICATION_DEFECT');
  });
  it('gateway 503 → ENVIRONMENT_ISSUE', () => {
    assert.equal(classify(statusErr(200, 503), { api: exchange('GET', 'https://x.test/api/message', 503), endpoints }).category, 'ENVIRONMENT_ISSUE');
  });
  it('401 when 2xx expected → NEEDS_INVESTIGATION (check auth plumbing)', () => {
    assert.equal(classify(statusErr(200, 401), { api: exchange('GET', 'https://x.test/api/message', 401), endpoints }).category, 'NEEDS_INVESTIGATION');
  });
  it('status mismatch on a declared endpoint → APPLICATION_DEFECT', () => {
    assert.equal(classify(statusErr(401, 200), { api: exchange('GET', 'https://x.test/api/message', 200), endpoints }).category, 'APPLICATION_DEFECT');
  });
});

describe('snapshot evidence', () => {
  it('ignores the fixture header lines (# step: …) that echo the expected text', () => {
    const e = parseError(pw(["TimeoutError: locator.click: Timeout 10000ms exceeded.", "  - waiting for getByText('Hello World!')"]));
    assert.equal(classify(e, { snapshot: '# step: FAILED Then "Hello World!" is rendered\n- button "Start"' }).category, 'NEEDS_INVESTIGATION');
  });
});

describe('relevantExchange', () => {
  const seq = [exchange('POST', 'https://x.test/api/booking', 500), exchange('GET', 'https://x.test/api/booking?q=1', 200)];
  it('picks the exchange whose status is the failing received value, not the last one', () => {
    assert.equal(relevantExchange(seq, parseError(pw(['Error: [REQ AC-6] missing → 400', 'Expected: 400', 'Received: 500']))), 0);
  });
  it('falls back to the last exchange for non-status assertions', () => {
    assert.equal(relevantExchange(seq, parseError(pw(['Error: [REQ AC-6] not stored', 'Expected: []', 'Received: [1]']))), 1);
  });
});

describe('looseRegexMatch', () => {
  it('detects boundary-only mismatches', () => {
    assert.ok(looseRegexMatch('/\\bEmail\\b/i', '"blankEmail may not"'));
    assert.equal(looseRegexMatch('/\\bEmail\\b/i', '"no match here"'), undefined);
    assert.equal(looseRegexMatch('"plain"', 'plain'), undefined);
  });
});

describe('seeding', () => {
  it('[SEED] failures are BLOCKED (scenario not evaluated), never a requirement failure', () => {
    const r = classify(parseError('Error: [SEED] booking: precondition could not be established — expected 200, got 503'));
    assert.equal(r.category, 'BLOCKED');
  });
});

describe('API pre-steps', () => {
  it('a list of expected success statuses vs 403s → auth-plumbing investigation, not an app defect', () => {
    const e = parseError(pw(['Error: [REQ AC-8] repeated PUT → 200 both times', 'expect(received).toEqual(expected)', 'Expected: [200, 200]', 'Received: [403, 403]']));
    assert.equal(classify(e, { api: exchange('PUT', 'https://x.test/booking/7', 403), endpoints: [{ method: 'PUT', path: '/booking/{id}' }] }).category, 'NEEDS_INVESTIGATION');
  });
});

describe('parseError — toEqual diffs', () => {
  const msg = pw(['Error: [REQ AC-8] repeated PUT → 200 both times', '', 'expect(received).toEqual(expected) // deep equality', '',
    '- Expected  - 2', '+ Received  + 2', '', '  Array [', '-   200,', '-   200,', '+   403,', '+   403,', '  ]', '', '  208 |     });']);
  it('rebuilds expected/received from the diff', () => {
    const e = parseError(msg);
    assert.equal(e.expected, '[200, 200]');
    assert.equal(e.received, '[403, 403]');
  });
  it('the real Playwright diff for repeated 403s is an auth-plumbing investigation', () => {
    assert.equal(classify(parseError(msg), { api: exchange('PUT', 'https://x.test/booking/7', 403), endpoints: [{ method: 'PUT', path: '/booking/{id}' }] }).category, 'NEEDS_INVESTIGATION');
  });
});

describe('toHaveCount → 0', () => {
  it('a count assertion that received 0 is treated as "element not found", not an app defect', () => {
    const e = parseError(pw(['Error: [REQ AC-3] exactly one notification', 'expect(locator).toHaveCount(expected) failed', "Locator: getByRole('alert')", 'Expected: 1', 'Received: 0']));
    assert.equal(classify(e, { snapshot: '- text: Action successful' }).category, 'NEEDS_INVESTIGATION');
  });
});

describe('classify — request contract conformance', () => {
  const contracts = [{ method: 'POST', path: '/api/articles', envelope: 'article' }];
  const err = parseError(pw(['Error: [REQ AC-5] create article → 201', 'Expected: 201', 'Received: 500']));
  const call = (body: unknown, status: number): ApiExchange => ({ request: { method: 'POST', url: 'https://x.test/api/articles', body }, response: { status } });
  it('a request without the declared envelope is a script defect even when the AUT answers 5xx', () => {
    const r = classify(err, { api: call({ title: 't', body: 'b' }, 500), requestContracts: contracts });
    assert.equal(r.category, 'SCRIPT_DEFECT');
    assert.equal(r.confidence, 'high');
    assert.ok(r.signals.some((s) => /robustness observation/.test(s)));
  });
  it('a conforming request that gets a 5xx is still an application defect', () => {
    assert.equal(classify(err, { api: call({ article: { title: 't' } }, 500), requestContracts: contracts }).category, 'APPLICATION_DEFECT');
  });
  it('takes the request shape only from the structured contract fields', async () => {
    const { requestContracts } = await import('../scripts/lib/contract');
    const c = { endpoints: [
      { method: 'POST', path: '/api/articles', envelope: 'article', requestFields: ['title'], source: 'story.md#L1' },
      { method: 'GET', path: '/api/articles', request: '{"article": {…}} (prose only)', source: 'story.md#L1' },
    ] } as never;
    assert.deepEqual(requestContracts(c), [{ method: 'POST', path: '/api/articles', envelope: 'article', fields: ['title'] }]);
  });
});

describe('classify — declared request field names', () => {
  const contracts = [{ method: 'POST', path: '/carts/{id}', fields: ['product_id', 'quantity'] }];
  const err = parseError(pw(['Error: [REQ AC-2] add → 200', 'Expected: 200', 'Received: 422']));
  const call = (body: unknown): ApiExchange => ({ request: { method: 'POST', url: 'https://x.test/carts/abc', body }, response: { status: 422 } });
  it('a renamed field (productId vs product_id) is a script defect', () => {
    const r = classify(err, { api: call({ productId: 'p1', quantity: 1 }), requestContracts: contracts });
    assert.equal(r.category, 'SCRIPT_DEFECT');
    assert.equal(r.confidence, 'high');
    assert.ok(r.signals.some((s) => /"productId" looks like "product_id"/.test(s)));
  });
  it('a deliberately missing field (negative test) is not flagged', () => {
    assert.notEqual(classify(err, { api: call({ product_id: 'p1' }), requestContracts: contracts }).category, 'SCRIPT_DEFECT');
  });
});
