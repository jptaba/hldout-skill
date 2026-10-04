/**
 * Phase 1 — Fetch a story from Jira Data Center (or the mock) and normalise it. The requirement is the story's
 * title, its description and its acceptance criteria, plus what those two fields hold: the screenshots they embed
 * (Jira wiki markup !shot.png!, or an inline image) and the Confluence pages they link, with the images those pages
 * show. Comments and the issue's other attachments are not requirement input.
 *
 *   heldout fetch <KEY> [--aut <profile>]
 *
 * Output (evaluations/<KEY>/requirement/):
 *   story.md                      title + description + AC field (as Jira holds them: wiki markup on Data Center),
 *                                 then an index of the linked pages and the screenshots
 *   raw-issue.json                untouched API payload
 *   linked/<file>                 each screenshot the description or AC embed
 *   linked/confluence-<id>-*.md   each Confluence page they link, as Markdown; its images beside it
 *   CHANGES.md                    appended when a re-fetch finds the requirement changed (previous revision → history/)
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey, evalPaths, flagStr, loadConfig, main, parseArgs, rel, timestamp, writeFile } from './config';
import { confluenceLinks, createTracker, createWiki, embeddedAttachments, type JiraAttachmentMeta } from './jira';

const hashDir = (dir: string): Map<string, string> => new Map(fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile())
    .map((f) => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, f))).digest('hex')])
  : []);
const body = (md: string) => md.replace(/^fetchedAt: .*$/m, '').trim();

main(async () => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const p = evalPaths(cfg, key);
  const tracker = createTracker(cfg);
  // Bind the story to an AUT profile on first fetch (--aut, else the default) so every later command targets it.
  const bindingNote = (() => {
    if (fs.existsSync(p.evaluationMeta)) {
      const bound = (JSON.parse(fs.readFileSync(p.evaluationMeta, 'utf8')) as { aut?: string }).aut;
      if (flagStr(flags, 'aut') && bound !== flagStr(flags, 'aut')) throw new Error(`${key} is bound to AUT "${bound}" (evaluation.json); edit that file to re-bind it`);
      return `bound to AUT "${bound ?? cfg.autId}"`;
    }
    writeFile(p.evaluationMeta, `${JSON.stringify({ key, aut: cfg.autId, createdAt: new Date().toISOString().slice(0, 10) }, null, 2)}\n`);
    return `bound to AUT "${cfg.autId}" (${cfg.aut.name}) → ${rel(p.evaluationMeta)}${Object.keys(cfg.auts).length > 1 && !flagStr(flags, 'aut') ? ' — the default profile; pass --aut <id> to pick another' : ''}`;
  })();

  const previousStory = fs.existsSync(p.storyMd) ? fs.readFileSync(p.storyMd, 'utf8') : undefined;
  const previousLinked = hashDir(p.linked);
  const stamp = timestamp();
  if (previousStory) { // keep the old revision until we know whether it changed
    const hist = path.join(p.requirement, 'history', stamp);
    fs.mkdirSync(path.join(hist, 'linked'), { recursive: true });
    fs.writeFileSync(path.join(hist, 'story.md'), previousStory);
    for (const f of previousLinked.keys()) fs.copyFileSync(path.join(p.linked, f), path.join(hist, 'linked', f));
  }

  const issue = await tracker.getIssue(key);
  writeFile(p.rawIssue, `${JSON.stringify(issue, null, 2)}\n`);

  const f = issue.fields;
  const acField = cfg.jira.acceptanceCriteriaField;
  const acRaw = acField ? f[acField] : undefined;
  const description = (f.description ?? '').trim();
  const criteria = typeof acRaw === 'string' ? acRaw.trim() : '';

  // Fresh each fetch: a file the story stops embedding or linking is no longer requirement (history/ keeps the old revision).
  fs.rmSync(p.linked, { recursive: true, force: true });
  fs.mkdirSync(p.linked, { recursive: true });
  const shots: string[] = [];
  const save = async (att: JiraAttachmentMeta, name: string, download: (dest: string) => Promise<void>) => {
    await download(path.join(p.linked, name));
    shots.push(`| ${name} | ${att.mimeType} | ${att.size} | linked/${name} |`);
  };

  // Screenshots the description or the acceptance criteria show.
  const fields = `${description}\n${criteria}`;
  const embedded = embeddedAttachments(f.attachment ?? [], fields);
  for (const att of embedded) await save(att, att.filename, (dest) => tracker.downloadAttachment(key, att, dest));

  // Linked Confluence pages: each one as Markdown, with the images its body shows.
  const wiki = createWiki(cfg);
  const pages: string[] = [];
  for (const url of confluenceLinks(fields)) {
    try {
      const page = await wiki.getPage(url);
      let body = page.body;
      const files = embeddedAttachments(page.attachments, body);
      for (const att of files) {
        // Saved beside the story's own screenshots, under a name that says which page shows it.
        const name = `confluence-${page.id}-${att.filename}`;
        await save(att, name, (dest) => wiki.downloadAttachment(page, att, dest));
        body = body.split(`[attachment: ${att.filename}]`).join(`[attachment: ${name}]`).split(`!${att.filename}!`).join(`[attachment: ${name}]`);
      }
      const name = `confluence-${page.id}-${page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)}.md`;
      writeFile(path.join(p.linked, name), `confluencePage: ${url}\n\n# ${page.title}\n\n${body}\n`);
      pages.push(`| ${page.title} | ${url} | read | linked/${name}${files.length ? ` (+ ${files.length} image(s))` : ''} |`);
    } catch (e) {
      pages.push(`| — | ${url} | **not read**: ${(e as Error).message.split('\n')[0].slice(0, 160)} | — |`);
    }
  }

  const md = [
    '---',
    `key: ${issue.key}`,
    `summary: ${JSON.stringify(f.summary)}`,
    `type: ${f.issuetype?.name ?? 'unknown'}`,
    `status: ${f.status?.name ?? 'unknown'}`,
    `priority: ${f.priority?.name ?? 'unknown'}`,
    `labels: [${(f.labels ?? []).join(', ')}]`,
    `source: ${tracker.mode === 'mock' ? 'mock-jira' : `jira-${tracker.mode}`}`,
    `url: ${tracker.browseUrl(key)}`,
    `fetchedAt: ${new Date().toISOString()}`,
    '---',
    '',
    `# ${issue.key}: ${f.summary}`,
    '',
    '## Description',
    '',
    description || '_(empty)_',
    '',
    ...(criteria ? ['## Acceptance criteria (custom field)', '', criteria, ''] : []),
    '## Linked pages',
    '',
    ...(pages.length ? ['| Page | Link | Status | Local path |', '| --- | --- | --- | --- |', ...pages] : ['_None_']),
    '',
    '## Screenshots',
    '',
    ...(shots.length ? ['| File | MIME | Bytes | Local path (transcribe what it shows) |', '| --- | --- | --- | --- |', ...shots] : ['_None_']),
    '',
  ].join('\n');
  writeFile(p.storyMd, md);

  const unread = pages.filter((r) => r.includes('**not read**')).length;
  console.log(`✔ Fetched ${key} from ${tracker.mode} Jira: "${f.summary}" (title, description, acceptance criteria; comments and attachments are not read)`);
  console.log(`  AUT:         ${bindingNote}`);
  console.log(`  story:       ${rel(p.storyMd)}`);
  console.log(`  pages:       ${pages.length} linked Confluence page(s)${unread ? `, ${unread} not read — see story.md "Linked pages"` : ''}`);
  console.log(`  screenshots: ${shots.length} → ${rel(p.linked)}/`);
  for (const row of shots) console.log(`    - ${row.split('|')[1].trim()}`);
  if (unread) console.log(`  ⚠ a linked page could not be read: the contract records it as an open question (or fix access and fetch again)`);

  // ---- revision detection ----
  const hist = path.join(p.requirement, 'history', stamp);
  if (!previousStory) { console.log(`\nNext (phase 1b): heldout contract ${key} --pack, then the heldout-contract-extractor and heldout-contract-reviewer subagents.`); return; }
  const now = hashDir(p.linked);
  const attChanges = [
    ...[...now.keys()].filter((k) => !previousLinked.has(k)).map((k) => `added ${k}`),
    ...[...previousLinked.keys()].filter((k) => !now.has(k)).map((k) => `removed ${k}`),
    ...[...now.keys()].filter((k) => previousLinked.has(k) && previousLinked.get(k) !== now.get(k)).map((k) => `changed ${k}`),
  ];
  if (body(previousStory) === body(md) && !attChanges.length) {
    fs.rmSync(hist, { recursive: true, force: true });
    const histRoot = path.dirname(hist);
    if (fs.existsSync(histRoot) && !fs.readdirSync(histRoot).length) fs.rmdirSync(histRoot);
    console.log('\n= Requirement unchanged since the last fetch.');
    return;
  }
  const oldLines = new Set(body(previousStory).split('\n'));
  const newLines = new Set(body(md).split('\n'));
  const added = [...newLines].filter((l) => l.trim() && !oldLines.has(l));
  const removed = [...oldLines].filter((l) => l.trim() && !newLines.has(l));
  const entry = [
    `## Revision detected ${new Date().toISOString()}`, '',
    `Previous revision archived at \`requirement/history/${stamp}/\`.`, '',
    ...(attChanges.length ? ['**Screenshots and linked pages:** ' + attChanges.join(', '), ''] : []),
    ...(added.length ? ['**Added lines:**', '', ...added.map((l) => `+ ${l}`), ''] : []),
    ...(removed.length ? ['**Removed lines:**', '', ...removed.map((l) => `- ${l}`), ''] : []),
    '**Action:** rebuild requirement-contract.json (it is now stale), then update requirement-review.md and scenarios.feature. New/changed tests need a re-freeze (`integrity.ts KEY --snapshot --reason …`) before hardening.', '',
  ].join('\n');
  const changesFile = path.join(p.requirement, 'CHANGES.md');
  writeFile(changesFile, `${fs.existsSync(changesFile) ? fs.readFileSync(changesFile, 'utf8') + '\n' : '# Requirement changes\n\n'}${entry}`);
  console.log(`\n⚠ REQUIREMENT CHANGED since the last fetch: +${added.length}/-${removed.length} lines${attChanges.length ? `; screenshots and linked pages: ${attChanges.join(', ')}` : ''}`);
  for (const l of added.slice(0, 8)) console.log(`    + ${l.slice(0, 140)}`);
  for (const l of removed.slice(0, 8)) console.log(`    - ${l.slice(0, 140)}`);
  console.log(`  → ${rel(changesFile)} (previous revision in requirement/history/${stamp}/)`);
  if (fs.existsSync(p.scenarios)) console.log('  Scenarios/tests were written against the previous revision — re-review them before the next run.');
});
