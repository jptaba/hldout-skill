/**
 * Tier-2 driver — runs steps through the real Playwright MCP server over stdio (the same browser_* tools
 * the agent uses when Playwright MCP is loaded in the session). Use it when the host has not loaded the
 * MCP tools (no restart yet, CI, other IDEs), or to record a reproducible tier-2 walk as evidence.
 *
 *   heldout mcp-probe [--key KEY | --aut <profile>]
 *       (--steps steps.json | --steps-json '[…]') [--out report.md] [--headed] [--browser chrome|msedge|firefox|webkit]
 *
 * Step forms (element resolution is by ROLE + ACCESSIBLE NAME from the live MCP snapshot → ref):
 *   { "tool": "browser_navigate", "url": "login" }                     path resolved against the AUT base URL
 *   { "tool": "browser_type",  "find": { "role": "textbox", "name": "Username" }, "text": "${env:USER}" }
 *   { "tool": "browser_click", "find": { "role": "button",  "name": "Login", "exact": true } }
 *   { "tool": "browser_press_key", "key": "Tab" }  · { "tool": "browser_handle_dialog", "accept": true, "promptText": "x" }
 *   { "tool": "browser_select_option", "find": {…}, "values": ["Option 2"] } · { "tool": "browser_wait_for", "text": "Hello World!" }
 *   { "expect": { "role": "heading", "name": "Secure Area", "exact": true } }   element present in the current snapshot
 *   { "expectAbsent": { "role": "textbox", "name": "Message", "exact": true } } element NOT exposed (e.g. a11y checks)
 *   { "expectText": "You logged into a secure area!" }                          text present in the current snapshot
 *   { "snapshot": "label" }                                                     include the current snapshot in the report
 *
 * expect/expectText poll the snapshot (web-first, 10 s). expectAbsent is only evaluated on a READY page (after a
 * browser_wait_for anchor, or once the snapshot has substantial content) — otherwise it FAILS rather than
 * vacuously passing on an unrendered page.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { flagStr, loadConfig, main, parseArgs, resolveUrl, writeFile } from './lib/config';
import { McpStdioClient, nodeFor, refFor } from './lib/mcp-client';
import { redactSnapshot } from './lib/redact';

interface Find { role: string; name?: string; exact?: boolean }
interface Step {
  tool?: string; url?: string; find?: Find; text?: string; key?: string; accept?: boolean; promptText?: string; values?: string[];
  expect?: Find; expectAbsent?: Find; expectText?: string; snapshot?: string;
}

const env = (s = '') => s.replace(/\$\{env:(\w+)\}/g, (_, n: string) => {
  if (process.env[n] === undefined) throw new Error(`\${env:${n}} is not set (.env)`);
  return process.env[n]!;
});
const describe = (f: Find) => `${f.role}${f.name !== undefined ? ` "${f.name}"` : ''}`;
/** Pull the YAML snapshot out of an MCP tool response (Playwright MCP embeds it in a ```yaml block). */
const yamlOf = (text: string) => text.match(/```yaml\r?\n([\s\S]*?)```/)?.[1] ?? '';

main(async () => {
  const { flags } = parseArgs();
  const cfg = loadConfig({ key: flagStr(flags, 'key'), aut: flagStr(flags, 'aut') });
  const stepsFile = flagStr(flags, 'steps');
  const steps: Step[] = stepsFile ? JSON.parse(fs.readFileSync(stepsFile, 'utf8')) : JSON.parse(flagStr(flags, 'steps-json') ?? '[]');
  // MCP writes large snapshots/screenshots to its output dir — keep that out of the project.
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-mcp-'));
  const args = ['-y', '@playwright/mcp@latest', '--isolated', '--output-dir', outputDir, ...(flags.headed ? [] : ['--headless']), ...(flagStr(flags, 'browser') ? ['--browser', flagStr(flags, 'browser')!] : [])];
  const client = new McpStdioClient('npx', args);
  const rows: string[] = [];
  const snapshots: string[] = [];
  let snapshot = '';
  let failures = 0;
  let ready = false; // set once a browser_wait_for anchor was seen after the last navigation
  /** Snapshot inline (```yaml) or, for large pages, from the file the server references ([Snapshot](path)). */
  const snapshotFrom = (text: string) => {
    const inline = yamlOf(text);
    if (inline) return inline;
    const file = text.match(/\[Snapshot\]\(([^)]+)\)/)?.[1];
    if (!file) return '';
    for (const p of [file, path.join(outputDir, path.basename(file)), path.resolve(file)]) if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    return '';
  };
  /** Values typed from ${env:…} or into secret-looking fields — never written to the report (snapshots echo field values). */
  const secrets: string[] = [];
  const refresh = async () => { snapshot = redactSnapshot(snapshotFrom((await client.call('browser_snapshot')).text), secrets); return snapshot; };
  /** Web-first: poll the snapshot until `found(snapshot)` or the timeout. */
  const poll = async (found: (snap: string) => boolean, timeoutMs = 10_000) => {
    const end = Date.now() + timeoutMs;
    for (;;) { if (found(await refresh())) return true; if (Date.now() > end) return false; await new Promise((r) => setTimeout(r, 500)); }
  };
  /** A page is "ready" for absence checks after an explicit wait anchor, or once it has substantial content. */
  const substantial = (snap: string) => (snap.match(/\[ref=/g) ?? []).length >= 15;
  const row = (n: number, what: string, ok: boolean, detail: string) => {
    if (!ok) failures++;
    rows.push(`| ${n} | ${what.replace(/\|/g, '\\|')} | ${ok ? '✔' : '✖'} | ${detail.replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 180)} |`);
  };

  await client.start();
  try {
    for (const [i, s] of steps.entries()) {
      const n = i + 1;
      try {
        if (s.expect) {
          const f = s.expect;
          const ok = await poll((snap) => Boolean(nodeFor(snap, f.role, f.name, f.exact)));
          const hit = nodeFor(snapshot, f.role, f.name, f.exact);
          row(n, `expect ${describe(f)}`, ok, hit ? `found: ${hit.line}` : 'not in the accessibility snapshot (polled 10 s)');
          continue;
        }
        if (s.expectAbsent) {
          // Absence is only meaningful on a rendered page — an empty/partial snapshot would "confirm" anything.
          const f = s.expectAbsent;
          const isReady = ready || await poll(substantial, 10_000);
          if (!isReady) { row(n, `expect absent ${describe(f)}`, false, 'page not ready (snapshot too small, no wait anchor) — absence cannot be concluded'); continue; }
          const hit = nodeFor(await refresh(), f.role, f.name, f.exact);
          row(n, `expect absent ${describe(f)}`, !hit, hit ? `present: ${hit.line}` : 'not exposed in the (ready) accessibility snapshot');
          continue;
        }
        if (s.expectText !== undefined) {
          const want = s.expectText.toLowerCase();
          const ok = await poll((snap) => snap.toLowerCase().includes(want));
          row(n, `expect text "${s.expectText}"`, ok, ok ? 'present in snapshot' : 'absent from snapshot (polled 10 s)');
          continue;
        }
        if (s.snapshot !== undefined) { snapshots.push(`### Snapshot: ${s.snapshot}\n\n\`\`\`yaml\n${await refresh()}\`\`\``); row(n, `snapshot "${s.snapshot}"`, true, `${snapshot.split('\n').length} lines`); continue; }

        const tool = s.tool!;
        const callArgs: Record<string, unknown> = {};
        if (s.url !== undefined) callArgs.url = resolveUrl(cfg.aut.baseURL, s.url);
        if (s.find) {
          const ref = refFor(await refresh(), s.find.role, s.find.name, s.find.exact);
          if (!ref) { row(n, `${tool} ${describe(s.find)}`, false, 'element not found in the MCP snapshot'); continue; }
          callArgs.target = ref;
          callArgs.element = describe(s.find);
        }
        if (s.text !== undefined) {
          callArgs.text = env(s.text);
          if (/\$\{env:/.test(s.text) || /pass|pin|secret|token/i.test(s.find?.name ?? '')) secrets.push(String(callArgs.text));
        }
        if (s.key !== undefined) callArgs.key = s.key;
        if (s.accept !== undefined) callArgs.accept = s.accept;
        if (s.promptText !== undefined) callArgs.promptText = s.promptText;
        if (s.values) callArgs.values = s.values;
        if (tool === 'browser_navigate') ready = false;
        const r = await client.call(tool, callArgs);
        if (tool === 'browser_wait_for' && !r.isError) ready = true;
        // Playwright MCP reports the Playwright code it executed — i.e. the locator it chose (a tier-2 locator suggestion).
        const code = r.text.match(/```js\r?\n([\s\S]*?)```/)?.[1]?.trim().split('\n').filter((l) => l.trim()).join(' ; ') ?? '';
        row(n, `${tool}${s.find ? ` ${describe(s.find)}` : s.url ? ` ${s.url}` : ''}`, !r.isError, r.isError ? r.text.slice(0, 180) : code ? `\`${code}\`` : 'ok');
      } catch (e) {
        row(n, s.tool ?? 'step', false, (e as Error).message);
      }
    }
  } finally {
    await client.call('browser_close').catch(() => undefined);
    client.stop();
  }

  const report = [
    '# Tier-2 walk (Playwright MCP over stdio)', '',
    `- AUT: ${cfg.aut.name} (profile \`${cfg.autId}\`) — ${cfg.aut.baseURL}`,
    `- Server: \`npx ${args.join(' ')}\` · ${new Date().toISOString()}`,
    `- Result: ${failures ? `✖ ${failures} step(s) failed` : '✔ all steps passed'}`, '',
    '| # | Step | OK | Detail |', '| --- | --- | --- | --- |', ...rows, '', ...snapshots, '',
  ].join('\n');
  const out = flagStr(flags, 'out');
  if (out) { writeFile(out, report); console.log(`${failures ? '✖' : '✔'} ${steps.length} steps, ${failures} failed → ${out}`); } else console.log(report);
  if (failures) process.exitCode = 1;
});
