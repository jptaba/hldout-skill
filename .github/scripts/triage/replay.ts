/**
 * The mechanical reproduction of an API failure: the calls the test made, sent again outside the test, twice. When
 * both times the application gives the answer the test failed on, the failure is reproduced live and needs no agent.
 *
 * Only what a script can settle is settled here. A failure goes to the triager when the automatic class is anything
 * but a sure application defect, when the test rests on an assumption or an open question, when a call was sent
 * signed in or holds a masked secret (the record keeps neither), or when the replay answers differently (the
 * records the run made are gone, or the application's state moved).
 */
import type { ApiExchange } from '../run/classify';
import { maskVolatile, type TriageEntry } from '../run/run-record';

export interface Sent { status: number; body: unknown }
export type Send = (call: { method: string; url: string; headers: Record<string, string>; body?: unknown }) => Promise<Sent>;

const signedIn = (x: ApiExchange) => Object.keys(x.request.headers ?? {}).some((h) => /^(authorization|cookie)$/i.test(h));
const text = (v: unknown) => (v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v));

/** The calls to send again for a failure, in the order the test sent them, or why a script can't settle it. */
export function replayPlan(e: TriageEntry): { calls: ApiExchange[] } | { why: string } {
  if (e.status !== 'failed' || !e.error) return { why: 'not a failure' };
  if (e.auto?.category !== 'APPLICATION_DEFECT' || e.auto.confidence !== 'high') return { why: 'the automatic class is not a sure application defect' };
  if (!e.error.reqTag) return { why: 'the failure is not on a requirement assertion' };
  if (e.tags.some((t) => /^@(assumes:|needs-clarification$)/.test(t))) return { why: 'the test rests on an assumption or an open question' };
  const api = e.evidence.api;
  if (!api || (e.layer && e.layer !== 'api')) return { why: 'the failure is not on an API answer' };
  const seq = e.evidence.apiSequence ?? [api];
  const at = e.evidence.apiRelevantIndex ?? seq.length - 1;
  const calls = [...(e.evidence.preSequence ?? []), ...seq.slice(0, at + 1)];
  if (calls.length > 12) return { why: 'more calls than a replay sends' };
  if (calls.some(signedIn)) return { why: 'a call was sent signed in' };
  if (calls.some((c) => text(c.request.body).includes('***redacted') || c.request.url.includes('***redacted'))) return { why: 'a call holds a masked secret' };
  if (calls.some((c) => !/^https?:\/\//.test(c.request.url))) return { why: 'a call\'s address is not recorded whole' };
  return { calls };
}

/** Leaves of two JSON values at the same place that differ: what the run's record names and the replay's now does. */
function renamed(was: unknown, now: unknown, out: Map<string, string>): void {
  if (Array.isArray(was) && Array.isArray(now)) { was.forEach((v, i) => renamed(v, now[i], out)); return; }
  if (was && now && typeof was === 'object' && typeof now === 'object') { for (const [k, v] of Object.entries(was)) renamed(v, (now as Record<string, unknown>)[k], out); return; }
  const [a, b] = [String(was), String(now)];
  // Only what is plainly an id: long enough that replacing it elsewhere can't hit something else.
  if ((typeof was === 'string' || typeof was === 'number') && typeof now === typeof was && a !== b && /^[\w-]{8,}$/.test(a) && /^[\w-]{8,}$/.test(b)) out.set(a, b);
}

/**
 * Sends the calls once. Ids the run's records had are replaced by the ids the replay's records get, call by call.
 * Returns undefined when the last call gets the status and (ids and times apart) the body the test failed on;
 * otherwise what differed.
 */
export async function replayOnce(calls: ApiExchange[], send: Send): Promise<string | undefined> {
  const ids = new Map<string, string>();
  const rebind = (s: string) => [...ids].reduce((acc, [was, now]) => acc.split(was).join(now), s);
  for (const [i, c] of calls.entries()) {
    const headers = Object.fromEntries(Object.entries(c.request.headers ?? {}).filter(([h]) => /^(accept|content-type)$/i.test(h)));
    const body = c.request.body === undefined ? undefined : typeof c.request.body === 'string' ? rebind(c.request.body) : JSON.parse(rebind(JSON.stringify(c.request.body))) as unknown;
    const got = await send({ method: c.request.method, url: rebind(c.request.url), headers, body });
    const what = `${c.request.method} ${new URL(c.request.url).pathname}`;
    if (got.status !== c.response.status) return `${what} answered ${got.status}, in the run ${c.response.status}`;
    if (i < calls.length - 1) { renamed(c.response.body, got.body, ids); continue; }
    if (maskVolatile(text(got.body)) !== maskVolatile(text(c.response.body))) return `${what} answered ${got.status} with another body than in the run`;
  }
  return undefined;
}

/** The decision a reproduced failure gets: what was required and what the application answered, both times. */
export function replayDecision(e: TriageEntry, calls: number, at = new Date()): NonNullable<TriageEntry['final']> {
  const api = e.evidence.api!;
  const call = `${api.request.method} ${new URL(api.request.url).pathname} → ${api.response.status}`;
  const required = e.error!.headline.replace(/^\[REQ [^\]]+\]\s*/, '');
  return {
    category: 'APPLICATION_DEFECT', severity: api.response.status >= 500 ? 'Critical' : 'Major',
    title: `Not met: ${required.slice(0, 140)}`,
    rationale: `${e.requirementRefs.join(', ')} requires: ${required}. Expected ${e.error!.expected ?? 'what the requirement states'}, received ${e.error!.received ?? `the answer of ${call}`}. Sent again outside the test, twice (${calls} call${calls === 1 ? '' : 's'} each time), the application gave the same answer: ${call}.`,
    evidence: `replayed by the tool, twice: ${call}`,
    failure: e.error!.headline.slice(0, 200), confirmedAt: at.toISOString(),
  };
}

/** The real sender: one HTTP call, its JSON answer parsed. */
export const httpSend: Send = async ({ method, url, headers, body }) => {
  const r = await fetch(url, { method, headers: { accept: 'application/json', ...(body !== undefined && typeof body !== 'string' ? { 'content-type': 'application/json' } : {}), ...headers }, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body), redirect: 'manual' });
  const raw = await r.text();
  try { return { status: r.status, body: JSON.parse(raw) as unknown }; } catch { return { status: r.status, body: raw || undefined }; }
};

/**
 * Replays every pending failure a script can settle and returns the ones reproduced, with their decisions; failures
 * that look alike share a title, so the verdict reports one finding for one cause.
 */
export async function replayPending(entries: TriageEntry[], likeness: (e: TriageEntry) => string, send: Send = httpSend): Promise<{ confirmed: TriageEntry[]; left: { scenario: string; why: string }[] }> {
  const confirmed: TriageEntry[] = []; const left: { scenario: string; why: string }[] = [];
  const titles = new Map<string, string>();
  for (const e of entries) {
    const plan = replayPlan(e);
    if ('why' in plan) { left.push({ scenario: e.scenario, why: plan.why }); continue; }
    let why: string | undefined;
    try { why = await replayOnce(plan.calls, send) ?? await replayOnce(plan.calls, send); } catch (x) { why = `the replay could not be sent (${(x as Error).message})`; }
    if (why) { left.push({ scenario: e.scenario, why }); continue; }
    const decision = replayDecision(e, plan.calls.length);
    const group = likeness(e);
    if (!titles.has(group)) titles.set(group, decision.title!);
    e.final = { ...decision, title: titles.get(group) };
    confirmed.push(e);
  }
  return { confirmed, left };
}
