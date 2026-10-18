/**
 * The triage report of a run (5-runs/NN-label/triage.md): what its reader, a person or the triager subagent, goes through
 * before reproducing a failure. Pure rendering of a TriageReport; `heldout triage` writes it.
 */
import path from 'node:path';
import { ROOT } from '../core/files';
import { pageText } from '../core/redact';
import type { ApiExchange } from './classify';
import { maskVolatile, type TriageEntry, type TriageReport } from './triage-model';

/** A body for the report, on one line: of an HTML page what it says (its text), not its markup; long ones cut. */
export const short = (v: unknown, n = 600) => {
  let s = typeof v === 'string' ? v : JSON.stringify(v);
  if (!s) return '';
  s = pageText(s).replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n)}…` : s;
};

/** The call's address for a replay: its full URL as recorded (right whatever path the API sits under), else without a leading slash, which Git Bash would rewrite. */
export const replayPath = (url: string): string => (/^https?:\/\//.test(url) ? url : url.replace(/^\/+/, ''));

export const replaySlug = (scenario: string) => scenario.toLowerCase().replace(/[^a-z0-9]+/g, '-');
export const signedIn = (api?: ApiExchange) => Object.keys(api?.request.headers ?? {}).some((h) => /^(authorization|cookie)$/i.test(h));

/**
 * Failures that look alike are read together: the same criterion, the same call (whatever records it names) with the
 * same status, or the same locator. A hint for the reader, who decides what is one root cause.
 */
export function likeness(e: TriageEntry): string {
  const api = e.evidence.api;
  const what = api ? `${api.request.method} ${maskVolatile(new URL(api.request.url, 'http://x').pathname)} → ${api.response.status}` : maskVolatile(e.error?.locator) ?? maskVolatile(e.error?.headline) ?? '';
  // A page's test and a direct call are read apart even when the same call is behind both: what they failed on differs.
  return `${e.requirementRefs.join(', ') || '-'} · ${e.layer === 'api' || !e.layer ? '' : `${e.layer}: `}${what}`;
}

/** The call that made the state a failed read-back looked at: the last call before it that changed something. */
function callBefore(e: TriageEntry): ApiExchange | undefined {
  const api = e.evidence.api; const seq = e.evidence.apiSequence ?? [];
  if (!api || api.request.method !== 'GET') return undefined;
  return seq.slice(0, e.evidence.apiRelevantIndex ?? seq.length).reverse().find((x) => x.request.method !== 'GET');
}

/** Where the triage report is written, and where its replay commands put their files. */
export interface TriageReportPlaces {
  /** The folder the report is written to: its evidence links are relative to it. */
  dir: string;
  /** The starting chains `triage` writes for the failures (scratch). */
  chains: string;
}

/** @param root the project's folder, which the paths in the report's evidence are relative to. */
export function renderTriageMd(r: TriageReport, places: TriageReportPlaces, root = ROOT): string {
  const link = (projRel: string) => path.relative(places.dir, path.join(root, projRel)).split(path.sep).join('/');
  const fromRoot = (dir: string, file: string) => path.relative(root, path.join(dir, file)).split(path.sep).join('/');
  const out = [`# Triage — ${r.key} / run ${r.run}`, '', `Generated ${r.generatedAt}`, '', ...(r.environmentNote ? [`> ⚠️ **Environment:** ${r.environmentNote}`, ''] : []),
    `**${r.summary.passed}/${r.summary.total} passed**, ${r.summary.failed} failed, ${r.summary.flaky} flaky, ${r.summary.skipped} skipped.`, '',
    '| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |', '| --- | --- | --- | --- | --- | --- | --- |',
    // The tests that need a look, one row each; the ones that passed, in a line.
    ...r.entries.filter((e) => e.status !== 'passed' || e.auto).map((e) => `| ${e.scenario} | ${e.testType ?? '-'} | ${e.requirementRefs.join(', ')} | ${e.status} | ${e.auto?.category ?? '-'} | ${e.auto?.confidence ?? '-'} | ${e.final ? `**${e.final.category}**` : e.auto ? '⏳ pending' : '-'} |`), '',
    ...(r.entries.some((e) => e.status === 'passed' && !e.auto) ? [`Passed (${r.entries.filter((e) => e.status === 'passed' && !e.auto).length}): ${r.entries.filter((e) => e.status === 'passed' && !e.auto).map((e) => e.scenario).join(', ')}`, ''] : [])];
  const failed = r.entries.filter((x) => x.error);
  const groups = new Map<string, TriageEntry[]>();
  for (const e of failed) groups.set(likeness(e), [...(groups.get(likeness(e)) ?? []), e]);
  if (failed.length > groups.size) out.push(`## Failures that look alike (${failed.length} failures, ${groups.size} groups)`, '',
    'The same criterion and the same call and status (or the same locator). Read the first of a group in full; the others show what differs. Whether a group is one root cause is yours to decide.', '',
    '| # | Criteria · what failed | Tests |', '| --- | --- | --- |',
    ...[...groups].map(([k, g], i) => `| ${i + 1} | ${k.replace(/\|/g, '/')} | ${g.map((e) => e.scenario).join(', ')} |`), '');
  // A test's screenshot, trace and page snapshot sit in one folder: the folder once, then the files in it.
  const evidenceLine = (e: TriageEntry) => {
    const files = [e.evidence.screenshot, e.evidence.trace, e.evidence.errorContext].filter((f): f is string => Boolean(f));
    if (!files.length) return '- Evidence: -';
    const dir = path.posix.dirname(files[0]);
    if (files.some((f) => path.posix.dirname(f) !== dir)) return `- Evidence: ${files.map((f) => `[${path.posix.basename(f)}](${link(f)})`).join(' · ')}`;
    return `- Evidence: ${files.map((f) => path.posix.basename(f)).join(', ')} in [this folder](${link(dir)}/)`;
  };
  const bodyOf = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v ?? ''));
  // "toContain", "toHaveText": which of the two values is the one looked for, and in what.
  const matcher = (e: TriageEntry) => (e.error?.matcher ? ` (${e.error.matcher})` : '');
  const before = (e: TriageEntry) => { const c = callBefore(e); return c ? [`  - the call before it: \`${c.request.method} ${c.request.url}\` → **${c.response.status}**${c.request.body ? ` · body \`${short(c.request.body, 200)}\`` : ''}`] : []; };
  const told = new Map<string, string>();
  for (const [n, g] of [...groups.values()].entries()) for (const e of g) {
    const api = e.evidence.api; const first = g[0]; const firstApi = first.evidence.api;
    // A decision already written out for an earlier failure is named, not repeated.
    const decision = e.final ? `${e.final.category}|${e.final.severity ?? ''}|${e.final.rationale}|${e.final.action ?? ''}` : '';
    const confirmed = !e.final ? [] : told.has(decision) ? [`**Confirmed: ${e.final.category}${e.final.severity ? ` / ${e.final.severity}` : ''}** — as ${told.get(decision)}.`, '']
      : [`**Confirmed: ${e.final.category}${e.final.severity ? ` / ${e.final.severity}` : ''}** — ${e.final.rationale}`, ...(e.final.action ? ['', `Action: ${e.final.action}`] : []), ''];
    if (decision && !told.has(decision)) told.set(decision, e.scenario);
    if (e !== first) {
      // The rest of a group: what this failure has of its own, the rest as the first one.
      const sameAnswer = api && firstApi && bodyOf(api.response.body) === bodyOf(firstApi.response.body);
      out.push(`## ${e.title}`, '', `- Like ${first.scenario} (group ${n + 1}); type: ${e.testType ?? '-'} · layer: ${e.layer ?? '-'}${e.failingStep !== first.failingStep ? ` · failing step: ${e.failingStep ?? '-'}` : ''}`,
        ...(e.evidence.repeats ? [`- Repeats: failed **${e.evidence.repeats.failed} of ${e.evidence.repeats.runs}**`] : []),
        `- Error: \`${e.error!.headline}\``,
        ...(e.error!.expected !== undefined ? [`- Expected${matcher(e)}: \`${e.error!.expected}\` · received: \`${e.error!.received ?? '-'}\``] : []),
        ...(api ? [`- Call: \`${api.request.method} ${api.request.url}\` → **${api.response.status}**${api.request.as ? ` · sent as: ${api.request.as}` : signedIn(api) ? '' : ' · sent as: a visitor (no token)'}`,
          ...before(e),
          ...(api.request.body && short(api.request.body) !== short(firstApi?.request.body) ? [`  - request body: \`${short(api.request.body, 300)}\``] : []),
          `  - response body: ${sameAnswer ? `as ${first.scenario}` : `\`${short(api.response.body, 300)}\``}`] : []),
        evidenceLine(e),
        ...(e.auto!.category !== first.auto!.category || e.auto!.confidence !== first.auto!.confidence ? [`- Auto: **${e.auto!.category} (${e.auto!.confidence})**, unlike ${first.scenario}: ${e.auto!.signals.filter((s) => !/^(Expected|Received):/.test(s)).join(' · ')}`] : []),
        '', ...confirmed);
      continue;
    }
    out.push(`## ${e.title}`, '', `- Requirement refs: ${e.requirementRefs.join(', ') || '-'} · type: ${e.testType ?? '-'} · layer: ${e.layer ?? '-'}`, `- Failing step: ${e.failingStep ?? '-'}`,
      ...(e.evidence.repeats ? [`- Repeats: failed **${e.evidence.repeats.failed} of ${e.evidence.repeats.runs}**`] : []),
      `- Error: \`${e.error!.headline}\``, ...(e.error!.locator ? [`- Locator: \`${e.error!.locator}\``] : []),
      ...(e.error!.expected !== undefined ? [`- Expected${matcher(e)}: \`${e.error!.expected}\``] : []), ...(e.error!.received !== undefined ? [`- Received: \`${e.error!.received}\``] : []),
      ...(api ? [`- Relevant API exchange (${e.evidence.apiCalls ? '' : 'precondition '}#${(e.evidence.apiRelevantIndex ?? 0) + 1} of ${e.evidence.apiCalls ?? e.evidence.preSequence?.length ?? 1}): \`${api.request.method} ${api.request.url}\` → **${api.response.status}**`,
        ...(api.request.as ? [`  - sent as: ${api.request.as}`] : signedIn(api) ? [] : ['  - sent as: a visitor (no token)']),
        ...before(e),
        `  - request body: \`${short(api.request.body)}\``, `  - response body: \`${short(api.response.body)}\``,
        // A starting point for the live replay: the call as the test made it (a body, a token or the calls before it
        // are added by hand, or the sequence goes in a chain file).
        ...(e.final ? [] : signedIn(api)
          ? [`  - replay: the test sent this call signed in, so replay it as a chain: the sign-in of that kind of user, this call, and a control call that should succeed (the owner, an administrator). A starting chain, when the profile has an API sign-in: \`npm run heldout -- api-probe --key ${r.key} --chain ${fromRoot(places.chains, `${replaySlug(e.scenario)}.chain.json`)}\` (it prints the probe's id, Pn: cite it in the decision)`]
          : [`  - replay: \`npm run heldout -- api-probe --key ${r.key} ${api.request.method} "${replayPath(api.request.url)}"${api.request.body ? " --data '<the request body>'" : ''}\` (it prints the probe's id, Pn: cite it in the decision)`])] : []),
      evidenceLine(e),
      // The expected and received values are above: the signals say only what the classification adds.
      '', `**Auto: ${e.auto!.category} (${e.auto!.confidence})**`, '', ...e.auto!.signals.filter((s) => !/^(Expected|Received):/.test(s)).map((s) => `- ${s}`), '', `Next: ${e.auto!.next}`, '', ...confirmed);
  }
  return out.join('\n');
}
