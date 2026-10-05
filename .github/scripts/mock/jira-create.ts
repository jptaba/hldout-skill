/**
 * Author a story in the file-based mock Jira (no Jira needed). It stores the story the way Jira Data Center holds it:
 * the description and the acceptance-criteria field as text, screenshots embedded as !shot.png!.
 *
 *   heldout new <KEY> --from story.md
 *       [--summary "..."] [--type Story] [--status "Ready for QA"] [--priority High] [--label a --label b]
 *       [--ac-from ac.md] [--page <id>=page.md]... [--force]
 *
 *   --ac-from  acceptance criteria in a custom field (jira.acceptanceCriteriaField, default customfield_10035), as many teams do
 *   --page     a Confluence page the story links to, in the mock Confluence ([<SPACE>:]<id>=<file>, space DEV unless
 *              given): page.md (its first "# " heading is the title; written in storage format) or page.html (storage
 *              format as Confluence keeps it, e.g. exported from a real page; title from its <title> or first <h1>).
 *              Link it from the description or the criteria as
 *              <jira.baseUrl>/confluence/pages/viewpage.action?pageId=<id> or …/confluence/display/<SPACE>/<Title>
 *
 * The first "# " heading of story.md becomes the summary unless --summary is given; the rest is the description.
 * Each screenshot the description, the criteria or a page embeds (!shot.png!, or an ac:image in storage format) is
 * taken from beside its file. Everything is stored as Jira and Confluence Data Center return it (see jira-client.ts,
 * confluence-client.ts), so `heldout fetch` reads the mock exactly like the real servers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, assertIssueKey, flagList, flagStr, loadConfig, main, parseArgs, rel, writeFile } from '../config';
import { embeddedFiles } from '../jira';
import type { JiraAttachmentMeta, JiraIssue } from '../jira-types';
import { mimeOf, renderIssueView } from './jira-client';
import { markdownToStorage } from './storage-format';

/** Copy each named file from beside `from` into dir. */
function copyBeside(names: string[], from: string, dir: string): { name: string; size: number }[] {
  return names.map((n) => {
    const src = path.resolve(path.dirname(from), n);
    if (!fs.existsSync(src)) throw new Error(`${from} shows ${n}, but ${src} does not exist`);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, path.join(dir, path.basename(n)));
    return { name: path.basename(n), size: fs.statSync(src).size };
  });
}

main(() => {
  const { _, flags } = parseArgs();
  const key = assertIssueKey(_[0]);
  const from = flagStr(flags, 'from');
  if (!from) throw new Error('--from <story.md> is required');
  const cfg = loadConfig();
  const dir = path.join(ROOT, cfg.jira.mockRoot, 'issues', key);
  if (fs.existsSync(path.join(dir, 'issue.json')) && !flags.force) throw new Error(`${key} already exists in the mock (use --force to overwrite)`);
  fs.rmSync(dir, { recursive: true, force: true });

  let md = fs.readFileSync(from, 'utf8').replace(/^﻿/, '');
  const h1 = md.match(/^#\s+(.+)$/m);
  const summary = flagStr(flags, 'summary') ?? h1?.[1].replace(new RegExp(`^${key}:?\\s*`), '') ?? key;
  if (h1 && !flagStr(flags, 'summary')) md = md.replace(h1[0], '');

  const acFrom = flagStr(flags, 'ac-from');
  const ac = acFrom ? fs.readFileSync(acFrom, 'utf8').replace(/^﻿/, '').trim() : undefined;
  const acField = cfg.jira.acceptanceCriteriaField || 'customfield_10035';
  // The mock Jira is ours: point fetch at the field the criteria are written to, rather than asking the user to.
  if (acFrom && !cfg.jira.acceptanceCriteriaField) {
    const file = path.join(ROOT, 'heldout.config.json');
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    raw.jira = { ...raw.jira, acceptanceCriteriaField: acField };
    fs.writeFileSync(file, `${JSON.stringify(raw, null, 2)}\n`);
    console.log(`✔ jira.acceptanceCriteriaField set to ${acField} (where --ac-from writes the criteria), so fetch reads them`);
  }
  // The screenshots the description and the criteria show, as attachments with Data Center download URLs.
  const base = cfg.jira.baseUrl ?? 'https://jira.example.com';
  const idBase = 20000 + Number(key.split('-')[1]) * 10;
  const shots = [...copyBeside(embeddedFiles(md), from, path.join(dir, 'attachments')), ...(ac && acFrom ? copyBeside(embeddedFiles(ac), acFrom, path.join(dir, 'attachments')) : [])];
  const attachment: JiraAttachmentMeta[] = shots.map((s, i) => ({ id: String(idBase + i), filename: s.name, mimeType: mimeOf(s.name), size: s.size,
    content: `${base}/secure/attachment/${idBase + i}/${encodeURIComponent(s.name)}`, created: new Date().toISOString(), author: { displayName: 'Product Owner' } }));

  // Confluence pages the story links to, as Confluence Data Center's REST answers, with the images they show.
  for (const spec of flagList(flags, 'page')) {
    const m = spec.match(/^(?:([A-Z][A-Z0-9_]*):)?(\d+)=(.+)$/);
    if (!m) throw new Error(`--page takes [<SPACE>:]<numeric id>=<page.md|page.html>, not "${spec}"`);
    const [, space = 'DEV', id, file] = m;
    const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
    const isStorage = /\.(html?|xml)$/i.test(file);
    const title = (isStorage ? raw.match(/<title>([^<]+)<\/title>/)?.[1] ?? raw.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '') : raw.match(/^#\s+(.+)$/m)?.[1])?.trim() ?? `Page ${id}`;
    const storage = isStorage ? raw.replace(/<title>[^<]*<\/title>/, '').trim() : markdownToStorage(raw.replace(/^#\s+.+$/m, '').trim());
    const images = [...new Set([...storage.matchAll(/<ac:image\b[^>]*>[\s\S]*?ri:filename="([^"]+)"[\s\S]*?<\/ac:image>/g)].map((x) => x[1]))];
    const pageDir = path.join(ROOT, cfg.jira.mockRoot, 'confluence', id);
    fs.rmSync(pageDir, { recursive: true, force: true });
    const files = copyBeside(images, file, path.join(pageDir, 'files'));
    writeFile(path.join(pageDir, 'content.json'), `${JSON.stringify({ id, type: 'page', status: 'current', title, space: { key: space },
      body: { storage: { value: storage, representation: 'storage' } }, _links: { webui: `/pages/viewpage.action?pageId=${id}` } }, null, 2)}\n`);
    writeFile(path.join(pageDir, 'attachments.json'), `${JSON.stringify({ results: files.map((f, i) => ({ id: `att${id}${i + 1}`, type: 'attachment', title: f.name,
      metadata: { mediaType: mimeOf(f.name) }, extensions: { mediaType: mimeOf(f.name), fileSize: f.size },
      _links: { download: `/download/attachments/${id}/${encodeURIComponent(f.name)}` } })), size: files.length }, null, 2)}\n`);
    console.log(`✔ mock Confluence page ${id} "${title}" (space ${space}) → ${rel(pageDir)}/ (${files.length} image(s)); link: ${base}/confluence/pages/viewpage.action?pageId=${id}`);
  }

  const issue: JiraIssue = {
    id: String(10000 + Number(key.split('-')[1])),
    key,
    self: `${base}/rest/api/2/issue/${key}`,
    fields: {
      summary,
      issuetype: { name: flagStr(flags, 'type') ?? 'Story' },
      status: { name: flagStr(flags, 'status') ?? 'Ready for QA' },
      priority: { name: flagStr(flags, 'priority') ?? 'High' },
      labels: flagList(flags, 'label'),
      description: md.trim(),
      attachment,
      comment: { comments: [], total: 0 },
      ...(ac !== undefined ? { [acField]: ac } : {}),
    },
  };
  writeFile(path.join(dir, 'issue.json'), `${JSON.stringify(issue, null, 2)}\n`);
  writeFile(path.join(dir, 'ISSUE_VIEW.md'), renderIssueView(issue, `${base}/browse/${key}`));
  console.log(`✔ mock Jira issue ${key} "${summary}" → ${rel(dir)}/ (${attachment.length} screenshot(s))`);
  console.log(`\nNext: npm run heldout -- fetch ${key}   (or ask Opus: "Run a held-out evaluation of ${key}")`);
});
