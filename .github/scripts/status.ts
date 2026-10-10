/**
 * Where is each story in the pipeline, and what is the next command?
 *
 *   heldout status          every story under output/<profile>/ (one line each)
 *   heldout status KEY      one story, phase by phase
 *
 * `heldout advance KEY` runs the next steps itself, up to the next subagent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, listStories, loadConfig, main, parseArgs } from './config';
import { phasesOf } from './phases';

const H = 'npm run heldout --';

main(() => {
  const { _ } = parseArgs();
  const stories = listStories(loadConfig()).sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
  const keys = _[0] ? [{ key: _[0], profile: undefined as string | undefined }] : stories;
  if (!keys.length) {
    const cfg = loadConfig();
    const mockIssues = path.join(ROOT, cfg.jira.mockRoot ?? 'mock-jira', 'issues');
    const waiting = cfg.jira.mode === 'mock' && fs.existsSync(mockIssues) ? fs.readdirSync(mockIssues).filter((k) => /^[A-Z][A-Z0-9_]+-\d+$/.test(k)) : [];
    if (waiting.length) console.log(`No stories in ${cfg.outputDir}/ yet. In the mock Jira, not fetched: ${waiting.join(', ')}. Start with: ${H} advance ${waiting[0]}`);
    else console.log(`No stories in ${cfg.outputDir}/ yet. Start with: ${H} advance ABC-123   (or ${H} new ABC-1 --from story.md for the mock Jira)`);
    return;
  }
  if (_[0]) {
    const cfg = loadConfig({ key: _[0] });
    const phases = phasesOf(cfg, _[0]);
    console.log(`${_[0]} (${cfg.outputDir}/${cfg.autId}/${_[0]})`);
    for (const ph of phases) console.log(`  ${ph.done ? '✔' : '·'} ${ph.name.padEnd(9)} ${ph.detail}`);
    const next = phases.find((ph) => !ph.done);
    console.log(next ? `\nNext: ${next.next}\n      (or ${H} advance ${_[0]}: it runs the script steps up to the next subagent)` : '\n✔ Complete.');
    return;
  }
  console.log(`${'Story'.padEnd(12)} ${'Profile'.padEnd(24)} ${'Phase'.padEnd(10)} ${'Verdict'.padEnd(20)} Next`);
  for (const { key, profile } of keys) {
    const cfg = loadConfig({ key, aut: profile });
    const phases = phasesOf(cfg, key);
    const next = phases.find((ph) => !ph.done);
    const v = phases.find((ph) => ph.name === 'verdict')!;
    console.log(`${key.padEnd(12)} ${String(profile).slice(0, 24).padEnd(24)} ${(next?.name ?? 'done').padEnd(10)} ${(v.done ? v.detail : '-').slice(0, 20).padEnd(20)} ${next?.next ?? ''}`);
  }
});
