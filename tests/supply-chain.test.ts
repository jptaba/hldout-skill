/**
 * The supply chain the skill ships pinned (docs/governance-plan.md, P4): the Playwright MCP server and the dev
 * dependencies a project gets are exact versions, the same everywhere the skill names them, and `doctor` flags a
 * Playwright MCP server that isn't the pinned one.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { PLAYWRIGHT_MCP } from '../.github/scripts/core/config';
import { DEV_DEPENDENCIES } from '../.github/scripts/setup/init';
import { MCP_FILE, playwrightMcpConfigured, playwrightMcpSpecs } from '../.github/scripts/setup/mcp-config';

const REPO = path.resolve(import.meta.dirname, '..');
const read = (f: string) => fs.readFileSync(path.join(REPO, f), 'utf8');

describe('supply chain', () => {
  it('pins the Playwright MCP server to one exact version, in the shipped MCP file and in mcp-probe', () => {
    assert.match(PLAYWRIGHT_MCP, /^@playwright\/mcp@\d+\.\d+\.\d+$/);
    assert.deepEqual(playwrightMcpSpecs(read(MCP_FILE)), [PLAYWRIGHT_MCP], `${MCP_FILE} runs ${PLAYWRIGHT_MCP}`);
    const scripts = fs.readdirSync(path.join(REPO, '.github', 'scripts'), { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts'));
    // No script fetches a package as @latest (a string literal; comments may name the form).
    for (const f of scripts) {
      const code = read(path.join('.github', 'scripts', f)).split('\n').filter((l) => !/^\s*(?:\/\/|\/?\*)/.test(l)).join('\n');
      assert.doesNotMatch(code, /['"`][^'"`\n]*@latest\b/, f);
    }
  });

  it('gives a project the exact dev dependencies the skill is tested with', () => {
    const pkg = JSON.parse(read('package.json')) as { devDependencies: Record<string, string> };
    for (const [name, version] of Object.entries(DEV_DEPENDENCIES)) {
      assert.match(version, /^\d+\.\d+\.\d+$/, name);
      assert.equal(pkg.devDependencies[name], version, `init's ${name} is the skill's own`);
    }
    for (const [name, version] of Object.entries(pkg.devDependencies)) assert.match(version, /^\d+\.\d+\.\d+$/, `package.json ${name}`);
  });

  it('reads how either app\'s MCP file names the Playwright MCP server, so doctor can hold it to the pin', () => {
    const vscode = (args: unknown, command = 'npx') => JSON.stringify({ servers: { playwright: { type: 'stdio', command, args } } });
    const claude = (args: string[]) => JSON.stringify({ mcpServers: { playwright: { type: 'stdio', command: 'cmd', args: ['/c', 'npx', ...args] } } });
    const off = (text: string) => (playwrightMcpSpecs(text) ?? ['(unreadable)']).filter((s) => s !== PLAYWRIGHT_MCP);
    for (const make of [vscode, claude]) {
      assert.deepEqual(off(make(['-y', PLAYWRIGHT_MCP, '--isolated'])), [], 'the pin');
      for (const spec of ['@playwright/mcp@latest', '@playwright/mcp', '@playwright/mcp@^0.0.83', '@playwright/mcp@0.0.80', 'https://evil.example/playwright/mcp.tgz@0.0.83']) {
        assert.deepEqual(off(make(['-y', spec])), [spec], spec);
      }
      assert.deepEqual(off(make(['--package=@playwright/mcp@latest', 'mcp-server-playwright'])), ['@playwright/mcp@latest']);
    }
    // Any runner, a command written as one string, both sections of one file.
    assert.deepEqual(off(vscode(['dlx', '@playwright/mcp@next'], 'yarn')), ['@playwright/mcp@next']);
    assert.deepEqual(off(vscode(undefined, 'npx -y @playwright/mcp@latest')), ['@playwright/mcp@latest']);
    assert.deepEqual(off(JSON.stringify({ servers: { a: { command: 'npx', args: [PLAYWRIGHT_MCP] } }, mcpServers: { a: { command: 'npx', args: ['@playwright/mcp@latest'] } } })), ['@playwright/mcp@latest']);
    // A path that only contains the words (a config file) is not the server.
    assert.deepEqual(off(vscode(['-y', PLAYWRIGHT_MCP, '--config', './playwright/mcp.json'])), []);
    assert.deepEqual(off(vscode(['-y', 'file:../vendor/playwright/mcp.tgz'])), ['file:../vendor/playwright/mcp.tgz']);
    assert.deepEqual(off(vscode(['-y', PLAYWRIGHT_MCP, '--config', 'C:/cfg/playwright/mcp.json'])), [], 'a drive letter is no URL scheme');
    // Configured: by the parsed specs, or for a file with comments, by whether its text names the server.
    assert.equal(playwrightMcpConfigured(vscode(['-y', PLAYWRIGHT_MCP])), true);
    assert.equal(playwrightMcpConfigured(vscode(['server.js'], 'node')), false);
    assert.equal(playwrightMcpConfigured('{ // tier 2\n "servers": { "p": { "command": "npx", "args": ["@playwright/mcp@0.0.83"] } } }'), true);
    assert.equal(playwrightMcpConfigured('{ // no browser here\n "servers": {} }'), false);
    // Not Playwright, or malformed entries: nothing to hold to the pin, and no crash.
    assert.deepEqual(playwrightMcpSpecs(JSON.stringify({ servers: { p: { command: 'node', args: ['server.js'] } } })), []);
    assert.deepEqual(playwrightMcpSpecs(JSON.stringify({ servers: { p: null, q: { args: {} }, r: 3 } })), []);
    assert.equal(playwrightMcpSpecs('{ // a comment\n "servers": {} }'), undefined, 'JSON with comments: unchecked, said so');
  });
});
