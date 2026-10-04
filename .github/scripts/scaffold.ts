/**
 * Phase 2 head start — a spec skeleton and the test data from requirement-contract.json.
 *
 *   heldout scaffold KEY [--force]
 *
 * What it writes (never overwrites unless forced):
 *   tests/<key>.spec.ts imports (the shared fixtures and where the journey fixtures are), the ASSUMPTION / OPEN-QUESTION
 *                       lines of the contract's gaps, an empty @req-constants block, typed endpoint helpers, and one
 *                       test stub per criterion with its "// from" source and tags. Stubs are TODO(test): the lint
 *                       refuses them until implemented, and a criterion may need several tests (one @type each).
 *   test-data.json      the values the specs read via `data`; the contract's test-user secret as ${env:NAME}
 *   hardening/hardening-log.md  a template the hardener fills in
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, assertIssueKey, createsAccounts, evalPaths, journeyPaths, loadConfig, main, parseArgs, rel, writeFile } from './config';
import { openQuestions, readContract, toDiscover, type ContractAC, type ContractEndpoint } from './contract-model';
import { TEST_TYPES } from './spec-model';


/** "/api/articles/{slug}/comments/{id}" → { name: "articleComment", params: ["slug", "id"] } */
function endpointHelper(e: ContractEndpoint): { name: string; params: string[]; body: string } {
  const segs = e.path.split('/').filter(Boolean).filter((s) => s !== 'api' && !/^v\d+$/.test(s));
  const params = [...e.path.matchAll(/\{([^}]+)\}|:([A-Za-z_]\w*)/g)].map((m) => (m[1] ?? m[2]).replace(/\W/g, '_'));
  const words = segs.filter((s) => !/^\{|^:/.test(s)).map((s) => s.replace(/[^A-Za-z0-9]+(.)/g, (_, c: string) => c.toUpperCase()));
  let name = words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w.toLowerCase())).join('') || 'root';
  if (params.length) name += `By${params.map((p) => p[0].toUpperCase() + p.slice(1)).join('And')}`;
  const body = e.path.replace(/\{([^}]+)\}|:([A-Za-z_]\w*)/g, (_m, a: string, b: string) => `\${${(a ?? b).replace(/\W/g, '_')}}`);
  return { name, params, body };
}

const shortTitle = (ac: ContractAC) => {
  const t = ac.text.replace(/`/g, '').replace(/\s+/g, ' ').trim();
  // A criterion written as a Gherkin scenario: its title (up to the first step), without the keyword.
  const scenario = t.match(/^Scenario(?: Outline)?:\s*(.+?)(?:[.:]?\s+(?:Given|When|Then)\b|\.\s|$)/);
  const title = scenario ? scenario[1].trim() : t;
  return title.length > 90 ? `${title.slice(0, 87).replace(/\s+\S*$/, '')}…` : title;
};

main(() => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const c = readContract(p.base);
  if (!c) throw new Error(`No requirement-contract.json for ${key} — run: heldout contract ${key} --pack, then the extractor and reviewer subagents`);

  // Test data the specs read through the `data` fixture; secrets as ${env:NAME}, never literal.
  if (!fs.existsSync(p.testData)) {
    // The secret the contract names for test users (auth.credentials / testData), e.g. "password from PB_USER_PASSWORD".
    const secret = JSON.stringify([c.auth, c.testData]).match(/\b[A-Z][A-Z0-9]*_(?:[A-Z0-9]+_)*(?:PASSWORD|PASS|TOKEN|SECRET)\b/)?.[0];
    writeFile(p.testData, `${JSON.stringify(secret ? { password: `\${env:${secret}}` } : {}, null, 2)}\n`);
    console.log(`✔ created ${rel(p.testData)}${secret ? ` (password → \${env:${secret}})` : ''} — add the values your tests need`);
    if (secret && !process.env[secret]) console.log(`• next: set ${secret}. For accounts the tests create themselves: npm run heldout -- secret ${secret} --generate. For an existing account, add ${secret}=… to .env.`);
  }

  if (!fs.existsSync(p.hardeningLog)) {
    writeFile(p.hardeningLog, [`# Hardening log — ${key}`, '', '**Tiers used:** ', '', '| Change | Why | Evidence |', '| --- | --- | --- |', ''].join('\n'));
    console.log(`✔ created ${rel(p.hardeningLog)} — a template: fill it in while hardening (the verdict quotes its "Tiers used" line)`);
  }

  const discover = toDiscover(c);
  if (discover.length) console.log(`• discover while hardening (record discovered-in-aut + evidence in the contract): ${discover.map((g) => `${g.id} ${g.element}`).join('; ')}`);

  // ---- spec skeleton ------------------------------------------------------------------------------
  const specFile = path.join(p.tests, `${key.toLowerCase()}.spec.ts`);
  const anySpec = fs.existsSync(p.tests) && fs.readdirSync(p.tests).some((f) => f.endsWith('.spec.ts'));
  if (anySpec && !flags.force) { console.log(`• keep    ${rel(p.tests)}/ (a spec exists; --force to regenerate)`); return; }
  const fixtures = path.relative(p.tests, path.join(ROOT, 'heldout-support', 'fixtures')).split(path.sep).join('/');
  const journeys = path.relative(p.tests, journeyPaths(cfg, cfg.autId).base).split(path.sep).join('/');
  // One helper per path (all methods on it listed in its comment).
  const byPath = new Map<string, ContractEndpoint[]>();
  for (const e of c.endpoints) byPath.set(e.path, [...(byPath.get(e.path) ?? []), e]);
  const seen = new Set<string>();
  const epLines = [...byPath.entries()].map(([p0, es]) => {
    const h = endpointHelper(es[0]);
    let name = h.name;
    while (seen.has(name)) name += '_';
    seen.add(name);
    const doc = `/** ${es.map((e) => e.method).join(', ')} ${p0} */`;
    return h.params.length
      ? `  ${doc} ${name}: (${h.params.map((x) => `${x}: string | number`).join(', ')}) => \`${h.body}\`,`
      : `  ${doc} ${name}: '${p0}',`;
  });
  const hasUi = c.acceptanceCriteria.some((a) => a.layer !== 'api');
  const accounts = Boolean(cfg.aut.accounts);
  const creates = createsAccounts(cfg.aut.accounts);
  const existing = cfg.aut.accounts?.existing?.length ?? 0;
  const whoAccounts = creates
    ? `makes a test user on ${cfg.aut.name} (the profile's recipe; ${cfg.aut.accounts?.delete ? 'deleted after the test' : 'kept after the test, named so it can be found'})`
    : `hands this test one of the ${existing} existing test accounts on ${cfg.aut.name}, for it alone; the accounts are shared with later runs and never deleted, so leave their data as you found it`;
  const open = openQuestions(c);
  const spec = [
    '/**',
    ` * Held-out acceptance tests for ${key} — "${c.title}".`,
    ' * Written from requirement-contract.json (the requirement only; never from the AUT\'s code). The steps call the',
    ` * journey fixtures in ${rel(journeyPaths(cfg, cfg.autId).base)}/ (npm run heldout -- journeys ${key}); every expectation stays here.`,
    ' */',
    `import { test, expect${c.endpoints.length ? ', expectResponse' : ''}${hasUi ? ', gotoPage' : ''}${accounts && hasUi ? ', signIn' : ''}, checkShape, type Api, type ApiResponse, type Seed, type TestData${accounts ? ', type Account' : ''} } from '${fixtures.startsWith('.') ? fixtures : `./${fixtures}`}';`,
    `// Journey fixtures: import { … } from '${journeys}/api/<domain>' and '${journeys}/ui/<domain>'.`,
    ...(accounts ? [
      '',
      `// Accounts: \`const me = await seed.account()\` ${whoAccounts}.`,
      `// \`me.headers\` authenticates API calls as it${hasUi ? '; `await signIn(page, me)` signs in through the UI (then `await me.refresh()` before more API calls)' : ''}.`,
    ] : []),
    '',
    ...c.gaps.filter((g) => g.resolution === 'assumed').map((g) => `// ASSUMPTION: ${g.id} — ${g.element}: ${g.value ?? ''}`),
    ...open.map((g) => `// OPEN-QUESTION: ${g.id} — ${g.element}`),
    ...(c.gaps.some((g) => g.resolution === 'assumed') || open.length ? [''] : []),
    `// @req-constants-start — expected outcomes copied verbatim from ${key} (never edit during hardening)`,
    'const REQ = {',
    ...[...new Set(c.errorModel.map((e) => e.status).filter(Boolean))].length ? [`  STATUS: { ${[...new Set([...c.endpoints.map((e) => Number(e.success?.match(/\b[1-5]\d\d\b/)?.[0])), ...c.errorModel.map((e) => e.status)].filter((s): s is number => Boolean(s)))].sort().map((s) => `S${s}: ${s}`).join(', ')} },`] : [],
    '  // TODO(test) copy the remaining expected values (messages, limits, rules) from the contract',
    '} as const;',
    '// @req-constants-end',
    '',
    '// Endpoints exactly as declared in the requirement.',
    'const EP = {',
    ...epLines,
    '};',
    '',
    `test.describe('${key} ${c.title.replace(/'/g, "\\'")}', () => {`,
    ...c.acceptanceCriteria.flatMap((ac, i) => [
      `  // from ${ac.source}`,
      // The test type is a judgement about the test you write (a refusal is negative, a limit is boundary…): no default.
      `  // TODO(test) add '@type:<${TEST_TYPES.join('|')}>'; a criterion may need several tests (one @type each)`,
      `  test('SCN-${String(i + 1).padStart(3, '0')}: ${shortTitle(ac).replace(/'/g, "\\'")}', { tag: ['@${ac.id}', '@layer:${ac.layer}', '@P1'${open.some((g) => g.required && g.affects.includes(ac.id)) ? ", '@needs-clarification'" : ''}] }, async ({ ${ac.layer === 'api' ? '' : 'page, '}api, journey, data, seed }) => {`,
      `    // TODO(test) journey.step('Given …' / 'When …' / 'Then …') for each step; seed preconditions with seed.* (or a journey fixture); assert with "[REQ ${ac.id}] …" messages${ac.layer !== 'ui' && c.endpoints.length ? ` (API answers: expectResponse(res, { status, body }, '[REQ ${ac.id}] <METHOD /path> …'))` : ''}`,
      ...(ac.outcomes.length ? [`    // Then: ${ac.outcomes.join(' · ')}`] : []),
      '  });',
      '',
    ]),
    '});',
    '',
    '// Unused until the stubs are implemented:',
    `void [EP, REQ, checkShape${c.endpoints.length ? ', expectResponse' : ''}${accounts && hasUi ? ', signIn' : ''}] as unknown as [Api, ApiResponse, Seed, TestData${accounts ? ', Account' : ''}];`,
    '',
  ].join('\n');
  writeFile(specFile, spec);
  console.log(`✔ created ${rel(specFile)} — ${c.acceptanceCriteria.length} test stub(s), ${c.endpoints.length} endpoint helper(s)`);
  if (accounts) console.log(`• accounts: seed.account() uses the "${cfg.autId}" profile's recipe — no seeding code needed for test users${creates ? '' : ` (${existing} existing account(s), shared with later runs: each test leaves the data it changed as it found it)`}`);
  else if (/\b(creat|regist|sign ?up)\w*\b[^.]*\b(user|account|customer)/i.test(JSON.stringify([c.testData, c.auth]))) {
    console.log(`• the tests make their own accounts: once hardening has found how (create, sign in, delete), save it as auts.${cfg.autId}.accounts in heldout.config.json — then seed.account() does it for this and every later story (references/data-and-journeys.md)`);
  }
  console.log(`\nNext: the journey fixtures you can call (heldout journeys ${key}); write the tests, then: heldout lint ${key} --allow-unhardened`);
});
