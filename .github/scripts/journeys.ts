/**
 * Journey fixtures — the reusable HOW of an application (journeys/<profile>/ui|api/<domain>.ts), with the UI and API maps
 * (journeys/<profile>/map/) that say what each fixture touches and which stories proved it.
 *
 *   heldout journeys KEY                      the fixtures for this story's application, the ones it concerns first
 *   heldout journeys KEY --all                every fixture, with its map status
 *   heldout journeys KEY --stale "<key>" --evidence "<what failed>"   a fixture that no longer works (marked by the harvest)
 *   heldout journeys KEY --unstage "<key>"    take back a stale mark
 *   heldout journeys KEY --harvest [--apply]  after the verdict: the fixtures passing tests used (preview; --apply writes
 *                                             the map fragments)
 *   heldout journeys --aut <id>               every fixture of a profile (no story needed)
 *   heldout journeys --aut <id> --check       lint every journey file of the profile; fixtures missing from the map
 *   heldout journeys --aut <id> --log         what the map learned, when and from which story
 *   heldout journeys --aut <id> --compact     fold the map files into one snapshot per kind (run from one place)
 *
 * The test author reads the fixtures while drafting (they hold no expected value, so they can't leak the oracle), calls
 * them for the steps of its tests and adds the ones it needs to the domain file they belong to.
 */
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey, evalPaths, flagStr, journeyPaths, loadConfig, main, parseArgs, readJson, rel, writeFile, type HeldoutConfig } from './config';
import { readContract, type RequirementContract } from './contract-model';
import {
  compactMap, describeFixture, entries, fixtureKey, fixtureUse, journeyFiles, journeysUsedBy, lintJourneys, loadMap, mapValueOf,
  profileFixtures, relevantFixture, valueId, writeMap, type FixtureInfo, type MapEntry, type MapObservation,
} from './journeys-store';
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
  const jp = journeyPaths(cfg, profile);
  const map = loadMap(cfg, profile);
  const mapped = new Map(entries(map.records).map((e) => [e.key, e]));
  const fixtures = profileFixtures(cfg, profile);

  if (!key) {
    if (flags.compact) {
      const r = compactMap(cfg, profile);
      if (!r.length) console.log(`Nothing to compact in ${rel(jp.map)} (one file or none per kind).`);
      for (const x of r) console.log(`✔ folded ${x.folded} file(s) into ${rel(x.snapshot)} (${x.records} record(s))`);
      if (r.length) console.log('  commit the new snapshots and the deleted files together');
      return;
    }
    if (flags.log) {
      const events = map.records.flatMap((r) => [
        ...(r.provenAt ? [{ at: r.provenAt, what: `proven by ${r.stories.join(', ')}`, r }] : []),
        ...(r.staleAt ? [{ at: r.staleAt, what: `found stale${r.evidence ? ` (${r.evidence})` : ''}`, r }] : []),
      ]).sort((a, b) => b.at.localeCompare(a.at));
      console.log(`# Journey map of ${cfg.aut.name} (${profile})\n`);
      for (const e of events) console.log(`- ${e.at.slice(0, 16).replace('T', ' ')} · ${e.r.key} — ${describeFixture({ kind: e.r.kind, ...e.r.value })} — ${e.what}`);
      if (!events.length) console.log('Nothing proven yet: the first story that uses a fixture and passes records it (journeys KEY --harvest --apply).');
      return;
    }
    if (flags.check) {
      const findings = lintJourneys(journeyFiles(cfg, profile));
      for (const f of findings) console.log(`  ${f.level === 'error' ? '✖' : '⚠'} [${f.code}] ${f.message}`);
      const keys = new Set(fixtures.map((f) => fixtureKey(f.kind, f.domain, f.fixture)));
      for (const f of fixtures.filter((x) => !mapped.has(fixtureKey(x.kind, x.domain, x.fixture)))) console.log(`  • not in the map yet: ${fixtureKey(f.kind, f.domain, f.fixture)} (a passing story records it)`);
      for (const e of [...mapped.values()].filter((x) => !keys.has(x.key))) console.log(`  • in the map but no longer in the code: ${e.key}`);
      if (!findings.length) console.log(`✔ ${journeyFiles(cfg, profile).length} journey file(s), ${fixtures.length} fixture(s): no expected values, every fixture documented`);
      if (findings.some((f) => f.level === 'error')) process.exitCode = 1;
      return;
    }
    printFixtures(cfg, profile, fixtures, mapped, undefined, true);
    return;
  }

  const p = evalPaths(cfg, key);
  const contract = readContract(p.base);
  const stagedFile = path.join(p.hardening, 'journeys-staged.json');
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
    if (!mapped.has(k)) throw new Error(`No map entry "${k}" for ${profile}. Keys are listed by: ${H} journeys ${key} --all`);
    const evidence = flagStr(flags, 'evidence');
    if (!evidence) throw new Error('--stale needs --evidence "<what failed, e.g. the probe report>"');
    staged.stale = [...staged.stale.filter((s) => s.key !== k), { key: k, evidence, at: new Date().toISOString() }];
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${k} will be marked stale by the harvest. Fix the fixture (or replace it) in ${rel(jp.base)}/.`);
    return;
  }

  printFixtures(cfg, profile, fixtures, mapped, contract, Boolean(flags.all));
  const imp = (sub: string) => path.relative(p.tests, path.join(jp.base, sub)).split(path.sep).join('/');
  console.log(`\nFrom ${rel(p.tests)}/*.spec.ts: import { … } from '${imp('api/<domain>')}' (or '${imp('ui/<domain>')}').`);
  console.log(`A fixture you need and don't find: add it to the domain file it belongs to (${rel(jp.ui)}/<domain>.ts, ${rel(jp.api)}/<domain>.ts),`);
  console.log('with a /** doc comment */ saying what it does. HOW only: no [REQ …] assertion, no expected value of the story.');
});

function statusLine(f: FixtureInfo, mapped: Map<string, MapEntry>): string {
  const e = mapped.get(fixtureKey(f.kind, f.domain, f.fixture));
  if (!e) return 'not proven yet';
  const same = [e.best, ...e.alternatives].some((r) => valueId(r.key, r.value) === valueId(e.key, mapValueOf(f)));
  if (e.status === 'stale') return `STALE since ${e.best.staleAt?.slice(0, 10)}${e.best.evidence ? ` (${e.best.evidence})` : ''}`;
  return `${same ? 'proven' : 'changed since proven'} by ${e.best.stories.join(', ')}, ${e.best.provenAt?.slice(0, 10)}`;
}

function printFixtures(cfg: HeldoutConfig, profile: string, fixtures: (FixtureInfo & { body: string })[], mapped: Map<string, MapEntry>, contract: RequirementContract | undefined, all: boolean): void {
  const shown = all || !contract ? fixtures : fixtures.filter((f) => relevantFixture(f, contract));
  const where = rel(journeyPaths(cfg, profile).base);
  console.log(`Journey fixtures of ${cfg.aut.name} (${profile}) in ${where}/: ${shown.length} of ${fixtures.length}${all || !contract ? '' : ' that concern this story (--all for every one)'}`);
  let group = '';
  for (const f of shown) {
    const g = `${f.kind}/${f.domain}.ts`;
    if (g !== group) { group = g; console.log(`\n${g}`); }
    console.log(`  ${f.fixture}(${f.params ?? ''})  [${statusLine(f, mapped)}]\n      ${describeFixture(f)}`);
  }
  if (!all && contract) {
    const others = [...new Set(fixtures.filter((f) => !shown.includes(f)).map((f) => `${f.kind}/${f.domain}.ts`))];
    if (others.length) console.log(`\nOther domain files: ${others.join(', ')}`);
  }
  if (!fixtures.length) console.log(`\nNo fixtures yet for ${profile}: this story starts them.`);
}

/**
 * After the verdict: the fixtures this story's passing tests used, written to the UI and API maps as new fragment files.
 * Left out: fixtures only failing tests used (they may work around a defect), and the files of a fixture that breaks the
 * rules (an expected value of the story in it). Stale marks recorded while hardening are written too.
 */
function harvest(cfg: HeldoutConfig, key: string, profile: string, p: ReturnType<typeof evalPaths>, contract: RequirementContract | undefined, staged: Staged, apply: boolean): void {
  if (!fs.existsSync(p.verdictJson)) throw new Error(`No verdict for ${key} yet — the harvest keeps only what passing tests proved: ${H} verdict ${key}`);
  const verdict = readJson<{ generatedAt: string; finalRun: string; traceability: { criterion: string; scenarios: { id: string; tests: { id: string; status: string }[] }[] }[] }>(p.verdictJson);
  const passed = new Set<string>();
  for (const t of verdict.traceability ?? []) for (const s of t.scenarios) if (s.tests.some((x) => x.status === 'passed')) passed.add(s.id);
  const logFile = path.join(p.hardening, 'journeys-harvest.json');
  const last = fs.existsSync(logFile) ? readJson<HarvestLog>(logFile) : undefined;
  if (last?.finalRun === verdict.finalRun && apply) throw new Error(`Already harvested for ${verdict.finalRun} → ${last.files.join(', ') || 'nothing to keep'}`);

  const specs = specFiles(p.tests);
  const used = journeysUsedBy(cfg, specs);
  const base = journeyPaths(cfg, profile).base;
  const fixtures = profileFixtures(cfg, profile).filter((f) => used.includes(path.join(base, f.file)));
  const broken = new Set(lintJourneys(used, contract).filter((f) => f.level === 'error').map((f) => f.message.split(' ')[0]));
  const use = fixtureUse(fixtures, specs, readSuite(p.tests, contract).scenarios);
  const at = new Date().toISOString();
  const out: MapObservation[] = [];
  const dropped: { key: string; why: string }[] = [];
  for (const f of fixtures) {
    const k = fixtureKey(f.kind, f.domain, f.fixture);
    const by = [...(use.get(k) ?? [])];
    const proof = by.filter((s) => passed.has(s));
    if (!by.length) continue;
    if (broken.has(rel(path.join(base, f.file)))) dropped.push({ key: k, why: `${f.file} breaks the journey rules (heldout lint ${key})` });
    else if (!proof.length) dropped.push({ key: k, why: `none of ${by.join(', ')} passed in ${verdict.finalRun}` });
    else out.push({ key: k, kind: f.kind, value: mapValueOf(f), status: 'proven', at, by: key, evidence: `${verdict.finalRun}: ${proof.join(', ')} passed` });
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
    console.log(`  ${tag} ${o.key} — ${describeFixture({ kind: o.kind, ...o.value })}`);
  }
  for (const d of dropped) console.log(`  left out ${d.key} — ${d.why}`);
  if (!apply) { console.log(`\nPreview only. Write it: ${H} journeys ${key} --harvest --apply`); return; }
  const files = writeMap(cfg, profile, key, out);
  const log: HarvestLog = { at, finalRun: verdict.finalRun, files: files.map(rel), proven: out.filter((o) => o.status === 'proven').length, stale: out.filter((o) => o.status === 'stale').length, dropped };
  writeFile(logFile, `${JSON.stringify(log, null, 2)}\n`);
  console.log(files.length ? `\n✔ ${files.map(rel).join(', ')} — new file(s): commit them with the journey fixtures and the story's output (they never conflict with anyone else's)` : '\nNothing to keep.');
}
