/**
 * The MCP servers the skill uses (Playwright MCP = browser tier 2) live in one file, .vscode/mcp.json (VS Code's
 * format: `servers`), which GitHub Copilot reads. Claude Code reads only a root .mcp.json (`mcpServers`), so the same
 * servers are written there too. Both are merged into the project's own files: a server the project already has keeps
 * its settings, and nothing is removed.
 */
import fs from 'node:fs';
import path from 'node:path';

export const MCP_FILE = '.vscode/mcp.json';
export const CLAUDE_MCP_FILE = '.mcp.json';
type Server = { command?: string; args?: string[]; [k: string]: unknown };

/**
 * How an MCP file (either app's format) names the Playwright MCP server: every word of every server's command and
 * arguments that names `@playwright/mcp`, or a URL or tarball of it (a `--package=` prefix dropped), in any runner.
 * [] when no server runs it; undefined when the file can't be read as plain JSON (VS Code also accepts comments).
 * The skill pins one exact spec (`PLAYWRIGHT_MCP`): anything else differs from what it is tested with.
 */
export function playwrightMcpSpecs(text: string): string[] | undefined {
  let json: unknown;
  try { json = JSON.parse(text); } catch { return undefined; }
  if (!json || typeof json !== 'object') return undefined;
  const specs: string[] = [];
  for (const section of [(json as { servers?: unknown }).servers, (json as { mcpServers?: unknown }).mcpServers]) {
    if (!section || typeof section !== 'object') continue;
    for (const server of Object.values(section as Record<string, unknown>)) {
      if (!server || typeof server !== 'object') continue;
      const { command, args } = server as { command?: unknown; args?: unknown };
      const words = [command, ...(Array.isArray(args) ? args : [])].filter((w): w is string => typeof w === 'string').flatMap((w) => w.split(/\s+/));
      // The package by its name, or fetched from a URL or a tarball; a path that merely contains the words (a config
      // file) is not the server.
      specs.push(...words.map((w) => w.replace(/^(?:--package=|-p=)/, '')).filter((w) => /@playwright\/mcp/i.test(w) || (/playwright\/mcp/i.test(w) && /^[a-z][a-z+]+:|\.tgz\b/i.test(w))));
    }
  }
  return specs;
}

/** Whether an MCP file's text configures the Playwright MCP server: by its parsed specs, or, unparsable, by its text. */
export function playwrightMcpConfigured(text: string): boolean {
  const specs = playwrightMcpSpecs(text);
  return specs === undefined ? /playwright\/mcp/i.test(text) : specs.length > 0;
}

/** The servers a .vscode/mcp.json declares; undefined when it is missing or not plain JSON. */
export function mcpServersIn(file: string): Record<string, Server> | undefined {
  if (!fs.existsSync(file)) return undefined;
  try { return (JSON.parse(fs.readFileSync(file, 'utf8')) as { servers?: Record<string, Server> }).servers ?? {}; } catch { return undefined; }
}

/** Claude Code's form of a server: on Windows it starts npx through cmd /c. */
function forClaudeCode(server: Server): Server {
  return process.platform === 'win32' && server.command === 'npx' ? { ...server, command: 'cmd', args: ['/c', 'npx', ...(server.args ?? [])] } : server;
}

/** Add the given servers to the project's root .mcp.json (Claude Code) unless it already has them. */
export function writeClaudeCodeMcp(root: string, servers: Record<string, Server>, say: (mark: string, msg: string) => void): void {
  const file = path.join(root, CLAUDE_MCP_FILE);
  let have: { mcpServers?: Record<string, Server> } = {};
  if (fs.existsSync(file)) {
    try { have = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {
      say('⚠', `${CLAUDE_MCP_FILE} is not plain JSON — add these servers to its "mcpServers" yourself (Claude Code):\n${JSON.stringify(servers, null, 2)}`);
      return;
    }
  }
  const list = (have.mcpServers ??= {});
  const added = Object.entries(servers).filter(([name]) => !(name in list));
  if (!added.length) { say('•', `keep    ${CLAUDE_MCP_FILE}`); return; }
  for (const [name, server] of added) list[name] = forClaudeCode(server);
  const created = !fs.existsSync(file);
  fs.writeFileSync(file, `${JSON.stringify(have, null, 2)}\n`);
  say('✔', `${created ? 'created' : 'updated'} ${CLAUDE_MCP_FILE} (+ ${added.map(([n]) => n).join(', ')}: the same MCP servers for Claude Code, which reads only this file)`);
}
