import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { AGENT_FILES, SKILL_DIR } from '../.github/scripts/lib/config';

const REPO = path.resolve(import.meta.dirname, '..');
const COPILOT = AGENT_FILES.filter((f) => f.startsWith('.github/agents/'));
/** Dev-only agents (dev-* prefix): used in this repository, never shipped by init. */
const DEV = fs.readdirSync(path.join(REPO, '.github', 'agents')).filter((f) => f.startsWith('dev-')).map((f) => `.github/agents/${f}`);
/** The Claude Code bridge of a Copilot agent file. */
const bridgeOf = (f: string) => f.replace('.github/agents/', '.claude/agents/').replace('.agent.md', '.md');
/** The YAML frontmatter as raw `key: value` lines (values kept as written). */
function frontmatter(file: string): Record<string, string> {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(path.join(REPO, file), 'utf8'));
  assert.ok(m, `${file} has no frontmatter`);
  return Object.fromEntries(m[1].split(/\r?\n/).map((l) => /^([\w-]+):\s*(.*)$/.exec(l)).filter((x) => x !== null).map((x) => [x[1], x[2]]));
}

describe('agent files', () => {
  it('every agent file and bridge init ships exists', () => {
    for (const f of AGENT_FILES) assert.ok(fs.existsSync(path.join(REPO, f)), f);
    for (const f of COPILOT) assert.ok(AGENT_FILES.includes(bridgeOf(f)), `${f} has a Claude Code bridge`);
  });

  it('no dev-only agent is shipped, and every agent in .github/agents is either shipped or dev-only', () => {
    assert.deepEqual(AGENT_FILES.filter((f) => path.basename(f).startsWith('dev-')), []);
    const all = fs.readdirSync(path.join(REPO, '.github', 'agents')).map((f) => `.github/agents/${f}`);
    assert.deepEqual(all.filter((f) => !COPILOT.includes(f) && !DEV.includes(f)), [], 'name a new agent dev-… or add it to SUBAGENTS');
  });

  it('each Claude Code bridge carries the name and description of what it points at', () => {
    const skill = frontmatter(path.relative(REPO, path.join(SKILL_DIR, 'SKILL.md')));
    const bridge = frontmatter('.claude/skills/heldout-evaluator/SKILL.md');
    assert.equal(bridge.name, skill.name);
    assert.equal(bridge.description, skill.description);
    for (const f of [...COPILOT, ...DEV]) {
      const agent = frontmatter(f);
      const claude = frontmatter(bridgeOf(f));
      assert.equal(claude.name, agent.name, f);
      assert.equal(claude.description, agent.description, f);
      assert.ok(fs.readFileSync(path.join(REPO, bridgeOf(f)), 'utf8').includes(f), `${bridgeOf(f)} points at ${f}`);
    }
  });

  it('each Copilot agent lists its model with fallbacks; each Claude Code bridge names one model', () => {
    for (const f of [...COPILOT, ...DEV]) {
      assert.match(frontmatter(bridgeOf(f)).model, /^(opus|sonnet|haiku|fable|inherit|claude-[\w.-]+)$/, bridgeOf(f));
      const models = JSON.parse(frontmatter(f).model.replace(/'/g, '"')) as string[];
      assert.ok(Array.isArray(models) && models.length >= 2, `${f}: a primary model and at least one fallback`);
    }
  });
});
