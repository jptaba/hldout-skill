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
