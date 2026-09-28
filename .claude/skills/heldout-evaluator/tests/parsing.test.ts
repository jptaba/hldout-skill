import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { adfToMarkdown, markdownToAdf } from '../scripts/lib/jira/adf';
import { baseScenarioId, matchEndpoint, normaliseTestType, readFeature } from '../scripts/lib/gherkin';
import { testIdsIn, testTagsIn } from '../scripts/lib/preflight';
import { curlFor, rerunCommand } from '../scripts/lib/repro';
import { decideVerdict } from '../scripts/lib/verdict-rules';

const FEATURE = `# AC-1: First criterion
# AC-2: Second criterion
# ENDPOINT: GET /api/room/{id} — room detail
# ASSUMPTION: something assumed
# OPEN-QUESTION: something open
# OBSERVATION: the form sends no request
@story:ABC-1
Feature: Demo
  # from story AC-1, rules.csv
  @SCN-001 @AC-1 @type:positive @layer:ui
  Scenario: One
    Given x
    Then y

  @SCN-002 @AC-2 @type:boundary @assumes:G2
  Scenario Outline: Two
    When <v>
    Then z
    Examples:
      | v |
      | 1 |
      | 2 |
`;

describe('readFeature', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-f-')), 's.feature');
  fs.writeFileSync(file, FEATURE);
  const f = readFeature(file);
  it('reads ACs, endpoints, assumptions and open questions', () => {
    assert.deepEqual(f.acs.map((a) => a.id), ['AC-1', 'AC-2']);
    assert.deepEqual(f.endpoints, [{ method: 'GET', path: '/api/room/{id}', note: 'room detail' }]);
    assert.equal(f.assumptions.length, 1);
    assert.equal(f.openQuestions.length, 1);
    assert.deepEqual(f.observations, ["the form sends no request"]);
  });
  it('reads scenario tags, normalised type, layer, sources and outline examples', () => {
    const [a, b] = f.scenarios;
    assert.equal(a.testType, 'functional'); // alias of positive
    assert.equal(a.layer, 'ui');
    assert.deepEqual(a.sources, ['story AC-1, rules.csv']);
    assert.equal(b.outline, true);
    assert.deepEqual(a.assumes, []);
    assert.deepEqual(b.assumes, ['G2']);
    assert.equal(b.examples.length, 3);
    assert.deepEqual(b.sources, []);
  });
});

describe('helpers', () => {
  it('baseScenarioId / normaliseTestType', () => {
    assert.equal(baseScenarioId('SCN-006.12'), 'SCN-006');
    assert.equal(normaliseTestType('a11y'), 'accessibility');
    assert.equal(normaliseTestType('nonsense'), undefined);
  });
  it('matchEndpoint handles path templates', () => {
    const eps = [{ method: 'GET', path: '/api/room/{id}' }];
    assert.ok(matchEndpoint(eps, 'GET', '/api/room/7'));
    assert.equal(matchEndpoint(eps, 'GET', '/api/rooms/7'), undefined);
    assert.equal(matchEndpoint(eps, 'POST', '/api/room/7'), undefined);
  });
  it('matchEndpoint accepts declared paths relative to the API base path', () => {
    const eps = [{ method: 'GET', path: '/accounts/{accountId}' }];
    assert.ok(matchEndpoint(eps, 'GET', '/bank/services/accounts/20004', '/bank/services/'));
    assert.equal(matchEndpoint(eps, 'GET', '/other/accounts/20004', '/bank/services/'), undefined);
  });
  it('testIdsIn / testTagsIn read static and template-literal tests', () => {
    const src = "test('SCN-001: a', { tag: ['@AC-1', '@type:functional'] }, async () => {});\n  test(`SCN-004.${i + 1}: b`, { tag: ['@AC-4'] }, async () => {});";
    assert.deepEqual([...testIdsIn(src)], ['SCN-001', 'SCN-004']);
    assert.deepEqual(testTagsIn(src).get('SCN-001'), ['@AC-1', '@type:functional']);
  });
});

describe('ADF round trip', () => {
  it('markdown → ADF → markdown keeps headings, lists, tables and marks', () => {
    const md = '## Title\n\n- **AC-1**: do `x`\n- second\n\n| a | b |\n| --- | --- |\n| 1 | 2 |';
    const back = adfToMarkdown(markdownToAdf(md));
    assert.match(back, /## Title/);
    assert.match(back, /- \*\*AC-1\*\*: do `x`/);
    assert.match(back, /\| 1 \| 2 \|/);
  });
});

describe('repro', () => {
  it('curl replaces redacted secrets with placeholders', () => {
    const c = curlFor({ request: { method: 'POST', url: 'https://x.test/api/auth/login', headers: { 'Content-Type': 'application/json', Cookie: '***redacted***' }, body: { username: 'a', password: '***redacted***' } }, response: { status: 200 } });
    assert.match(c, /curl -i -X POST 'https:\/\/x.test\/api\/auth\/login'/);
    assert.doesNotMatch(c, /\*\*\*redacted\*\*\*/);
    assert.match(c, /<secret from test-data.json/);
  });
  it('rerun command escapes sub-ids for --grep', () => {
    assert.match(rerunCommand('ABC-1', 'SCN-006.1'), /--grep "SCN-006\\\.1:"/);
  });
});

describe('decideVerdict', () => {
  const base = { integrity: 'PRESERVED' as const, confirmedAppDefects: [], failures: 0, flaky: 0, uncoveredAcs: 0, clarifications: 0, openQuestions: 0 };
  it('violated integrity trumps everything', () => assert.equal(decideVerdict({ ...base, integrity: 'VIOLATED', confirmedAppDefects: [{ refs: ['AC-1'] }] }).verdict, 'INCONCLUSIVE'));
  it('a stated requirement nobody verified is a warning, not a pass', () => { const v = decideVerdict({ ...base, unverifiedRequirements: 1 }); assert.equal(v.verdict, 'PASS_WITH_WARNINGS'); assert.match(v.reason, /1 stated requirement\(s\) not verified/); });
  it('confirmed defects → FAIL', () => assert.equal(decideVerdict({ ...base, confirmedAppDefects: [{ refs: ['AC-1'] }], failures: 1 }).verdict, 'FAIL'));
  it('unexplained failures → INCONCLUSIVE', () => assert.equal(decideVerdict({ ...base, failures: 1 }).verdict, 'INCONCLUSIVE'));
  it('warnings → PASS_WITH_WARNINGS', () => assert.equal(decideVerdict({ ...base, openQuestions: 1 }).verdict, 'PASS_WITH_WARNINGS'));
  it('a failure resting only on an assumption → PASS_WITH_WARNINGS, not FAIL', () => assert.equal(decideVerdict({ ...base, contradictedAssumptions: 1 }).verdict, 'PASS_WITH_WARNINGS'));
  it('clean → PASS', () => assert.equal(decideVerdict(base).verdict, 'PASS'));
  it('amended integrity still allows PASS', () => assert.equal(decideVerdict({ ...base, integrity: 'AMENDED' }).verdict, 'PASS'));
});

describe('redaction', () => {
  it('redacts credential headers by name (incl. misspellings) and by value', async () => {
    const { redactHeaders } = await import('../scripts/lib/redact');
    const r = redactHeaders({ Authorisation: 'Basic YWRtaW46cGFzcw==', 'X-Trace': 'Bearer abc.def', Accept: 'application/json', 'X-Session-Id': 's1' });
    assert.equal(r.Authorisation, '***redacted***');
    assert.equal(r['X-Trace'], '***redacted***');
    assert.equal(r['X-Session-Id'], '***redacted***');
    assert.equal(r.Accept, 'application/json');
  });
});

describe('mergeRepeats (--repeat-each)', async () => {
  const { mergeRepeats } = await import('../scripts/lib/triage-model');
  const entry = (status: 'passed' | 'failed', cat?: string) => ({
    scenario: 'SCN-009', title: 'SCN-009: sort', file: 'a.spec.ts', status, tags: [], requirementRefs: ['AC-8'], otherFailures: [],
    evidence: { attempts: 1 },
    ...(cat ? { error: { headline: `${cat} boom`, message: '' }, auto: { category: cat as never, confidence: 'high' as const, signals: [], next: '' } } : {}),
  });
  it('mixed pass/fail → one FLAKY entry with repeat counts', () => {
    const [m, ...rest] = mergeRepeats([entry('passed'), entry('failed', 'SCRIPT_DEFECT'), entry('passed')]);
    assert.equal(rest.length, 0);
    assert.equal(m.status, 'flaky');
    assert.equal(m.auto?.category, 'FLAKY');
    assert.deepEqual(m.evidence.repeats && [m.evidence.repeats.runs, m.evidence.repeats.failed], [3, 1]);
  });
  it('all passed → passed; single entries are untouched', () => {
    assert.equal(mergeRepeats([entry('passed'), entry('passed')])[0].status, 'passed');
    assert.equal(mergeRepeats([entry('failed', 'APPLICATION_DEFECT')])[0].auto?.category, 'APPLICATION_DEFECT');
  });
  it('all failed with different causes keeps failed and lists the causes', () => {
    const [m] = mergeRepeats([entry('failed', 'ENVIRONMENT_ISSUE'), entry('failed', 'SCRIPT_DEFECT')]);
    assert.equal(m.status, 'failed');
    assert.ok(m.auto?.signals.some((s) => /2 different causes/.test(s)));
  });
});

describe('correlateDegradedEnvironment', async () => {
  const { correlateDegradedEnvironment } = await import('../scripts/lib/triage-model');
  const failed = (id: string, message: string, cat = 'NEEDS_INVESTIGATION') => ({
    scenario: id, title: id, file: 'a', status: 'failed' as const, tags: [], requirementRefs: [], otherFailures: [], evidence: { attempts: 1 },
    error: { headline: message, message }, auto: { category: cat as never, confidence: 'low' as const, signals: [], next: '' },
  });
  it('re-labels unrelated timeouts as ENVIRONMENT when a healthcheck was slow', () => {
    const es = [failed('SCN-1', 'Test timeout of 60000ms exceeded.'), failed('SCN-2', 'TimeoutError: locator.click: Timeout 10000ms exceeded.'), failed('SCN-3', 'x', 'APPLICATION_DEFECT')];
    assert.ok(correlateDegradedEnvironment(es, [{ url: 'u', ok: true, ms: 9000 }]));
    assert.deepEqual(es.map((e) => e.auto.category), ['ENVIRONMENT_ISSUE', 'ENVIRONMENT_ISSUE', 'APPLICATION_DEFECT']);
  });
  it('does nothing when the AUT was healthy or only one test timed out', () => {
    const es = [failed('SCN-1', 'Test timeout of 60000ms exceeded.'), failed('SCN-2', 'Test timeout of 60000ms exceeded.')];
    assert.equal(correlateDegradedEnvironment(es, [{ url: 'u', ok: true, ms: 300 }]), undefined);
    assert.equal(correlateDegradedEnvironment([failed('SCN-1', 'Test timeout of 60000ms exceeded.')], [{ url: 'u', ok: false, ms: 1 }]), undefined);
  });
});

describe('decideVerdict — skipped scenarios', () => {
  it('a skipped scenario prevents PASS (INCONCLUSIVE), but confirmed defects still FAIL', () => {
    const base = { integrity: 'PRESERVED' as const, confirmedAppDefects: [], failures: 0, flaky: 0, uncoveredAcs: 0, clarifications: 0, openQuestions: 0 };
    assert.equal(decideVerdict({ ...base, skipped: 1 }).verdict, 'INCONCLUSIVE');
    assert.equal(decideVerdict({ ...base, skipped: 1, confirmedAppDefects: [{ refs: ['AC-1'] }] }).verdict, 'FAIL');
  });
});

describe('correlateAuthPrecondition', async () => {
  const { correlateAuthPrecondition } = await import('../scripts/lib/triage-model');
  const ex = (method: string, url: string, status: number) => ({ request: { method, url }, response: { status } });
  it('a failed auth pre-step turns same-endpoint "app defects" into investigations', () => {
    const blocked = { scenario: 'SCN-010', title: '', file: '', status: 'failed' as const, tags: [], requirementRefs: [], otherFailures: [],
      error: { headline: '[SEED] token', message: '[SEED] token' }, auto: { category: 'BLOCKED' as never, confidence: 'high' as const, signals: [], next: '' },
      evidence: { attempts: 1, preSequence: [ex('POST', 'https://x.test/auth', 200)], seed: { tag: 't', records: [{ label: 'token', kind: 'auth', error: 'no token' }] } } };
    const sameEndpoint = { ...blocked, scenario: 'SCN-001', error: { headline: 'x', message: 'x' }, auto: { category: 'APPLICATION_DEFECT' as never, confidence: 'medium' as const, signals: [], next: '' },
      evidence: { attempts: 1, api: ex('POST', 'https://x.test/auth', 200) } };
    assert.ok(correlateAuthPrecondition([blocked, sameEndpoint] as never));
    assert.equal(sameEndpoint.auto.category, 'NEEDS_INVESTIGATION');
  });
});

describe('Playwright MCP snapshot parsing', async () => {
  const { nodeFor, refFor } = await import('../scripts/lib/mcp-client');
  const snap = [
    '- generic [active] [ref=e1]:',
    '  - textbox "Username" [ref=e16]',
    '  - button " Login" [ref=e22] [cursor=pointer]',
    '  - combobox [ref=e5]:',
    '    - option "Option 2" [selected]',
    '  - heading "Secure Area" [level=2] [ref=f1e10]',
  ].join('\n');
  it('finds refs by role + name (exact or partial)', () => {
    assert.equal(refFor(snap, 'textbox', 'Username', true), 'e16');
    assert.equal(refFor(snap, 'button', 'Login'), 'e22');
    assert.equal(refFor(snap, 'button', 'Login', true), undefined);
    assert.equal(refFor(snap, 'heading', 'Secure Area', true), 'f1e10');
  });
  it('nodes without refs (options) are found for expectations but not for actions', () => {
    assert.ok(nodeFor(snap, 'option', 'Option 2'));
    assert.equal(refFor(snap, 'option', 'Option 2'), undefined);
  });
});

describe('failure signatures across runs', () => {
  it('mask per-run generated values but keep statuses and AC ids', async () => {
    const { maskVolatile } = await import('../scripts/lib/triage-model');
    assert.equal(maskVolatile('"Heldout-irl8v63eb2-74248"'), maskVolatile('"Heldout-irk2p0aa91-74230"'));
    assert.equal(maskVolatile('106886'), maskVolatile('106912'));
    assert.equal(maskVolatile('2026-09-26T19:08:35.136Z'), '<ts>');
    assert.equal(maskVolatile('[REQ AC-10] 401 vs 403'), '[REQ AC-10] 401 vs 403');
    assert.notEqual(maskVolatile('"Your account has been locked."'), maskVolatile('"Epic sadface: Sorry"'));
  });
  it('match a "must not be X" failure whatever X is this run (a seeded id)', async () => {
    const { signature } = await import('../scripts/lib/triage-model');
    const entry = (id: string) => ({ scenario: 'SCN-007', status: 'failed', error: { headline: "[REQ AC-6] does not return B's basket", reqTag: 'AC-6', expected: `not ${id}`, received: id, message: '' } }) as never;
    assert.equal(signature(entry('46')), signature(entry('69')));
  });
  it('depend on the failure only, not on the evidence triage picked for it', async () => {
    const { signature } = await import('../scripts/lib/triage-model');
    const error = { headline: '[REQ AC-6] an error is shown', reqTag: 'AC-6', received: 'hidden', message: '' };
    const exchange = (method: string, status: number) => ({ request: { method, url: 'https://x.test/a' }, response: { status } });
    const a = { scenario: 'SCN-1', status: 'failed', error, evidence: { api: exchange('GET', 200) } };
    const b = { scenario: 'SCN-1', status: 'failed', error, evidence: {} };
    const c = { scenario: 'SCN-1', status: 'failed', error, evidence: { api: exchange('POST', 500) } };
    assert.equal(signature(a as never), signature(b as never));
    assert.equal(signature(a as never), signature(c as never));
  });
});

describe('snapshot redaction', () => {
  it('removes password values from ARIA snapshots (skill and fixture copies agree)', async () => {
    const { redactSnapshot } = await import('../scripts/lib/redact');
    const { redactSnapshot: fixtureCopy } = await import('../templates/fixtures');
    const yaml = '- textbox "Email": qa1@example.com\n- textbox "Password" [disabled]: Fixture-00000!q\n- text: echo Fixture-00000!q';
    for (const fn of [redactSnapshot, fixtureCopy]) {
      const out = fn(yaml, ['Fixture-00000!q']);
      assert.ok(!out.includes('Fixture-00000!q'));
      assert.match(out, /textbox "Email": qa1@example.com/);
      assert.match(fn('- textbox "Passcode": 1234'), /Passcode": \*\*\*redacted\*\*\*/);
    }
  });
});

describe('run artifact scrubbing', () => {
  it('scrubs secrets from text artifacts and base64 attachment bodies in results.json', async () => {
    const { scrubDir, secretValuesFor } = await import('../scripts/lib/redact');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scrub-'));
    fs.mkdirSync(path.join(dir, 'artifacts'));
    fs.writeFileSync(path.join(dir, 'artifacts', 'error-context.md'), '- textbox "Pwd field": hunter2-xyz\n- text: hunter2-xyz');
    const att = Buffer.from('- textbox "Password": hunter2-xyz').toString('base64');
    fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify({ suites: [{ attachments: [{ name: 'aria-snapshot', contentType: 'text/yaml', body: att }] }] }));
    fs.writeFileSync(path.join(dir, 'td.json'), '{"p":"${env:APP_LOGIN}"}');
    const found = secretValuesFor(path.join(dir, 'td.json'), { APP_LOGIN: 'hunter2-xyz', MY_API_KEY: 'k-123456', PATH: '/usr/bin' }, ['password', 'x9-secret']);
    // Only what the story references (never the whole environment); plain words are refused, not replaced everywhere.
    assert.deepEqual(found, { values: ['hunter2-xyz', 'x9-secret'], weak: ['--value'] });
    const secrets = found.values;
    assert.equal(scrubDir(dir, secrets).files, 2);
    assert.ok(!fs.readFileSync(path.join(dir, 'artifacts', 'error-context.md'), 'utf8').includes('hunter2'));
    const body = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8')).suites[0].attachments[0].body;
    assert.ok(!Buffer.from(body, 'base64').toString().includes('hunter2'));
    assert.equal(scrubDir(dir, secrets).files, 0, 'idempotent');
    fs.writeFileSync(path.join(dir, 'notes.md'), 'The wrong password error is shown.');
    assert.equal(scrubDir(dir, secrets).files, 0, 'ordinary words are never touched');
  });
});

describe('form-encoded reproductions', () => {
  it('renders form bodies as --data a=b&… with secrets as placeholders', () => {
    const c = curlFor({ request: { method: 'POST', url: 'https://x.test/api/verifyLogin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: { email: 'qa@example.com', password: '***redacted***' } }, response: { status: 200 } });
    assert.match(c, /--data 'email=qa%40example.com&password=<secret from test-data.json \/ .env>'/);
  });
});

describe('Git Bash path rewriting', () => {
  it('undoes MSYS rewriting of "/…" arguments', async () => {
    const { unmangleMsysPath, resolveUrl } = await import('../scripts/lib/config');
    assert.equal(unmangleMsysPath('C:/Program Files/Git/'), '/');
    assert.equal(unmangleMsysPath('C:\\Program Files\\Git\\products'), '/products');
    assert.equal(unmangleMsysPath('/health'), '/health');
    assert.equal(unmangleMsysPath('api;C:\\Program Files\\Git\\products'), 'api:/products');
    assert.equal(unmangleMsysPath('#C:/Program Files/Git/login'), '#/login'); // SPA hash route
    assert.equal(resolveUrl('https://x.test', 'C:/Program Files/Git/api/ping'), 'https://x.test/api/ping');
  });
});

describe('compact run digest', () => {
  it('lists failed and flaky tests with the first plain line of their last error', async () => {
    const { failedTests } = await import('../scripts/lib/triage-model');
    const results = { suites: [{ suites: [{ specs: [
      { title: 'SCN-001: ok', tests: [{ status: 'expected', results: [{}] }] },
      { title: 'SCN-002: broken', tests: [{ status: 'unexpected', results: [{ error: { message: '\u001b[31mError: [REQ AC-2] shown\u001b[39m\n\nExpected: 1' } }] }] },
      { title: 'SCN-003: wobbly', tests: [{ status: 'flaky', results: [{ error: { message: 'Timeout 5000ms exceeded.' } }, {}] }] },
    ] }] }] };
    assert.deepEqual(failedTests(results), [
      { title: 'SCN-002: broken', error: 'Error: [REQ AC-2] shown', flaky: false },
      { title: 'SCN-003: wobbly', error: 'Timeout 5000ms exceeded.', flaky: true },
    ]);
  });
});

describe('app discovery', () => {
  it('finds the app root of a page someone pasted, and keeps an app mounted under a folder', async () => {
    const { appRootOf } = await import('../scripts/lib/detect');
    const site = (titles: Record<string, string>) => async (u: string) => titles[u];
    assert.equal(await appRootOf('https://demoqa.com/books', site({ 'https://demoqa.com/books': 'demosite', 'https://demoqa.com/': 'demosite' })), 'https://demoqa.com/');
    assert.equal(await appRootOf('https://host.test/app/login', site({ 'https://host.test/app/login': 'Shop', 'https://host.test/': 'Company', 'https://host.test/app/': 'Shop' })), 'https://host.test/app/');
    assert.equal(await appRootOf('https://host.test/app/', site({ 'https://host.test/app/': 'Shop', 'https://host.test/': 'Other' })), 'https://host.test/app/');
    assert.equal(await appRootOf('https://host.test/', site({})), 'https://host.test/');
  });
  it('tells generated ids (new on every page load) from stable ones', async () => {
    const { generatedId } = await import('../scripts/lib/detect');
    assert.equal(generatedId('689bc902-233f-4fc5-add9-f49c5587a21e'), true);
    assert.equal(generatedId(':r3:'), true);
    assert.equal(generatedId('mat-input-104729'), true);
    for (const id of ['customer.firstName', 'loginButton', 'repeatedPassword', 'mat-input-3']) assert.equal(generatedId(id), false, id);
  });
  it('turns a page address copied from the browser into a base URL', async () => {
    const { baseUrlOf } = await import('../scripts/lib/detect');
    assert.equal(baseUrlOf('https://parabank.parasoft.com/parabank/index.htm'), 'https://parabank.parasoft.com/parabank/');
    assert.equal(baseUrlOf('http://localhost:3000/#/login'), 'http://localhost:3000/');
    assert.equal(baseUrlOf('https://app.test/shop?lang=en'), 'https://app.test/shop');
    assert.equal(baseUrlOf('https://api.test/v1.2'), 'https://api.test/v1.2'); // a version is not a file name
  });
  it('derives a readable profile id from the host', async () => {
    const { profileIdFor } = await import('../scripts/lib/detect');
    assert.equal(profileIdFor('https://demoqa.com'), 'demoqa');
    assert.equal(profileIdFor('https://www.saucedemo.com/'), 'saucedemo');
    assert.equal(profileIdFor('https://parabank.parasoft.com/parabank'), 'parabank');
    assert.equal(profileIdFor('https://thinking-tester-contact-list.herokuapp.com'), 'thinking-tester-contact-list');
    assert.equal(profileIdFor('https://demo.owasp-juice.shop'), 'owasp-juice');
    assert.equal(profileIdFor('https://staging.shop.example.com'), 'shop');
    assert.equal(profileIdFor('http://localhost:3000'), 'app');
    assert.equal(profileIdFor('http://10.0.0.7:8080'), 'app');
  });
  it('names the app from the title segment that names the host', async () => {
    const { appNameFrom } = await import('../scripts/lib/detect');
    assert.equal(appNameFrom('ParaBank | Welcome | Online Banking', 'parabank-parasoft'), 'ParaBank');
    assert.equal(appNameFrom('Swag Labs', 'saucedemo'), 'Swag Labs');
    assert.equal(appNameFrom('Automation Exercise - Signup / Login', 'automationexercise'), 'Automation Exercise');
    assert.equal(appNameFrom('', 'shop'), undefined);
  });
  it('recognises ad/analytics networks by domain, never the application itself', async () => {
    const { adDomainsOf } = await import('../scripts/lib/detect');
    assert.deepEqual(adDomainsOf(['demoqa.com', 'securepubads.g.doubleclick.net', 'pagead2.googlesyndication.com', 'www.googletagmanager.com', 'cdn.example.com', 'notdoubleclick.net']),
      ['doubleclick.net', 'googlesyndication.com', 'googletagmanager.com']);
  });
});

describe('command flags', () => {
  it('every flag a command documents in its usage header is accepted by the dispatcher', async () => {
    const { knownFlags } = await import('../scripts/lib/config');
    const dir = path.join(import.meta.dirname, '..', 'scripts');
    const rejected = fs.readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'heldout.ts').flatMap((f) => {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const header = src.match(/^\/\*\*([\s\S]*?)\*\//)?.[1] ?? '';
      const known = knownFlags(src);
      return [...new Set([...header.matchAll(/(?<![\w-])--([a-z][a-z-]+)/g)].map((m) => m[1]))].filter((d) => !known.has(d)).map((d) => `${f} --${d}`);
    });
    assert.deepEqual(rejected, []);
  });
});

describe('generated secrets', () => {
  it('are long, mixed and never plain words, so artifacts can be scrubbed of them', async () => {
    const { safeToScrub, strongSecret } = await import('../scripts/lib/redact');
    for (let i = 0; i < 50; i++) {
      const v = strongSecret();
      assert.equal(v.length, 20);
      assert.match(v, /[A-Z]/); assert.match(v, /[a-z]/); assert.match(v, /[0-9]/); assert.match(v, /[!@*]/);
      assert.ok(safeToScrub(v));
    }
  });
});

describe('accounts recipe from an api-probe chain', () => {
  it('maps the saved id/token steps, the DELETE, the ${uid} user name, the password and the UI sign-in steps', async () => {
    const { recipeFromChain } = await import('../scripts/lib/accounts');
    const chain = { steps: [
      { method: 'POST', path: 'Account/v1/User', json: { userName: 'qa-${uid}', password: '${env:APP_PW}' }, save: { id: 'userID' } },
      { method: 'POST', path: 'Account/v1/GenerateToken', json: { userName: 'qa-${uid}', password: '${env:APP_PW}' }, save: { token: 'token' } },
      { method: 'DELETE', path: 'Account/v1/User/${id}', headers: { Authorization: 'Bearer ${token}' } },
    ] };
    const signIn = { path: '/login', done: 'url:/profile', steps: [
      { do: 'fill', target: "getByPlaceholder('UserName')", value: '${var:user}' },
      { do: 'fill', target: "getByPlaceholder('Password')", value: '${env:APP_PW}' },
      { do: 'click', target: "getByRole('button', { name: 'Login' })" },
      { do: 'wait', target: "getByText('Books')" },
    ] };
    assert.deepEqual(recipeFromChain(chain as never, signIn), {
      password: '${env:APP_PW}', username: 'qa-${uid}',
      create: { method: 'POST', path: '/Account/v1/User', body: { userName: '${username}', password: '${password}' }, id: 'userID' },
      token: { method: 'POST', path: '/Account/v1/GenerateToken', body: { userName: '${username}', password: '${password}' }, token: 'token' },
      authHeader: 'Authorization: Bearer ${token}',
      delete: { method: 'DELETE', path: '/Account/v1/User/${id}' },
      signIn: { path: '/login', done: 'url:/profile', steps: [
        { fill: "getByPlaceholder('UserName')", value: '${username}' },
        { fill: "getByPlaceholder('Password')", value: '${password}' },
        { click: "getByRole('button', { name: 'Login' })" },
      ] },
    });
  });
  it('refuses a chain that never saves the new id', async () => {
    const { recipeFromChain } = await import('../scripts/lib/accounts');
    assert.throws(() => recipeFromChain({ steps: [{ method: 'POST', path: 'users', json: { p: '${env:X}' } }] }), /a step saving "id"/);
  });
});
