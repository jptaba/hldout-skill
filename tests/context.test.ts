/**
 * dev/context.ts: what filled an agent's context, by kind, from its transcript.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { describeUse, kindOfFile, latestSubagents, main, readAgent, render } from '../dev/context';

const use = (id: string, name: string, input: object) => JSON.stringify({ message: { role: 'assistant', content: [{ type: 'tool_use', id, name, input }] } });
const result = (id: string, content: unknown) => JSON.stringify({ message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content }] } });
const turn = (id: string, input: number, cached: number) => JSON.stringify({ message: { id, role: 'assistant', usage: { input_tokens: input, cache_read_input_tokens: cached }, content: [{ type: 'text', text: 'w'.repeat(40) }] } });

describe('context report', () => {
  it('sorts files and commands into kinds, from any project', () => {
    assert.equal(kindOfFile('rounds/r1/.github/skills/heldout-evaluator/references/triage.md'), 'instructions');
    assert.equal(kindOfFile('rounds\\r1\\output\\shop\\ABC-1\\4-hardening\\abc-1.spec.ts'), 'handoffs');
    assert.equal(kindOfFile('.heldout/shop/ABC-1/6-triage/triage-02-eval.md'), 'handoffs');
    assert.equal(kindOfFile('output/shop/ABC-1/4-hardening/P7.md'), 'probes');
    assert.equal(kindOfFile('.heldout/shop/ABC-1/6-triage/probes/P7.md'), 'probes');
    assert.equal(kindOfFile('rounds/r1/journeys-shop/fixtures/cart.ts'), 'support');
    assert.equal(kindOfFile('heldout-support/fixtures.ts'), 'support');
    assert.deepEqual(describeUse({ name: 'Bash', input: { command: "cd p && npm run heldout '--' show ABC-1 triage" } }), { what: 'heldout show triage', kind: 'handoffs' });
    assert.deepEqual(describeUse({ name: 'PowerShell', input: { command: 'npm run heldout -- inspect --key ABC-1' } }), { what: 'heldout inspect', kind: 'probes' });
    assert.deepEqual(describeUse({ name: 'Bash', input: { command: 'sed -n 1,9p output/shop/ABC-1/2-contract/contract.json | head' } }), { what: 'output/shop/ABC-1/2-contract/contract.json', kind: 'handoffs' });
    assert.equal(describeUse({ name: 'Grep', input: { pattern: 'x', path: 'rounds/r1/journeys/fixtures/cart.ts' } }).kind, 'support');
    assert.equal(describeUse({ name: 'mcp__playwright__browser_snapshot', input: {} }).what, 'browser_snapshot');
    assert.equal(describeUse({ name: 'mcp__playwright__browser_snapshot', input: {} }).kind, 'probes');
  });

  it('gives start, peak, turns, kinds and the largest items, with how many times each was read', () => {
    const r = readAgent('heldout-triager', 'Triage ABC-1', [
      turn('m1', 1000, 0),
      turn('m1', 1000, 0),
      use('a', 'Read', { file_path: 'output/shop/ABC-1/4-hardening/abc-1.spec.ts' }), result('a', 'x'.repeat(400)),
      use('b', 'Read', { file_path: 'output/shop/ABC-1/4-hardening/abc-1.spec.ts' }), result('b', [{ type: 'text', text: 'y'.repeat(400) }]),
      turn('m2', 100, 2000),
      use('c', 'Write', { file_path: 'steps.json', content: 'z'.repeat(400) }),
      'not json: a transcript cut off',
    ]);
    assert.deepEqual([r.start, r.peak, r.turns], [1000, 2100, 2], 'a message written as several lines is one turn');
    assert.equal(r.kinds.handoffs, 200);
    assert.ok(r.kinds.writing >= 130, 'its tool inputs and its text');
    assert.deepEqual(r.items[0], { what: 'output/shop/ABC-1/4-hardening/abc-1.spec.ts', kind: 'handoffs', tokens: 200, times: 2 });
    assert.match(render(r, 5).join('\n'), /peak 2100 .*\n.*handoffs 200/);
  });

  it('counts an image and does not measure its encoding', () => {
    const r = readAgent('a', 'b', [use('a', 'Read', { file_path: 'x.png' }), result('a', [{ type: 'image', source: { data: 'x'.repeat(100000) } }])]);
    assert.equal(r.images, 1);
    assert.equal(r.kinds.other, 0);
  });

  it('says so when a folder has no transcripts to read, or a filter matches none', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-context-'));
    assert.equal(main([dir]), 1, 'an empty folder');
    fs.writeFileSync(path.join(dir, 'agent-a.jsonl'), `${turn('m1', 10, 0)}\n`);
    fs.writeFileSync(path.join(dir, 'agent-a.meta.json'), JSON.stringify({ agentType: 'heldout-triager', description: 'Triage ABC-1' }));
    fs.writeFileSync(path.join(dir, 'agent-b.jsonl'), `${turn('m2', 10, 0)}\n`);
    fs.writeFileSync(path.join(dir, 'agent-b.meta.json'), 'not json');
    assert.equal(main([dir, '--filter', 'nothing like this']), 1);
    assert.equal(main([dir]), 0, 'and a subagent with bad metadata is skipped');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('finds the latest session of a project, and says when there is none', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-context-'));
    const dir = path.join(home, '.claude', 'projects', 'z--work-app', 's1', 'subagents');
    fs.mkdirSync(dir, { recursive: true });
    assert.equal(latestSubagents('Z:\\work\\app', home), dir, 'a drive letter of either case');
    assert.equal(latestSubagents('Z:\\work\\other', home), undefined);
    fs.rmSync(home, { recursive: true, force: true });
  });
});
