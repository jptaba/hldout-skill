/**
 * demo/inflight.ts: which tool calls count as probing the application (held-out isolation before the freeze).
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { probes } from '../demo/inflight';

describe('inflight: a probe of the application', () => {
  it('counts the dispatcher\'s probe commands, a probe script that tsx or node runs, and the MCP browser tools', () => {
    for (const c of ['npm run heldout -- inspect --key ABC-1', "npm run heldout '--' api-probe GET products", 'npx tsx .github/scripts/probe/inspect.ts --url /',
      'npx tsx ".github/scripts/probe/mcp-probe.ts" --steps s.json', 'node --import tsx .github\\scripts\\probe\\api-probe.ts GET x']) {
      assert.ok(probes(c), c);
    }
    assert.ok(probes(undefined, 'mcp__playwright__browser_navigate'));
  });

  it('does not count reading or searching for them', () => {
    for (const c of ['grep -n "heldout inspect" docs/x.md', 'grep -n "node" .github/scripts/probe/inspect.ts', 'cat .github/scripts/probe/api-probe.ts',
      'npm run heldout -- contract ABC-1', 'node -e "1"']) {
      assert.ok(!probes(c), c);
    }
    assert.ok(!probes(undefined, 'Read'));
  });
});
