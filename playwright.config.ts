/**
 * Playwright config for held-out evaluations (scaffolded by the heldout-evaluator skill).
 * AUT-agnostic: "heldout run" resolves the story's AUT profile and passes it via env
 * (HELDOUT_AUT, AUT_BASE_URL, AUT_API_BASE_URL, AUT_TEST_ID_ATTRIBUTE) plus HELDOUT_RUN_DIR.
 * Running `npx playwright test` directly falls back to the config's defaultAut.
 */
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// Resolved from the working directory (Playwright and the skill run from the project root) so this config works in CommonJS and ESM projects alike.
const cfg = JSON.parse(fs.readFileSync(path.resolve(process.env.HELDOUT_ROOT ?? process.cwd(), 'heldout.config.json'), 'utf8'));
const profiles = cfg.auts ?? { default: cfg.aut };
const profile = profiles[process.env.HELDOUT_AUT ?? cfg.defaultAut ?? Object.keys(profiles)[0]] ?? {};
const runDir = process.env.HELDOUT_RUN_DIR ?? path.join('test-results', 'heldout');
const num = (v: string | undefined, fallback: number) => (v !== undefined && v !== '' ? Number(v) : fallback);

// Fixtures read these, so direct `npx playwright test` runs behave like run.ts runs.
process.env.AUT_BASE_URL ??= profile.baseURL;
process.env.AUT_API_BASE_URL ??= profile.apiBaseURL ?? profile.baseURL;

export default defineConfig({
  // Each story's tests: output/<profile>/<KEY>/tests/ (the journeys they import are not tests).
  testDir: cfg.outputDir ?? 'output',
  testMatch: '**/tests/**/*.spec.ts',
  outputDir: path.join(runDir, 'artifacts'),
  fullyParallel: true,
  forbidOnly: true,
  retries: num(process.env.HELDOUT_RETRIES, cfg.run?.retries ?? 1),
  workers: num(process.env.HELDOUT_WORKERS, cfg.run?.workers ?? 4),
  timeout: cfg.run?.testTimeoutMs ?? 60_000,
  expect: { timeout: cfg.run?.expectTimeoutMs ?? 5_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(runDir, 'results.json') }],
    ['junit', { outputFile: path.join(runDir, 'junit.xml') }],
    ['html', { outputFolder: path.join(runDir, 'html'), open: 'never' }],
  ],
  use: {
    baseURL: process.env.AUT_BASE_URL,
    testIdAttribute: process.env.AUT_TEST_ID_ATTRIBUTE ?? profile.testIdAttribute ?? 'data-testid',
    headless: process.env.HELDOUT_HEADED ? false : (cfg.run?.headless ?? true),
    actionTimeout: cfg.run?.actionTimeoutMs ?? 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  // A test tagged @irreversible changes the application for good (locks an account, sends a real e-mail): it runs once
  // per run, never retried and never repeated, so a run does exactly the damage it has to.
  projects: [
    { name: 'chromium', grepInvert: /@irreversible\b/, repeatEach: num(process.env.HELDOUT_REPEAT_EACH, 1), use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-once', grep: /@irreversible\b/, retries: 0, repeatEach: 1, use: { ...devices['Desktop Chrome'] } },
  ],
});
