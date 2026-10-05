/**
 * Actions — the reusable HOW of an application (actions/<profile>/ui|api/<domain>/<action>.ts, one action per file),
 * with the UI and API maps (actions/<profile>/map/) that say what each action touches and which stories proved it.
 *
 *   heldout actions KEY                      the actions for this story's application, the ones it concerns first
 *   heldout actions KEY --all                every action, with its map status
 *   heldout actions KEY --stale "<key>" --evidence "<what failed>"   an action that no longer works (marked by the harvest)
 *   heldout actions KEY --unstage "<key>"    take back a stale mark
 *   heldout actions KEY --harvest [--apply]  after the verdict: the actions passing tests used (preview; --apply writes
 *                                            new map files)
 *   heldout actions --aut <id>               every action of a profile (no story needed)
 *   heldout actions --aut <id> --check       lint every action file (HOW only, one action per file); possible
 *                                            duplicates; actions missing from the map — run it after merging
 *   heldout actions --aut <id> --log         what the maps learned, when and from which story
 *   heldout actions --aut <id> --compact     fold the map files into one snapshot per kind (run from one place)
 *
 * The test author reads the actions while drafting (they hold no expected value, so they can't leak the oracle), calls
 * them for the steps of its tests and adds the ones it needs, each in a file of its own in its domain's folder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { actionPaths, assertIssueKey, evalPaths, flagStr, loadConfig, main, parseArgs, readJson, rel, writeFile, type HeldoutConfig } from './config';
import { readContract, type RequirementContract } from './contract-model';
import {
  actionFiles, actionKey, actionUse, actionsUsedBy, compactMap, describeAction, duplicateActions, entries, lintActions, loadMap, mapValueOf,
  profileActions, relevantAction, valueId, writeMap, type ActionCode, type MapEntry, type MapObservation,
} from './actions-store';
import { readSuite, specFiles } from './spec-model';

const H = 'npm run heldout --';
interface Staged { stale: { key: string; evidence: string; at: string }[] }
/** `finalRun`: the run the harvest kept what passed in (a re-rendered verdict of the same run needs no new harvest). */
export interface HarvestLog { at: string; finalRun: string; files: string[]; proven: number; stale: number; dropped: { key: string; why: string }[] }

main(() => {
  const { _, flags } = parseArgs();
  const key = _[0] ? assertIssueKey(_[0]) : undefined;
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const profile = cfg.autId;
  const ap = actionPaths(cfg, profile);
  const map = loadMap(cfg, profile);
  const mapped = new Map(entries(map.records).map((e) => [e.key, e]));
  const actions = profileActions(cfg, profile);

  if (!key) {
    if (flags.compact) {
      const r = compactMap(cfg, profile);
      if (!r.length) console.log(`Nothing to compact in ${rel(ap.map)} (one file or none per kind).`);
      for (const x of r) console.log(`✔ folded ${x.folded} file(s) into ${rel(x.snapshot)} (${x.records} record(s))`);
      if (r.length) console.log('  commit the new snapshots and the deleted files together');
      return;
    }
    if (flags.log) {
      const events = map.records.flatMap((r) => [
        ...(r.provenAt ? [{ at: r.provenAt, what: `proven by ${r.stories.join(', ')}`, r }] : []),
        ...(r.staleAt ? [{ at: r.staleAt, what: `found stale${r.evidence ? ` (${r.evidence})` : ''}`, r }] : []),
      ]).sort((a, b) => b.at.localeCompare(a.at));
      console.log(`# Action maps of ${cfg.aut.name} (${profile})\n`);
      for (const e of events) console.log(`- ${e.at.slice(0, 16).replace('T', ' ')} · ${e.r.key} — ${describeAction(e.r.value)} — ${e.what}`);
      if (!events.length) console.log('Nothing proven yet: the first story that uses an action and passes records it (actions KEY --harvest --apply).');
      return;
    }
    if (flags.check) {
      const files = actionFiles(cfg, profile);
      const findings = lintActions(files, undefined, ap.base);
      for (const f of findings) console.log(`  ${f.level === 'error' ? '✖' : '⚠'} [${f.code}] ${f.message}`);
      // Two people who added the same action under two names, on two branches: one should go.
      for (const g of duplicateActions(actions)) console.log(`  ⚠ [possible-duplicate] ${g.map((a) => `${actionKey(a.kind, a.domain, a.action)} (${a.file})`).join(' and ')} touch the same ${g[0].endpoints?.length ? `calls (${g[0].endpoints.join(', ')})` : 'page the same way'} — keep one, point the tests at it`);
      const keys = new Set(actions.map((a) => actionKey(a.kind, a.domain, a.action)));
      for (const a of actions.filter((x) => !mapped.has(actionKey(x.kind, x.domain, x.action)))) console.log(`  • not in the map yet: ${actionKey(a.kind, a.domain, a.action)} (a passing story records it)`);
      for (const e of [...mapped.values()].filter((x) => !keys.has(x.key))) console.log(`  • in the map but no longer in the code: ${e.key}`);
      if (!findings.length) console.log(`✔ ${files.length} action file(s), ${actions.length} action(s): no expected values, one documented action per file`);
      if (findings.some((f) => f.level === 'error')) process.exitCode = 1;
      return;
    }
    printActions(cfg, profile, actions, mapped, undefined, true);
    return;
  }

  const p = evalPaths(cfg, key);
  const contract = readContract(p.base);
  const stagedFile = path.join(p.hardening, 'actions-staged.json');
  const staged: Staged = fs.existsSync(stagedFile) ? readJson<Staged>(stagedFile) : { stale: [] };

  if (flags.harvest) return harvest(cfg, key, profile, p, contract, staged, Boolean(flags.apply));

  if (flagStr(flags, 'unstage')) {
    const k = flagStr(flags, 'unstage')!;
    const before = staged.stale.length;
    staged.stale = staged.stale.filter((s) => s.key !== k);
    if (before === staged.stale.length) throw new Error(`No stale mark for "${k}" by ${key}.`);
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${k}: stale mark taken back.`);
    return;
  }
  if (flagStr(flags, 'stale')) {
    const k = flagStr(flags, 'stale')!;
    if (!mapped.has(k)) throw new Error(`No map entry "${k}" for ${profile}. Keys are listed by: ${H} actions ${key} --all`);
    const evidence = flagStr(flags, 'evidence');
    if (!evidence) throw new Error('--stale needs --evidence "<what failed, e.g. the probe report>"');
    staged.stale = [...staged.stale.filter((s) => s.key !== k), { key: k, evidence, at: new Date().toISOString() }];
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${k} will be marked stale by the harvest. Fix the action (or replace it) in ${rel(ap.base)}/.`);
    return;
  }

  printActions(cfg, profile, actions, mapped, contract, Boolean(flags.all));
  const imp = (sub: string) => path.relative(p.tests, path.join(ap.base, sub)).split(path.sep).join('/');
  console.log(`\nFrom ${rel(p.tests)}/*.spec.ts: import { … } from '${imp('api/<domain>/<action>')}' (or '${imp('ui/<domain>/<action>')}').`);
  console.log(`An action you need and don't find: a NEW file, ${rel(ap.ui)}/<domain>/<action-name>.ts or ${rel(ap.api)}/<domain>/<action-name>.ts,`);
  console.log('exporting that one action with a /** doc comment */ (helpers its domain shares: <domain>/_shared.ts). One action per file');
  console.log('keeps everyone\'s new actions in files of their own: no merge conflicts. HOW only: no [REQ …] assertion, no expected value.');
});

function statusLine(a: ActionCode, mapped: Map<string, MapEntry>): string {
  const e = mapped.get(actionKey(a.kind, a.domain, a.action));
  if (!e) return 'not proven yet';
  const same = [e.best, ...e.alternatives].some((r) => valueId(r.key, r.value) === valueId(e.key, mapValueOf(a)));
  if (e.status === 'stale') return `STALE since ${e.best.staleAt?.slice(0, 10)}${e.best.evidence ? ` (${e.best.evidence})` : ''}`;
  return `${same ? 'proven' : 'changed since proven'} by ${e.best.stories.join(', ')}, ${e.best.provenAt?.slice(0, 10)}`;
}

function printActions(cfg: HeldoutConfig, profile: string, actions: ActionCode[], mapped: Map<string, MapEntry>, contract: RequirementContract | undefined, all: boolean): void {
  const shown = all || !contract ? actions : actions.filter((a) => relevantAction(a, contract));
  const where = rel(actionPaths(cfg, profile).base);
  console.log(`Actions of ${cfg.aut.name} (${profile}) in ${where}/: ${shown.length} of ${actions.length}${all || !contract ? '' : ' that concern this story (--all for every one)'}`);
  let group = '';
  for (const a of shown) {
    const g = `${a.kind}/${a.domain}/`;
    if (g !== group) { group = g; console.log(`\n${g}`); }
    console.log(`  ${a.action}(${a.params ?? ''})  ${path.basename(a.file)}  [${statusLine(a, mapped)}]\n      ${describeAction(a)}`);
  }
  if (!all && contract) {
    const others = [...new Set(actions.filter((a) => !shown.includes(a)).map((a) => `${a.kind}/${a.domain}/`))];
    if (others.length) console.log(`\nOther domains: ${others.join(', ')}`);
  }
  if (!actions.length) console.log(`\nNo actions yet for ${profile}: this story starts them.`);
}

/**
 * After the verdict: the actions this story's passing tests used, written to the UI and API maps as new files. Left
 * out: actions only failing tests used (they may work around a defect), and the files that break the rules (an
 * expected value of the story in them). Stale marks recorded while hardening are written too.
 */
function harvest(cfg: HeldoutConfig, key: string, profile: string, p: ReturnType<typeof evalPaths>, contract: RequirementContract | undefined, staged: Staged, apply: boolean): void {
  if (!fs.existsSync(p.verdictJson)) throw new Error(`No verdict for ${key} yet — the harvest keeps only what passing tests proved: ${H} verdict ${key}`);
  const verdict = readJson<{ generatedAt: string; finalRun: string; traceability: { criterion: string; scenarios: { id: string; tests: { id: string; status: string }[] }[] }[] }>(p.verdictJson);
  const passed = new Set<string>();
  for (const t of verdict.traceability ?? []) for (const s of t.scenarios) if (s.tests.some((x) => x.status === 'passed')) passed.add(s.id);
  const logFile = path.join(p.hardening, 'actions-harvest.json');
  const last = fs.existsSync(logFile) ? readJson<HarvestLog>(logFile) : undefined;
  if (last?.finalRun === verdict.finalRun && apply) throw new Error(`Already harvested for ${verdict.finalRun} → ${last.files.join(', ') || 'nothing to keep'}`);

  const specs = specFiles(p.tests);
  const used = actionsUsedBy(cfg, specs);
  const base = actionPaths(cfg, profile).base;
  // Shared helpers take part in who-calls-what, but only actions go in the maps.
  const code = profileActions(cfg, profile, true).filter((a) => used.includes(path.join(base, a.file)));
  const broken = new Set(lintActions(used, contract, base).filter((f) => f.level === 'error').map((f) => f.message.split(' ')[0]));
  const use = actionUse(code, specs, readSuite(p.tests, contract).scenarios);
  const at = new Date().toISOString();
  const out: MapObservation[] = [];
  const dropped: { key: string; why: string }[] = [];
  for (const a of code.filter((x) => !x.shared)) {
    const k = actionKey(a.kind, a.domain, a.action);
    const by = [...(use.get(k) ?? [])];
    const proof = by.filter((s) => passed.has(s));
    if (!by.length) continue;
    if (broken.has(rel(path.join(base, a.file)))) dropped.push({ key: k, why: `${a.file} breaks the action rules (heldout lint ${key})` });
    else if (!proof.length) dropped.push({ key: k, why: `none of ${by.join(', ')} passed in ${verdict.finalRun}` });
    else out.push({ key: k, kind: a.kind, value: mapValueOf(a), status: 'proven', at, by: key, evidence: `${verdict.finalRun}: ${proof.join(', ')} passed` });
  }
  const mapped = new Map(entries(loadMap(cfg, profile).records).map((e) => [e.key, e]));
  for (const s of staged.stale) {
    const e = mapped.get(s.key);
    if (e && !out.some((o) => o.key === s.key)) out.push({ key: s.key, kind: e.kind, value: e.best.value, status: 'stale', at, by: key, evidence: s.evidence });
  }

  console.log(`Harvest of ${key} (${verdict.finalRun}) for ${profile}: ${out.filter((o) => o.status === 'proven').length} proven, ${out.filter((o) => o.status === 'stale').length} stale, ${dropped.length} left out\n`);
  for (const o of out) {
    const was = mapped.get(o.key);
    const tag = o.status === 'stale' ? 'stale    ' : !was ? 'new      ' : [was.best, ...was.alternatives].some((r) => valueId(r.key, r.value) === valueId(o.key, o.value)) ? 're-proven' : 'changed  ';
    console.log(`  ${tag} ${o.key} — ${describeAction(o.value)}`);
  }
  for (const d of dropped) console.log(`  left out ${d.key} — ${d.why}`);
  if (!apply) { console.log(`\nPreview only. Write it: ${H} actions ${key} --harvest --apply`); return; }
  const files = writeMap(cfg, profile, key, out);
  const log: HarvestLog = { at, finalRun: verdict.finalRun, files: files.map(rel), proven: out.filter((o) => o.status === 'proven').length, stale: out.filter((o) => o.status === 'stale').length, dropped };
  writeFile(logFile, `${JSON.stringify(log, null, 2)}\n`);
  console.log(files.length ? `\n✔ ${files.map(rel).join(', ')} — new file(s): commit them with the action files and the story's output (they never conflict with anyone else's)` : '\nNothing to keep.');
}
