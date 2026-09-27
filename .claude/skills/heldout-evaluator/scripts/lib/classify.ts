/**
 * Evidence-based automatic failure classification (pure functions — unit tested in tests/).
 * UI signals: failure-time ARIA snapshot. API signals: last api-exchange attachment + the
 * endpoints the requirement declares (# ENDPOINT: lines in scenarios.feature).
 */
import { matchEndpoint, type Endpoint } from './gherkin';

export type Category = 'APPLICATION_DEFECT' | 'SCRIPT_DEFECT' | 'ENVIRONMENT_ISSUE' | 'FLAKY' | 'BLOCKED' | 'NEEDS_INVESTIGATION';
export const CATEGORIES: Category[] = ['APPLICATION_DEFECT', 'SCRIPT_DEFECT', 'ENVIRONMENT_ISSUE', 'FLAKY', 'BLOCKED', 'NEEDS_INVESTIGATION'];

export interface ParsedError {
  headline: string; reqTag?: string; matcher?: string; expected?: string; received?: string; locator?: string; message: string;
}
export interface ApiExchange {
  request: { method: string; url: string; headers?: Record<string, string>; body?: unknown };
  response: { status: number; durationMs?: number; headers?: Record<string, string>; body?: unknown };
}
export interface AutoClassification { category: Category; confidence: 'high' | 'medium' | 'low'; signals: string[]; next: string }
/** Request shape the requirement contract declares for an endpoint (top-level envelope, e.g. {"article": …}). */
export interface RequestContract { method: string; path: string; envelope?: string; fields?: string[] }
export interface ClassifyContext { snapshot?: string; flaky?: boolean; api?: ApiExchange; endpoints?: Endpoint[]; requestContracts?: RequestContract[] }

export const stripAnsi = (s = '') => s.replace(/\u001b\[[0-9;]*m/g, '');
const norm = (s = '') => s.replace(/^["'`/]|["'`/]$/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * toEqual on arrays/objects prints a "- Expected / + Received" diff instead of Expected:/Received: lines.
 * Rebuild compact values from the removed (-) and added (+) lines, e.g. "[200, 200]" vs "[403, 403]".
 */
function parseDiff(message: string): { expected: string; received: string } | undefined {
  const lines = message.split('\n');
  const start = lines.findIndex((l) => /^- Expected/.test(l));
  if (start === -1 || !/^\+ Received/.test(lines[start + 1] ?? '')) return undefined;
  const exp: string[] = []; const rec: string[] = [];
  let opener = '';
  for (const l of lines.slice(start + 2)) {
    if (/^\s*>?\s*\d+ \|/.test(l)) break; // code frame starts
    const m = l.match(/^([-+ ])\s+(.*?),?\s*$/);
    if (!m || !m[2]) continue;
    if (/^(Array|Object) [[{]$/.test(m[2])) { opener = m[2].endsWith('[') ? '[' : '{'; continue; }
    if (/^[\]}]$/.test(m[2])) continue;
    if (m[1] === '-') exp.push(m[2]); else if (m[1] === '+') rec.push(m[2]); else { exp.push(m[2]); rec.push(m[2]); }
  }
  if (!exp.length && !rec.length) return undefined;
  const wrap = (xs: string[]) => (opener === '{' ? `{ ${xs.join(', ')} }` : `[${xs.join(', ')}]`);
  return { expected: wrap(exp), received: wrap(rec) };
}

/** Pull matcher/expected/received/locator out of a Playwright failure message. */
export function parseError(raw: string): ParsedError {
  const message = stripAnsi(raw);
  const line = (re: RegExp) => message.match(re)?.[1]?.trim();
  const headline = message.split('\n').find((l) => l.trim())?.replace(/^Error:\s*/, '').trim() ?? '';
  const diff = parseDiff(message);
  return {
    headline,
    reqTag: message.match(/\[REQ ([^\]]+)\]/)?.[1],
    matcher: line(/expect\([^)]*\)\.((?:not\.)?to\w+)/),
    expected: line(/^\s*Expected(?: [a-z ]+)?:\s*(.*)$/m) ?? diff?.expected,
    received: line(/^\s*Received(?: [a-z ]+)?:\s*(.*)$/m) ?? diff?.received,
    locator: line(/^\s*Locator:\s*(.*)$/m) ?? line(/waiting for ((?:locator|getBy\w+)\(.*\))\s*$/m),
    message: message.slice(0, 2500),
  };
}

/**
 * For regex expectations (`/\bEmail\b/i`): does the received text match once word boundaries and
 * anchors are removed? Returns a description of the relaxation, or undefined.
 */
export function looseRegexMatch(expected = '', received = ''): string | undefined {
  const m = expected.match(/^\/(.+)\/([a-z]*)$/);
  if (!m || !received) return undefined;
  const relaxed = m[1].replace(/\\b|\^|\$/g, '');
  if (relaxed === m[1]) return undefined;
  try {
    const text = received.replace(/^"|"$/g, '');
    return new RegExp(relaxed, m[2]).test(text) && !new RegExp(m[1], m[2]).test(text) ? `/${relaxed}/${m[2]} matches` : undefined;
  } catch { return undefined; }
}

/**
 * Which exchange a failure is about: when the assertion received an HTTP status (e.g. "500"), the most
 * recent exchange that answered with that status; otherwise the last exchange.
 */
export function relevantExchange(sequence: ApiExchange[], e?: ParsedError): number {
  // A status ("500") or a list of statuses from repeated calls ("[403, 403]") → use the first one.
  const received = (e?.received ?? '').replace(/"/g, '').trim();
  const status = /^\[?\s*\d{3}(\s*,\s*\d{3})*\s*\]?$/.test(received) ? Number(received.match(/\d{3}/)![0]) : NaN;
  if (Number.isInteger(status) && status >= 100 && status <= 599) {
    for (let i = sequence.length - 1; i >= 0; i--) if (sequence[i].response.status === status) return i;
  }
  return sequence.length - 1;
}

/** Human-meaningful strings a locator is looking for (role name, text, label, placeholder). */
export function locatorNeedles(locator = ''): { role?: string; texts: string[] } {
  const role = locator.match(/getByRole\(\s*['"](\w+)['"]/)?.[1];
  const texts = [...locator.matchAll(/(?:name:\s*|getBy(?:Text|Label|Placeholder|Title|AltText)\(\s*)(['"`])(.+?)\1/g)].map((m) => m[2]);
  return { role, texts };
}

function snapshotLinesFor(snapshot: string, text: string): string[] {
  const t = text.toLowerCase();
  // Skip '# url: …' / '# step: …' header lines the fixture prepends — they echo the step text, not the page.
  return snapshot.split('\n').filter((l) => !l.trimStart().startsWith('#') && l.toLowerCase().includes(t)).map((l) => l.trim()).slice(0, 5);
}

/** Order matters: most specific / most certain first. */
export function classify(e: ParsedError, ctx: ClassifyContext = {}): AutoClassification {
  const m = e.message;
  const snapshot = ctx.snapshot ?? '';
  const signals: string[] = [];
  if (/\[SEED\]/.test(m)) {
    const cause = m.match(/\[SEED\][^\n]*/)?.[0] ?? '[SEED]';
    const network = /net::ERR_|ECONNREFUSED|ENOTFOUND|ECONNRESET|ETIMEDOUT|socket hang up|\b50[234]\b/i.test(m);
    return { category: 'BLOCKED', confidence: 'high',
      signals: [`Precondition data could not be seeded, so the scenario was not evaluated: ${cause.slice(0, 200)}`,
        ...(network ? ['The seeding failure looks network/availability-related (environment).'] : [])],
      next: 'Replay the seed call with api-probe.ts. Seed plumbing wrong → fix (SCRIPT); AUT unavailable → re-run later; a requirement endpoint used for seeding is broken → that is evidence for the AC that owns it, not for this one.' };
  }
  if (ctx.flaky) {
    return { category: 'FLAKY', confidence: 'medium', signals: ['Failed then passed on retry — nondeterministic.'],
      next: 'Look for missing web-first waits / race conditions (script) or intermittent AUT/backend errors (environment). Re-run 3x to confirm.' };
  }
  if (/net::ERR_|ECONNREFUSED|ENOTFOUND|ECONNRESET|ETIMEDOUT|ERR_NAME_NOT_RESOLVED|socket hang up|browserType\.launch|Target page, context or browser has been closed/i.test(m)) {
    return { category: 'ENVIRONMENT_ISSUE', confidence: 'high', signals: ['Network / browser / connectivity error in failure message.'],
      next: 'Check the AUT is up (open base URL / healthcheck), then re-run. Not attributable to app logic or the script.' };
  }
  if (/\b(TypeError|ReferenceError|SyntaxError)\b|is not a function|Cannot read propert|is not defined/.test(m) && !/page\.evaluate/.test(m)) {
    return { category: 'SCRIPT_DEFECT', confidence: 'high', signals: ['JavaScript error raised by the test code itself.'], next: 'Fix the test code; re-run.' };
  }
  if (/strict mode violation/i.test(m)) {
    return { category: 'SCRIPT_DEFECT', confidence: 'high', signals: ['Locator resolved to multiple elements (strict mode violation).'],
      next: 'Scope/refine the locator so it is unique; verify with a probe; re-run.' };
  }

  // ---- API evidence ---------------------------------------------------------------------------
  if (ctx.api) {
    const { method, url } = ctx.api.request;
    const status = ctx.api.response.status;
    let pathname = url;
    try { pathname = new URL(url).pathname; } catch { /* relative */ }
    signals.push(`Last API exchange: ${method} ${pathname} → ${status}`);
    const endpoints = ctx.endpoints ?? [];
    if (endpoints.length && !matchEndpoint(endpoints, method, pathname)) {
      signals.push(`${method} ${pathname} is not an endpoint the requirement declares (${endpoints.map((x) => `${x.method} ${x.path}`).join(', ')}).`);
      return { category: 'SCRIPT_DEFECT', confidence: 'high', signals,
        next: 'The test called the wrong endpoint/method. Align it with the declared contract (HOW only), probe it, re-run.' };
    }
    // A request that breaks the declared request contract says nothing about the AC, whatever the AUT answered —
    // even a 5xx (a server that crashes on malformed input is a separate robustness observation, not this AC).
    const rc = ctx.requestContracts?.length ? (matchEndpoint(ctx.requestContracts, method, pathname) as RequestContract | undefined) : undefined;
    const body = ctx.api.request.body;
    if (e.reqTag && rc?.envelope && body && typeof body === 'object' && !Array.isArray(body) && !(rc.envelope in body)) {
      signals.push(`The request body lacks the "${rc.envelope}" envelope the requirement contract declares for ${rc.method} ${rc.path} (top-level keys sent: ${Object.keys(body).join(', ') || 'none'}).`);
      if (status >= 500) signals.push(`The AUT answered the non-conforming request with ${status}. That is outside this AC; record it as a robustness observation (malformed input should get a 4xx), not as this finding.`);
      return { category: 'SCRIPT_DEFECT', confidence: 'high', signals,
        next: 'Send the payload in the declared envelope (HOW only), confirm with api-probe.ts, re-run. The AC is evaluated only once the request conforms.' };
    }
    // Field names: a body that drops a declared field AND sends an undeclared one almost always renamed it (productId vs product_id).
    if (e.reqTag && rc?.fields?.length && body && typeof body === 'object' && !Array.isArray(body)) {
      const inner = (rc.envelope && typeof (body as Record<string, unknown>)[rc.envelope] === 'object' ? (body as Record<string, Record<string, unknown>>)[rc.envelope] : body) as Record<string, unknown>;
      const sent = Object.keys(inner ?? {});
      const flat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const unknown = sent.filter((k) => !rc.fields!.includes(k));
      const missing = rc.fields.filter((k) => !sent.includes(k));
      if (unknown.length && missing.length) {
        const renamed = unknown.map((u) => [u, missing.find((m) => flat(m) === flat(u))] as const).filter(([, m]) => m);
        signals.push(`The request body sends ${unknown.map((u) => `"${u}"`).join(', ')}, which the requirement contract does not declare for ${rc.method} ${rc.path}, and lacks ${missing.map((m) => `"${m}"`).join(', ')}${renamed.length ? ` (${renamed.map(([u, m]) => `"${u}" looks like "${m}"`).join('; ')})` : ''}.`);
        return { category: 'SCRIPT_DEFECT', confidence: renamed.length ? 'high' : 'medium', signals,
          next: 'Use the declared field names (HOW only), confirm with api-probe.ts, re-run. The AC is evaluated only once the request conforms.' };
      }
    }
    if ([502, 503, 504].includes(status)) {
      signals.push('Gateway/availability status — typically infrastructure, not application logic.');
      return { category: 'ENVIRONMENT_ISSUE', confidence: 'medium', signals, next: 'Check AUT health, re-run. Escalate to APPLICATION only if it reproduces consistently on a healthy environment.' };
    }
    // "201" or a list of success statuses like "[200, 200]" (repeated calls).
    const expected2xx = /^\D*2\d\d(\D+2\d\d)*\D*$/.test(e.expected ?? '');
    if (e.reqTag && status >= 500 && !/^\D*5\d\d/.test(e.expected ?? '')) {
      signals.push('Server error (5xx) on a declared endpoint where the requirement specifies a different outcome.');
      return { category: 'APPLICATION_DEFECT', confidence: 'high', signals, next: 'Replay the request (api-probe.ts) to confirm it reproduces, then record with --set.' };
    }
    if (e.reqTag && expected2xx && [401, 403].includes(status)) {
      signals.push('Request was rejected as unauthenticated/unauthorised although success was expected — verify the test authenticated as the requirement specifies.');
      return { category: 'NEEDS_INVESTIGATION', confidence: 'low', signals, next: 'Check the auth plumbing (token/cookie) with api-probe.ts. Wrong plumbing → SCRIPT; correct credentials rejected → APPLICATION.' };
    }
    if (e.reqTag && expected2xx && [400, 415, 422].includes(status)) {
      signals.push('AUT rejected the request as invalid although the scenario sends a valid payload — verify the payload matches the requirement contract.');
      return { category: 'APPLICATION_DEFECT', confidence: 'medium', signals, next: 'Compare the logged request body to the requirement field rules. Payload violates them → SCRIPT; payload conforms → APPLICATION (over-strict validation).' };
    }
  }

  // ---- UI evidence ----------------------------------------------------------------------------
  // toHaveCount(n > 0) that received 0 is "element not found" in disguise — not evidence about the app yet.
  const zeroCount = /toHaveCount/.test(e.matcher ?? m) && /^0$/.test((e.received ?? '').trim()) && !/^0$/.test((e.expected ?? '').trim());
  const elementMissing = zeroCount || (/element\(s\) not found|waiting for (?:locator|getBy)|Timeout \d+ms exceeded/i.test(m)
    && (!e.received || /element\(s\) not found/.test(e.received)));
  const needles = locatorNeedles(e.locator);

  if (elementMissing && !ctx.api && /\bstrict\b/.test(e.reqTag ?? '')) {
    signals.push(`Target not found: ${e.locator ?? '(locator not reported)'}`,
      'This is a strict requirement assertion: the locator itself encodes the requirement (accessible name / role / alt text), so "not found" means the element is not exposed as required.');
    return { category: 'APPLICATION_DEFECT', confidence: 'medium', signals,
      next: 'Confirm live that the element exists but lacks the required accessible name/role (or is absent), then record with --set.' };
  }
  if (elementMissing && !ctx.api) {
    signals.push(`Target not found: ${e.locator ?? '(locator not reported)'}`);
    const hits = needles.texts.flatMap((t) => snapshotLinesFor(snapshot, t));
    if (hits.length) {
      const roleMismatch = needles.role && !hits.some((h) => h.replace(/^-\s*/, '').startsWith(needles.role!));
      signals.push(`Failure-time page snapshot DOES contain the target text: ${hits.map((h) => `\`${h}\``).join(', ')}`);
      if (roleMismatch) signals.push(`…but with a different role than the locator's '${needles.role}'.`);
      return { category: 'SCRIPT_DEFECT', confidence: roleMismatch ? 'high' : 'medium', signals,
        next: 'The element exists but the locator does not match it — re-inspect at this step, fix the locator (HOW only), re-run.' };
    }
    // The locator may carry no text (e.g. getByRole('alert')): then look for the EXPECTED text of a text assertion.
    const expectedText = /toHaveText|toContainText/.test(e.matcher ?? e.message) ? e.expected?.match(/^"(.+)"$/)?.[1] : undefined;
    const expectedHits = expectedText ? snapshotLinesFor(snapshot, expectedText) : [];
    if (expectedHits.length) {
      signals.push(`The expected text "${expectedText}" IS on the page (${expectedHits.map((h) => `\`${h}\``).join(', ')}) — the locator targets a different element.`);
      return { category: 'SCRIPT_DEFECT', confidence: 'medium', signals,
        next: 'Re-locate the element that actually carries the expected text (probe it), fix the locator (HOW only), re-run.' };
    }
    if (!snapshot) signals.push('No failure-time snapshot available.');
    else if (needles.texts.length || expectedText) signals.push(`Target text ${[...needles.texts, ...(expectedText ? [expectedText] : [])].map((t) => `"${t}"`).join(', ')} is absent from the failure-time snapshot.`);
    return { category: 'NEEDS_INVESTIGATION', confidence: 'low', signals,
      next: 'Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.' };
  }

  if (e.reqTag && e.received !== undefined) {
    signals.push(`Requirement assertion [REQ ${e.reqTag}] failed${ctx.api ? '' : ' on a located element'}.`, `Expected: ${e.expected ?? '?'}`, `Received: ${e.received}`);
    if (!ctx.api && /toHaveText|toContainText/.test(e.matcher ?? e.message) && /^(""|''|)$/.test(e.received.trim())) {
      signals.push('The located element has NO text at all — the locator may be matching the wrong (e.g. empty placeholder/live-region) element.');
      return { category: 'NEEDS_INVESTIGATION', confidence: 'low', signals,
        next: 'Probe the locator at this step: if it matches an empty/unrelated element while the expected text is elsewhere → SCRIPT; if the expected text is truly absent → APPLICATION.' };
    }
    const loose = looseRegexMatch(e.expected, e.received);
    if (loose) {
      signals.push(`The received text DOES contain the expected content when the pattern is relaxed (${loose}) — the assertion is stricter than the requirement.`);
      return { category: 'SCRIPT_DEFECT', confidence: 'medium', signals,
        next: 'Fix the assertion implementation (e.g. drop word boundaries/anchors) without changing what it requires; record it with integrity.ts --amend, then re-run.' };
    }
    if (e.expected !== undefined && norm(e.expected) === norm(e.received)) {
      signals.push('Expected and received differ only by whitespace/case/quoting.');
      return { category: 'SCRIPT_DEFECT', confidence: 'medium', signals, next: 'Assertion is over-strict relative to the requirement wording — relax formatting only if the requirement does not mandate it.' };
    }
    return { category: 'APPLICATION_DEFECT', confidence: 'high', signals,
      next: `Confirm live in the AUT (${ctx.api ? 'replay with api-probe.ts' : 'reproduce the steps'}, observe the actual value), then record with --set.` };
  }
  if (e.reqTag) {
    signals.push(`Requirement assertion [REQ ${e.reqTag}] failed: ${e.headline}`);
    return { category: 'APPLICATION_DEFECT', confidence: 'medium', signals, next: 'Confirm live in the AUT, then record with --set.' };
  }
  if (/Test timeout of \d+ms exceeded/.test(m)) {
    return { category: 'NEEDS_INVESTIGATION', confidence: 'low', signals: [...signals, 'Whole-test timeout without a specific assertion.'],
      next: 'Open the trace; find the last completed step; re-inspect live.' };
  }
  signals.push(`Non-requirement assertion/action failed: ${e.headline}`);
  return { category: 'NEEDS_INVESTIGATION', confidence: 'low', signals, next: 'Inspect trace + snapshot; decide SCRIPT vs APPLICATION.' };
}
