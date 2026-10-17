/**
 * The layout of the skill's scripts (docs/refactor-plan.md, section 5): one folder per area, areas that depend
 * downwards only, no import cycles, and commands that never import other commands. Type-only imports are erased when
 * the scripts run, so only runtime imports count.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { COMMANDS } from '../.github/scripts/heldout';

const DIR = path.join(import.meta.dirname, '..', '.github', 'scripts');
/** Lowest first: an area may import its own files and those of the areas before it. */
const AREAS = ['core', 'requirement', 'authoring', 'probe', 'run', 'triage', 'report', 'flow', 'setup'];
const rank = (area: string) => (area === 'setup' ? AREAS.indexOf('flow') : AREAS.indexOf(area));

const files = fs.readdirSync(DIR, { recursive: true, encoding: 'utf8' }).map((f) => f.split(path.sep).join('/')).filter((f) => f.endsWith('.ts'));
const areaOf = (f: string) => f.split('/')[0];

/** The scripts a file imports at runtime, as paths relative to the scripts folder. */
function runtimeImports(file: string): string[] {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  return [...src.matchAll(/^(?:import|export)\s+(?!type\s)[^;]*?\sfrom\s+'(\.{1,2}\/[^']+)';/gm), ...src.matchAll(/import\('(\.{1,2}\/[^']+)'\)/g)]
    .map((m) => path.posix.normalize(path.posix.join(path.posix.dirname(file), m[1])))
    .map((p) => (p.endsWith('.ts') ? p : `${p}.ts`));
}

const commands = [...new Set(Object.values(COMMANDS))];

describe('the scripts layout', () => {
  it('has only the dispatcher at the top, and every other script in a known area', () => {
    assert.deepEqual(files.filter((f) => !f.includes('/')), ['heldout.ts']);
    assert.deepEqual([...new Set(files.filter((f) => f.includes('/')).map(areaOf))].filter((a) => !AREAS.includes(a)), []);
  });

  it('imports only scripts that exist', () => {
    assert.ok(runtimeImports('run/run.ts').includes('core/cli.ts'), 'runtime imports are read');
    assert.ok(!runtimeImports('requirement/evidence.ts').includes('requirement/contract-model.ts'), 'type-only imports are left out');
    const missing = files.flatMap((f) => runtimeImports(f).filter((i) => !files.includes(i)).map((i) => `${f} → ${i}`));
    assert.deepEqual(missing, []);
  });

  it('has areas that depend downwards only', () => {
    const upward = files.filter((f) => f.includes('/')).flatMap((f) => runtimeImports(f)
      .filter((i) => areaOf(i) !== areaOf(f) && rank(areaOf(i)) >= rank(areaOf(f)))
      .map((i) => `${f} → ${i}`));
    assert.deepEqual(upward, []);
  });

  it('has no import cycles', () => {
    const graph = new Map(files.map((f) => [f, runtimeImports(f)]));
    const cycles: string[] = [];
    const state = new Map<string, 'open' | 'done'>();
    const visit = (f: string, trail: string[]) => {
      if (state.get(f) === 'done') return;
      if (state.get(f) === 'open') { cycles.push([...trail.slice(trail.indexOf(f)), f].join(' → ')); return; }
      state.set(f, 'open');
      for (const i of graph.get(f) ?? []) visit(i, [...trail, f]);
      state.set(f, 'done');
    };
    for (const f of files) visit(f, []);
    assert.deepEqual(cycles, []);
  });

  it('names the story folders in core/paths.ts only', () => {
    // A phase folder's name in a string, outside comments: everything else asks core/paths.ts for the folder.
    const named = files.filter((f) => f !== 'core/paths.ts').flatMap((f) => fs.readFileSync(path.join(DIR, f), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').split('\n')
      .flatMap((line, i) => (/['"`][^'"`\n]*\b[1-6]-(?:requirement|contract|tests|evidence|runs|verdict)\b/.test(line) ? [`${f}:${i + 1}`] : [])));
    assert.deepEqual(named, []);
  });

  it('has commands that never import another command', () => {
    assert.ok(commands.length > 10, 'commands found in heldout.ts');
    const crossed = commands.flatMap((c) => runtimeImports(c).filter((i) => commands.includes(i) && i !== c).map((i) => `${c} → ${i}`));
    assert.deepEqual(crossed, []);
  });
});
