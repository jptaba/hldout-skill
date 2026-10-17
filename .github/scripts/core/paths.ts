/**
 * Where everything of a story and of an application's journeys lives. The only place that knows the layout.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJson } from './files';
import type { HeldoutConfig } from './profile';

export function evalPaths(cfg: HeldoutConfig, key: string) {
  const base = path.resolve(ROOT, cfg.outputDir, cfg.autId, key);
  return {
    base,
    requirement: path.join(base, 'requirement'),
    storyMd: path.join(base, 'requirement', 'story.md'),
    rawIssue: path.join(base, 'requirement', 'raw-issue.json'),
    /** What the description and acceptance criteria embed (screenshots) and link (Confluence pages, with their images). */
    linked: path.join(base, 'requirement', 'linked'),
    evaluationMeta: path.join(base, 'evaluation.json'),
    testData: path.join(base, 'test-data.json'),
    tests: path.join(base, 'tests'),
    draft: path.join(base, 'draft'),
    hardening: path.join(base, 'hardening'),
    hardeningLog: path.join(base, 'hardening', 'hardening-log.md'),
    integrity: path.join(base, 'hardening', 'integrity.json'),
    runs: path.join(base, 'runs'),
    verdictMd: path.join(base, 'verdict.md'),
    verdictJson: path.join(base, 'verdict.json'),
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
