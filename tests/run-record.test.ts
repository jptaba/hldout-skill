/**
 * A run's record: the digest of Playwright's raw results that every later step reads instead of the raw output.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { HeldoutConfig } from '../.github/scripts/core/profile';
import { digestRun } from '../.github/scripts/run/record';
import { readRunRecord, writeRunRecord, type RunRecord } from '../.github/scripts/run/run-record';

const SPEC = `import { test } from '../../../../heldout-support/fixtures';
test('SCN-001: a product is listed', { tag: ['@AC-1', '@type:functional', '@layer:api'] }, async () => {});
test('SCN-002: an unknown product is refused', { tag: ['@AC-2', '@type:negative', '@layer:api'] }, async () => {});
`;

const exchange = (status: number, body: unknown) => JSON.stringify({ request: { method: 'GET', url: 'https://shop.test/api/products/999' }, response: { status, body } });
const attachment = (name: string, body: string) => ({ name, contentType: 'application/json', body: Buffer.from(body).toString('base64') });

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-record-'));
  const cfg = {
    outputDir: path.join(root, 'output'), journeysDir: path.join(root, 'journeys'), autId: 'shop', defaultAut: 'shop',
    auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/', apiBaseURL: 'https://shop.test/api/' } },
    aut: { name: 'Shop', baseURL: 'https://shop.test/', apiBaseURL: 'https://shop.test/api/' },
    jira: { mode: 'mock', mockRoot: 'mock-jira' }, run: { retries: 0 },
  } as unknown as HeldoutConfig;
  // What runs is the hardener's copy of the draft.
  const tests = path.join(root, 'output', 'shop', 'ABC-1', '4-hardening');
  fs.mkdirSync(tests, { recursive: true });
  fs.writeFileSync(path.join(tests, 'abc-1.spec.ts'), SPEC);
  const big = { data: Array.from({ length: 2000 }, (_, i) => ({ id: i, name: `product ${i}` })) };
  const results = {
    suites: [{ title: 'abc-1.spec.ts', file: 'abc-1.spec.ts', specs: [
      { title: 'SCN-001: a product is listed', file: 'abc-1.spec.ts', tags: ['AC-1', 'type:functional', 'layer:api'], tests: [{ status: 'expected', results: [{ status: 'passed', retry: 0, attachments: [] }] }] },
      { title: 'SCN-002: an unknown product is refused', file: 'abc-1.spec.ts', tags: ['AC-2', 'type:negative', 'layer:api'], tests: [{ status: 'unexpected', results: [{
        status: 'failed', retry: 0,
        errors: [{ message: "Error: [REQ AC-2] an unknown product is refused\n\nexpect(received).toBe(expected)\n\nExpected: 404\nReceived: 200" }],
        attachments: [attachment('api-exchange 01 GET /api/products/999 → 200', exchange(200, big))],
      }] }] },
    ] }],
  };
  const resultsFile = path.join(root, 'results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results));
  return { cfg, resultsFile };
}

describe('the record of a run', () => {
  it('keeps one line for a test that passed, and the evidence and an automatic class for one that failed', () => {
    const { cfg, resultsFile } = project();
    const r = digestRun(cfg, 'ABC-1', '02-eval', resultsFile, []);
    assert.deepEqual(r.summary, { total: 2, passed: 1, failed: 1, flaky: 0, skipped: 0 });
    const [passed, failed] = r.entries;
    assert.equal(passed.status, 'passed');
    assert.deepEqual(passed.evidence, { attempts: 1 });
    assert.equal(passed.auto, undefined);
    assert.equal(failed.status, 'failed');
    assert.deepEqual(failed.requirementRefs, ['AC-2']);
    assert.equal(failed.error?.expected, '404');
    assert.ok(failed.auto?.category, 'classified');
    assert.equal(failed.evidence.api?.response.status, 200);
  });

  it('keeps the start of a long answer, marked as cut, after the classification has read all of it', () => {
    const { cfg, resultsFile } = project();
    const failed = digestRun(cfg, 'ABC-1', '02-eval', resultsFile, []).entries[1];
    const body = failed.evidence.api?.response.body as string;
    assert.equal(typeof body, 'string');
    assert.match(body, /… \[\d+ more characters, cut in the run record\]$/);
    assert.ok(body.length < 8200);
    assert.ok((failed.evidence.apiSequence?.[0].response.body as string).length < 8200, 'the sequence keeps the same start of it');
    assert.ok(fs.statSync(resultsFile).size > 50_000, 'while the raw answer was long');
  });

  it('keeps the triager\'s decisions in the triage phase\'s file, the run record as the run wrote it', () => {
    const { cfg, resultsFile } = project();
    const story = path.join(cfg.outputDir, 'shop', 'ABC-1');
    const file = path.join(story, '5-run', '02-eval.json');
    const report = digestRun(cfg, 'ABC-1', '02-eval', resultsFile, []);
    const record = { ...report, meta: {} } as unknown as RunRecord;
    writeRunRecord(file, record);
    assert.ok(!fs.existsSync(path.join(story, '6-triage', 'decisions.json')), 'no decision, no file');
    const final = { category: 'APPLICATION_DEFECT' as const, rationale: 'reproduced (P3)', confirmedAt: 'now' };
    writeRunRecord(file, { ...record, entries: record.entries.map((e) => (e.scenario === 'SCN-002' ? { ...e, final } : e)) });
    assert.ok(!fs.readFileSync(file, 'utf8').includes('"final"'), 'the run record holds no decision');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(story, '6-triage', 'decisions.json'), 'utf8')), { '02-eval': { 'SCN-002': final } });
    assert.deepEqual(readRunRecord(file).entries.map((e) => e.final), [undefined, final], 'read back with the record');
    // Compact, and the exchange a failure is about kept once (by its place among its calls), whole when read.
    const onDisk = fs.readFileSync(file, 'utf8');
    assert.ok(onDisk.split('\n').length > 10 && /\n "entries": \[/.test(onDisk), 'a field per line, indented by one');
    const stored = JSON.parse(onDisk).entries[1].evidence;
    assert.equal(stored.api, undefined);
    assert.equal(typeof stored.apiRelevantIndex, 'number');
    assert.deepEqual(readRunRecord(file).entries[1].evidence.api, report.entries[1].evidence.api);
  });
});
