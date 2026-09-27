/**
 * Exercises the Jira Cloud adapter against a local fake of the Jira Cloud REST v3 API
 * (no subscription needed): auth header, issue read, attachment download/upload, ADF comment,
 * label update — plus jira-fetch.ts end-to-end in JIRA_MODE=cloud.
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
import { JiraCloudClient } from '../scripts/lib/jira/cloud';
import { doc, p } from '../scripts/lib/jira/adf';

const EMAIL = 'bot@example.test';
const TOKEN = 'not-a-real-token';
const AUTH = `Basic ${Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64')}`;

interface Captured { method: string; url: string; headers: http.IncomingHttpHeaders; body: Buffer }
const calls: Captured[] = [];
let labels = ['api'];
let base = '';

const issue = () => ({
  key: 'CLD-7', id: '10007',
  fields: {
    summary: 'Cloud story', issuetype: { name: 'Story' }, status: { name: 'Ready for QA' }, priority: { name: 'High' }, labels,
    description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'AC-1: it works' }] }] },
    attachment: [{ id: '1', filename: 'rules.csv', mimeType: 'text/csv', size: 10, content: `${base}/secure/attachment/1/rules.csv` }],
  },
});

const server = http.createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    calls.push({ method: req.method!, url: req.url!, headers: req.headers, body });
    if (req.headers.authorization !== AUTH) { res.writeHead(401).end('{"errorMessages":["unauthorised"]}'); return; }
    const send = (status: number, json: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(json)); };
    if (req.method === 'GET' && req.url!.startsWith('/rest/api/3/issue/CLD-7')) return send(200, issue());
    if (req.method === 'GET' && req.url === '/rest/api/3/myself') return send(200, { displayName: 'QA Bot', emailAddress: EMAIL });
    if (req.method === 'GET' && req.url === '/rest/api/3/field') return send(200, [
      { id: 'summary', name: 'Summary', custom: false }, { id: 'customfield_10035', name: 'Acceptance Criteria', custom: true }, { id: 'customfield_10020', name: 'Sprint', custom: true }]);
    if (req.method === 'GET' && req.url === '/secure/attachment/1/rules.csv') { res.writeHead(302, { Location: '/files/rules.csv' }).end(); return; }
    if (req.method === 'GET' && req.url === '/files/rules.csv') { res.writeHead(200, { 'Content-Type': 'text/csv' }).end('a,b\n1,2\n'); return; }
    if (req.method === 'POST' && req.url === '/rest/api/3/issue/CLD-7/attachments') return send(200, [{ id: '99', filename: 'verdict.md', mimeType: 'text/markdown', size: body.length, content: `${base}/x` }]);
    if (req.method === 'POST' && req.url === '/rest/api/3/issue/CLD-7/comment') return send(201, { id: '555' });
    if (req.method === 'PUT' && req.url === '/rest/api/3/issue/CLD-7') {
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

describe('JiraCloudClient against a fake Jira Cloud', () => {
  it('diagnoses auth and finds the acceptance-criteria custom field', async () => {
    const d = await new JiraCloudClient(base, EMAIL, TOKEN).diagnose();
    assert.equal(d.user, 'QA Bot');
    assert.deepEqual(d.acFieldCandidates, [{ id: 'customfield_10035', name: 'Acceptance Criteria' }]);
  });
  it('reads an issue with basic auth and the requested fields', async () => {
    const c = new JiraCloudClient(base, EMAIL, TOKEN, ['customfield_10035']);
    const i = await c.getIssue('CLD-7');
    assert.equal(i.fields.summary, 'Cloud story');
    const last = calls.at(-1)!;
    assert.equal(last.headers.authorization, AUTH);
    assert.match(last.url, /fields=summary,description,.*attachment,comment,customfield_10035/);
  });
  it('downloads an attachment following the redirect', async () => {
    const c = new JiraCloudClient(base, EMAIL, TOKEN);
    const dest = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jc-')), 'rules.csv');
    await c.downloadAttachment('CLD-7', issue().fields.attachment[0], dest);
    assert.equal(fs.readFileSync(dest, 'utf8'), 'a,b\n1,2\n');
  });
  it('uploads an attachment as multipart with the XSRF bypass header', async () => {
    const c = new JiraCloudClient(base, EMAIL, TOKEN);
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jc-')), 'verdict.md');
    fs.writeFileSync(file, '# Verdict\n');
    const meta = await c.addAttachment('CLD-7', file, 'heldout-verdict-CLD-7.md');
    const last = calls.at(-1)!;
    assert.equal(meta.id, '99');
    assert.equal(last.headers['x-atlassian-token'], 'no-check');
    assert.match(String(last.headers['content-type']), /^multipart\/form-data; boundary=/);
    assert.match(last.body.toString(), /filename="heldout-verdict-CLD-7.md"/);
  });
  it('posts an ADF comment', async () => {
    const c = new JiraCloudClient(base, EMAIL, TOKEN);
    assert.equal((await c.addComment('CLD-7', doc(p('Held-out evaluation: FAIL')))).id, '555');
    assert.equal(JSON.parse(calls.at(-1)!.body.toString()).body.type, 'doc');
  });
  it('replaces prefixed labels with one update', async () => {
    labels = ['api', 'heldout-pass'];
    const c = new JiraCloudClient(base, EMAIL, TOKEN);
    const result = await c.setLabels('CLD-7', ['heldout-fail'], 'heldout-');
    assert.deepEqual(result.sort(), ['api', 'heldout-fail']);
    assert.deepEqual(labels.sort(), ['api', 'heldout-fail']);
  });
  it('fails clearly on bad credentials', async () => {
    const c = new JiraCloudClient(base, EMAIL, 'wrong');
    await assert.rejects(c.getIssue('CLD-7'), /401/);
  });
  it('jira-fetch.ts works end-to-end in JIRA_MODE=cloud', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jc-proj-'));
    fs.writeFileSync(path.join(dir, 'heldout.config.json'), JSON.stringify({
      defaultAut: 'app', auts: { app: { name: 'App', baseURL: 'http://localhost:1' } },
      jira: { mode: 'cloud', mockRoot: 'mock-jira', baseUrl: base }, evaluationsDir: 'evaluations', run: { retries: 0 },
    }));
    const script = path.resolve(import.meta.dirname, '..', 'scripts', 'jira-fetch.ts');
    const tsxLoader = pathToFileURL(createRequire(import.meta.url).resolve('tsx/esm')).href; // resolve from the project, not the temp cwd
    // Async spawn: the fake Jira server lives in this process, so a blocking spawnSync would deadlock.
    const r = await new Promise<{ status: number | null; stderr: string }>((resolve) => {
      const child = spawn(process.execPath, ['--import', tsxLoader, script, 'CLD-7'], {
        cwd: dir, env: { ...process.env, JIRA_MODE: 'cloud', JIRA_BASE_URL: base, JIRA_EMAIL: EMAIL, JIRA_API_TOKEN: TOKEN },
      });
      let stderr = '';
      child.stderr.on('data', (d) => { stderr += d; });
      child.on('close', (status) => resolve({ status, stderr }));
    });
    assert.equal(r.status, 0, r.stderr);
    const story = fs.readFileSync(path.join(dir, 'evaluations', 'CLD-7', 'requirement', 'story.md'), 'utf8');
    assert.match(story, /source: jira-cloud/);
    assert.match(story, /AC-1: it works/);
    assert.equal(fs.readFileSync(path.join(dir, 'evaluations', 'CLD-7', 'requirement', 'attachments', 'rules.csv'), 'utf8'), 'a,b\n1,2\n');
  });
});
