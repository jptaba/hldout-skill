/**
 * The layout of the skill's scripts (docs/refactor-plan.md, section 5): one folder per area, areas that depend
 * downwards only, no import cycles, and commands that never import other commands. Type-only imports are erased when
 * the scripts run, so only runtime imports count.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { PHASE_FOLDERS, moveStrayFiles, moveSupersededRuns, strayFiles } from '../.github/scripts/core/paths';
import { COMMANDS } from '../.github/scripts/heldout';

const DIR = path.join(import.meta.dirname, '..', '.github', 'scripts');
/**
 * Lowest first: an area may import its own files and those of the areas before it. The phases in their order (a phase
 * never imports a later one), core and the probe tools shared, flow and setup on top.
 */
const AREAS = ['core', 'fetch', 'contract', 'authoring', 'probe', 'hardening', 'run', 'triage', 'verdict', 'flow', 'setup'];
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
    assert.ok(!runtimeImports('contract/evidence.ts').includes('contract/contract-model.ts'), 'type-only imports are left out');
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
    // A phase folder's name in a string, outside comments: everything else asks core/paths.ts for the folder. Any
    // "<digit>-<word>" name counts, so an old or a new folder name is caught alike.
    const names = new RegExp(`['"\`][^'"\`\\n]*\\b(?:${PHASE_FOLDERS.join('|')}|[1-9]-(?:evidence|runs|verdict))\\b`);
    const named = files.filter((f) => f !== 'core/paths.ts').flatMap((f) => fs.readFileSync(path.join(DIR, f), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').split('\n')
      .flatMap((line, i) => (names.test(line) ? [`${f}:${i + 1}`] : [])));
    assert.deepEqual(named, []);
  });

  it('has commands that never import another command', () => {
    assert.ok(commands.length > 10, 'commands found in heldout.ts');
    const crossed = commands.flatMap((c) => runtimeImports(c).filter((i) => commands.includes(i) && i !== c).map((i) => `${c} → ${i}`));
    assert.deepEqual(crossed, []);
  });
});

describe('the story record', () => {
  it('finds the files its layout does not have, says where they belong, and moves them to the scratch stray/', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-stray-'));
    const p = { base: path.join(root, 'KEY'), work: { stray: path.join(root, 'scratch', 'stray') } };
    const kept = ['history.jsonl', '1-requirement/story.md', '1-requirement/linked/page.md', '2-contract/contract.json', '3-tests/key.spec.ts',
      '3-tests/freeze.json', '4-hardening/key.spec.ts', '4-hardening/hardening.md', '4-hardening/probes.jsonl', '4-hardening/P2.md',
      '5-run/05-eval.json', '6-triage/decisions.json', '6-triage/probes.jsonl', '6-triage/P12.md', '7-verdict/verdict.md', '7-verdict/05-eval-SCN-001.png'];
    // Each phase keeps its own files only: the hardening log is not the draft's, a screenshot is the verdict's.
    const stray = ['3-tests/login.steps.json', '3-tests/hardening.md', '5-run/05-eval/results.json', 'gaps.json', '6-triage/notes.txt', '6-triage/SCN-1.png', '6-triage/repro.chain.json'];
    for (const f of [...kept, ...stray]) { fs.mkdirSync(path.dirname(path.join(p.base, f)), { recursive: true }); fs.writeFileSync(path.join(p.base, f), 'x'); }
    const found = strayFiles(p);
    assert.deepEqual(found.map((s) => s.file), [...stray].sort());
    assert.match(found.find((s) => s.file === '3-tests/login.steps.json')!.home, /scratch area's 4-hardening/);
    assert.match(found.find((s) => s.file === '6-triage/repro.chain.json')!.home, /scratch area's 6-triage/);
    assert.match(found.find((s) => s.file === '5-run/05-eval/results.json')!.home, /raw output/);
    assert.deepEqual(moveStrayFiles(p), [...stray].sort());
    assert.deepEqual(strayFiles(p), []);
    assert.ok(fs.existsSync(path.join(p.work.stray, '5-run/05-eval/results.json')));
    assert.ok(!fs.existsSync(path.join(p.base, '5-run/05-eval')), 'the emptied folder goes too');
    for (const f of kept) assert.ok(fs.existsSync(path.join(p.base, f)), f);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('keeps the final evaluation run before the verdict, the earlier runs going to the scratch area', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-runs-'));
    const p = { runs: path.join(root, 'KEY', '5-run'), work: { runs: path.join(root, 'scratch', '5-run') } };
    fs.mkdirSync(p.runs, { recursive: true });
    const meta = (grep: string | null) => JSON.stringify({ meta: { grep } });
    for (const [r, grep] of [['01-harden', null], ['02-eval', null], ['03-repair', 'SCN-1'], ['04-rerun', null], ['05-eval', 'SCN-2']] as const) fs.writeFileSync(path.join(p.runs, `${r}.json`), meta(grep));
    assert.deepEqual(moveSupersededRuns(p), ['01-harden', '02-eval', '03-repair', '05-eval']);
    assert.deepEqual(fs.readdirSync(p.runs), ['04-rerun.json'], 'a run of some tests is never the final one');
    assert.ok(fs.existsSync(path.join(p.work.runs, '02-eval.json')));
    assert.deepEqual(moveSupersededRuns(p), [], 'nothing left to move');
    fs.rmSync(root, { recursive: true, force: true });
  });
});
