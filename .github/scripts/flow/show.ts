/**
 * Read a story's record — or the project's profile — without writing a script: each view prints what an agent or a
 * person looks for, and --json the same as data.
 *
 *   heldout show KEY contract [--ac AC-1,AC-7] [--gaps [open|mechanics|oracle]] [--endpoints] [--rules] [--errors] [--variants] [--md]
 *   heldout show config [--aut <profile>]       the profile: URLs, accounts (roles, shared, perTest; secrets as their
 *                                               references), workers, pacing, data prefix
 *   heldout show KEY run [NN-label] [--failed] [--test SCN-x]    a run's record (the latest run by default)
 *   heldout show KEY triage [NN-label] [--pending] [--test SCN-x]   classes and decisions (the latest evaluation run)
 *   heldout show KEY probes [--id P7] [--phase harden|triage]   the probe log
 *   heldout show KEY history                    every step that changed the story, in order
 *   … --json                                    the same, as JSON
 */
import fs from 'node:fs';
import path from 'node:path';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import { rel } from '../core/files';
import { readHistory } from '../core/history';
import { evalPaths, evalRunsOf, listRuns, phaseDirs, runFile } from '../core/paths';
import { readProbes } from '../core/probe-log';
import { readContract } from '../requirement/contract-model';
import { renderContract } from '../requirement/contract-render';
import { readReview } from '../requirement/evidence';
import { pendingOf, readRunRecord, type TriageEntry } from '../triage/triage-model';

export const spec: CommandSpec = {
  name: 'show', group: 'Report', usage: 'KEY contract|run|triage|probes|history [...] | config [--aut id]   [--json]', words: 3,
  about: 'read a story\'s record or the profile: parts of the contract, a run, the decisions, the probes, the history',
  flags: ['ac', 'aut', 'endpoints', 'errors', 'failed', 'gaps', 'id', 'json', 'md', 'pending', 'phase', 'rules', 'test', 'variants'],
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
    const acs = flagStr(flags, 'ac')?.split(',').map((x) => x.trim());
    const gaps = flags.gaps === undefined ? undefined : c.gaps.filter((g) => flags.gaps === true || (flags.gaps === 'open' ? g.resolution === 'open' : g.kind === flags.gaps));
    const parts = { acs: Boolean(acs), gaps: Boolean(gaps), endpoints: Boolean(flags.endpoints), rules: Boolean(flags.rules), errors: Boolean(flags.errors), variants: Boolean(flags.variants) };
    const all = !Object.values(parts).some(Boolean);
    const data = {
      key: c.key, title: c.title,
      ...(all || acs ? { acceptanceCriteria: c.acceptanceCriteria.filter((a) => !acs || acs.includes(a.id)) } : {}),
      ...(all || gaps ? { gaps: gaps ?? c.gaps } : {}),
      ...(all || parts.endpoints ? { endpoints: c.endpoints } : {}),
      ...(all || parts.rules ? { rules: c.rules } : {}),
      ...(all || parts.errors ? { errorModel: c.errorModel } : {}),
      ...(all || parts.variants ? { variants: c.variants ?? [] } : {}),
    };
    print(json, data, () => [
      `${c.key}: ${c.title}`,
      ...(data.acceptanceCriteria ?? []).flatMap((a) => [`\n${a.id} [${a.layer}] ${a.text}`, ...a.outcomes.map((o) => `   → ${o}`), `   source ${a.source}${a.gaps?.length ? ` · gaps ${a.gaps.join(', ')}` : ''}${a.endpoints?.length ? ` · ${a.endpoints.join(', ')}` : ''}`]),
      ...(data.rules?.length ? ['\nRules', ...data.rules.map((r) => `  ${r.id} ${r.text} (${r.source})`)] : []),
      ...(data.errorModel?.length ? ['\nError model', ...data.errorModel.map((e) => `  ${e.id} ${e.case} → ${e.status ?? '-'} ${e.body ?? ''} (${e.source})`)] : []),
      ...(data.endpoints?.length ? ['\nEndpoints', ...data.endpoints.map((e) => `  ${e.method} ${e.path}${e.auth ? ` · auth ${e.auth}` : ''}${e.success ? ` · ${e.success}` : ''} (${e.source})`)] : []),
      ...(data.gaps?.length ? ['\nGaps', ...data.gaps.map((g) => `  ${g.id} ${g.kind}${g.required ? ' required' : ''} · ${g.resolution}${g.value ? `: ${g.value}` : ''} · ${g.element} → ${g.affects.join(', ')}`)] : []),
      ...(data.variants?.length ? ['\nVariants', ...data.variants.map((v) => `  ${v.key}: ${v.values.map((x) => x.id).join(', ')} → ${v.appliesTo.join(', ')}`)] : []),
    ]);
    return;
  }

  if (what === 'run' || what === 'triage') {
    const runs = listRuns(p.runs);
    const name = _[2] ?? (what === 'triage' ? evalRunsOf(p.runs).at(-1) : runs.at(-1));
    if (!name || !fs.existsSync(runFile(p, name))) throw new Error(`No run ${name ?? ''} of ${key} (runs: ${runs.join(', ') || 'none'})`);
    const r = readRunRecord(runFile(p, name));
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
  throw new Error(`Show what? heldout show ${key} contract|run|triage|probes|history, or heldout show config`);
}
