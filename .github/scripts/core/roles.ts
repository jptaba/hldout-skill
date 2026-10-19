/**
 * Least privilege for the subagents: what each one's role allows, and the tool lists that follow from it. Every agent
 * file and Claude Code bridge is checked against this (tests/agent-files.test.ts in the skill repository, `doctor` in
 * a project), so a tool list widened by hand is caught rather than trusted.
 */

/** A role: whether it edits files or only creates its own, and whether it may look at the application. */
export interface Role { writes: 'edit' | 'create'; browser: boolean }

/**
 * Before the freeze no role may look at the application (held-out isolation); after it, the hardener and the triager
 * work live. The contract reviewer creates its review and never edits the contract it judges: Claude Code withholds
 * its Edit tool, as defence in depth (Write and a shell can still change a file; the guard is `contract
 * --review-bind`, which binds the review to the contract's hash). Copilot's `edit` covers creating a file, so there
 * every role has it.
 */
export const ROLES = {
  'heldout-contract-extractor': { writes: 'edit', browser: false },
  'heldout-contract-reviewer': { writes: 'create', browser: false },
  'heldout-test-author': { writes: 'edit', browser: false },
  'heldout-hardener': { writes: 'edit', browser: true },
  'heldout-triager': { writes: 'edit', browser: true },
} as const satisfies Record<string, Role>;

/** GitHub Copilot's `tools:` for a role. */
export function copilotTools(role: Role): string[] {
  return ['read', 'search', 'edit', 'execute', ...(role.browser ? ['browser', 'playwright/*'] : [])];
}

/** Claude Code's `tools:` for a role: an allow list, the browser as the Playwright MCP server's tools only. */
export function claudeTools(role: Role): string[] {
  return ['Read', 'Grep', 'Glob', 'Write', ...(role.writes === 'edit' ? ['Edit'] : []), 'Bash', ...(role.browser ? ['mcp__playwright__*'] : [])];
}

/** The frontmatter keys each kind of file may have: any other (an MCP server, a permission mode, hooks) widens it. */
const KEYS = { copilot: ['name', 'description', 'tools', 'model', 'user-invocable'], claude: ['name', 'description', 'tools', 'model'] };
const BOM = String.fromCharCode(0xfeff);

/**
 * A file's frontmatter as one-line `key: value` pairs, with what can't be read that way: a line continued on the next
 * one, a block list, a repeated key. A tool list the check can't read whole is a problem, never a pass.
 */
function frontmatter(text: string): { fields: Record<string, string>; problems: string[] } {
  // A byte-order mark is no change; the frontmatter ends only at a line that is exactly "---".
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text.startsWith(BOM) ? text.slice(1) : text);
  if (!m) return { fields: {}, problems: ['no frontmatter'] };
  const fields: Record<string, string> = {};
  const problems: string[] = [];
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):[ \t]*(.*)$/.exec(line);
    if (!kv || line.startsWith('---')) { if (line.trim()) problems.push(`a line that isn't one "key: value" (${line.trim().slice(0, 40)})`); continue; }
    if (kv[1] in fields) problems.push(`${kv[1]} given twice`);
    fields[kv[1]] = kv[2].trim();
  }
  return { fields, problems };
}

/** A list as an agent file writes it on one line: `['a', 'b']` (Copilot) or `A, B` (Claude Code). */
const listOf = (value: string | undefined): string[] | undefined =>
  value === undefined ? undefined : value.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const same = (a: string[] | undefined, b: string[]) => JSON.stringify(a ? [...a].sort() : a) === JSON.stringify([...b].sort());

/**
 * How an agent file's tools differ from its role: [] when they match. `file` is its path in the project
 * (`.github/agents/<name>.agent.md` or `.claude/agents/<name>.md`), `text` its content.
 */
export function toolProblems(file: string, text: string): string[] {
  const name = /([\w-]+?)(?:\.agent)?\.md$/.exec(file)?.[1] ?? '';
  const role: Role | undefined = (ROLES as Record<string, Role>)[name];
  if (!role) return [`${file}: no role for ${name}`];
  const copilot = file.includes('.github/agents/');
  const { fields, problems } = frontmatter(text);
  const out = problems.map((p) => `${file}: ${p}`);
  for (const key of Object.keys(fields)) if (!KEYS[copilot ? 'copilot' : 'claude'].includes(key)) out.push(`${file}: unknown frontmatter key ${key} (it may widen what the agent can do; only ${KEYS[copilot ? 'copilot' : 'claude'].join(', ')} are checked)`);
  const want = copilot ? copilotTools(role) : claudeTools(role);
  if (!same(listOf(fields.tools), want)) out.push(`${file}: tools ${fields.tools ?? '(none: every tool)'} — its role allows ${want.join(', ')}`);
  return out;
}
