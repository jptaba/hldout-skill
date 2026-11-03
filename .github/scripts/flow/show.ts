/**
 * Read a story's record — or the project's profile — without writing a script: each view prints what an agent or a
 * person looks for, and --json the same as data.
 *
 *   heldout show KEY contract [--ac AC-1,AC-7] [--gaps [open|mechanics|oracle]] [--endpoints] [--rules] [--errors] [--variants] [--auth] [--md]
 *                                               (--auth: how users sign in, and the contract's test data)
 *   heldout show config [--aut <profile>]       the profile: URLs, accounts (roles, shared, perTest; secrets as their
 *                                               references), workers, pacing, data prefix
 *   heldout show KEY run [NN-label] [--failed] [--test SCN-x]    a run's record (the latest run by default)
 *   heldout show KEY triage [NN-label] [--pending] [--test SCN-x]   classes and decisions (the latest evaluation run)
 *   heldout show KEY triage [NN-label] --group N  one group of "Failures that look alike", as the triage report has it
 *   heldout show KEY spec [--test SCN-x]        the tests as they stand (hardened, or the draft before that): where each
 *                                               test and declaration is; with --test, that test's numbered lines
 *   heldout show KEY probes [--id P7] [--phase harden|triage]   the probe log
 *   heldout show KEY history                    every step that changed the story, in order
 *   … --json                                    the same, as JSON
 */
import fs from 'node:fs';
import path from 'node:path';
import { baseScenarioId, specFiles, specOutline } from '../authoring/spec-model';
import { flagList, flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel, ROOT } from '../core/files';
import { readHistory } from '../core/history';
import { currentTests, evalPaths, evalRunsOf, listRuns, movedRunNote, phaseDirs, runFile } from '../core/paths';
import { readProbes } from '../core/probe-log';
import { readContract } from '../contract/contract-model';
import { renderContract } from '../contract/contract-render';
import { readReview } from '../contract/evidence';
import { pendingOf, readRunRecord, type TriageEntry } from '../run/run-record';
import { failureGroups, placesOf, renderTriageMd, sectionsOf } from '../triage/triage-report';

export const spec: CommandSpec = {
  name: 'show', group: 'Report', usage: 'KEY contract|run|triage|spec|probes|history [...] | config [--aut id]   [--json]', words: 3,
  about: 'read a story\'s record or the profile: parts of the contract, a run, a failure group, a test, the decisions, the probes, the history',
  flags: ['ac', 'aut', 'auth', 'endpoints', 'errors', 'failed', 'gaps', 'group', 'id', 'json', 'md', 'pending', 'phase', 'rules', 'test', 'variants'],
};

const print = (json: boolean, data: unknown, text: () => string[]) => console.log(json ? JSON.stringify(data, null, 2) : text().join('\n'));
const one = (s: unknown, n = 160) => { const t = typeof s === 'string' ? s : JSON.stringify(s ?? ''); return t.length > n ? `${t.slice(0, n)}…` : t; };

export function run({ _, flags }: Args): void {
  const json = Boolean(flags.json);
  if (_[0] === 'config') {
    const cfg = loadConfig({ aut: flagStr(flags, 'aut') });
    const data = { profile: cfg.autId, ...cfg.aut, run: cfg.run, jira: { mode: cfg.jira.mode, publish: cfg.jira.publish ?? 'auto' } };
    const a = cfg.aut.accounts;
    print(json, data, () => [
      `Profile ${cfg.autId}: ${cfg.aut.name}`, `  UI ${cfg.aut.baseURL} · API ${cfg.aut.apiBaseURL} · test ids: ${cfg.aut.testIdAttribute ?? 'data-testid'} · data prefix: ${cfg.aut.dataPrefix ?? 'hldout'}`,
      `  workers: ${cfg.aut.maxWorkers ?? cfg.run.workers ?? 'default'}${cfg.aut.minTestIntervalMs ? ` · tests ${cfg.aut.minTestIntervalMs} ms apart` : ''} · retries ${cfg.run.retries}`,
      ...(cfg.aut.overlays?.length ? [`  overlays: ${cfg.aut.overlays.join(' · ')}`] : []),
      ...(cfg.aut.blockHosts?.length ? [`  blockHosts: ${cfg.aut.blockHosts.join(', ')}`] : []),
      `  accounts: ${!a ? 'none yet' : [
        a.create ? `created by the tests (${a.create.method} ${a.create.path}${a.delete ? `, deleted by ${a.delete.method} ${a.delete.path}` : ', never deleted'})` : '',
        a.signUp ? `created on the sign-up page ${a.signUp.path}` : '',
        ...(a.existing ?? []).map((x) => `existing ${x.username}${x.role ? ` (${x.role})` : ''}${x.shared ? ' shared' : ''} password ${x.password}`),
        a.perTest ? `${a.perTest} per test` : '', a.token ? `API sign-in ${a.token.method} ${a.token.path}` : '', a.signIn ? `UI sign-in ${a.signIn.path}` : '', a.reset ? `reset ${a.reset.method} ${a.reset.path}` : '',
      ].filter(Boolean).join('\n            ')}`,
    ]);
    return;
  }
  const key = assertIssueKey(_[0]);
  const what = _[1];
  const cfg = loadConfig({ key });
  const p = evalPaths(cfg, key);

  if (what === 'contract') {
    const c = readContract(p.contract);
    if (!c) throw new Error(`No contract for ${key} yet (${rel(p.contract)})`);
    if (flags.md) { const review = readReview(p.review); console.log(renderContract(c, review, Boolean(review))); return; }
    // --ac AC-1,AC-7 or --ac AC-1 --ac AC-7.
    const asked = flagList(flags, 'ac').flatMap((x) => x.split(',')).map((x) => x.trim());
    const acs = asked.length ? asked : undefined;
    const gaps = flags.gaps === undefined ? undefined : c.gaps.filter((g) => flags.gaps === true || (flags.gaps === 'open' ? g.resolution === 'open' : g.kind === flags.gaps));
    const parts = { acs: Boolean(acs), gaps: Boolean(gaps), endpoints: Boolean(flags.endpoints), rules: Boolean(flags.rules), errors: Boolean(flags.errors), variants: Boolean(flags.variants), auth: Boolean(flags.auth) };
    const all = !Object.values(parts).some(Boolean);
    const data = {
      key: c.key, title: c.title,
      ...(all || acs ? { acceptanceCriteria: c.acceptanceCriteria.filter((a) => !acs || acs.includes(a.id)) } : {}),
      ...(all || gaps ? { gaps: gaps ?? c.gaps } : {}),
      ...(all || parts.endpoints ? { endpoints: c.endpoints } : {}),
      ...(all || parts.rules ? { rules: c.rules } : {}),
      ...(all || parts.errors ? { errorModel: c.errorModel } : {}),
      ...(all || parts.variants ? { variants: c.variants ?? [] } : {}),
      ...(all || parts.auth ? { auth: c.auth, testData: c.testData } : {}),
    };
    print(json, data, () => [
      `${c.key}: ${c.title}`,
      ...(data.acceptanceCriteria ?? []).flatMap((a) => [`\n${a.id} [${a.layer}] ${a.text}`, ...a.outcomes.map((o) => `   → ${o}`), `   source ${a.source}${a.gaps?.length ? ` · gaps ${a.gaps.join(', ')}` : ''}${a.endpoints?.length ? ` · ${a.endpoints.join(', ')}` : ''}`]),
      ...(data.rules?.length ? ['\nRules', ...data.rules.map((r) => `  ${r.id} ${r.text} (${r.source})`)] : []),
      ...(data.errorModel?.length ? ['\nError model', ...data.errorModel.map((e) => `  ${e.id} ${e.case} → ${e.status ?? '-'} ${e.body ?? ''} (${e.source})`)] : []),
      ...(data.endpoints?.length ? ['\nEndpoints', ...data.endpoints.map((e) => `  ${e.method} ${e.path}${e.auth ? ` · auth ${e.auth}` : ''}${e.success ? ` · ${e.success}` : ''} (${e.source})`)] : []),
      ...(data.gaps?.length ? ['\nGaps', ...data.gaps.map((g) => `  ${g.id} ${g.kind}${g.required ? ' required' : ''} · ${g.resolution}${g.value ? `: ${g.value}` : ''} · ${g.element} → ${g.affects.join(', ')}`)] : []),
      ...(data.variants?.length ? ['\nVariants', ...data.variants.map((v) => `  ${v.key}: ${v.values.map((x) => x.id).join(', ')} → ${v.appliesTo.join(', ')}`)] : []),
      ...(data.auth ? [`\nAuth\n  ${data.auth.mechanism}${data.auth.credentials ? ` · ${data.auth.credentials}` : ''} (${data.auth.source})`] : []),
      ...(data.testData ? [`\nTest data\n  ${data.testData.strategy}${data.testData.constraints?.length ? ` · ${data.testData.constraints.join('; ')}` : ''}${data.testData.cleanup ? ` · cleanup: ${data.testData.cleanup}` : ''}${data.testData.source ? ` (${data.testData.source})` : ''}`] : []),
    ]);
    return;
  }

  if (what === 'run' || what === 'triage') {
    const runs = listRuns(p.runs);
    const name = _[2] ?? (what === 'triage' ? evalRunsOf(p.runs).at(-1) : runs.at(-1));
    if (!name || !fs.existsSync(runFile(p, name))) throw new Error(`No run ${name ?? ''} of ${key} (runs: ${runs.join(', ') || 'none'})${movedRunNote(p, name)}`);
    const r = readRunRecord(runFile(p, name));
    const group = flagStr(flags, 'group');
    if (what === 'triage' && group) {
      const groups = failureGroups(r);
      const g = groups[Number(group) - 1];
      if (!g) throw new Error(`${name} has no group ${group} (${groups.length ? `groups: 1-${groups.length}` : 'it has no failures'})`);
      // Rendered from the project's folder: its evidence links are then paths to read from here.
      const report = sectionsOf(renderTriageMd(r, { dir: ROOT, chains: placesOf(p, name).chains }), g);
      print(json, { run: name, group: Number(group), of: groups.length, tests: g.map((e) => e.scenario), environmentNote: r.environmentNote, report }, () => [`Group ${group} of ${groups.length}, ${name}: ${g.map((e) => e.scenario).join(', ')}`, ...(r.environmentNote ? [`⚠ Environment: ${r.environmentNote}`] : []), '', report]);
      return;
    }
    const test = flagStr(flags, 'test');
    if (test) {
      const e = r.entries.filter((x) => x.scenario === test || x.scenario.startsWith(`${test}.`));
      if (!e.length) throw new Error(`${test} is not in ${name}`);
      console.log(JSON.stringify(e.length === 1 ? e[0] : e, null, 2));
      return;
    }
    const pick = what === 'triage' ? (flags.pending ? pendingOf(r) : r.entries.filter((e) => e.auto)) : flags.failed ? r.entries.filter((e) => e.status !== 'passed') : r.entries;
    const line = (e: TriageEntry) => `  ${e.scenario.padEnd(11)} ${e.status.padEnd(7)} ${(e.final ? `${e.final.category} ✔` : e.auto ? `${e.auto.category} (auto, ${e.auto.confidence})` : '').padEnd(36)} ${one(e.error?.headline ?? e.title, 110)}`;
    print(json, what === 'run' ? { run: name, meta: r.meta, seed: r.seed, summary: r.summary, entries: pick } : { run: name, entries: pick }, () => [
      `${name}: ${r.summary.passed}/${r.summary.total} passed, ${r.summary.failed} failed, ${r.summary.flaky} flaky, ${r.summary.skipped} skipped${r.meta?.grep ? ` · only ${r.meta.grep}` : ''}${r.meta ? ` · ${r.meta.startedAt.slice(0, 16)} · skill ${r.meta.skill}` : ''}`,
      ...(r.environmentNote ? [`  ⚠ ${r.environmentNote}`] : []),
      ...(what === 'run' && r.seed ? [`  seeding: ${r.seed.created} created, ${r.seed.cleaned} cleaned, ${r.seed.kept} kept, ${r.seed.leftovers.length} left behind`] : []),
      ...pick.map(line),
      ...(what === 'triage' ? [`  ${pendingOf(r).length} pending · \`heldout show ${key} ${what} ${name} --test SCN-x\` for one test's evidence`] : []),
    ]);
    return;
  }

  if (what === 'spec') {
    const dir = currentTests(p);
    if (!specFiles(dir).length) throw new Error(`No tests of ${key} yet (${rel(dir)})`);
    const outlines = specFiles(dir).map((file) => ({ file: rel(file), source: file, ...specOutline(file) }));
    const where = (parts: { name: string; from: number; to: number }[]) => parts.map((d) => `${d.name} ${d.from}-${d.to}`).join(', ');
    const test = flagStr(flags, 'test');
    if (test) {
      const id = baseScenarioId(test);
      const hit = outlines.find((o) => o.tests.some((t) => t.name === id));
      const block = hit?.tests.find((t) => t.name === id);
      if (!hit || !block) throw new Error(`${test} is not in ${rel(dir)} (have: ${outlines.flatMap((o) => o.tests.map((t) => t.name)).join(', ')})`);
      const lines = fs.readFileSync(hit.source, 'utf8').split(/\r?\n/).slice(block.from - 1, block.to);
      const code = lines.join('\n');
      const used = hit.declarations.filter((d) => new RegExp(`(^|[^\\w$.])${d.name.replace(/\$/g, '\\$')}\\b`).test(code));
      print(json, { file: hit.file, ...block, used, hooks: hit.hooks, code }, () => [`${hit.file}:${block.from}-${block.to}`,
        ...lines.map((l, i) => `${String(block.from + i).padStart(5)}  ${l}`),
        ...(used.length ? ['', `Declared in the file: ${where(used)}`] : []),
        ...(hit.hooks.length ? [`Hooks in the file: ${where(hit.hooks)}`] : [])]);
      return;
    }
    print(json, outlines.map(({ source: _source, ...o }) => o), () => outlines.flatMap((o) => [o.file,
      ...(o.declarations.length ? [`  declared: ${where(o.declarations)}`] : []),
      ...(o.hooks.length ? [`  hooks: ${where(o.hooks)}`] : []),
      ...o.tests.map((t) => `  ${t.name.padEnd(9)} ${`${t.from}-${t.to}`.padEnd(10)} ${t.tags.join(' ')} ${one(t.title, 90)}`)]));
    return;
  }

  if (what === 'probes') {
    const probes = readProbes(p).filter((x) => !flagStr(flags, 'phase') || x.phase === flagStr(flags, 'phase'));
    const id = flagStr(flags, 'id');
    if (id) {
      const x = probes.find((e) => e.id === id);
      if (!x) throw new Error(`${id} is not in the probe log of ${key}`);
      console.log(JSON.stringify(x, null, 2));
      return;
    }
    print(json, probes, () => probes.length ? probes.map((x) => `  ${x.id.padEnd(4)} ${x.phase.padEnd(7)} ${x.tool.padEnd(9)} ${one(x.digest[0] ?? '', 120)}${fs.existsSync(path.join(phaseDirs(p, x.phase).kept, `${x.id}.md`)) ? '  (cited)' : ''}`) : [`No probes for ${key} yet.`]);
    return;
  }

  if (what === 'history') {
    const events = readHistory(p.history);
    const skip = new Set(['at', 'event', 'skill', 'command']);
    print(json, events, () => events.length ? events.map((e) => `  ${e.at.slice(0, 16).replace('T', ' ')}  ${e.event.padEnd(16)} ${one(Object.fromEntries(Object.entries(e).filter(([k]) => !skip.has(k))), 150)}`) : [`No history for ${key} yet.`]);
    return;
  }
  throw new Error(`Show what? heldout show ${key} contract|run|triage|spec|probes|history, or heldout show config`);
}
