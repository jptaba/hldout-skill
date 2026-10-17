/**
 * A story's history (history.jsonl) and its folder layout (core/paths.ts).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { lastEvent, readHistory, recordChange, recordEvent, setCommandLine } from '../.github/scripts/core/history';
import { PHASE_FOLDERS, SCRATCH_DIR, STORY_ROOT_FILES, evalPaths } from '../.github/scripts/core/paths';

const tmpFile = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-history-')), 'history.jsonl');

describe('the history of a story', () => {
  it('appends one line per event, with the time, the skill and the command (flag values left out)', () => {
    const file = tmpFile();
    setCommandLine('contract', ['ABC-1', '--resolve', 'G1', '--value', 'a secret-ish value', '--pack']);
    recordEvent(file, 'fetched', { profile: 'shop' });
    recordEvent(file, 'run', { run: '01-harden' });
    const events = readHistory(file);
    assert.deepEqual(events.map((e) => e.event), ['fetched', 'run']);
    assert.match(events[0].at, /^\d{4}-\d\d-\d\dT/);
    assert.match(events[0].skill, /^[0-9a-f]{16}$/);
    assert.equal(events[0].command, 'heldout contract ABC-1 --resolve --value --pack');
    assert.equal(fs.readFileSync(file, 'utf8').trim().split('\n').length, 2);
  });

  it('gives the latest event of a kind, and skips a line that is not JSON', () => {
    const file = tmpFile();
    recordEvent(file, 'run', { run: '01-harden' });
    fs.appendFileSync(file, '<<<<<<< a merge gone wrong\n');
    recordEvent(file, 'run', { run: '02-eval' });
    assert.equal(lastEvent<{ run: string }>(file, 'run')?.run, '02-eval');
    assert.equal(lastEvent(file, 'verdict'), undefined);
    assert.equal(readHistory(path.join(path.dirname(file), 'none.jsonl')).length, 0);
  });

  it('records a check again only when its outcome changed', () => {
    const file = tmpFile();
    assert.ok(recordChange(file, 'integrity', { status: 'PRESERVED', changed: [] }));
    assert.equal(recordChange(file, 'integrity', { status: 'PRESERVED', changed: [] }), undefined);
    assert.ok(recordChange(file, 'integrity', { status: 'VIOLATED', changed: ['a.spec.ts: [REQ AC-1] x'] }));
    assert.equal(readHistory(file).length, 2);
  });
});

describe('the folders of a story', () => {
  const p = evalPaths({ outputDir: 'output', autId: 'shop' }, 'ABC-1');
  const top = (file: string, root: string) => path.relative(root, file).split(path.sep)[0];

  it('keeps the record in the six phase folders and the history, and the scratch apart', () => {
    const record = Object.entries(p).filter(([k, v]) => typeof v === 'string' && k !== 'base').map(([, v]) => v as string);
    for (const f of record) assert.ok([...PHASE_FOLDERS, ...STORY_ROOT_FILES].includes(top(f, p.base) as never), `${f} is in a phase folder`);
    for (const f of Object.values(p.work).filter((v) => v !== p.work.base)) {
      assert.ok([...PHASE_FOLDERS, 'stray'].includes(top(f, p.work.base)), `${f} is in a phase folder of the scratch`);
    }
    assert.equal(path.relative(process.cwd(), p.work.base).split(path.sep)[0], SCRATCH_DIR);
  });

  it('lists the phase folders in pipeline order', () => {
    assert.deepEqual([...PHASE_FOLDERS], [...PHASE_FOLDERS].sort());
    assert.deepEqual(PHASE_FOLDERS.map((f) => f.split('-')[1]), ['requirement', 'contract', 'tests', 'evidence', 'runs', 'verdict']);
  });
});
