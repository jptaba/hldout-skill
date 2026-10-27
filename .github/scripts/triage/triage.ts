/**
 * Phase 5 — Triage failures: SCRIPT defect vs APPLICATION defect (vs environment / flaky / unknown). Every run's record
 * (5-run/NN-label.json, written by `heldout run`) already holds each failure's evidence and an automatic
 * classification; triage is where the decisions are confirmed.
 *
 *   heldout triage <KEY> [--run 02-eval]
 *        → the triage report of the run (in the scratch area) and a starting chain for each failure to replay.
 *
 *   heldout triage <KEY> --carry-from <run|auto>
 *        → reuse confirmed decisions for failures with an identical signature ("auto" = latest earlier run with confirmations)
 *
 *   heldout triage <KEY> --set SCN-002[,SCN-003…] (or SCN-007: every failing row of that outline) --category APPLICATION_DEFECT --severity Major \
 *        --rationale "..." [--evidence "P7 …"] [--action "..."] [--title "..."] [--any-reading [SCN-a,SCN-b]]
 *        → records the evaluator's *confirmed* classification after live re-investigation, in 6-triage/decisions.json.
 *        The probes the evidence names (Pn) must be in the story's probe logs; their reports are kept in their phase's folder.
 *        --any-reading: the test is tagged @assumes or @needs-clarification, but the failure holds whichever way the
 *        open question is answered (the rationale says why): it is reported as a defect, not as a question for the owner.
 *        With ids, only those tests of the call are marked (the others stay questions for the owner).
 *
 * The automatic pass never has the last word on an APPLICATION_DEFECT: policy requires a live
 * reproduction in the AUT (tier 1/2/3 browser, or heldout api-probe for an API) before --set confirms it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { baseScenarioId } from '../authoring/spec-model';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel, writeFile } from '../core/files';
import { recordEvent } from '../core/history';
import { citeProbes } from '../core/probe-log';
import { evalPaths, listRuns, runFile, type StoryPaths } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';
import { CATEGORIES, type ApiExchange, type Category } from './classify';
import { renderTriageMd, replaySlug, signedIn } from './triage-report';
import { pendingOf, readRunRecord, signature, writeRunRecord, type RunRecord, type TriageEntry } from './triage-model';

/**
 * A chain to start the live replay of a failure whose call was sent signed in: the sign-in of each kind of user the
 * test took (from the profile's accounts recipe, secrets as references), then the failing call with the first one's
 * token. The triager adds the control call and, when the test took several users, picks the token the call was sent
 * with. Nothing when the profile has no API sign-in, or the accounts aren't plain environment references.
 */
function starterChain(cfg: HeldoutConfig, e: TriageEntry): { note: string; steps: Record<string, unknown>[] } | undefined {
  const api = e.evidence.api; const recipe = cfg.aut.accounts;
  if (!api || !signedIn(api) || !recipe?.token || !recipe.existing?.length) return undefined;
  const taken = ((e.evidence.seed as { records?: { kind?: string; label?: string }[] } | undefined)?.records ?? []).filter((r) => r.kind === 'account');
  // The test took its accounts in this order: the nth one of a role is the nth existing account of that role (as
  // handed out on one worker; with several workers the triager checks which one it was).
  const roles = taken.map((r) => r.label?.match(/\(([a-z][a-z0-9-]*)\)$/)?.[1]).filter((r): r is string => Boolean(r));
  const nth = new Map<string, number>();
  const accounts = [...new Set(roles.length ? roles.map((role) => { const n = nth.get(role) ?? 0; nth.set(role, n + 1); return recipe.existing!.filter((a) => a.role === role)[n]; }) : [recipe.existing[0]])]
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  if (!accounts.length || accounts.some((a) => /\$\{vault:/.test(`${a.username}${a.password}`))) return undefined;
  const fill = (v: unknown, a: { username: string; password: string }): unknown => (typeof v === 'string' ? v.replace(/\$\{username\}/g, a.username).replace(/\$\{password\}/g, a.password)
    : Array.isArray(v) ? v.map((x) => fill(x, a)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x, a)])) : v);
  // The failing call was recorded with the user it was sent as: that one's token goes on it.
  const username = (a: { username: string }) => a.username.replace(/^\$\{env:([A-Za-z_][\w]*)\}$/, (_, n: string) => process.env[n] ?? '');
  const sender = accounts.find((a) => api.request.as && username(a) && api.request.as.endsWith(`· ${username(a)}`))
    ?? recipe.existing.find((a) => api.request.as && username(a) && api.request.as.endsWith(`· ${username(a)}`));
  if (sender && !accounts.includes(sender)) accounts.push(sender);
  const tokenVar = (a: { role?: string }, i: number) => { const same = accounts.filter((x) => x.role === a.role); return `token_${a.role ?? 'account'}${same.length > 1 ? same.indexOf(a as typeof accounts[number]) + 1 : a.role ? '' : i + 1}`; };
  const header = (recipe.authHeader ?? 'Authorization: Bearer ${token}').split(/:\s*/);
  const steps: Record<string, unknown>[] = accounts.map((a, i) => ({
    name: `sign in as ${a.role ?? 'the account'}${accounts.filter((x) => x.role === a.role).length > 1 ? ` (${username(a) || `#${i + 1}`})` : ''}`, setup: true, method: recipe.token!.method, path: recipe.token!.path,
    ...(recipe.token!.form ? { form: fill(recipe.token!.form, a) } : { json: fill(recipe.token!.body ?? {}, a) }), save: { [tokenVar(a, i)]: recipe.token!.token },
  }));
  const body = api.request.body;
  steps.push({
    name: `the failing call of ${e.scenario}`, method: api.request.method, path: api.request.url,
    headers: { [header[0]]: header.slice(1).join(': ').replace(/\$\{token\}/g, `\${${tokenVar(sender ?? accounts[0], accounts.indexOf(sender ?? accounts[0]))}}`) },
    ...(body && typeof body === 'object' ? { json: body } : {}),
  });
  // Records the run made are gone when it is over: the ids the call names then point at nothing.
  const namesRecords = /\/(\d+|[0-9A-Za-z-]{16,})(\/|\?|$)/.test(api.request.url) || Boolean(body && typeof body === 'object' && Object.keys(body).some((k) => /(^|_)id$|Id$/.test(k)));
  return { note: `${namesRecords ? 'The failing call names records by id, and the run\'s records may be gone: when the call answers "not found", add a setup step that makes each again (save its id) and put the saved ids in the call. Failures that need the same kind of record share one chain: each sign-in once, the record made once, then every failing call. ' : ''}Starting point written by heldout triage for ${e.scenario}: ${sender ? `the failing call carries the token of the user it was sent as (${api.request.as})` : 'check which user\'s token the failing call was sent with'}${body ? ', restore any value the evidence shows masked' : ''}, and add a control call that should succeed.`, steps };
}

/** Where a run's triage report and its starting chains go: views and working files, in the scratch area. */
const placesOf = (p: StoryPaths, run: string) => ({
  report: path.join(p.work.triage, `triage-${run}.md`),
  chains: path.join(p.work.triage, 'chains', run),
});

/** Write the run's triage report (a view: rendered again whenever a decision is recorded). */
function writeReport(p: StoryPaths, record: RunRecord): string {
  const places = placesOf(p, record.run);
  writeFile(places.report, renderTriageMd(record, { dir: path.dirname(places.report), chains: places.chains }));
  return places.report;
}

export const spec: CommandSpec = {
  name: 'triage', group: 'Run', usage: 'KEY [--run NN-label] [--set SCN --category … --rationale …] [--carry-from auto]',
  about: 'classify failures; record confirmed decisions',
  flags: ['action', 'any-reading', 'carry-from', 'category', 'evidence', 'rationale', 'run', 'set', 'severity', 'title'],
};

export function run({ _, flags }: Args): void {
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);
  const runs = listRuns(p.runs);
  const runName = flagStr(flags, 'run') ?? runs.at(-1);
  if (!runName) throw new Error(`No runs under ${rel(p.runs)}`);
  const file = runFile(p, runName);
  if (!fs.existsSync(file)) throw new Error(`No run ${runName} under ${rel(p.runs)} (runs: ${runs.join(', ') || 'none'})`);
  const record = readRunRecord(file);

  const setId = flagStr(flags, 'set');
  if (setId) {
    // One decision per root cause: "SCN-007.1,SCN-007.2", or an outline's base id "SCN-007" for all its failing rows.
    const entries = setId.split(',').map((x) => x.trim()).flatMap((id) => {
      const hit = record.entries.filter((e) => e.scenario === id || (e.error && baseScenarioId(e.scenario) === id));
      if (!hit.length) throw new Error(`${id} not in ${rel(file)} (have: ${record.entries.filter((e) => e.error).map((e) => e.scenario).join(', ')})`);
      return hit;
    });
    const category = flagStr(flags, 'category') as Category;
    if (!CATEGORIES.includes(category)) throw new Error(`--category must be one of ${CATEGORIES.join(', ')}`);
    const rationale = flagStr(flags, 'rationale');
    if (!rationale) throw new Error('--rationale is required (explain the evidence).');
    // The live reproduction a decision rests on is a probe (Pn): its report is kept in the story's evidence.
    if (flagStr(flags, 'evidence')) citeProbes(cfg, key, flagStr(flags, 'evidence')!);
    const decision = { category, severity: flagStr(flags, 'severity'), title: flagStr(flags, 'title'), rationale,
      evidence: flagStr(flags, 'evidence'), action: flagStr(flags, 'action'), confirmedAt: new Date().toISOString() };
    // --any-reading alone marks every test of the call; with ids, those tests only (one root cause, one call, although
    // its tagged tests differ in what their open question decides).
    const anyReading = flags['any-reading'];
    const marked = typeof anyReading === 'string' ? anyReading.split(',').map((x) => x.trim()).filter(Boolean) : [];
    const stray = marked.filter((id) => !entries.some((e) => e.scenario === id || baseScenarioId(e.scenario) === id));
    if (stray.length) throw new Error(`--any-reading names ${stray.join(', ')}, which --set does not: name tests of this call, or give the flag alone for all of them`);
    for (const e of entries) e.final = { ...decision, ...(e.error?.headline ? { failure: e.error.headline.slice(0, 200) } : {}), ...(anyReading && (!marked.length || marked.includes(e.scenario) || marked.includes(baseScenarioId(e.scenario))) ? { anyReading: true } : {}) };
    writeRunRecord(file, record);
    writeReport(p, record);
    recordEvent(p.history, 'decided', {
      run: runName, tests: entries.map((e) => e.scenario), category, ...(decision.severity ? { severity: decision.severity } : {}),
      ...(anyReading ? { anyReading: marked.length ? marked : true } : {}), ...(decision.evidence ? { evidence: decision.evidence } : {}),
    });
    console.log(`✔ ${entries.map((e) => e.scenario).join(', ')} confirmed as ${category}${decision.severity ? ` (${decision.severity})` : ''}${decision.title ? ` — "${decision.title}"` : ''} in ${rel(file)}`);
    return;
  }

  // --carry-from <run|auto>: reuse confirmed decisions from an earlier run, only for identical failure signatures.
  const withDecisions = (r: string) => readRunRecord(runFile(p, r)).entries.some((x) => x.final);
  let carryFrom = flagStr(flags, 'carry-from');
  if (carryFrom === 'auto') {
    carryFrom = runs.filter((r) => r < runName && withDecisions(r)).at(-1);
    if (!carryFrom) console.log('  (no earlier run with confirmed decisions — nothing to carry)');
  }
  if (carryFrom) {
    const prev = readRunRecord(runFile(p, carryFrom));
    for (const e of record.entries.filter((x) => x.status === 'failed' && !x.final)) {
      const old = prev.entries.find((x) => x.scenario === e.scenario && x.final && signature(x) === signature(e));
      if (old?.final) {
        e.final = { ...old.final, rationale: `${old.final.rationale.replace(/ \(Confirmed in run .*\)$/, '')} (Confirmed in run ${carryFrom}; identical failure signature in ${runName}.)` };
        console.log(`  ↻ ${e.scenario}: carried ${old.final.category} from ${carryFrom} (identical signature)`);
      }
    }
  }
  writeRunRecord(file, record);
  const triaged = record.entries.filter((e) => e.auto);
  recordEvent(p.history, 'triaged', {
    run: runName, ...record.summary,
    automatic: triaged.reduce<Record<string, number>>((n, e) => ({ ...n, [e.auto!.category]: (n[e.auto!.category] ?? 0) + 1 }), {}),
    confirmed: triaged.filter((e) => e.final).length, ...(carryFrom ? { carriedFrom: carryFrom } : {}),
  });
  // A starting chain for the live replay of each failure whose call was sent signed in.
  const { chains } = placesOf(p, runName);
  const pendingEntries = pendingOf(record);
  for (const e of pendingEntries) {
    const chain = starterChain(cfg, e);
    const chainFile = path.join(chains, `${replaySlug(e.scenario)}.chain.json`);
    if (chain && !fs.existsSync(chainFile)) writeFile(chainFile, `${JSON.stringify(chain, null, 2)}\n`);
  }
  // And one chain for all of them: each sign-in once, then every distinct failing call (signed in or not). Failures
  // that need the same kind of record are replayed against one record, so the application is left with fewer.
  const pendingCalls = pendingEntries.filter((x) => x.evidence.api);
  const allFile = path.join(chains, 'all.chain.json');
  if (pendingCalls.length > 1 && !fs.existsSync(allFile)) {
    const seen = new Set<string>(); const signIns: Record<string, unknown>[] = []; const calls: Record<string, unknown>[] = [];
    // A call as a chain step, with the headers that shape the answer (never the ones that prove who calls).
    const stepOf = (name: string, x: ApiExchange): Record<string, unknown> => {
      const shaping = Object.fromEntries(Object.entries(x.request.headers ?? {}).filter(([h]) => /^(accept|content-type)$/i.test(h)));
      return { name, method: x.request.method, path: x.request.url, ...(Object.keys(shaping).length ? { headers: shaping } : {}), ...(x.request.body && typeof x.request.body === 'object' ? { json: x.request.body } : {}) };
    };
    for (const e of pendingCalls) {
      const api = e.evidence.api!; const seq = e.evidence.apiSequence ?? [];
      // When the failed check read a state back, the call that made that state comes first: a read alone replays nothing.
      const at = e.evidence.apiRelevantIndex ?? seq.length;
      const cause = api.request.method === 'GET' ? seq.slice(0, at).reverse().find((x) => x.request.method !== 'GET') : undefined;
      const steps = [...(cause ? [stepOf(`the call before the failing check of ${e.scenario}`, cause)] : []),
        ...(starterChain(cfg, e)?.steps ?? [stepOf(`the failing call of ${e.scenario}`, api)])];
      for (const s of steps) {
        // Two calls that differ only in the ids of the records they name are one call to replay.
        const { name: _name, ...what } = s; const k = JSON.stringify(what).replace(/\b\d{4,}\b|\b[0-9A-Za-z]{20,}\b/g, '#');
        if (seen.has(k)) continue;
        seen.add(k);
        (s.setup ? signIns : calls).push(s);
      }
    }
    if (calls.length <= 40) writeFile(allFile, `${JSON.stringify({ note: `Starting point written by heldout triage: the API calls of this run's failures in one chain. ${pendingCalls.length} of the ${pendingEntries.length} failures made an API call (the others are checks on a page: replay those with heldout inspect). Calls that differ only in the ids of the records they name are listed once, under the first test that made them: ${calls.length} call(s). Where the failed check read a state back, the call that made the state is listed before it. The run's records may be gone: add setup steps that make each record once (save its id), put the saved ids in the calls, add a control call per root cause, and delete the calls you don't need.`, steps: [...signIns, ...calls] }, null, 2)}\n`);
  }
  const report = writeReport(p, record);

  console.log(`Triage ${key} / ${runName}: ${record.summary.passed}/${record.summary.total} passed, ${record.summary.failed} failed, ${record.summary.flaky} flaky\n`);
  for (const e of triaged) {
    // A confirmed decision is what counts: show it, not the automatic suggestion it replaced.
    const shown = e.final ? `${e.final.category.padEnd(20)} ✔ confirmed  ` : `${e.auto!.category.padEnd(20)} (${e.auto!.confidence.padEnd(6)}) ⏳ pending `;
    console.log(`  ${e.scenario.padEnd(10)} ${shown} ${e.error!.headline.slice(0, 80)}`);
  }
  console.log(`\n  report: ${rel(report)}${pendingEntries.length && fs.existsSync(chains) ? `\n  chains: ${rel(chains)}/` : ''}`);
  // Failures an earlier run already confirmed, identically: say so, rather than asking for the investigation again.
  const earlier = carryFrom ? undefined : runs.filter((r) => r < runName && withDecisions(r)).at(-1);
  const earlierEntries = earlier ? readRunRecord(runFile(p, earlier)).entries : [];
  const same = pendingEntries.filter((e) => e.status === 'failed' && earlierEntries.some((x) => x.scenario === e.scenario && x.final && signature(x) === signature(e)));
  if (same.length) console.log(`\n↻ ${same.map((e) => e.scenario).join(', ')}: the same failure${same.length > 1 ? 's were' : ' was'} confirmed in ${earlier} (identical signature). Reuse ${same.length > 1 ? 'those decisions' : 'that decision'}: npm run heldout -- triage ${key} --carry-from auto`);
  if (pendingEntries.some((x) => !same.includes(x))) console.log('\nNext: investigate each pending failure live (references/triage.md), then confirm with --set.');
}
