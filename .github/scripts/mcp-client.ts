/**
 * Minimal MCP stdio client (JSON-RPC 2.0, newline-delimited) — lets the bundled scripts drive an MCP
 * server such as Playwright MCP directly, when the host has not loaded its tools (tier 2 fallback, CI).
 */
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';

export interface McpTool { name: string; description?: string; inputSchema?: { properties?: Record<string, unknown>; required?: string[] } }
export interface McpContent { type: string; text?: string; data?: string; mimeType?: string }

export class McpStdioClient {
  private proc!: ChildProcessWithoutNullStreams;
  private buf = '';
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  stderr = '';

  constructor(private readonly command: string, private readonly args: string[]) {}

  async start(): Promise<void> {
    this.proc = spawn(this.command, this.args, { stdio: ['pipe', 'pipe', 'pipe'], shell: process.platform === 'win32' });
    this.proc.stdout.setEncoding('utf8');
    this.proc.stdout.on('data', (chunk: string) => {
      this.buf += chunk;
      let nl: number;
      while ((nl = this.buf.indexOf('\n')) >= 0) {
        const line = this.buf.slice(0, nl).trim();
        this.buf = this.buf.slice(nl + 1);
        if (!line) continue;
        let msg: { id?: number; result?: unknown; error?: { message: string } };
        try { msg = JSON.parse(line); } catch { continue; }
        if (msg.id !== undefined && this.pending.has(msg.id)) {
          const p = this.pending.get(msg.id)!;
          this.pending.delete(msg.id);
          if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result);
        }
      }
    });
    this.proc.stderr.on('data', (d) => { this.stderr += String(d); });
    await this.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'heldout-evaluator', version: '1.0' } });
    this.notify('notifications/initialized', {});
  }

  private send(msg: object) { this.proc.stdin.write(`${JSON.stringify(msg)}\n`); }
  notify(method: string, params: object) { this.send({ jsonrpc: '2.0', method, params }); }

  request<T = unknown>(method: string, params: object, timeoutMs = 90_000): Promise<T> {
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`MCP ${method} timed out after ${timeoutMs} ms`)); }, timeoutMs);
      this.pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v as T); }, reject: (e) => { clearTimeout(timer); reject(e); } });
      this.send({ jsonrpc: '2.0', id, method, params });
    });
  }

  async tools(): Promise<McpTool[]> { return (await this.request<{ tools: McpTool[] }>('tools/list', {})).tools; }

  async call(name: string, args: Record<string, unknown> = {}): Promise<{ text: string; isError: boolean }> {
    const r = await this.request<{ content?: McpContent[]; isError?: boolean }>('tools/call', { name, arguments: args });
    return { text: (r.content ?? []).filter((c) => c.type === 'text').map((c) => c.text).join('\n'), isError: Boolean(r.isError) };
  }

  stop(): void { try { this.proc.stdin.end(); this.proc.kill(); } catch { /* ignore */ } }
}

/**
 * Find a node in a Playwright-MCP ARIA snapshot by role and (exact or partial) accessible name.
 * Returns the snapshot line and its ref (some nodes, e.g. <option>s, have no ref — fine for expectations,
 * not for actions).
 */
export function nodeFor(snapshot: string, role: string, name?: string, exact = false): { line: string; ref?: string } | undefined {
  for (const line of snapshot.split('\n')) {
    const m = line.match(/^\s*-\s+([\w-]+)(?:\s+"((?:[^"\\]|\\.)*)")?/);
    if (!m || m[1] !== role) continue;
    const n = m[2] ?? '';
    if (name === undefined || (exact ? n === name : n.toLowerCase().includes(name.toLowerCase()))) {
      return { line: line.trim(), ref: line.match(/\[ref=([\w-]+)\]/)?.[1] };
    }
  }
  return undefined;
}

/** Ref of the nth (1-based) matching node that HAS a ref (required to act on it). */
export function refFor(snapshot: string, role: string, name?: string, exact = false, nth = 1): string | undefined {
  let seen = 0;
  for (const line of snapshot.split('\n')) {
    if (!/\[ref=/.test(line)) continue;
    const hit = nodeFor(line, role, name, exact);
    if (hit?.ref && ++seen === nth) return hit.ref;
  }
  return undefined;
}
