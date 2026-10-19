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
 *
 * Also counted, as a breach of held-out isolation: a probe of the application (`heldout inspect`, `api-probe`,
 * `mcp-probe`, a Playwright MCP browser tool) by an agent that works before the freeze (the contract extractor and
 * reviewer, the test author). A probe for a story is refused before the freeze; one made for no story is caught here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let since: string | undefined;
let list = false;

const INLINE: [string, RegExp][] = [
  ['inline program', /\b(node|tsx)\s+(-e|--eval|-p|--print)\b|\bnode\s+(-\s+)?<<|\bpython3?\s+(-c\b|-\s*<<)/],
  ['heredoc file', /\bcat\s*>{1,2}\s*\S+\s*<<|\btee\s+\S+\s*<<|<<-?\s*'?\w+'?\s*>\s*\S+/],
  ['sed -i', /\bsed\s+(-\w*\s+)*-i/],
];

const BEFORE_FREEZE = /contract-extractor|contract-reviewer|test-author/;
// The dispatcher form (outside quotes), or a Playwright MCP browser tool.
const PROBE = /\bheldout\s+(?:'--'\s+|--\s+|""\s+)?(?:inspect|api-probe|mcp-probe)\b|^mcp__playwright__browser_/;
const PROBE_SCRIPT = /scripts[\\/]probe[\\/](?:inspect|api-probe|mcp-probe)\.ts/;
// tsx or node in any form a shell reaches them by: node.exe, npx.cmd tsx, tsx@4, a quoted full path.
const RUNNER = /(?:^|[^\w.-])(?:tsx|node)(?:@[\w.^~-]+|\.exe|\.cmd)?(?![\w-])/;
// A command that only reads or searches what it names (a commit message that mentions a run is a git command).
const READ = /^(?:grep|rg|ag|cat|bat|less|more|head|tail|ls|wc|stat|file|diff|git|echo|printf|tsc|code|type|Select-String|Get-Content)\b/;
// …unless it can run a command of its own.
// (`rebase … -x` is two tests: one regex with `.*` between them backtracks once per `rebase`.)
const RUNS_OTHERS = /\bbisect\s+run\b|\bsubmodule\s+foreach\b|\balias\.|\s-c\s+["']?alias/;
const runsOthers = (part: string) => RUNS_OTHERS.test(part) || (/\brebase\b/.test(part) && /\s(?:-x|--exec)\b/.test(part));

/**
 * Whether a shell command runs a probe script. A heuristic for a tally, so it errs toward counting: some part of the
 * command (see splitCommands) names a probe script and tsx or node in some form, and is not a read or a search. Every
 * wrapper (npx -y, xargs, sudo, nohup, timeout, find -exec, bash -c, pwsh -Command, a subshell, a redirect) therefore
 * counts when the script is named on the wrapped command. Known over-count: a runner used on another file in the same
 * part (`node eslint …/probe/inspect.ts`). Known under-counts, on purpose: the script's name reaching the runner from
 * another part (`cat …/inspect.ts | npx tsx`, `echo …/inspect.ts | xargs npx tsx`, `npx tsx $(echo …/inspect.ts)`).
 * Linear.
 */
export function runsProbeScript(command: string): boolean {
  if (!PROBE_SCRIPT.test(command)) return false;
  return splitCommands(command).some((p) => PROBE_SCRIPT.test(p) && RUNNER.test(p) && (!READ.test(p.trim()) || runsOthers(p)));
}

/**
 * A shell command's parts, in one pass: split at newlines, ; & | ( ) outside quotes; a command substitution (`$(…)`, a
 * backtick) is a part of its own, inside double quotes too, where bash still runs it; single-quoted text and escaped
 * characters are text; a heredoc's body stays with the command that opened it (`git commit -F - <<'EOF' … EOF`; a
 * `<<-` terminator may follow tabs; `<<<` is a here-string); a `#` comment runs to the end of its line.
 */
export function splitCommands(command: string): string[] {
  const parts: string[] = [];
  const stack: string[] = []; // open contexts: '"', "'", '$(' or '`'
  let current = '';
  let heredoc = '';
  let tabs = false;
  const cut = () => { parts.push(current); current = ''; };
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    const top = stack.at(-1);
    if (top === "'") { current += c; if (c === "'") stack.pop(); continue; }
    if (c === '\\') { current += c + (command[i + 1] ?? ''); i++; continue; }
    if (top === '"') {
      if (c === '"') { stack.pop(); current += c; continue; }
      if (c === '$' && command[i + 1] === '(') { cut(); stack.push('$('); i++; continue; }
      if (c === '`') { cut(); stack.push('`'); continue; }
      current += c; continue;
    }
    // Unquoted, or inside a command substitution.
    if (c === '"' || c === "'") { stack.push(c); current += c; continue; }
    if (c === '$' && command[i + 1] === '(') { cut(); stack.push('$('); i++; continue; }
    if (c === '`') { cut(); if (top === '`') stack.pop(); else stack.push('`'); continue; }
    if (c === ')' && top === '$(') { cut(); stack.pop(); continue; }
    // A comment runs to the end of its line: an apostrophe in it opens no quote.
    if (c === '#' && (i === 0 || /[\s;&|()]/.test(command[i - 1]))) {
      const eol = command.indexOf('\n', i);
      i = (eol < 0 ? command.length : eol) - 1;
      continue;
    }
    // A here-string (<<<) is a word, not a heredoc.
    if (c === '<' && command.startsWith('<<<', i)) { current += '<<<'; i += 2; continue; }
    const here = c === '<' && command.slice(i).match(/^<<(-?)\s*["']?(\w+)["']?/);
    if (here) { heredoc = here[2]; tabs = here[1] === '-'; current += here[0]; i += here[0].length - 1; continue; }
    if (c === '\n' && heredoc) {
      // The body, up to the line that ends it (after tabs, for <<-), belongs to the command that opened it.
      let stop = command.length;
      for (let j = i; j >= 0; j = command.indexOf('\n', j + 1)) {
        let k = j + 1;
        if (tabs) while (command[k] === '\t') k++;
        const after = command[k + heredoc.length];
        if (command.startsWith(heredoc, k) && (after === undefined || after === '\n' || after === '\r')) { stop = k + heredoc.length; break; }
      }
      current += command.slice(i, stop);
      i = stop - 1;
      heredoc = '';
      continue;
    }
    if ('\n\r;&|()'.includes(c)) { cut(); continue; }
    current += c;
  }
  cut();
  return parts;
}

/**
 * Whether a tool call probes the application: the dispatcher's probe commands (quoted text is an argument, not a
 * command), a probe script run by tsx or node, or a Playwright MCP browser tool.
 */
export function probes(command: string | undefined, tool = ''): boolean {
  const bare = command?.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '""') ?? '';
  return PROBE.test(bare) || runsProbeScript(command ?? '') || PROBE.test(tool);
}

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
      // Held-out isolation: an agent that works before the freeze never probes the application (a probe with --key is
      // refused; one without it is only caught here).
      // Quoted text is an argument, not a command: a `grep "node -e"` is no inline program.
      const bare = typeof cmd === 'string' ? cmd.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '""') : undefined;
      if (BEFORE_FREEZE.test(agent) && probes(typeof cmd === 'string' ? cmd : undefined, b.name)) kinds.push('probe before freeze');
      if (bare) for (const [kind, re] of INLINE) if (re.test(bare)) kinds.push(kind);
      if ((b.name === 'Write' || b.name === 'Edit') && /\.(m?js|cjs|py)$/.test(b.input?.file_path ?? '')) kinds.push('script file');
      for (const k of kinds) {
        t.found[k] = (t.found[k] ?? 0) + 1;
        if (list) found.push(`${agent} | ${k} | ${(cmd ?? b.input?.file_path ?? '').replace(/\s+/g, ' ').slice(0, 200)}`);
      }
    }
  }
}

function main(args: string[]): number {
  const dir = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--since');
  since = args.includes('--since') ? args[args.indexOf('--since') + 1] : undefined;
  list = args.includes('--list');
  if (!dir || !fs.existsSync(dir)) {
    console.log(fs.readFileSync(import.meta.filename, 'utf8').match(/^\/\*\*([\s\S]*?)\*\//)![1].replace(/^ \* ?/gm, '').trim());
    return dir ? 1 : 0;
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

  // Scripts are one measure; a probe before the freeze is another (a breach of held-out isolation), shown apart.
  const kinds = [...INLINE.map(([k]) => k), 'script file'];
  console.log(`| Agent | Sessions | Tool calls | ${kinds.join(' | ')} | Scripts per 100 calls | Probes before the freeze |`);
  console.log(`| --- | --- | --- | ${kinds.map(() => '---').join(' | ')} | --- | --- |`);
  for (const [agent, t] of [...tally].filter(([, t]) => t.calls).sort((a, b) => a[0].localeCompare(b[0]))) {
    const total = kinds.reduce((n, k) => n + (t.found[k] ?? 0), 0);
    console.log(`| ${agent} | ${t.sessions} | ${t.calls} | ${kinds.map((k) => t.found[k] ?? 0).join(' | ')} | ${(100 * total / t.calls).toFixed(1)} | ${t.found['probe before freeze'] ?? 0} |`);
  }
  if (list) for (const f of found) console.log(f);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exitCode = main(process.argv.slice(2));
