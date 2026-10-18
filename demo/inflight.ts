/**
 * How many scripts the agents wrote on the fly, per agent type: the measure of "commands, not scripts" (this
 * repository only, never copied by init). It reads Claude Code transcripts: a session's `<id>.jsonl`, and each
 * subagent's `.jsonl` beside its `.meta.json` (which names the agent type), so rounds run in Claude Code are what it
 * measures.
 *
 *   npx tsx demo/inflight.ts <transcripts folder> [--since 2026-10-01] [--list]
 *        the folder is the round project's under ~/.claude/projects/; --list prints each script found
 *
 * Counted as a script: an inline program (`node -e`, `tsx -e`, `node <<`, `python -c`, `python - <<`), a file
 * written by a shell heredoc or redirection of generated text, an in-place `sed -i`, and a script file written with
 * the file tools (.js, .mjs, .cjs, .py).
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--since');
const since = args.includes('--since') ? args[args.indexOf('--since') + 1] : undefined;
const list = args.includes('--list');
if (!dir || !fs.existsSync(dir)) {
  console.log(fs.readFileSync(import.meta.filename, 'utf8').match(/^\/\*\*([\s\S]*?)\*\//)![1].replace(/^ \* ?/gm, '').trim());
  process.exit(dir ? 1 : 0);
}

const INLINE: [string, RegExp][] = [
  ['inline program', /\b(node|tsx)\s+(-e|--eval|-p|--print)\b|\bnode\s+(-\s+)?<<|\bpython3?\s+(-c\b|-\s*<<)/],
  ['heredoc file', /\bcat\s*>{1,2}\s*\S+\s*<<|\btee\s+\S+\s*<<|<<-?\s*'?\w+'?\s*>\s*\S+/],
  ['sed -i', /\bsed\s+(-\w*\s+)*-i/],
];

interface Tally { sessions: number; calls: number; found: Record<string, number> }
const tally = new Map<string, Tally>();
const found: string[] = [];

function scan(file: string, agent: string): void {
  const t = tally.get(agent) ?? { sessions: 0, calls: 0, found: {} };
  tally.set(agent, t);
  let counted = false;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let o: { timestamp?: string; message?: { content?: unknown } };
    try { o = JSON.parse(line); } catch { continue; }
    if (since && o.timestamp && o.timestamp < since) continue;
    const content = o.message?.content;
    if (!Array.isArray(content)) continue;
    for (const b of content as { type?: string; name?: string; input?: { command?: string; file_path?: string } }[]) {
      if (b.type !== 'tool_use') continue;
      if (!counted) { t.sessions++; counted = true; }
      t.calls++;
      const kinds: string[] = [];
      const cmd = b.input?.command;
      if (typeof cmd === 'string') for (const [kind, re] of INLINE) if (re.test(cmd)) kinds.push(kind);
      if ((b.name === 'Write' || b.name === 'Edit') && /\.(m?js|cjs|py)$/.test(b.input?.file_path ?? '')) kinds.push('script file');
      for (const k of kinds) {
        t.found[k] = (t.found[k] ?? 0) + 1;
        if (list) found.push(`${agent} | ${k} | ${(cmd ?? b.input?.file_path ?? '').replace(/\s+/g, ' ').slice(0, 200)}`);
      }
    }
  }
}

const files: string[] = [];
(function walk(d: string) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.jsonl')) files.push(p);
  }
})(dir);
for (const f of files) {
  const meta = f.replace(/\.jsonl$/, '.meta.json');
  const agent = fs.existsSync(meta) ? String((JSON.parse(fs.readFileSync(meta, 'utf8')) as { agentType?: string }).agentType ?? 'subagent') : 'main session';
  scan(f, agent);
}

const kinds = [...INLINE.map(([k]) => k), 'script file'];
console.log(`| Agent | Sessions | Tool calls | ${kinds.join(' | ')} | Scripts per 100 calls |`);
console.log(`| --- | --- | --- | ${kinds.map(() => '---').join(' | ')} | --- |`);
for (const [agent, t] of [...tally].filter(([, t]) => t.calls).sort((a, b) => a[0].localeCompare(b[0]))) {
  const total = kinds.reduce((n, k) => n + (t.found[k] ?? 0), 0);
  console.log(`| ${agent} | ${t.sessions} | ${t.calls} | ${kinds.map((k) => t.found[k] ?? 0).join(' | ')} | ${(100 * total / t.calls).toFixed(1)} |`);
}
if (list) for (const f of found) console.log(f);
