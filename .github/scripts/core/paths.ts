/**
 * Where everything of a story and of an application's journeys lives. The only place that knows the layout.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJson } from './files';
import type { HeldoutConfig } from './profile';

/**
 * The phase folders of a story, one per producer, in the order the phases run (specs/001-phase-separation): each
 * holds only what that phase hands the later ones. The kept record (output/<profile>/<KEY>/) and the scratch area
 * (.heldout/<profile>/<KEY>/) use the same names.
 */
export const PHASE_FOLDERS = ['1-requirement', '2-contract', '3-tests', '4-hardening', '5-run', '6-triage', '7-verdict'] as const;
const [REQUIREMENT, CONTRACT, TESTS, HARDENING, RUN, TRIAGE, VERDICT] = PHASE_FOLDERS;
/** The phases that probe the application, each keeping the probes it cites. */
export type ProbingPhase = 'hardening' | 'triage';
/** The scratch area: raw tool output, views and working files, git-ignored, removed when a story is complete. */
export const SCRATCH_DIR = '.heldout';
/** The files at the top of a story's folder besides the phase folders. */
export const STORY_ROOT_FILES = ['history.jsonl'] as const;

export type StoryPaths = ReturnType<typeof evalPaths>;

/** Every place of one story: its kept record, and its scratch area under the same phase folder names. */
export function evalPaths(cfg: Pick<HeldoutConfig, 'outputDir' | 'autId'>, key: string) {
  const base = path.resolve(ROOT, cfg.outputDir, cfg.autId, key);
  const scratch = path.resolve(ROOT, SCRATCH_DIR, cfg.autId, key);
  return {
    base,
    /** Every step that changed the story, one JSON line each (core/history.ts). */
    history: path.join(base, 'history.jsonl'),
    // 1 — what was asked
    requirement: path.join(base, REQUIREMENT),
    storyMd: path.join(base, REQUIREMENT, 'story.md'),
    /** What the description and acceptance criteria embed (screenshots) and link (Confluence pages, with their images). */
    linked: path.join(base, REQUIREMENT, 'linked'),
    /** Earlier revisions of the requirement, one folder each, and what changed between them. */
    revisions: path.join(base, REQUIREMENT, 'revisions'),
    changes: path.join(base, REQUIREMENT, 'CHANGES.md'),
    // 2 — what it means
    contractDir: path.join(base, CONTRACT),
    contract: path.join(base, CONTRACT, 'contract.json'),
    review: path.join(base, CONTRACT, 'review.json'),
    // 3 — how it is tested: the test author's draft, frozen as written
    tests: path.join(base, TESTS),
    testData: path.join(base, TESTS, 'test-data.json'),
    /** The frozen draft's hashes, its re-freezes and the audited amendments (hardening/integrity-check.ts). */
    freeze: path.join(base, TESTS, 'freeze.json'),
    // 4 — how the tests were made to work: the hardener's copy of the draft, its log and the probes it cites
    hardened: path.join(base, HARDENING),
    hardenedData: path.join(base, HARDENING, 'test-data.json'),
    hardeningLog: path.join(base, HARDENING, 'hardening.md'),
    // 5 — what ran
    runs: path.join(base, RUN),
    // 6 — what the failures are: the triager's decisions and the probes they cite
    triage: path.join(base, TRIAGE),
    decisions: path.join(base, TRIAGE, 'decisions.json'),
    // 7 — what we recommend
    verdictMd: path.join(base, VERDICT, 'verdict.md'),
    verdictJson: path.join(base, VERDICT, 'verdict.json'),
    /** Views and working files: never committed, rendered again or written again when needed. */
    work: {
      base: scratch,
      evidencePack: path.join(scratch, CONTRACT, 'evidence-pack.md'),
      contractMd: path.join(scratch, CONTRACT, 'contract.md'),
      hardening: path.join(scratch, HARDENING),
      runs: path.join(scratch, RUN),
      triage: path.join(scratch, TRIAGE),
      journeysStaged: path.join(scratch, VERDICT, 'journeys-staged.json'),
      stray: path.join(scratch, 'stray'),
    },
  };
}

/** The tests as they are now: the test author's draft until the freeze, the hardener's copy after it. */
export function currentTests(p: Pick<StoryPaths, 'tests' | 'hardened' | 'freeze'>): string {
  return fs.existsSync(p.freeze) ? p.hardened : p.tests;
}
/** The test data beside the current tests. */
export const currentTestData = (p: Pick<StoryPaths, 'tests' | 'hardened' | 'freeze'>) => path.join(currentTests(p), 'test-data.json');

/** Where a probing phase keeps the probes it cites, and where its working files go. */
export function phaseDirs(p: Pick<StoryPaths, 'hardened' | 'triage' | 'work'>, phase: ProbingPhase): { kept: string; work: string } {
  return phase === 'hardening' ? { kept: p.hardened, work: p.work.hardening } : { kept: p.triage, work: p.work.triage };
}

/** What each part of a story's record may hold (path relative to the story's folder); anything else is a stray file. */
const RECORD_LAYOUT: RegExp[] = [
  /^history\.jsonl$/,
  new RegExp(`^${REQUIREMENT}/(story\\.md|CHANGES\\.md|(linked|transcripts|revisions)/.+)$`),
  new RegExp(`^${CONTRACT}/(contract|review)\\.json$`),
  new RegExp(`^${TESTS}/([^/]+\\.spec\\.ts|test-data\\.json|freeze\\.json)$`),
  new RegExp(`^${HARDENING}/([^/]+\\.spec\\.ts|test-data\\.json|hardening\\.md|probes\\.jsonl|P[1-9]\\d*\\.md)$`),
  new RegExp(`^${RUN}/\\d{2,}-[\\w-]+\\.json$`),
  new RegExp(`^${TRIAGE}/(decisions\\.json|probes\\.jsonl|P[1-9]\\d*\\.md)$`),
  // The verdict keeps the screenshot of each failure it reports.
  new RegExp(`^${VERDICT}/(verdict\\.(md|json)|[^/]+\\.(png|jpe?g|gif|webp))$`),
];

/** Where a stray file most likely belongs, said to whoever made it. */
function homeOf(file: string): string {
  const name = path.posix.basename(file);
  const phase = file.split('/')[0];
  if (/\.spec\.ts$/.test(name)) return `${TESTS}/ (the draft) or ${HARDENING}/ (the hardened copy)`;
  if (/\.(steps|chain)\.json$|^gaps|\.out$|\.log$/.test(name)) return `the scratch area's ${phase === TRIAGE ? TRIAGE : HARDENING}/ (a working file)`;
  if (/^\d{2,}-/.test(file.split('/')[1] ?? '') && phase === RUN) return `the scratch area's ${RUN}/ (a run's raw output)`;
  return 'the scratch area (no part of the record holds it)';
}

/** The files in a story's record that the layout doesn't have, each with where it belongs. */
export function strayFiles(p: Pick<StoryPaths, 'base'>): { file: string; home: string }[] {
  if (!fs.existsSync(p.base)) return [];
  return (fs.readdirSync(p.base, { recursive: true, withFileTypes: true }) as fs.Dirent[])
    .filter((d) => d.isFile())
    .map((d) => path.relative(p.base, path.join(d.parentPath, d.name)).split(path.sep).join('/'))
    .filter((f) => !RECORD_LAYOUT.some((re) => re.test(f)))
    .sort()
    .map((file) => ({ file, home: homeOf(file) }));
}

/** Moves the stray files of a story's record to the scratch area's stray/ folder, keeping their paths. Returns them. */
export function moveStrayFiles(p: { base: string; work: Pick<StoryPaths['work'], 'stray'> }): string[] {
  const stray = strayFiles(p).map((s) => s.file);
  for (const f of stray) {
    const to = path.join(p.work.stray, f);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(path.join(p.base, f), to);
  }
  // Folders the move left empty go too (a run's raw-output folder, a draft folder).
  for (const dir of [...new Set(stray.map((f) => path.dirname(path.join(p.base, f))))].sort((a, b) => b.length - a.length)) {
    for (let d = dir; d.startsWith(p.base) && d !== p.base && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
  }
  return stray;
}

/**
 * The runs the verdict doesn't stand on (hardening runs, reproductions, an evaluation run a re-run replaced), moved
 * to the scratch area before the verdict: the record keeps the final evaluation run, and the history every run's
 * result. Returns the runs moved.
 */
export function moveSupersededRuns(p: { runs: string; work: Pick<StoryPaths['work'], 'runs'> }): string[] {
  const final = evalRunsOf(p.runs).at(-1);
  if (!final) return [];
  const moved = listRuns(p.runs).filter((r) => r !== final);
  for (const r of moved) {
    fs.mkdirSync(p.work.runs, { recursive: true });
    fs.renameSync(runFile(p, r), path.join(p.work.runs, `${r}.json`));
  }
  return moved;
}

/** Why a run's record is not in the record, when the verdict's tidy moved it: said in the errors that look for it. */
export function movedRunNote(p: { work: Pick<StoryPaths['work'], 'runs'> }, run?: string): string {
  const file = run && path.join(p.work.runs, `${run}.json`);
  return file && fs.existsSync(file) ? ` — ${run}'s record was moved to the scratch area when the verdict was due (${path.relative(ROOT, file).split(path.sep).join('/')}); its result is in the history` : '';
}

/** Every story folder: output/<profile>/<KEY>/. */
export function listStories(cfg: Pick<HeldoutConfig, 'outputDir'>): { profile: string; key: string; dir: string }[] {
  const out = path.resolve(ROOT, cfg.outputDir);
  if (!fs.existsSync(out)) return [];
  return fs.readdirSync(out, { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((p) =>
    fs.readdirSync(path.join(out, p.name), { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^[A-Z][A-Z0-9_]+-\d+$/.test(d.name))
      .map((d) => ({ profile: p.name, key: d.name, dir: path.join(out, p.name, d.name) })));
}

/** An application's journeys: fixtures/<domain>.ts and registry.yml, in its journeysDir (the project's by default). */
export function journeyPaths(cfg: Pick<HeldoutConfig, 'journeysDir' | 'auts'>, profile: string) {
  const base = path.resolve(ROOT, cfg.auts?.[profile]?.journeysDir ?? cfg.journeysDir ?? 'journeys');
  return { base, fixtures: path.join(base, 'fixtures'), registry: path.join(base, 'registry.yml') };
}

/** Runs that are not evaluations (hardening, reproductions, probes, robustness drills) — never the verdict's final run. */
export const NON_EVAL_RUN = /^\d+-(harden|repro|probe|robustness|repair)/;

/** The triager's decisions on a story's runs, beside the run record's story (a run record's path is enough). */
export const decisionsFor = (runRecord: string) => path.join(path.dirname(path.dirname(runRecord)), TRIAGE, 'decisions.json');

/** The record of one run (5-run/NN-label.json): how it ran, and every test with the evidence of its failures. */
export const runFile = (p: Pick<StoryPaths, 'runs'>, run: string) => path.join(p.runs, `${run}.json`);
/** The raw output of one run, in the scratch area (Playwright's JSON, artifacts, traces, logs). */
export const runRaw = (p: Pick<StoryPaths, 'work'>, run: string) => path.join(p.work.runs, run);

/**
 * A story's evaluation runs, oldest first: every run of the whole suite that is not a hardening, reproduction or
 * repair run. A run of some of the tests (`--grep`) is never one, whatever it was labelled: a verdict from four tests
 * that passed would say nothing of the others.
 */
export function evalRunsOf(runsDir: string): string[] {
  return listRuns(runsDir).filter((r) => {
    if (NON_EVAL_RUN.test(r)) return false;
    return !readJson<{ meta?: { grep?: string | null } }>(runFile({ runs: runsDir }, r)).meta?.grep;
  });
}

/** The story's runs (NN-label, from their records), oldest → newest. */
export function listRuns(runsDir: string): string[] {
  if (!fs.existsSync(runsDir)) return [];
  return fs.readdirSync(runsDir, { withFileTypes: true })
    .filter((d) => d.isFile() && /^\d{2,}-[\w-]+\.json$/.test(d.name))
    .map((d) => d.name.replace(/\.json$/, ''))
    .sort();
}
