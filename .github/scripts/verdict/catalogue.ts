/**
 * The test catalogue (7-verdict/catalogue.md): every check of the story in plain words, for a reader who doesn't read
 * code and for QA who repeats one by hand: the starting state, what is done, what is expected and the line of the
 * story that says so, the result in the final run, and the command that runs it again. Rendered from the reviewed
 * contract's checks and the run, so it can't describe a test other than the one that ran.
 */
import { checksOf, type Expectation } from '../contract/checks';
import type { RequirementContract } from '../contract/contract-model';
import type { TriageEntry } from '../run/run-record';
import { rerunCommand } from '../triage/repro';

const WORDS: Record<Expectation['comparator'], string> = {
  equals: 'is', contains: 'contains', matches: 'reads like', 'one-of': 'is one of', 'at-least': 'is at least', 'at-most': 'is at most', status: 'is',
  absent: 'is not there', present: 'is there', ordered: 'is in this order:', distinct: 'holds no item twice', 'same-as': 'are the same',
};
const valueOf = (v: Expectation['value']) => (v === undefined ? '' : ` ${Array.isArray(v) ? v.map(String).join(' / ') : String(v)}`);
const RESULT: Record<string, string> = { passed: '✅ passed', failed: '❌ failed', flaky: '⚠️ flaky', skipped: '⏭ did not run' };

/** The tests of each check, as the generated spec numbers them: SCN-001 for the first check, SCN-001.2 for its second row. */
export const scenarioOfCheck = (index: number) => `SCN-${String(index + 1).padStart(3, '0')}`;

export function renderCatalogue(key: string, c: RequirementContract, run: { name: string; entries: Pick<TriageEntry, 'scenario' | 'status'>[] } | undefined): string {
  const checks = checksOf(c);
  const md = [
    `# What was tested — ${key}`, '',
    `Every check of the story, in the words of its reviewed contract. ${run ? `Results are those of run \`${run.name}\`.` : 'No run yet.'}`,
    `Run every check again: \`npm run heldout -- run ${key} --label repro\` (the application must be up and the project's \`.env\` set).`, '',
  ];
  let i = 0;
  for (const ac of c.acceptanceCriteria) {
    const own = checks.filter((x) => x.ac === ac.id);
    md.push(`## ${ac.id} — ${ac.text}`, '');
    if (!own.length) { md.push('_Not tested: this criterion has no check._', ''); continue; }
    for (const { check } of own) {
      const scn = scenarioOfCheck(i++);
      const ran = run?.entries.filter((e) => e.scenario === scn || e.scenario.startsWith(`${scn}.`)) ?? [];
      const result = !run ? 'not run yet' : !ran.length ? 'not in the run' : ran.every((e) => e.status === ran[0].status) ? RESULT[ran[0].status] ?? ran[0].status : ran.map((e) => `${e.scenario} ${RESULT[e.status] ?? e.status}`).join(', ');
      md.push(`### ${check.id} · ${scn} — ${check.title}`, '',
        `${check.layer === 'api' ? 'Through the API' : 'In the browser'}. **Result:** ${result}.`, '',
        ...check.given.map((g) => `- Given ${g}`), ...check.when.map((w) => `- When ${w}`),
        ...check.expect.map((e) => `- Then ${e.what} ${WORDS[e.comparator]}${check.rows?.some((r) => r.expect?.[e.id] !== undefined) ? ' what each case states' : valueOf(e.value)} — the story, ${e.source}`), '');
      if (check.rows?.length) {
        md.push('| Case | Input | Expected |', '| --- | --- | --- |',
          ...check.rows.map((r) => `| ${r.label} | ${Object.entries(r.values ?? {}).map(([k, v]) => `${k}: ${String(v)}`).join(', ') || '-'} | ${Object.entries(r.expect ?? {}).map(([k, v]) => `${k}: ${String(v)}`).join(', ') || 'as above'} |`), '');
      }
      // A check with rows is a test per row: SCN-002.1, SCN-002.2.
      md.push(`Run it again: \`${check.rows?.length ? rerunCommand(key, scn).replace(/:"$/, '[.:]"') : rerunCommand(key, scn)}\``, '');
    }
  }
  return md.join('\n');
}
