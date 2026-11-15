/**
 * The benchmark's fault proxy (this repository only, never copied by init). It stands where the application's API
 * is expected and forwards every call to where the API really listens, so the web shop and the tests both pass
 * through it. A fault that is switched on changes a request on its way in or an answer on its way out; with none
 * on, a call passes unchanged. What a benchmark run should find is then known exactly: the faults that were on.
 *
 *   npx tsx dev/bench/proxy.ts [--port 8091] [--upstream http://localhost:8092] [--faults F01,F04]
 *
 *   GET /__bench/faults                  which faults exist, which are on, how often each changed a call
 *   PUT /__bench/faults {"on": ["F01"]}  switch exactly these on (an empty list: none) and reset the counts
 *
 * The faults themselves are in faults.ts.
 */
import http from 'node:http';
import { pathToFileURL } from 'node:url';

export interface Req {
  method: string;
  /** The path without its query, as the client sent it (`/products/01HX…`). */
  path: string;
  query: URLSearchParams;
  /** Lower-case names. */
  headers: Record<string, string>;
  /** The parsed JSON body, or undefined when the request has none or it isn't JSON. */
  body: unknown;
}
export interface Res { status: number; body: unknown }
export interface Fault {
  id: string;
  /** What is wrong while it is on, in a line. */
  title: string;
  /**
   * Before the call is forwarded: change `req` in place and return true, return an answer to give without
   * forwarding, or return false when this call isn't the fault's.
   */
  request?(req: Req): boolean | Res;
  /** After the application answered with JSON: change `res` in place and return true, or false when it isn't the fault's. */
  response?(req: Req, res: Res): boolean;
}

export const CONTROL = '/__bench/faults';
const isJson = (type: string | undefined) => /\bjson\b/i.test(type ?? '');
const parse = (buf: Buffer, type: string | undefined): unknown => {
  if (!buf.length || !isJson(type)) return undefined;
  try { return JSON.parse(buf.toString('utf8')); } catch { return undefined; }
};
const collect = (stream: NodeJS.ReadableStream) => new Promise<Buffer>((resolve, reject) => {
  const chunks: Buffer[] = [];
  stream.on('data', (c: Buffer) => chunks.push(c)).on('end', () => resolve(Buffer.concat(chunks))).on('error', reject);
});

/** The proxy as a server (not yet listening), with the faults' state. */
export function createProxy(upstream: string, faults: Fault[], initial: string[] = []) {
  const known = new Set(faults.map((f) => f.id));
  let on = new Set<string>();
  let hits: Record<string, number> = {};
  const set = (ids: string[]) => {
    const unknown = ids.filter((id) => !known.has(id));
    if (unknown.length) throw new Error(`no such fault: ${unknown.join(', ')}`);
    on = new Set(ids);
    hits = {};
  };
  set(initial);
  const hit = (id: string) => { hits[id] = (hits[id] ?? 0) + 1; };
  const state = () => ({ on: [...on].sort(), hits, all: faults.map((f) => ({ id: f.id, title: f.title })) });
  const target = new URL(upstream);

  const server = http.createServer(async (inc, out) => {
    const send = (status: number, headers: http.OutgoingHttpHeaders, body: Buffer) => { out.writeHead(status, { ...headers, 'content-length': body.length }); out.end(body); };
    const json = (status: number, value: unknown, extra: http.OutgoingHttpHeaders = {}) => send(status, { 'content-type': 'application/json', ...extra }, Buffer.from(JSON.stringify(value)));
    try {
      const url = new URL(inc.url ?? '/', 'http://proxy');
      const raw = await collect(inc);
      if (url.pathname === CONTROL) {
        if (inc.method === 'PUT') set(((parse(raw, 'json') as { on?: string[] } | undefined)?.on) ?? []);
        return json(200, state());
      }
      const headers = Object.fromEntries(Object.entries(inc.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v ?? '']));
      const req: Req = { method: inc.method ?? 'GET', path: url.pathname, query: url.searchParams, headers, body: parse(raw, headers['content-type']) };
      const active = faults.filter((f) => on.has(f.id));
      let changed = false;
      for (const f of active) {
        const r = f.request?.(req);
        if (!r) continue;
        hit(f.id);
        // An answer given here never reaches the application; a page on another origin still has to be allowed to read it.
        if (r !== true) return json(r.status, r.body, { 'access-control-allow-origin': headers.origin || '*', 'access-control-allow-credentials': 'true' });
        changed = true;
      }
      const body = changed && req.body !== undefined ? Buffer.from(JSON.stringify(req.body)) : raw;
      const search = req.query.toString();
      // Uncompressed, so that a JSON answer can be read and changed.
      const forward = { ...headers, host: target.host, 'accept-encoding': 'identity', 'content-length': String(body.length) };
      if (!body.length && !inc.headers['content-length']) delete (forward as Record<string, string>)['content-length'];
      const answer = await new Promise<http.IncomingMessage>((resolve, reject) => {
        const r = http.request({ hostname: target.hostname, port: target.port || 80, method: req.method, path: req.path + (search ? `?${search}` : ''), headers: forward }, resolve);
        r.on('error', reject);
        r.end(body);
      });
      let payload = await collect(answer);
      let status = answer.statusCode ?? 502;
      const hooks = active.filter((f) => f.response);
      const parsed = hooks.length ? parse(payload, answer.headers['content-type']) : undefined;
      if (parsed !== undefined) {
        const res: Res = { status, body: parsed };
        let touched = false;
        for (const f of hooks) if (f.response!(req, res)) { hit(f.id); touched = true; }
        if (touched) { status = res.status; payload = Buffer.from(JSON.stringify(res.body)); }
      }
      const { 'transfer-encoding': _te, 'content-length': _cl, connection: _c, ...rest } = answer.headers;
      send(status, rest, payload);
    } catch (e) {
      json(502, { message: `fault proxy: ${(e as Error).message}` });
    }
  });
  return { server, set, state };
}

async function main(args: string[]): Promise<void> {
  const flag = (name: string, fallback: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] ?? fallback : fallback; };
  const { FAULTS } = await import('./faults');
  const port = Number(flag('--port', '8091'));
  const upstream = flag('--upstream', 'http://localhost:8092');
  const { server } = createProxy(upstream, FAULTS, flag('--faults', '').split(',').filter(Boolean));
  server.listen(port, () => console.log(`fault proxy on :${port} → ${upstream} (${FAULTS.length} faults, state at ${CONTROL})`));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) void main(process.argv.slice(2));
