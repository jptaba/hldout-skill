/**
 * What each agent of a round took in (this repository only, never copied by init): its context at start and at peak,
 * its turns, and what filled it. It reads Claude Code transcripts: each subagent's `.jsonl` beside its `.meta.json`
 * (which names the agent type and the task), so rounds run in Claude Code are what it measures.
 *
 *   npx tsx dev/context.ts [<subagents folder>] [--filter "r40"] [--agent heldout-triager] [--since 2026-10-01] [--top 8]
 *        the folder defaults to the subagents of this project's latest session under ~/.claude/projects/;
 *        --filter matches the task's description
 *
 * Tokens are the app's own for context (at start, at peak); the kinds are estimated from characters (four to a token).
 * The model's thinking is in the peak and not in the kinds: the transcripts don't hold it.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const KINDS = ['instructions', 'handoffs', 'support', 'probes', 'other', 'writing'] as const;
export type Kind = typeof KINDS[number];

export interface AgentContext {
  agent: string; description: string; start: number; peak: number; turns: number; images: number;
  kinds: Record<Kind, number>;
  items: { what: string; kind: Kind; tokens: number; times: number }[];
}

interface ToolUse { name: string; input: Record<string, unknown> }

const HANDOFF_COMMANDS = /^(show|status|contract|triage|journeys|integrity|stats)$/;
const PROBE_COMMANDS = /^(inspect|api-probe|mcp-probe|trace|run)$/;
/** The command after `heldout --` (or `heldout`), quoted dashes included. */
const heldoutCommand = (cmd: string) => cmd.match(/\bheldout\s+(?:'?--'?\s+)?([a-z][a-z-]*)/)?.[1];

/** A file's path from the project's own folders on, so the same file reads the same from any project. */
const short = (file: string) => file.replace(/\\/g, '/').replace(/^.*?\/?(?=(?:\.github|\.claude|\.heldout|output|journeys[^/]*|heldout-support)\/)/, '');

export function kindOfFile(file: string): Kind {
  const f = short(file);
  if (/^\.github\/(agents|skills)\/|^\.claude\/(agents|skills)\//.test(f)) return 'instructions';
  if (/^(journeys[^/]*|heldout-support)\//.test(f)) return 'support';
  if (/(^|\/)(probes\/)?P\d+\.md$/.test(f)) return 'probes';
  if (/^(output|\.heldout)\//.test(f)) return 'handoffs';
  return 'other';
}

/** What a tool call read or ran, and which kind of input its result is. */
export function describeUse(use: ToolUse): { what: string; kind: Kind } {
  if (use.name === 'Read') { const f = String(use.input.file_path ?? ''); return { what: short(f), kind: kindOfFile(f) }; }
  if (use.name.startsWith('mcp__')) return { what: use.name.replace(/^mcp__\w+?__/, ''), kind: 'probes' };
  if (use.name === 'Bash' || use.name === 'PowerShell') {
    const cmd = String(use.input.command ?? '');
    const c = heldoutCommand(cmd);
    // `show` is many views: which one is what a reader of the report wants to know.
    const view = c === 'show' ? cmd.match(/\bshow\s+(?:[A-Z][A-Z0-9]*-\d+\s+)?([a-z]+)/)?.[1] : undefined;
    if (c) return { what: `heldout ${c}${view ? ` ${view}` : ''}`, kind: PROBE_COMMANDS.test(c) ? 'probes' : HANDOFF_COMMANDS.test(c) ? 'handoffs' : 'other' };
    // A file read through the shell (`cat`, `sed -n`) is the same input as one read with the file tool.
    const file = cmd.replace(/\\/g, '/').match(/(?:\.github|\.claude|\.heldout|output|journeys[^/\s]*|heldout-support)\/[^\s'"|;&]*/)?.[0];
    return { what: file ? short(file) : cmd.replace(/\s+/g, ' ').slice(0, 50), kind: file ? kindOfFile(file) : 'other' };
  }
  const searched = typeof use.input.path === 'string' ? use.input.path : '';
  return { what: `${use.name} ${short(searched)}`.trim(), kind: searched ? kindOfFile(searched) : 'other' };
}

/** One subagent's transcript, as lines of JSON. A line that isn't JSON (a transcript cut off) is skipped. */
export function readAgent(agent: string, description: string, lines: string[]): AgentContext {
  const r: AgentContext = { agent, description, start: 0, peak: 0, turns: 0, images: 0, kinds: Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<Kind, number>, items: [] };
  const uses = new Map<string, ToolUse>();
  const items = new Map<string, { what: string; kind: Kind; chars: number; times: number }>();
  // The app writes a line per block of a message, each with the message's id and usage: a turn is an id.
  const seen = new Set<string>();
  const answered = new Set<string>();
  for (const line of lines) {
    let m: { id?: string; role?: string; usage?: Record<string, number>; content?: unknown } | undefined;
    try { m = (JSON.parse(line) as { message?: typeof m }).message; } catch { continue; }
    if (m?.usage) {
      const context = (m.usage.input_tokens ?? 0) + (m.usage.cache_read_input_tokens ?? 0) + (m.usage.cache_creation_input_tokens ?? 0);
      r.start ||= context; r.peak = Math.max(r.peak, context);
      if (!m.id || !seen.has(m.id)) r.turns++;
      if (m.id) seen.add(m.id);
    }
    for (const c of Array.isArray(m?.content) ? m.content as Record<string, unknown>[] : []) {
      if (c.type === 'text' && m?.role === 'assistant') r.kinds.writing += String(c.text ?? '').length;
      if (c.type === 'tool_use') {
        // The app can write a call and its result twice under one id: they entered the context once.
        if (!uses.has(String(c.id))) r.kinds.writing += JSON.stringify(c.input ?? {}).length;
        uses.set(String(c.id), { name: String(c.name), input: (c.input ?? {}) as Record<string, unknown> });
      }
      if (c.type !== 'tool_result' || answered.has(String(c.tool_use_id))) continue;
      answered.add(String(c.tool_use_id));
      const parts = Array.isArray(c.content) ? c.content as Record<string, unknown>[] : [{ type: 'text', text: c.content }];
      // An image's size in the transcript is its encoding, not what it costs: it is counted, not measured.
      r.images += parts.filter((x) => x.type === 'image').length;
      const chars = parts.filter((x) => x.type !== 'image').reduce((n, x) => n + String(x.text ?? '').length, 0);
      const use = uses.get(String(c.tool_use_id));
      const { what, kind } = use ? describeUse(use) : { what: '?', kind: 'other' as Kind };
      r.kinds[kind] += chars;
      const item = items.get(what) ?? { what, kind, chars: 0, times: 0 };
      item.chars += chars; item.times++;
      items.set(what, item);
    }
  }
  for (const k of KINDS) r.kinds[k] = Math.round(r.kinds[k] / 4);
  r.items = [...items.values()].sort((a, b) => b.chars - a.chars).map((x) => ({ what: x.what, kind: x.kind, tokens: Math.round(x.chars / 4), times: x.times }));
  return r;
}

/** The subagents of this project's latest session; undefined when there are none to read. */
export function latestSubagents(cwd = process.cwd(), home = os.homedir()): string | undefined {
  const projects = path.join(home, '.claude', 'projects');
  const slug = cwd.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const project = fs.existsSync(projects) ? fs.readdirSync(projects).find((d) => d.toLowerCase() === slug) : undefined;
  if (!project) return undefined;
  const sessions = fs.readdirSync(path.join(projects, project)).map((d) => path.join(projects, project, d, 'subagents')).filter((d) => fs.existsSync(d));
  return sessions.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

export function render(r: AgentContext, top: number): string[] {
  return [`## ${r.agent}: ${r.description}`,
    `  start ${r.start} · peak ${r.peak} · ${r.turns} turns${r.images ? ` · ${r.images} images` : ''}`,
    `  ${KINDS.map((k) => `${k} ${r.kinds[k]}`).join(' · ')}`,
    ...r.items.slice(0, top).map((x) => `  ${String(x.tokens).padStart(7)}  x${String(x.times).padEnd(3)} ${x.kind.padEnd(12)} ${x.what}`), ''];
}

export function main(argv: string[]): number {
  const flags = new Map<string, string>(); const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) flags.set(argv[i].slice(2), argv[++i] ?? ''); else rest.push(argv[i]); }
  const dir = rest[0] ?? latestSubagents();
  const none = () => { console.error('No Claude Code subagent transcripts found: name the folder. Other agent apps\' transcripts can\'t be read.'); return 1; };
  if (!dir || !fs.existsSync(dir)) return none();
  const since = flags.has('since') ? Date.parse(flags.get('since')!) : 0;
  let read = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.jsonl')).sort()) {
    const file = path.join(dir, f); const metaFile = file.replace(/\.jsonl$/, '.meta.json');
    if (!fs.existsSync(metaFile) || fs.statSync(file).mtimeMs < since) continue;
    let meta: { agentType?: string; description?: string };
    try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')) as typeof meta; } catch { continue; }
    if (flags.has('filter') && !(meta.description ?? '').includes(flags.get('filter')!)) continue;
    if (flags.has('agent') && meta.agentType !== flags.get('agent')) continue;
    const r = readAgent(meta.agentType ?? '?', meta.description ?? '', fs.readFileSync(file, 'utf8').split('\n').filter(Boolean));
    console.log(render(r, Number(flags.get('top') ?? 8)).join('\n'));
    read++;
  }
  return read ? 0 : none();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exitCode = main(process.argv.slice(2));
