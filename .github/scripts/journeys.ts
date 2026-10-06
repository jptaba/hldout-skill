/**
 * Journeys — the reusable HOW of an application (journeys/fixtures/<domain>.ts, one file per domain), with the registry
 * (journeys/registry.yml) that says where each journey is, what it touches, what must run before it and which stories
 * proved it.
 *
 *   heldout journeys KEY                      the journeys for this story's application, the ones it concerns first
 *   heldout journeys KEY --all                every journey, with its registry status
 *   heldout journeys KEY --stale "<id>" --evidence "<what failed>"   a journey that no longer works (marked by the harvest)
 *   heldout journeys KEY --unstage "<id>"     take back a stale mark
 *   heldout journeys KEY --harvest [--apply]  after the verdict: what the passing tests proved (preview; --apply writes
 *                                             registry.yml)
 *   heldout journeys [--aut <id>]             every journey of the application (no story needed)
 *   heldout journeys [--aut <id>] --check     lint every journey file (HOW only, one file per domain); possible
 *                                             duplicates; a registry out of step with the code — run it after merging
 *   heldout journeys [--aut <id>] --sync      write registry.yml from the code (new journeys, moved ones, gone ones)
 *   heldout journeys [--aut <id>] --resolve   a merge conflict in registry.yml: keep both sides, then sync
 *
 * The test author reads the journeys while drafting (they hold no expected value, so they can't leak the oracle), calls
 * them for the steps of its tests and adds the ones it needs to their domain's file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey, evalPaths, flagStr, journeyPaths, loadConfig, main, parseArgs, readJson, rel, writeFile, type HeldoutConfig } from './config';
import { readContract, type RequirementContract } from './contract-model';
import {
  CONFLICT, allJourneys, allRequires, conflictSides, directRequires, describeJourney, duplicateJourneys, journeyFiles, journeyUse, journeysUsedBy, lintJourneys,
  mergeRegistries, observedRequires, parseRegistry, readRegistry, relevantJourney, statusOf, syncRegistry, writeRegistry,
  type JourneyCode, type Registry,
} from './journeys-store';
import { readSuite, specFiles } from './spec-model';

const H = 'npm run heldout --';
interface Staged { stale: { id: string; evidence: string; at: string }[] }
/** `finalRun`: the run the harvest kept what passed in (a re-rendered verdict of the same run needs no new harvest). */
export interface HarvestLog { at: string; finalRun: string; registry: string; proven: string[]; stale: string[]; dropped: { id: string; why: string }[] }

main(() => {
  const { _, flags } = parseArgs();
  const key = _[0] ? assertIssueKey(_[0]) : undefined;
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const profile = cfg.autId;
  const jp = journeyPaths(cfg, profile);
  const journeys = allJourneys(cfg, profile);

  if (!key) {
    if (flags.resolve) return resolve(cfg, profile, journeys);
    const registry = readRegistry(cfg, profile);
    if (flags.sync) {
      const s = syncRegistry(registry, journeys, cfg.aut.name);
      if (!s.added.length && !s.removed.length && !s.updated.length && fs.existsSync(jp.registry)) { console.log(`✔ ${rel(jp.registry)} is in step with the code (${journeys.length} journey(s)).`); return; }
      writeRegistry(cfg, profile, s.registry);
      console.log(`✔ ${rel(jp.registry)}: ${s.added.length} added, ${s.updated.length} updated, ${s.removed.length} removed (${journeys.length} journey(s))`);
      for (const id of s.added) console.log(`  + ${id}`);
      for (const id of s.removed) console.log(`  - ${id}`);
      return;
    }
    if (flags.check) {
      const files = journeyFiles(cfg, profile);
      const findings = lintJourneys(files, undefined, jp.base);
      for (const f of findings) console.log(`  ${f.level === 'error' ? '✖' : '⚠'} [${f.code}] ${f.message}`);
      // Two people who added the same journey under two names, on two branches: one should go.
      for (const g of duplicateJourneys(journeys)) console.log(`  ⚠ [possible-duplicate] ${g.map((a) => `${a.id} (${a.file})`).join(' and ')} touch the same ${g[0].endpoints?.length ? `calls (${g[0].endpoints.join(', ')})` : 'page the same way'} — keep one, point the tests at it`);
      const s = syncRegistry(registry, journeys);
      if (s.added.length || s.removed.length || s.updated.length) console.log(`  • ${rel(jp.registry)} is behind the code (${s.added.length} new, ${s.updated.length} changed, ${s.removed.length} gone): a story's harvest records them after its verdict; to bring it in line now, ${H} journeys --sync`);
      if (!findings.length) console.log(`✔ ${files.length} journey file(s), ${journeys.length} journey(s): no expected values, one file per domain, every journey documented`);
      if (findings.some((f) => f.level === 'error')) process.exitCode = 1;
      return;
    }
    printJourneys(cfg, profile, journeys, registry, undefined, true);
    return;
  }

  const p = evalPaths(cfg, key);
  const contract = readContract(p.base);
  const stagedFile = path.join(p.hardening, 'journeys-staged.json');
  const staged: Staged = fs.existsSync(stagedFile) ? readJson<Staged>(stagedFile) : { stale: [] };

  if (flags.harvest) return harvest(cfg, key, profile, p, contract, staged, journeys, Boolean(flags.apply));

  if (flagStr(flags, 'unstage')) {
    const id = flagStr(flags, 'unstage')!;
    const before = staged.stale.length;
    staged.stale = staged.stale.filter((s) => s.id !== id);
    if (before === staged.stale.length) throw new Error(`No stale mark for "${id}" by ${key}.`);
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${id}: stale mark taken back.`);
    return;
  }
  if (flagStr(flags, 'stale')) {
    const id = flagStr(flags, 'stale')!;
    if (!journeys.some((j) => j.id === id)) throw new Error(`No journey "${id}" in ${rel(jp.fixtures)}/. Ids are listed by: ${H} journeys ${key} --all`);
    const evidence = flagStr(flags, 'evidence');
    if (!evidence) throw new Error('--stale needs --evidence "<what failed, e.g. the probe report>"');
    staged.stale = [...staged.stale.filter((s) => s.id !== id), { id, evidence, at: new Date().toISOString() }];
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${id} will be marked stale by the harvest. Fix the journey (or replace it) in ${rel(jp.fixtures)}/.`);
    return;
  }

  printJourneys(cfg, profile, journeys, readRegistry(cfg, profile), contract, Boolean(flags.all));
  const imp = path.relative(p.tests, jp.fixtures).split(path.sep).join('/');
  console.log(`\nFrom ${rel(p.tests)}/*.spec.ts: import { … } from '${imp}/<domain>' (e.g. '${imp}/products').`);
  console.log(`A journey you need and don't find: add it to its domain's file, ${rel(jp.fixtures)}/<domain>.ts (a new domain is a new`);
  console.log('file), exported with a /** doc comment */; helpers the domain\'s journeys share stay in the file, not exported.');
  console.log('HOW only: no [REQ …] assertion, no expected value. The harvest records it in the registry once a passing test used it.');
});

function printJourneys(cfg: HeldoutConfig, profile: string, journeys: JourneyCode[], registry: Registry, contract: RequirementContract | undefined, all: boolean): void {
  const shown = all || !contract ? journeys : journeys.filter((a) => relevantJourney(a, contract));
  const jp = journeyPaths(cfg, profile);
  console.log(`Journeys of ${cfg.aut.name} in ${rel(jp.fixtures)}/: ${shown.length} of ${journeys.length}${all || !contract ? '' : ' that concern this story (--all for every one)'}`);
  let group = '';
  for (const j of shown) {
    if (j.file !== group) { group = j.file; console.log(`\n${j.file}`); }
    const e = registry.journeys[j.id];
    const status = !e ? 'not in the registry yet' : statusOf(e, j.hash) === 'proven' ? `proven by ${e.proven!.by.join(', ')}, ${e.proven!.at.slice(0, 10)}`
      : statusOf(e, j.hash) === 'changed' ? `changed since proven by ${e.proven!.by.join(', ')}` : statusOf(e, j.hash) === 'stale' ? `STALE since ${e.stale!.at.slice(0, 10)}${e.stale!.evidence ? ` (${e.stale!.evidence})` : ''}` : 'not proven yet';
    console.log(`  ${j.id}  ${j.name}(${j.params ?? ''})  [${status}]\n      ${describeJourney(j)}${e?.requires?.length ? `\n      requires ${e.requires.join(', ')}` : ''}${j.calls?.length ? `\n      calls ${j.calls.join(', ')}` : ''}`);
  }
  if (!all && contract) {
    const others = [...new Set(journeys.filter((a) => !shown.includes(a)).map((a) => a.file))];
    if (others.length) console.log(`\nOther domains: ${others.join(', ')}`);
  }
  if (!journeys.length) console.log(`\nNo journeys yet for ${cfg.aut.name}: this story starts them.`);
}

/** A registry.yml with merge-conflict markers: both sides merged (every proof kept), then in step with the code. */
function resolve(cfg: HeldoutConfig, profile: string, journeys: JourneyCode[]): void {
  const file = journeyPaths(cfg, profile).registry;
  if (!fs.existsSync(file)) throw new Error(`No ${rel(file)} yet: ${H} journeys --sync`);
  const text = fs.readFileSync(file, 'utf8');
  if (!CONFLICT.test(text)) { console.log(`${rel(file)} has no merge-conflict markers: nothing to resolve.`); return; }
  const [ours, theirs] = conflictSides(text).map(parseRegistry);
  const s = syncRegistry(mergeRegistries(ours, theirs), journeys, cfg.aut.name);
  writeRegistry(cfg, profile, s.registry);
  console.log(`✔ ${rel(file)}: both sides kept (${Object.keys(s.registry.journeys).length} journey(s)), in step with the code. Then: git add ${rel(file)}`);
}

/**
 * After the verdict: the journeys this story's passing tests used, recorded in registry.yml with what ran before them.
 * Left out: journeys only failing tests used (they may work around a defect), and the files that break the rules (an
 * expected value of the story in them). Stale marks recorded while hardening are written too.
 */
function harvest(cfg: HeldoutConfig, key: string, profile: string, p: ReturnType<typeof evalPaths>, contract: RequirementContract | undefined, staged: Staged, journeys: JourneyCode[], apply: boolean): void {
  if (!fs.existsSync(p.verdictJson)) throw new Error(`No verdict for ${key} yet — the harvest keeps only what passing tests proved: ${H} verdict ${key}`);
  const verdict = readJson<{ finalRun: string; traceability: { scenarios: { id: string; tests: { status: string }[] }[] }[] }>(p.verdictJson);
  const passed = new Set<string>();
  for (const t of verdict.traceability ?? []) for (const s of t.scenarios) if (s.tests.some((x) => x.status === 'passed')) passed.add(s.id);
  const logFile = path.join(p.hardening, 'journeys-harvest.json');
  const last = fs.existsSync(logFile) ? readJson<HarvestLog>(logFile) : undefined;
  if (last?.finalRun === verdict.finalRun && apply) throw new Error(`Already harvested for ${verdict.finalRun} → ${last.registry}`);

  const jp = journeyPaths(cfg, profile);
  const specs = specFiles(p.tests);
  const usedFiles = journeysUsedBy(cfg, profile, specs);
  const broken = new Set(lintJourneys(usedFiles, contract, jp.base).filter((f) => f.level === 'error').map((f) => f.message.split(' ')[0]));
  const scenarios = readSuite(p.tests, contract).scenarios;
  const use = journeyUse(journeys, specs, scenarios);
  const requires = observedRequires(journeys, specs, scenarios.filter((s) => passed.has(s.id)));
  const at = new Date().toISOString();
  const { registry } = syncRegistry(readRegistry(cfg, profile), journeys, cfg.aut.name);
  // What earlier stories saw before each journey, in full (the registry keeps only the direct prerequisites).
  const earlier = new Map(Object.keys(registry.journeys).map((id) => [id, allRequires(registry, id)]));
  const proven: string[] = [];
  const dropped: { id: string; why: string }[] = [];
  const lines: string[] = [];
  for (const j of journeys) {
    const by = [...(use.get(j.id) ?? [])];
    if (!by.length) continue;
    const proof = by.filter((s) => passed.has(s));
    if (broken.has(rel(path.join(jp.base, j.file)))) { dropped.push({ id: j.id, why: `${j.file} breaks the journey rules (heldout lint ${key})` }); continue; }
    if (!proof.length) { dropped.push({ id: j.id, why: `none of ${by.join(', ')} passed in ${verdict.finalRun}` }); continue; }
    const e = registry.journeys[j.id];
    const tag = !e.proven ? 'new      ' : e.proven.hash === j.hash ? 're-proven' : 'changed  ';
    // Proven by other stories before: keep what they and this one agree on. A first proof takes what this story saw.
    const provenBefore = Boolean(e.proven?.by.some((s) => s !== key));
    e.proven = { at, by: [...new Set([...(e.proven?.by ?? []), key])].sort(), evidence: `${verdict.finalRun}: ${proof.join(', ')} passed`, hash: j.hash };
    const seen = requires.get(j.id);
    if (seen) e.requires = provenBefore ? (earlier.get(j.id) ?? []).filter((r) => seen.includes(r)) : seen;
    if (!e.requires?.length) delete e.requires;
    e.status = statusOf(e, j.hash);
    proven.push(j.id);
    lines.push(`  ${tag} ${j.id}`);
  }
  directRequires(registry);
  for (const [i, id] of proven.entries()) {
    const e = registry.journeys[id];
    lines[i] += ` — ${describeJourney(journeys.find((j) => j.id === id)!)}${e.requires?.length ? ` · requires ${e.requires.join(', ')}` : ''}`;
  }
  const stale: string[] = [];
  for (const s of staged.stale) {
    const e = registry.journeys[s.id];
    if (!e || proven.includes(s.id)) continue;
    e.stale = { at, by: key, evidence: s.evidence };
    e.status = statusOf(e);
    stale.push(s.id);
    lines.push(`  stale     ${s.id} — ${s.evidence}`);
  }

  console.log(`Harvest of ${key} (${verdict.finalRun}): ${proven.length} proven, ${stale.length} stale, ${dropped.length} left out\n`);
  for (const l of lines) console.log(l);
  for (const d of dropped) console.log(`  left out ${d.id} — ${d.why}`);
  if (!apply) { console.log(`\nPreview only. Write it: ${H} journeys ${key} --harvest --apply`); return; }
  const file = writeRegistry(cfg, profile, registry);
  const log: HarvestLog = { at, finalRun: verdict.finalRun, registry: rel(file), proven, stale, dropped };
  writeFile(logFile, `${JSON.stringify(log, null, 2)}\n`);
  console.log(`\n✔ ${rel(file)} — commit it with the journey files and the story's output`);
}
