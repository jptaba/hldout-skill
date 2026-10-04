/**
 * App knowledge — HOW to drive an application, learned once and reused by every later story on it (aut-knowledge/<profile>/).
 * It opens only after the freeze: tests and expected values are always written from the requirement alone.
 *
 *   heldout knowledge KEY                     the entries this story needs (once the draft is frozen)
 *   heldout knowledge KEY --all               every entry of the story's application
 *   heldout knowledge KEY --add page --route /contacts [--name "Contacts"] [--ready "<locator>"] [--reach "…"] [--signed-in] --for SCN-001[,SCN-002]
 *   heldout knowledge KEY --add locator --route /contacts --element "Add contact button" --locator "<locator>" --for SCN-001
 *   heldout knowledge KEY --add endpoint --endpoint "POST /contacts" [--auth required] [--auth-header "Authorization: Bearer ${token}"] [--query a,b] [--envelope x] [--fields a,b] [--required a] --for SCN-003
 *   heldout knowledge KEY --add seed --entity contact --create "POST /contacts" [--id _id] [--fields a,b] [--cleanup "DELETE /contacts/{id}"] --for SCN-002
 *   heldout knowledge KEY --add note --topic "pacing" --text "…" [--app-wide] --for SCN-004   (--app-wide: shown to every story)
 *   heldout knowledge KEY --confirm "<entry key>" --for SCN-001  an entry you verified and your tests rely on, as it is
 *   heldout knowledge KEY --stale "<entry key>" --evidence "<what failed>"
 *   heldout knowledge KEY --unstage "<entry key>"  take back what you added, confirmed or marked stale for a key
 *   heldout knowledge KEY --harvest [--apply]  after the verdict: what the story proved (preview; --apply writes it)
 *   heldout knowledge --aut <id>              every entry of a profile (no story needed)
 *   heldout knowledge --aut <id> --log        what was learned, when and from which story
 *   heldout knowledge --aut <id> --compact    fold every file into one snapshot (run from one place, e.g. a scheduled CI job)
 *
 * --add and --stale are recorded with the story (hardening/knowledge-staged.json) and reach aut-knowledge/ only through
 * the harvest, which keeps what a passing test used. Mechanics only: an entry never says what the application answers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey, evalPaths, flagStr, loadConfig, main, parseArgs, readJson, rel, writeFile } from './lib/config';
import { readContract, type RequirementContract } from './lib/contract';
import {
  compact, describeEntry, describeValue, entries, keys, knowledgeDir, loadKnowledge, oracleLeak, relevantTo, statusOf, usesLocator, valueId, writeFacts,
  type KnowledgeEntry, type KnowledgeKind, type Observation,
} from './lib/knowledge';

const H = 'npm run heldout --';
interface Staged { facts: (Observation & { for: string[]; via?: 'add' | 'confirm' | 'stale' })[] }
interface UsedLog { calls: { at: string; all: boolean; shown: { key: string; status: string }[] }[] }
export interface HarvestLog { at: string; verdictAt: string; file?: string; proven: number; stale: number; dropped: { key: string; why: string }[] }

const list = (v: string | undefined) => (v ?? '').split(',').map((x) => x.trim()).filter(Boolean);

main(() => {
  const { _, flags } = parseArgs();
  const key = _[0] ? assertIssueKey(_[0]) : undefined;
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const profile = cfg.autId;
  const store = loadKnowledge(profile);
  const all = entries(store.records);
  const where = rel(knowledgeDir(profile));

  // ---- profile-wide views (no story) ----
  if (!key) {
    if (flags.compact) {
      const r = compact(profile);
      console.log(r ? `✔ folded ${r.folded} file(s) into ${rel(r.snapshot)} (${r.records} record(s)); commit the new snapshot and the deleted files together` : `Nothing to compact in ${where} (one file or none).`);
      return;
    }
    if (flags.log) {
      const events = store.records.flatMap((r) => [
        ...(r.provenAt ? [{ at: r.provenAt, what: `proven by ${r.stories.join(', ')}`, r }] : []),
        ...(r.seenAt ? [{ at: r.seenAt, what: 'seen by doctor --learn', r }] : []),
        ...(r.staleAt ? [{ at: r.staleAt, what: `found stale${r.evidence ? ` (${r.evidence})` : ''}`, r }] : []),
      ]).sort((a, b) => b.at.localeCompare(a.at));
      console.log(`# What the evaluator learned about ${cfg.aut.name} (${profile})\n`);
      for (const e of events) console.log(`- ${e.at.slice(0, 16).replace('T', ' ')} · ${e.r.key} — ${describeValue({ kind: e.r.kind, best: e.r })} — ${e.what}`);
      if (!events.length) console.log(`Nothing yet. Start with: ${H} doctor --learn --aut ${profile}`);
      return;
    }
    printEntries(all, `${cfg.aut.name} (${profile}) — ${all.length} entr${all.length === 1 ? 'y' : 'ies'} in ${where} (${store.files.length} fact file(s), ${store.snapshots.length} snapshot(s))`);
    if (!all.length) console.log(`Nothing yet. Start with: ${H} doctor --learn --aut ${profile}`);
    return;
  }

  const p = evalPaths(cfg, key);
  const contract = readContract(p.base);
  const frozen = fs.existsSync(p.draft) && fs.readdirSync(p.draft).some((f) => f.endsWith('.spec.ts'));
  const stagedFile = path.join(p.hardening, 'knowledge-staged.json');
  const staged: Staged = fs.existsSync(stagedFile) ? readJson<Staged>(stagedFile) : { facts: [] };

  if (flags.harvest) return harvest(key, profile, p, contract, staged, Boolean(flags.apply));

  // Everything below is hardening: the tests and their expected values are frozen first.
  if (!frozen) {
    throw new Error(`App knowledge opens after the freeze, so the tests and their expected values come from the requirement alone.\n  Freeze first: ${H} integrity ${key} --snapshot`);
  }

  // --unstage: take back what this story recorded for a key (added, confirmed or marked stale) before the harvest.
  if (flagStr(flags, 'unstage')) {
    const k = flagStr(flags, 'unstage')!;
    const before = staged.facts.length;
    staged.facts = staged.facts.filter((f) => f.key !== k);
    if (before === staged.facts.length) throw new Error(`Nothing recorded for "${k}" by ${key}. Recorded: ${[...new Set(staged.facts.map((f) => f.key))].join(', ') || 'nothing'}`);
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${k}: ${before - staged.facts.length} record(s) taken back; the harvest won't keep them.`);
    return;
  }

  if (flagStr(flags, 'stale')) {
    const k = flagStr(flags, 'stale')!;
    const e = all.find((x) => x.key === k);
    if (!e) throw new Error(`No entry "${k}" for ${profile}. Keys are listed by: ${H} knowledge ${key} --all`);
    const evidence = flagStr(flags, 'evidence');
    if (!evidence) throw new Error('--stale needs --evidence "<what failed, e.g. the probe report>"');
    staged.facts.push({ key: e.key, kind: e.kind, value: e.best.value, status: 'stale', at: new Date().toISOString(), by: key, evidence, for: [], via: 'stale' });
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${e.key} (${describeValue(e)}) will be marked stale by the harvest.`);
    return;
  }

  // --confirm: an entry you verified and your tests rely on, as it is (a wrong stale mark is cleared the same way).
  if (flagStr(flags, 'confirm')) {
    const k = flagStr(flags, 'confirm')!;
    const e = all.find((x) => x.key === k);
    if (!e) throw new Error(`No entry "${k}" for ${profile}. Keys are listed by: ${H} knowledge ${key} --all`);
    const scenarios = list(flagStr(flags, 'for'));
    if (!scenarios.length) throw new Error('--confirm needs --for SCN-001[,SCN-002]: the scenarios whose tests rely on it (the harvest keeps it only if one of them passes)');
    // A confirm replaces an earlier confirm of the key; what you added for it stays.
    staged.facts = staged.facts.filter((f) => !(f.key === e.key && f.via === 'confirm'));
    staged.facts.push({ key: e.key, kind: e.kind, value: e.best.value, status: 'proven', at: new Date().toISOString(), by: key, for: scenarios, via: 'confirm' });
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${e.key} — ${describeValue(e)}\n  proven by the harvest if ${scenarios.join(' or ')} passes${e.status === 'stale' ? ' (this clears its stale mark)' : ''}`);
    return;
  }

  const kind = flagStr(flags, 'add') as KnowledgeKind | undefined;
  if (kind) {
    const scenarios = list(flagStr(flags, 'for'));
    if (!scenarios.length) throw new Error('--add needs --for SCN-001[,SCN-002]: the scenarios whose tests use it (the harvest keeps it only if one of them passes)');
    const added = observation(kind, flags);
    // An endpoint keeps what was already known of it (the API document's full field list) under what you add.
    const known = added.kind === 'endpoint' ? all.find((x) => x.key === added.key && x.status !== 'stale')?.best.value : undefined;
    const o = known ? { ...added, value: { ...known, ...added.value } } : added;
    const leak = oracleLeak(o, contract);
    if (leak) throw new Error(`Not recorded: ${leak}. App knowledge holds HOW to drive the application, never what it answers.`);
    // Adding a key again corrects what you added; a confirm of the key stays.
    staged.facts = staged.facts.filter((f) => !(f.key === o.key && f.via === 'add'));
    staged.facts.push({ ...o, status: 'proven', at: new Date().toISOString(), by: key, for: scenarios, via: 'add' });
    writeFile(stagedFile, `${JSON.stringify(staged, null, 2)}\n`);
    console.log(`✔ ${o.key} — ${describeValue({ kind: o.kind, best: o })}\n  kept by the harvest if ${scenarios.join(' or ')} passes (${rel(stagedFile)})`);
    return;
  }

  // Read: the entries this story needs (or all), logged for the verdict.
  if (!contract) throw new Error(`No requirement contract for ${key} — the story's entries are chosen from its endpoints and pages`);
  const shown = flags.all ? all : relevantTo(all, contract);
  printEntries(shown, `App knowledge for ${key} on ${cfg.aut.name} (${profile}): ${shown.length} of ${all.length} entr${all.length === 1 ? 'y' : 'ies'}${flags.all ? '' : ' (--all for every one)'}`);
  if (!all.length) console.log(`No app knowledge for ${profile} yet: harden as usual. What this story proves is kept by ${H} knowledge ${key} --harvest --apply after the verdict.`);
  if (all.length) {
    console.log('\nMechanics only. Verify each with a probe before use (an entry can be out of date).');
    console.log(`  works and your tests rely on it:  ${H} knowledge ${key} --confirm "<key>" --for <SCN>`);
    console.log(`  doesn't work (discover it as usual): ${H} knowledge ${key} --stale "<key>" --evidence "…"`);
  }
  console.log(`Record what you find that holds for the whole application (pages, locators, endpoints, seed recipes, and what a mechanics gap\nturned out to be) with --add … --for <SCN>, so later stories reuse it; a note every story needs (pacing, data that regenerates)\nwith --app-wide. Not this story's own data (ids, names), which change.`);
  const usedFile = path.join(p.hardening, 'knowledge-used.json');
  const used: UsedLog = fs.existsSync(usedFile) ? readJson<UsedLog>(usedFile) : { calls: [] };
  used.calls.push({ at: new Date().toISOString(), all: Boolean(flags.all), shown: shown.map((e) => ({ key: e.key, status: e.status })) });
  writeFile(usedFile, `${JSON.stringify(used, null, 2)}\n`);
});

function printEntries(list: KnowledgeEntry[], title: string): void {
  console.log(title);
  let kind = '';
  for (const e of list) {
    if (e.kind !== kind) { kind = e.kind; console.log(`\n${kind}`); }
    console.log(`  ${describeEntry(e)}`);
  }
}

/** The entry --add describes, from its flags. */
function observation(kind: KnowledgeKind, flags: ReturnType<typeof parseArgs>['flags']): Pick<Observation, 'key' | 'kind' | 'value'> {
  const need = (v: string | undefined, name: string) => { if (!v) throw new Error(`--add ${kind} needs --${name}`); return v; };
  // A route may be "/", "", "orders", "/orders" or "#/login"; an empty one is the start page.
  const routeFlag = () => { if (flags.route === undefined) throw new Error(`--add ${kind} needs --route (the start page: --route /)`); return flagStr(flags, 'route') || '/'; };
  // Git Bash rewrites an argument that starts with "/" into a Windows path, and a "/path" inside text too: undone.
  const unmsys = (x: unknown) => (typeof x === 'string' ? x.replace(/[A-Za-z]:\/Program Files(?: \(x86\))?\/Git\//g, '/') : x);
  const clean = (v: Record<string, unknown>) => Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined && x !== false && !(Array.isArray(x) && !x.length)).map(([k, x]) => [k, unmsys(x)]));
  switch (kind) {
    case 'page': {
      const route = routeFlag();
      return { key: keys.page(route), kind, value: clean({ route: keys.page(route).slice(5), name: flagStr(flags, 'name'), ready: flagStr(flags, 'ready'), reach: flagStr(flags, 'reach'), signedIn: Boolean(flags['signed-in']) }) };
    }
    case 'locator': {
      const route = routeFlag();
      const element = need(flagStr(flags, 'element'), 'element');
      const locator = need(flagStr(flags, 'locator'), 'locator');
      // One entry per element: the harvest keeps a locator only when the tests use it as written.
      if (/\s\/\s|;\s*(page\.)?(getBy|locator)/.test(locator.replace(/'[^']*'|"[^"]*"/g, "''"))) throw new Error('--locator takes one locator expression: record each element as its own entry');
      return { key: keys.locator(route, element), kind, value: clean({ route: keys.page(route).slice(5), element, locator }) };
    }
    case 'endpoint': {
      const [method, p] = need(flagStr(flags, 'endpoint'), 'endpoint').trim().split(/\s+/);
      if (!method || !p) throw new Error('--endpoint takes "METHOD /path", e.g. "POST /contacts"');
      return { key: keys.endpoint(method, p), kind, value: clean({ method: method.toUpperCase(), path: p, auth: flagStr(flags, 'auth'), authHeader: flagStr(flags, 'auth-header'), query: list(flagStr(flags, 'query')), envelope: flagStr(flags, 'envelope'), requestFields: list(flagStr(flags, 'fields')), required: list(flagStr(flags, 'required')) }) };
    }
    case 'seed': {
      const entity = need(flagStr(flags, 'entity'), 'entity');
      return { key: keys.seed(entity), kind, value: clean({ entity, create: need(flagStr(flags, 'create'), 'create'), id: flagStr(flags, 'id'), fields: list(flagStr(flags, 'fields')), cleanup: flagStr(flags, 'cleanup') }) };
    }
    case 'note': {
      const topic = need(flagStr(flags, 'topic'), 'topic');
      return { key: keys.note(topic), kind, value: clean({ topic, text: need(flagStr(flags, 'text'), 'text'), appWide: Boolean(flags['app-wide']) }) };
    }
    default: throw new Error(`--add takes page, locator, endpoint, seed or note (got "${String(kind)}")`);
  }
}

/**
 * After the verdict: what this story proved, as one new fact file. Kept: entries recorded with --add whose scenarios
 * include one that passed in the final run (a locator or readiness anchor also has to be in the final tests), the
 * endpoints of criteria that a passing scenario exercised (their auth, envelope and request fields), and stale marks.
 * Dropped: anything only failing scenarios used (they may have worked around a defect) and anything that carries an
 * expected value. The story's own mechanics gaps are not copied: what of them holds for the whole application is
 * recorded with --add while hardening.
 */
function harvest(key: string, profile: string, p: ReturnType<typeof evalPaths>, contract: RequirementContract | undefined, staged: Staged, apply: boolean): void {
  if (!fs.existsSync(p.verdictJson)) throw new Error(`No verdict for ${key} yet — the harvest keeps only what passing tests proved: ${H} verdict ${key}`);
  const verdict = readJson<{ generatedAt: string; finalRun: string; traceability: { criterion: string; scenarios: { id: string; tests: { id: string; status: string }[] }[] }[] }>(p.verdictJson);
  const passed = new Set<string>();
  const passedAcs = new Set<string>();
  for (const t of verdict.traceability ?? []) for (const s of t.scenarios) {
    if (s.tests.some((x) => x.status === 'passed')) { passed.add(s.id); passedAcs.add(t.criterion); }
  }
  const logFile = path.join(p.hardening, 'knowledge-harvest.json');
  const last = fs.existsSync(logFile) ? readJson<HarvestLog>(logFile) : undefined;
  if (last?.verdictAt === verdict.generatedAt && apply) throw new Error(`Already harvested for this verdict → ${last.file ?? 'nothing to keep'}`);

  const at = new Date().toISOString();
  const out: Observation[] = [];
  const dropped: { key: string; why: string }[] = [];
  const keep = (o: Observation) => {
    const leak = o.status === 'stale' ? undefined : oracleLeak(o, contract);
    if (leak) dropped.push({ key: o.key, why: leak }); else out.push(o);
  };
  // A locator (or a page's readiness anchor) is proven only if the final tests use it: the same calls, where a quoted
  // name may be a constant in the test (REQ.MY_ACCOUNT) and the options may carry more (exact: true).
  const specs = fs.existsSync(p.tests) ? fs.readdirSync(p.tests, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts')).map((f) => fs.readFileSync(path.join(p.tests, f), 'utf8')).join('\n') : '';
  const usedInTests = (o: Observation) => {
    const expr = o.kind === 'locator' ? o.value.locator : o.kind === 'page' ? o.value.ready : undefined;
    return typeof expr !== 'string' || usesLocator(specs, expr);
  };
  for (const f of staged.facts) {
    const { for: scenarios, via, ...o } = f;
    void via;
    if (o.status === 'stale') { keep({ ...o, by: key }); continue; }
    const proof = scenarios.filter((s) => passed.has(s.replace(/\.\d+$/, '')));
    if (!proof.length) dropped.push({ key: o.key, why: `none of ${scenarios.join(', ')} passed in ${verdict.finalRun}` });
    else if (!usedInTests(o)) dropped.push({ key: o.key, why: `the tests do not use ${String(o.value.locator ?? o.value.ready)}` });
    else keep({ ...o, at, by: key, evidence: `${verdict.finalRun}: ${proof.join(', ')} passed` });
  }
  const all = entries(loadKnowledge(profile).records);
  const before = new Map(all.map((e) => [e.key, e]));
  const recorded = new Set(out.map((o) => o.key));
  for (const e of contract?.endpoints ?? []) {
    const k = keys.endpoint(e.method, e.path);
    if (recorded.has(k)) continue;
    const acs = (contract?.acceptanceCriteria ?? []).filter((a) => (a.endpoints ?? []).some((x) => keys.endpoint(x.split(/\s+/)[0] ?? '', x.split(/\s+/)[1] ?? '') === k)).map((a) => a.id);
    const proof = acs.filter((a) => passedAcs.has(a));
    if (!proof.length) continue;
    // What the story states, on top of what was already known of the endpoint (the request fields of the API document).
    const stated = Object.fromEntries(Object.entries({ auth: e.auth, envelope: e.envelope, requestFields: e.requestFields?.length ? e.requestFields : undefined }).filter(([, x]) => x !== undefined));
    const value = { method: e.method.toUpperCase(), path: e.path, ...(before.get(k)?.best.value ?? {}), ...stated };
    keep({ key: k, kind: 'endpoint', value, status: 'proven', at, by: key, evidence: `${verdict.finalRun}: ${proof.join(', ')} passed` });
  }

  console.log(`Harvest of ${key} (${verdict.finalRun}) for ${profile}: ${out.filter((o) => o.status !== 'stale').length} proven, ${out.filter((o) => o.status === 'stale').length} stale, ${dropped.length} left out\n`);
  for (const o of out) {
    const was = before.get(o.key);
    const tag = o.status === 'stale' ? 'stale  ' : !was ? 'new    ' : [was.best, ...was.alternatives].some((r) => valueId(r.key, r.value) === valueId(o.key, o.value)) ? (statusOf(was.best) === 'proven' ? 're-proven' : 'proven ') : 'changed';
    console.log(`  ${tag} ${o.key} — ${describeValue({ kind: o.kind, best: o })}`);
  }
  for (const d of dropped) console.log(`  left out ${d.key} — ${d.why}`);
  if (!apply) { console.log(`\nPreview only. Write it: ${H} knowledge ${key} --harvest --apply`); return; }
  const file = writeFacts(profile, key, out);
  const log: HarvestLog = { at, verdictAt: verdict.generatedAt, ...(file ? { file: rel(file) } : {}), proven: out.filter((o) => o.status !== 'stale').length, stale: out.filter((o) => o.status === 'stale').length, dropped };
  writeFile(logFile, `${JSON.stringify(log, null, 2)}\n`);
  console.log(file ? `\n✔ ${rel(file)} — a new file: commit it with the evaluation (it never conflicts with anyone else's)` : '\nNothing to keep.');
}
