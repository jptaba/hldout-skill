/**
 * Where everything of a story and of an application's journeys lives. The only place that knows the layout.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJson } from './files';
import type { HeldoutConfig } from './profile';

/**
 * The phase folders of a story, in the order a reviewer reads them (docs/refactor-plan.md, section 3). The kept record
 * (output/<profile>/<KEY>/) and the scratch area (.heldout/<profile>/<KEY>/) use the same names.
 */
export const PHASE_FOLDERS = ['1-requirement', '2-contract', '3-tests', '4-evidence', '5-runs', '6-verdict'] as const;
const [REQUIREMENT, CONTRACT, TESTS, EVIDENCE, RUNS, VERDICT] = PHASE_FOLDERS;
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
    // 3 — how it is tested, and how the tests were made to work
    tests: path.join(base, TESTS),
    testData: path.join(base, TESTS, 'test-data.json'),
    /** The frozen draft, its re-freezes and the audited amendments (authoring/integrity-check.ts). */
    freeze: path.join(base, TESTS, 'freeze.json'),
    hardeningLog: path.join(base, TESTS, 'hardening.md'),
    // 4 — what was seen in the application
    evidence: path.join(base, EVIDENCE),
    // 5 — what ran
    runs: path.join(base, RUNS),
    // 6 — what we recommend
    verdictMd: path.join(base, VERDICT, 'verdict.md'),
    verdictJson: path.join(base, VERDICT, 'verdict.json'),
    /** Views and working files: never committed, rendered again or written again when needed. */
    work: {
      base: scratch,
      evidencePack: path.join(scratch, CONTRACT, 'evidence-pack.md'),
      contractMd: path.join(scratch, CONTRACT, 'contract.md'),
      evidence: path.join(scratch, EVIDENCE),
      runs: path.join(scratch, RUNS),
      journeysStaged: path.join(scratch, VERDICT, 'journeys-staged.json'),
      stray: path.join(scratch, 'stray'),
    },
  };
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

/**
 * A story's evaluation runs, oldest first: every run of the whole suite that is not a hardening, reproduction or
 * repair run. A run of some of the tests (`--grep`) is never one, whatever it was labelled: a verdict from four tests
 * that passed would say nothing of the others.
 */
export function evalRunsOf(runsDir: string): string[] {
  return listRuns(runsDir).filter((r) => {
    if (NON_EVAL_RUN.test(r)) return false;
    const meta = path.join(runsDir, r, 'run-meta.json');
    return !(fs.existsSync(meta) && readJson<{ grep?: string | null }>(meta).grep);
  });
}

/** Run folders (NN-label), oldest → newest. */
export function listRuns(runsDir: string): string[] {
  if (!fs.existsSync(runsDir)) return [];
  return fs.readdirSync(runsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{2,}-/.test(d.name))
    .map((d) => d.name)
    .sort();
}
