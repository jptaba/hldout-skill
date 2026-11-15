/**
 * What init ships and what stays with the maintainer: the maintainer-only files are not in the shipped list, and
 * .github/skills holds only the shipped skill.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { SHIPPED } from '../.github/scripts/setup/update';

const REPO = path.resolve(import.meta.dirname, '..');
const shippedBy = (f: string) => SHIPPED.find((s) => f === s || f.startsWith(`${s}/`));
const list = (dir: string) => fs.readdirSync(path.join(REPO, dir), { recursive: true, encoding: 'utf8' }).map((f) => `${dir}/${f.split(path.sep).join('/')}`);

describe('what ships and what is maintainer-only', () => {
  it('ships none of the maintainer files, the developer tools or the demo', () => {
    const maintainer = ['AGENTS.md', 'SECURITY.md', '.agents/skills/pr-packet/SKILL.md', '.claude/skills/pr-packet/SKILL.md', '.github/copilot-instructions.md', '.github/workflows/verify.yml'];
    for (const f of maintainer) assert.ok(fs.existsSync(path.join(REPO, f)), `${f} exists`);
    assert.deepEqual(maintainer.filter(shippedBy), []);
    const devAndDemo = [...list('dev'), ...list('demo')];
    assert.ok(devAndDemo.includes('dev/bench/score.ts') && devAndDemo.includes('demo/bench/keys/SHOP-1.json'));
    assert.deepEqual(devAndDemo.filter(shippedBy), []);
    assert.deepEqual(list('demo').filter((f) => f.endsWith('.ts')), [], 'code lives in dev/, data in demo/');
  });

  it('keeps only the shipped skill under .github/skills', () => {
    assert.deepEqual(fs.readdirSync(path.join(REPO, '.github', 'skills')), ['heldout-evaluator']);
  });
});
