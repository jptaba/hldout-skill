/**
 * Phase 2 — the tests of a story, generated from the checks of its contract (2-contract/contract.json).
 *
 *   heldout scaffold KEY [--force]
 *
 * What it writes in 3-tests/ (never overwrites unless forced):
 *   <key>.spec.ts       one test per check (one per row of a check with rows): its tags, its "// from" source, its
 *                       steps in the contract's words, each empty and marked TODO(harden), and each expectation as
 *                       expectCheck(id, actual). No expected value: the contract is its only place.
 *   test-data.json      the values the specs read via `data`; the contract's test-user secret as ${env:NAME}
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Args, CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { ROOT, rel, writeFile } from '../core/files';
import { evalPaths, journeyPaths } from '../core/paths';
import { checksOf, hasChecks, type Expectation } from '../contract/checks';
import { openQuestions, readContract, toDiscover, type RequirementContract } from '../contract/contract-model';

const COMPARATOR_WORDS: Record<Expectation['comparator'], string> = {
  equals: 'is', contains: 'contains', matches: 'reads like', 'one-of': 'is one of', 'at-least': 'is at least', 'at-most': 'is at most', status: 'is', absent: 'is not there', present: 'is there', ordered: 'is in', distinct: 'holds no item twice', 'same-as': 'are the same',
};
const lit = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\s+/g, ' ').trim();
const shown = (v: Expectation['value']) => (v === undefined ? '' : ` ${Array.isArray(v) ? v.join(', ') : String(v)}`);

/**
 * The whole spec of a story: one test per check (one per row of a check with rows), its steps in the contract's
 * words, and each expectation asserted by reference. No expected value is written here: whoever makes the tests run
 * fills in how each step is done and where each actual value is read, nothing else.
 */
export function specFromChecks(c: RequirementContract, at: { key: string; fixtures: string; journeys: string; journeysDir: string }): string {
  const gaps = new Map(c.gaps.map((g) => [g.id, g]));
  const variantKeys = (c.variants ?? []).map((v) => v.key);
  const lines: string[] = [
    '/**',
    ` * Held-out acceptance tests for ${at.key} — "${c.title}".`,
    ' * Generated from the checks of the reviewed requirement contract (2-contract/contract.json), which holds what',
    ' * each test expects: here, expectCheck(id, actual) names an expectation and never states it. The steps call the',
    ` * journeys in ${at.journeysDir}/ (npm run heldout -- journeys ${at.key}).`,
    ' */',
    `import { test, expectCheck, rowsOf } from '${at.fixtures}';`,
    `// Journeys: import { … } from '${at.journeys}/<domain>' (e.g. '${at.journeys}/products').`,
    '',
    ...c.gaps.filter((g) => g.resolution === 'assumed').map((g) => `// ASSUMPTION: ${g.id} — ${g.element}: ${g.value ?? ''}`),
    ...openQuestions(c).map((g) => `// OPEN-QUESTION: ${g.id} — ${g.element}`),
    '',
    `test.describe('${lit(`${at.key} ${c.title}`)}', () => {`,
  ];
  let n = 0;
  for (const ac of c.acceptanceCriteria) for (const k of ac.checks ?? []) {
    const scn = `SCN-${String(++n).padStart(3, '0')}`;
    const rows = Boolean(k.rows?.length);
    // Only what is correct can be unsettled: a gap about how the application is operated, or one the sources or
    // the owner answered, leaves the check's failure a plain failure.
    const rests = (k.restsOn ?? []).map((g) => gaps.get(g)).filter((g) => g?.kind === 'oracle' && (g.resolution === 'assumed' || g.resolution === 'open'))
      .map((g) => (g!.resolution === 'assumed' ? `'@assumes:${g!.id}'` : "'@needs-clarification'"));
    const tags = [`'@${ac.id}'`, `'@type:${k.type}'`, `'@layer:${k.layer}'`, "'@P1'", ...new Set(rests)].join(', ');
    const pad = rows ? '  ' : '';
    const step = (kind: string, text: string, body: string[]) => [`${pad}    await journey.step('${kind} ${lit(text)}', async () => {`, ...body.map((b) => `${pad}      ${b}`), `${pad}    });`];
    lines.push(`  // from ${[...new Set(k.expect.map((e) => e.source))].join(', ')}`, `  // check ${k.id}`);
    // A row that names a value of one of the contract's variants is the test of that setup: tagged, so the verdict's
    // setups table counts it.
    const variantTags = variantKeys.length ? `, ...Object.entries(row.values ?? {}).filter(([k]) => ${JSON.stringify(variantKeys).replace(/"/g, "'")}.includes(k)).map(([k, v]) => \`@variant:\${k}=\${String(v)}\`)` : '';
    if (rows) lines.push(`  for (const [i, row] of rowsOf('${k.id}').entries()) {`, `    test(\`${scn}.\${i + 1}: ${lit(k.title).replace(/`/g, "'")} (\${row.label})\`, { tag: [${tags}${variantTags}] }, async ({ ${k.layer === 'api' ? '' : 'page, '}api, journey, data, seed }) => {`);
    else lines.push(`  test('${scn}: ${lit(k.title)}', { tag: [${tags}] }, async ({ ${k.layer === 'api' ? '' : 'page, '}api, journey, data, seed }) => {`);
    for (const g of k.given) lines.push(...step('Given', g, [`// TODO(harden) reach this state${rows ? ' (this row\'s input: row.values)' : ''}: call a journey, or add one`]));
    for (const w of k.when) lines.push(...step('When', w, [`// TODO(harden) do this${rows ? ' (this row\'s input: row.values)' : ''}: call a journey, or add one`]));
    for (const e of k.expect) {
      lines.push(...step('Then', `${e.what} ${COMPARATOR_WORDS[e.comparator]}${rows && k.rows!.some((r) => r.expect?.[e.id] !== undefined) ? ' what this row states' : `${shown(e.value)}${e.comparator === 'ordered' ? ' order' : ''}`}`, [
        `// TODO(harden) read ${lit(e.what)} from what the application answered or shows`,
        'const actual: unknown = undefined;',
        `expectCheck('${e.id}', actual${rows ? ', row' : ''});`,
      ]));
    }
    lines.push(rows ? '    });' : '  });', ...(rows ? ['  }'] : []), '');
  }
  lines.push('});', '');
  return lines.join('\n');
}

export const spec: CommandSpec = {
  name: 'scaffold', group: 'Tests', usage: 'KEY [--force]',
  about: 'the tests of a story, generated from its contract\'s checks, and its test data',
  flags: ['force'],
};

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const c = readContract(p.contract);
  if (!c) throw new Error(`No requirement contract for ${key} (${rel(p.contract)}) — run: heldout contract ${key} --pack, then the extractor and reviewer subagents`);
  if (!hasChecks(c)) throw new Error(`The contract of ${key} has no checks to generate the tests from: the extractor adds them (references/requirement-contract.md, "Checks")`);

  // Test data the specs read through the `data` fixture; secrets as ${env:NAME}, never literal.
  if (!fs.existsSync(p.testData)) {
    // The secret the contract names for test users (auth.credentials / testData), e.g. "password from PB_USER_PASSWORD".
    const secret = JSON.stringify([c.auth, c.testData]).match(/\b[A-Z][A-Z0-9]*_(?:[A-Z0-9]+_)*(?:PASSWORD|PASS|TOKEN|SECRET)\b/)?.[0];
    writeFile(p.testData, `${JSON.stringify(secret ? { password: `\${env:${secret}}` } : {}, null, 2)}\n`);
    console.log(`✔ created ${rel(p.testData)}${secret ? ` (password → \${env:${secret}})` : ''} — add the values your tests need`);
    if (secret && !process.env[secret]) console.log(`• next: set ${secret}. For accounts the tests create themselves: npm run heldout -- secret ${secret} --generate. For an existing account, add ${secret}=… to .env.`);
  }

  const discover = toDiscover(c);
  if (discover.length) console.log(`• discover while hardening (record discovered-in-aut + evidence in the contract): ${discover.map((g) => `${g.id} ${g.element}`).join('; ')}`);

  const specFile = path.join(p.tests, `${key.toLowerCase()}.spec.ts`);
  const anySpec = fs.existsSync(p.tests) && fs.readdirSync(p.tests).some((f) => f.endsWith('.spec.ts'));
  if (anySpec && !flags.force) { console.log(`• keep    ${rel(p.tests)}/ (a spec exists; --force to regenerate)`); return; }
  const fixtures = path.relative(p.tests, path.join(ROOT, 'heldout-support', 'fixtures')).split(path.sep).join('/');
  writeFile(specFile, specFromChecks(c, { key, fixtures: fixtures.startsWith('.') ? fixtures : `./${fixtures}`, journeys: path.relative(p.tests, journeyPaths(cfg, cfg.autId).fixtures).split(path.sep).join('/'), journeysDir: rel(journeyPaths(cfg, cfg.autId).fixtures) }));
  console.log(`✔ created ${rel(specFile)} — ${checksOf(c).length} check(s) of ${c.acceptanceCriteria.length} criteria as tests; what they expect stays in ${rel(p.contract)}`);
}
