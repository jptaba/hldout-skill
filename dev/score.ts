/**
 * Evaluator scorecard — tests the held-out evaluator itself against machine-readable answer keys.
 *
 *   npx tsx dev/score.ts [KEY ...]        (default: every demo/answer-keys/*.json)
 *   npx tsx dev/score.ts [KEY ...] --from <project>
 *        score the evaluations of another project (a round's fresh onboarding) and print the full scorecard
 *        instead of writing demo/SCORECARD.md (default: the stories evaluated there)
 *
 * Per story it measures:
 *   - verdict match (expected vs rendered)
 *   - application-defect recall (expected defects matched by a confirmed finding) and precision
 *     (confirmed findings that match an expected defect; the rest are false positives)
 *   - expected defects the evaluator surfaced as readings the application contradicts (owner questions, not defects)
 *   - automatic-triage agreement: auto category vs confirmed category, over every failure the
 *     evaluator confirmed in non-harden runs (how often the heuristics were right before a human/AI look)
 * Writes demo/SCORECARD.md. The answer keys live outside the skill; the evaluator never reads them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PHASE_FOLDERS } from '../.github/scripts/core/paths';
import { readRunRecord } from '../.github/scripts/triage/triage-model';
import { KEYS_DIR, pinProblems, readPins } from './answer-keys';
import { matchDefects } from './score-match';

interface Key {
  /** The file it was read from (the pin is by file). */
  file: string;
  key: string; aut: string; expectedVerdict: string;
  defects: { id: string; criteria: string[]; origin: string; keywords: string[]; description: string }[];
  seededScriptDefects: { id: string; keywords: string[]; description: string }[];
  traps?: string[]; expectations?: string[];
}
interface Finding { id: string; title: string; confirmed: boolean; criteria: string[]; expected: string | null; actual: string | null; rationale?: string | null }
interface Reading { test: string; title: string; criteria: string[]; restsOn: string[]; expected: string | null; actual: string | null; rationale?: string | null }
interface Verdict { verdict: string; applicationDefects: Finding[]; contradictedReadings?: Reading[]; summary: { total: number; passed: number; failed: number } }
interface Entry { scenario: string; status: string; error?: { headline: string }; auto?: { category: string }; final?: { category: string; rationale: string; action?: string; title?: string } }

const REPO = path.resolve(import.meta.dirname, '..');
const keysDir = KEYS_DIR;
// A score is measured against a pinned key: an edited one is refused (re-pin it, with its ADR, in the same commit).
const unpinned = pinProblems();
if (unpinned.length) throw new Error(`the answer keys don't match their pins (demo/answer-keys/HASHES):\n  ${unpinned.join('\n  ')}`);
const pins = readPins();
const args = process.argv.slice(2);
const fromAt = args.indexOf('--from');
const from = fromAt >= 0 ? path.resolve(args[fromAt + 1] ?? '') : undefined;
if (from && !fs.existsSync(path.join(from, 'output'))) throw new Error(`--from ${from}: no output/ folder there`);
const ROOT = from ?? REPO;
/** A story's folder: output/<profile>/<KEY>/, whichever profile it was evaluated under. */
const storyDir = (key: string): string | undefined => {
  const out = path.join(ROOT, 'output');
  if (!fs.existsSync(out)) return undefined;
  return fs.readdirSync(out).map((p) => path.join(out, p, key)).find((d) => fs.existsSync(d));
};
const wanted = args.filter((_, i) => fromAt < 0 || (i !== fromAt && i !== fromAt + 1));
const keys: Key[] = fs.readdirSync(keysDir).filter((f) => f.endsWith('.json'))
  .map((f) => ({ ...JSON.parse(fs.readFileSync(path.join(keysDir, f), 'utf8')) as Key, file: f }))
  .filter((k) => (wanted.length ? wanted.includes(k.key) : !from || Boolean(storyDir(k.key))));

const text = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ').toLowerCase();
const hit = (hay: string, keywords: string[]) => keywords.some((k) => hay.includes(k.toLowerCase()));
const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : 'n/a');

const rows: string[] = [];
const details: string[] = [];
let totals = { expected: 0, tp: 0, asked: 0, fp: 0, confirmed: 0, autoN: 0, autoAgree: 0, autoWrong: 0, verdictOk: 0, stories: 0 };

for (const k of keys) {
  const base = storyDir(k.key) ?? path.join(ROOT, 'output', k.aut, k.key);
  const [, , , , RUNS, , VERDICT] = PHASE_FOLDERS;
  const vFile = path.join(base, VERDICT, 'verdict.json');
  if (!fs.existsSync(vFile)) { rows.push(`| ${k.key} | ${k.aut} | ${k.expectedVerdict} | _not evaluated_ | | | |`); continue; }
  const v = JSON.parse(fs.readFileSync(vFile, 'utf8')) as Verdict;
  const confirmed = v.applicationDefects.filter((f) => f.confirmed);

  // defects: match each expected defect to its best confirmed finding (dev/score-match.ts), else to a reading the
  // application contradicts (the evaluator surfaced it, as a question for the owner, because the requirement was
  // judged not to settle it: found, but not counted as a defect).
  const { best, unmatched } = matchDefects(k.defects, confirmed.map((x) => ({ criteria: x.criteria, words: text(x.title, x.expected, x.actual, x.rationale) })));
  const defectResults = k.defects.map((d, i) => {
    const f = best[i] >= 0 ? confirmed[best[i]] : undefined;
    const q = f ? undefined : (v.contradictedReadings ?? []).find((x) => x.criteria.some((c) => d.criteria.includes(c)) && hit(text(x.title, x.expected, x.actual, x.rationale), d.keywords));
    return { d, f, q };
  });
  const tp = defectResults.filter((r) => r.f).length;
  const asked = defectResults.filter((r) => r.q).length;
  const fps = unmatched.map((i) => confirmed[i]);

  // runs: auto-triage agreement. (An answer key's seededScriptDefects belong to drafts planted by hand; the test author
  // writes its own draft, so there is nothing seeded to detect.)
  // Each run's record (5-run/NN-label.json) holds its tests and their automatic class; the triager's decisions are read in with it.
  const runsDir = path.join(base, RUNS);
  const runs = fs.existsSync(runsDir) ? fs.readdirSync(runsDir).filter((r) => /^\d+-[\w-]+\.json$/.test(r) && !/^\d+-(harden|repro|probe|robustness)/.test(r)).sort() : [];
  const entries: (Entry & { run: string })[] = runs.flatMap((r) => (readRunRecord(path.join(runsDir, r)).entries as Entry[]).map((e) => ({ ...e, run: r.replace(/\.json$/, '') })));
  // agreement: first occurrence of each (scenario, final) pair, so carried-over repeats don't inflate the score
  const seen = new Set<string>();
  const judged = entries.filter((e) => e.final && e.auto && e.status !== 'passed').filter((e) => { const id = `${e.scenario}|${e.final!.category}|${e.error?.headline}`; if (seen.has(id)) return false; seen.add(id); return true; });
  const agree = judged.filter((e) => e.auto!.category === e.final!.category);
  // "abstained" = the heuristics said "needs investigation"/"blocked" (honest uncertainty); "wrong" = a confident, different category.
  const abstained = judged.filter((e) => e.auto!.category !== e.final!.category && ['NEEDS_INVESTIGATION', 'BLOCKED'].includes(e.auto!.category));
  const wrong = judged.filter((e) => e.auto!.category !== e.final!.category && !abstained.includes(e));

  const verdictOk = v.verdict === k.expectedVerdict;
  totals = { expected: totals.expected + k.defects.length, tp: totals.tp + tp, asked: totals.asked + asked, fp: totals.fp + fps.length, confirmed: totals.confirmed + confirmed.length,
    autoN: totals.autoN + judged.length, autoAgree: totals.autoAgree + agree.length, autoWrong: totals.autoWrong + wrong.length,
    verdictOk: totals.verdictOk + (verdictOk ? 1 : 0), stories: totals.stories + 1 };

  rows.push(`| ${k.key} | ${k.aut} | ${k.expectedVerdict} | ${verdictOk ? '✅' : '❌'} ${v.verdict} | ${tp}/${k.defects.length} (${pct(tp, k.defects.length)})${asked ? ` + ${asked} as owner question` : ''} | ${fps.length} | ${agree.length}/${judged.length} (${pct(agree.length, judged.length)}) · abstained ${abstained.length} · wrong ${wrong.length} |`);
  details.push(`## ${k.key} (${k.aut})`, '',
    `Verdict: expected **${k.expectedVerdict}**, got **${v.verdict}** ${verdictOk ? '✅' : '❌'} · tests ${v.summary.passed}/${v.summary.total} passed · key \`${k.file}\` sha256:${(pins.get(k.file) ?? '?').slice(0, 12)}`, '',
    ...(k.defects.length ? ['| Expected defect | Criteria | Origin | Matched finding |', '| --- | --- | --- | --- |',
      ...defectResults.map(({ d, f, q }) => `| ${d.id} ${d.description} | ${d.criteria.join(', ')} | ${d.origin} | ${f ? `✅ ${f.id}: ${f.title}` : q ? `❔ surfaced as a reading the app contradicts (${q.test}, rests on ${q.restsOn.join(', ')}): a question for the owner, not a defect` : '❌ missed'} |`), ''] : ['_No defects expected._', '']),
    ...(fps.length ? ['**False positives (confirmed findings not in the answer key):**', '', ...fps.map((f) => `- ❌ ${f.id}: ${f.title} (${f.criteria.join(', ')})`), ''] : ['False positives: none ✅', '']),
    ...(judged.length ? ['| Test | Run | Auto triage | Confirmed | |', '| --- | --- | --- | --- | --- |',
      ...judged.map((e) => `| ${e.scenario} | \`${e.run}\` | ${e.auto!.category} | ${e.final!.category} | ${e.auto!.category === e.final!.category ? '✅' : abstained.includes(e) ? "➖ abstained (needed investigation)" : "❌ wrong"} |`), ''] : []),
    ...(k.traps?.length ? ['Traps in this AUT: ' + k.traps.map((t) => `_${t}_`).join('; '), ''] : []));
}

const md = [
  '# Held-out evaluator — scorecard', '',
  `Generated ${new Date().toISOString()} by \`dev/score.ts\` from \`demo/answer-keys/*.json\` (written before each evaluation)${from ? `, for the evaluations in ${from}` : ''}.`, '',
  '| Story | AUT | Expected verdict | Actual verdict | Defects found (recall) | False positives | Auto-triage vs confirmed decision |',
  '| --- | --- | --- | --- | --- | --- | --- |', ...rows,
  `| **Total** | | | ${totals.verdictOk}/${totals.stories} verdicts | ${totals.tp}/${totals.expected} (${pct(totals.tp, totals.expected)})${totals.asked ? ` + ${totals.asked} as owner question` : ''} | ${totals.fp} | ${totals.autoAgree}/${totals.autoN} (${pct(totals.autoAgree, totals.autoN)}) · wrong ${totals.autoWrong} |`, '',
  // Per finding: one finding may cover two of a key's defects, and two findings one.
  `Precision: ${pct(totals.confirmed - totals.fp, totals.confirmed)} (${totals.confirmed - totals.fp} of ${totals.confirmed} confirmed findings are real).`, '',
  ...details,
].join('\n');
if (from) console.log(md);
else {
  fs.writeFileSync(path.join(REPO, 'demo', 'SCORECARD.md'), md);
  console.log(md.split('\n').slice(0, 7 + rows.length + 3).join('\n'));
}
