/**
 * Exercises the Jira and Confluence Data Center adapters against a local fake of their REST APIs: Bearer auth, issue
 * read, image download, upload, wiki-markup comment, label update — plus jira-fetch.ts end-to-end in
 * JIRA_MODE=datacenter, which reads only the title, description and acceptance criteria, the images they show and the
 * Confluence page they link (and the image that page shows): never comments, never other attachments.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { after, before, describe, it } from 'node:test';
import { JiraDataCenterClient } from '../.github/scripts/jira-datacenter';
import { doc, p } from '../.github/scripts/jira-adf';

const PAT = 'not-a-real-pat';
interface Captured { method: string; url: string; headers: http.IncomingHttpHeaders; body: Buffer }
const calls: Captured[] = [];
let labels = ['api'];
let base = '';

const issue = () => ({
  key: 'DC-7', id: '10007',
  fields: {
    summary: 'Guest cart', issuetype: { name: 'Story' }, status: { name: 'Ready for QA' }, priority: { name: 'High' }, labels,
    description: `h3. Cart\nThe page looks like this:\n!cart.png|thumbnail!\nThe API is on [Cart API|${base}/confluence/pages/viewpage.action?pageId=123].`,
    customfield_10035: '* AC-1: Adding 1 to 99 items works.\n* AC-2: Quantity 0 is rejected.',
    attachment: [
      { id: '1', filename: 'cart.png', mimeType: 'image/png', size: 4, content: `${base}/secure/attachment/1/cart.png` },
      { id: '2', filename: 'rules.csv', mimeType: 'text/csv', size: 9, content: `${base}/secure/attachment/2/rules.csv` },
    ],
    comment: { total: 1, comments: [{ id: '9', author: { displayName: 'PO' }, body: 'Actually it should answer 409', created: '2026-10-01' }] },
  },
});
const page = {
  id: '123', type: 'page', title: 'Cart API', space: { key: 'SHOP' },
  body: { storage: { value: '<p>Quantities outside 1&ndash;99 answer:</p><ac:structured-macro ac:name="code"><ac:parameter ac:name="language">yaml</ac:parameter><ac:plain-text-body><![CDATA[responses:\n  "422": quantity out of range]]></ac:plain-text-body></ac:structured-macro><p><ac:image><ri:attachment ri:filename="flow.png" /></ac:image></p>', representation: 'storage' } },
};
const pageFiles = { results: [
  { id: 'att1', title: 'flow.png', metadata: { mediaType: 'image/png' }, extensions: { fileSize: 4 }, _links: { download: '/download/attachments/123/flow.png' } },
  { id: 'att2', title: 'spec.pdf', metadata: { mediaType: 'application/pdf' }, extensions: { fileSize: 9 }, _links: { download: '/download/attachments/123/spec.pdf' } },
] };

const server = http.createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const url = req.url!;
    calls.push({ method: req.method!, url, headers: req.headers, body });
    if (req.headers.authorization !== `Bearer ${PAT}`) { res.writeHead(401).end('{"errorMessages":["unauthorised"]}'); return; }
    const send = (status: number, json: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(json)); };
    const file = (bytes: string) => { res.writeHead(200, { 'Content-Type': 'application/octet-stream' }).end(bytes); };
    if (req.method === 'GET' && url.startsWith('/rest/api/2/issue/DC-7')) return send(200, issue());
    if (req.method === 'GET' && url === '/rest/api/2/myself') return send(200, { name: 'qa.bot', displayName: 'QA Bot' });
    if (req.method === 'GET' && url === '/rest/api/2/field') return send(200, [{ id: 'customfield_10035', name: 'Acceptance Criteria', custom: true }, { id: 'customfield_10100', name: 'Sprint', custom: true }]);
    if (req.method === 'GET' && url === '/secure/attachment/1/cart.png') return file('PNG1');
    if (req.method === 'GET' && url === '/secure/attachment/2/rules.csv') return file('a,b\n1,2\n');
    if (req.method === 'GET' && url === '/confluence/rest/api/content/123?expand=body.storage') return send(200, page);
    if (req.method === 'GET' && url.startsWith('/confluence/rest/api/content/123/child/attachment')) return send(200, pageFiles);
    if (req.method === 'GET' && url === '/confluence/download/attachments/123/flow.png') return file('PNG2');
    if (req.method === 'GET' && url === '/confluence/download/attachments/123/spec.pdf') return file('%PDF');
    if (req.method === 'POST' && url === '/rest/api/2/issue/DC-7/attachments') return send(200, [{ id: '99', filename: 'verdict.md', mimeType: 'text/markdown', size: body.length, content: `${base}/x` }]);
    if (req.method === 'POST' && url === '/rest/api/2/issue/DC-7/comment') return send(201, { id: '555' });
    if (req.method === 'PUT' && url === '/rest/api/2/issue/DC-7') {
      const ops = JSON.parse(body.toString()).update.labels as { add?: string; remove?: string }[];
      for (const o of ops) { if (o.remove) labels = labels.filter((l) => l !== o.remove); if (o.add) labels.push(o.add); }
      res.writeHead(204).end(); return;
    }
    send(404, { errorMessages: ['not found'] });
  });
});

before(async () => {
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
after(() => { server.closeAllConnections(); server.close(); });

describe('JiraDataCenterClient against a fake Jira Data Center', () => {
  it('diagnoses auth and finds the acceptance-criteria custom field', async () => {
    const d = await new JiraDataCenterClient(base, PAT).diagnose();
    assert.equal(d.user, 'QA Bot');
    assert.deepEqual(d.acFieldCandidates, [{ id: 'customfield_10035', name: 'Acceptance Criteria' }]);
  });
  it('reads an issue over REST v2 with a Bearer token, without comments', async () => {
    const i = await new JiraDataCenterClient(base, PAT, ['customfield_10035']).getIssue('DC-7');
    assert.equal(i.fields.summary, 'Guest cart');
    const last = calls.at(-1)!;
    assert.equal(last.headers.authorization, `Bearer ${PAT}`);
    assert.match(last.url, /^\/rest\/api\/2\/issue\/DC-7\?fields=summary,description,.*attachment,customfield_10035$/);
    assert.doesNotMatch(last.url, /comment/);
  });
  it('uploads the verdict as multipart with the XSRF bypass header', async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dc-')), 'verdict.md');
    fs.writeFileSync(file, '# Verdict\n');
    const meta = await new JiraDataCenterClient(base, PAT).addAttachment('DC-7', file, 'heldout-verdict-DC-7.md');
    const last = calls.at(-1)!;
    assert.equal(meta.id, '99');
    assert.equal(last.headers['x-atlassian-token'], 'no-check');
    assert.match(last.body.toString(), /filename="heldout-verdict-DC-7.md"/);
  });
  it('posts the comment as wiki markup', async () => {
    assert.equal((await new JiraDataCenterClient(base, PAT).addComment('DC-7', doc(p('Held-out evaluation: FAIL')))).id, '555');
    assert.equal(JSON.parse(calls.at(-1)!.body.toString()).body, 'Held-out evaluation: FAIL');
  });
  it('replaces prefixed labels with one update', async () => {
    labels = ['api', 'heldout-pass'];
    const result = await new JiraDataCenterClient(base, PAT).setLabels('DC-7', ['heldout-fail'], 'heldout-');
    assert.deepEqual(result.sort(), ['api', 'heldout-fail']);
    assert.deepEqual(labels.sort(), ['api', 'heldout-fail']);
  });
  it('fails clearly on a bad token', async () => {
    await assert.rejects(new JiraDataCenterClient(base, 'wrong').getIssue('DC-7'), /401/);
  });

  it('jira-fetch.ts reads the story, its images and its linked page — never comments or other attachments', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-proj-'));
    fs.writeFileSync(path.join(dir, 'heldout.config.json'), JSON.stringify({
      defaultAut: 'app', auts: { app: { name: 'App', baseURL: 'http://localhost:1' } },
      jira: { mode: 'datacenter', mockRoot: 'mock-jira', baseUrl: base, acceptanceCriteriaField: 'customfield_10035' }, outputDir: 'output', run: { retries: 0 },
    }));
    const script = path.resolve(import.meta.dirname, '..', '.github', 'scripts', 'jira-fetch.ts');
    const tsxLoader = pathToFileURL(createRequire(import.meta.url).resolve('tsx/esm')).href; // resolve from the project, not the temp cwd
    calls.length = 0;
    // Async spawn: the fake server lives in this process, so a blocking spawnSync would deadlock.
    const r = await new Promise<{ status: number | null; stderr: string }>((resolve) => {
      const child = spawn(process.execPath, ['--import', tsxLoader, script, 'DC-7'], { cwd: dir, env: { ...process.env, JIRA_MODE: 'datacenter', JIRA_BASE_URL: base, JIRA_PAT: PAT } });
      let stderr = '';
      child.stderr.on('data', (d) => { stderr += d; });
      child.on('close', (status) => resolve({ status, stderr }));
    });
    assert.equal(r.status, 0, r.stderr);
    const req = path.join(dir, 'output', 'app', 'DC-7', 'requirement');
    const story = fs.readFileSync(path.join(req, 'story.md'), 'utf8');
    assert.match(story, /source: jira-datacenter/);
    assert.match(story, /!cart\.png\|thumbnail!/);
    assert.match(story, /AC-2: Quantity 0 is rejected\./);
    assert.match(story, /\| Cart API \| .*pageId=123 \| read \| linked\/confluence-123-cart-api\.md/);
    assert.doesNotMatch(story, /409|Actually/);
    assert.doesNotMatch(story, /rules\.csv/);
    assert.deepEqual(fs.readdirSync(path.join(req, 'linked')).sort(), ['cart.png', 'confluence-123-cart-api.md', 'confluence-123-flow.png']);
    const pageMd = fs.readFileSync(path.join(req, 'linked', 'confluence-123-cart-api.md'), 'utf8');
    assert.match(pageMd, /^confluencePage: /);
    assert.match(pageMd, /```yaml\nresponses:\n {2}"422": quantity out of range\n```/);
    assert.match(pageMd, /\[attachment: confluence-123-flow\.png\]/);
    // Only the two images shown were fetched: no other attachment, on the issue or the page.
    const downloads = calls.filter((c) => /\/(secure\/attachment|download\/attachments)\//.test(c.url)).map((c) => c.url).sort();
    assert.deepEqual(downloads, ['/confluence/download/attachments/123/flow.png', '/secure/attachment/1/cart.png']);
  });
});
