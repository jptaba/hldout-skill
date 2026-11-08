/**
 * No saved secret in a report (specs/014-no-secret-in-a-report): what `redact` hides, what is scrubbed, and real chains
 * against a local server, read back from the report and the log.
 */
import { spawn, spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { scrubsFromReport } from '../.github/scripts/core/probe-log';
import { redact, redactField, scrubNotes, scrubValues } from '../.github/scripts/core/redact';
import { writeZip } from '../.github/scripts/core/zip';

const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-secrets-'));
after(() => fs.rmSync(root, { recursive: true, force: true }));

/** A chain against a server that gives each call the next of `answers`, the last one over and over. */
async function runChain(answers: unknown[], steps: unknown[], extra: { headers?: Record<string, string>; status?: number } = {}) {
  const dir = fs.mkdtempSync(path.join(root, 'chain-'));
  let n = 0;
  const server = http.createServer((_req, res) => {
    const answer = answers[Math.min(n++, answers.length - 1)];
    res.writeHead(extra.status ?? 200, { 'Content-Type': 'application/json', ...extra.headers });
    res.end(JSON.stringify(answer));
  });
  await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve); });
  try {
    fs.writeFileSync(path.join(dir, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: `http://127.0.0.1:${(server.address() as AddressInfo).port}/` } } }));
    const story = path.join(dir, 'output', 'shop', 'ABC-1');
    fs.mkdirSync(path.join(story, '3-tests'), { recursive: true });
    fs.writeFileSync(path.join(story, '3-tests', 'freeze.json'), '{"frozenAt":"2026-11-04"}');
    fs.writeFileSync(path.join(dir, 'c.chain.json'), JSON.stringify({ steps }));
    const stdout = await new Promise<string>((resolve) => {
      const c = spawn(process.execPath, [TSX, DISPATCHER, 'api-probe', '--key', 'ABC-1', '--chain', 'c.chain.json'], { cwd: dir, env: { ...process.env, npm_lifecycle_event: '' } });
      let out = ''; c.stdout.on('data', (d) => { out += String(d); }); c.on('close', () => resolve(out));
    });
    const log = fs.readFileSync(path.join(story, '4-hardening', 'probes.jsonl'), 'utf8');
    const entry = JSON.parse(log) as { report: string; digest: string[]; input: { saved?: Record<string, string> } };
    return { log, stdout, entry, report: fs.readFileSync(path.join(dir, entry.report), 'utf8') };
  } finally { server.close(); }
}

const absent = (r: { report: string; log: string; stdout: string }, value: string, why: string) => {
  assert.ok(!r.report.includes(value), `${why}: in the report`);
  assert.ok(!r.log.includes(value), `${why}: in the log`);
  assert.ok(!r.stdout.includes(value), `${why}: on stdout`);
};
const TOKEN = ['a1B2', 'c3D4'].join('-').repeat(4);

describe('heldout trace', () => {
  it('shows no known secret in any form, and hides a form field by its name', () => {
    const dir = fs.mkdtempSync(path.join(root, 'trace-'));
    const secret = ['Gen3rated', '!pw*@x'].join('');
    const inForm = new URLSearchParams({ x: secret }).toString().slice(2);
    fs.writeFileSync(path.join(dir, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'http://127.0.0.1:9/' } } }));
    const story = path.join(dir, 'output', 'shop', 'ABC-1');
    fs.mkdirSync(path.join(story, '5-run'), { recursive: true });
    fs.mkdirSync(path.join(story, '3-tests'), { recursive: true });
    fs.writeFileSync(path.join(story, '3-tests', 'test-data.json'), '{"password":"${env:SHOP_PW}"}');
    const snapshot = (url: string, text: string, answer = '') => JSON.stringify({ type: 'resource-snapshot', snapshot: { request: { method: 'POST', url, postData: { text } }, response: { status: 200, content: { mimeType: 'text/plain', text: answer } } } });
    const network = [
      snapshot('http://app/login.htm', `username=ann&password=${inForm}&passenger=2&remember_token=true`),
      snapshot(`http://app/login/ann/${encodeURIComponent(secret)}?author=jo&session_token=abc123`, 'pin=1&sessionId=def456', `echo ${inForm}`),
    ].join('\n');
    const console_ = JSON.stringify({ type: 'console', messageType: 'log', text: `sent ${inForm} GET http://x/?password=unknown1` });
    const steps = [JSON.stringify({ type: 'before', callId: '1', title: `page.goto(http://app/login?token=unknown2&p=${inForm})` }),
      JSON.stringify({ type: 'after', callId: '1', error: { message: `refused ${inForm} at http://x/?token=unknown3` } })].join('\n');
    fs.writeFileSync(path.join(dir, 'trace.zip'), writeZip([{ name: '0.network', data: Buffer.from(network) }, { name: '0.trace', data: Buffer.from(console_) }, { name: 'test.trace', data: Buffer.from(steps) }]));
    fs.writeFileSync(path.join(story, '5-run', '01-eval.json'), JSON.stringify({ entries: [{ scenario: 'SCN-001', status: 'failed', evidence: { trace: 'trace.zip' } }] }));
    const heldout = (...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, ...args], { cwd: dir, encoding: 'utf8', env: { ...process.env, SHOP_PW: secret, npm_lifecycle_event: '' } });
    const r = heldout('trace', 'ABC-1', 'SCN-001', '--network', '--console', '--steps');
    assert.equal(r.status, 0, r.stderr);
    for (const form of [secret, inForm, encodeURIComponent(secret), 'abc123', 'def456', 'unknown1', 'unknown2', 'unknown3']) assert.ok(!r.stdout.includes(form), `${form} stays out`);
    assert.match(r.stdout, /username=ann&password=\*\*\*redacted\*\*\*&passenger=2&remember_token=true/);
    assert.match(r.stdout, /\/login\/ann\/\*\*\*redacted\*\*\*\?author=jo&session_token=\*\*\*redacted\*\*\*/);
    assert.match(r.stdout, /sent \*\*\*redacted\*\*\*/);
    assert.match(r.stdout, /refused \*\*\*redacted\*\*\*/);
  });

  it('leaves nothing of a value a field\'s name would cut', () => {
    const dir = fs.mkdtempSync(path.join(root, 'trace-cut-'));
    const secret = ['Ab1&cd9', '#x y!z@w*'].join('');
    fs.writeFileSync(path.join(dir, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'http://127.0.0.1:9/' } } }));
    const story = path.join(dir, 'output', 'shop', 'ABC-1');
    fs.mkdirSync(path.join(story, '5-run'), { recursive: true });
    fs.mkdirSync(path.join(story, '3-tests'), { recursive: true });
    fs.writeFileSync(path.join(story, '3-tests', 'test-data.json'), '{"password":"${env:SHOP_PW}"}');
    const call = JSON.stringify({ type: 'resource-snapshot', snapshot: { request: { method: 'POST', url: `http://app/in?password=${secret}`, postData: { text: `password=${secret}` } }, response: { status: 200, content: { mimeType: 'text/plain', text: `password=${secret}` } } } });
    fs.writeFileSync(path.join(dir, 'trace.zip'), writeZip([{ name: '0.network', data: Buffer.from(call) }]));
    fs.writeFileSync(path.join(story, '5-run', '01-eval.json'), JSON.stringify({ entries: [{ scenario: 'SCN-001', status: 'failed', evidence: { trace: 'trace.zip' } }] }));
    const r = spawnSync(process.execPath, [TSX, DISPATCHER, 'trace', 'ABC-1', 'SCN-001', '--network'], { cwd: dir, encoding: 'utf8', env: { ...process.env, SHOP_PW: secret, npm_lifecycle_event: '' } });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(!/cd9|y!z/.test(r.stdout), r.stdout);
  });

  it('heldout scrub clears what its check finds', () => {
    const dir = fs.mkdtempSync(path.join(root, 'scrub-'));
    const secret = ['Gen3rated', '!pw*@x'].join('');
    fs.writeFileSync(path.join(dir, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'http://127.0.0.1:9/' } } }));
    const story = path.join(dir, 'output', 'shop', 'ABC-1');
    fs.mkdirSync(path.join(story, '3-tests'), { recursive: true });
    fs.writeFileSync(path.join(story, '3-tests', 'test-data.json'), '{"password":"${env:SHOP_PW}"}');
    fs.writeFileSync(path.join(story, 'history.jsonl'), `${JSON.stringify({ sent: `password=${new URLSearchParams({ x: secret }).toString().slice(2)}` })}\n`);
    const heldout = (...args: string[]) => spawnSync(process.execPath, [TSX, DISPATCHER, ...args], { cwd: dir, encoding: 'utf8', env: { ...process.env, SHOP_PW: secret, npm_lifecycle_event: '' } });
    assert.equal(heldout('scrub', 'ABC-1', '--check').status, 1);
    assert.equal(heldout('scrub', 'ABC-1').status, 0);
    assert.equal(heldout('scrub', 'ABC-1', '--check').status, 0);
  });
});

describe('redact', () => {
  it('hides what holds a secret', () => {
    for (const field of ['jwt', 'auth', 'x-auth', 'oauth', 'oauth2', 'authCode', 'authKey', 'sessid', 'PHPSESSID', 'sessionid', 'JSESSIONID', 'pwd', 'bearer', 'credential', 'credentials', 'accessKey', 'access_key', 'privateKey', 'authorization', 'Authorization', 'authorisation', 'password', 'passwd', 'pass', 'user_pass', 'passcode', 'passphrase', 'passkey', 'pass1', 'passConfirm', 'passHash', 'sess', 'sesskey', 'sess_id', 'token', 'cookie', 'clientSecret']) {
      assert.deepEqual(redact({ [field]: 'x' }), { [field]: '***redacted***' }, field);
    }
  });

  it('leaves readable what only speaks of one, and any yes or no', () => {
    for (const field of ['author', 'authorId', 'authority', 'authenticated', 'isAuthenticated', 'authenticationStatus', 'authorized', 'isAuthorized', 'unauthorized', 'authorizedAmount', 'authType', 'authMethod', 'authRequired', 'authProvider', 'assessment', 'assessmentId', 'assessedValue', 'possess', 'isEssential', 'credentialType', 'credentialsValid', 'passenger', 'passengerFare', 'passport', 'passed', 'compass', 'bypass', 'auth_type', 'keyword', 'key', 'id', 'name', 'message', 'address', 'success', 'access']) {
      assert.deepEqual(redact({ [field]: 'x' }), { [field]: 'x' }, field);
    }
    assert.deepEqual(redact({ session: true, cookie: false }), { session: true, cookie: false });
  });

  it('hides a list under a secret\'s name, and what a path reads through a list', () => {
    assert.deepEqual(redact({ tokens: ['a', 'b'], ids: ['a'] }), { tokens: ['***redacted***', '***redacted***'], ids: ['a'] });
    assert.deepEqual(redactField('data.*.token', ['a', 'b']), ['***redacted***', '***redacted***']);
  });

  it('hides a field read by its path as it would inside its object', () => {
    assert.equal(redactField('data.password', 'x'), '***redacted***');
    assert.equal(redactField('jwt', 'x'), '***redacted***');
    assert.equal(redactField('data.name', 'x'), 'x');
    assert.equal(redactField('tokens.0', 'x'), '***redacted***', 'by the field\'s name, not its index');
    assert.equal(redactField('tokens.-1', 'x'), '***redacted***', 'nor one counted from the end');
    assert.equal(redactField('list.0', 'x'), 'x');
  });
});

describe('what is taken out of a report', () => {
  it('asks more than what is left out of the log', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    for (const [name, value, field] of [['apiKey', 'abc'], ['tok', 'abc', 'data.token'], ['v', 'eyJhbGciOiJIUzI1.x.y'], ['key', TOKEN], ['key', ['AKIA', 'IOSFODNN7EXAMPLE'].join('')], ['licenseKey', 'AB12-CD34-EF56-GH78'], ['sessionId', uuid], ['resetPasswordUrl', 'https://h/reset?t=abcdef123456', 'link'], ['resetToken', 'https://h/reset?k=a1b2']] as [string, string, string?][]) assert.equal(scrubsFromReport(name, value, field), true, `${name} = ${value}`);
    for (const [name, value, field] of [['author', 'Jane Doe'], ['issueKey', 'ABC-123', 'key'], ['keyword', 'red shoes'], ['fare', '100.00', 'passengerFare'], ['password', '${env:PW}'], ['authorId', uuid], ['authorUrl', 'https://h/a/1234567890abcdef'], ['passengerCreated', '2026-11-04T10:00:00Z'], ['tokenExpires', '2026-11-04']] as [string, string, string?][]) assert.equal(scrubsFromReport(name, value, field), false, `${name} = ${value}`);
  });

  it('finds a value in every form, the longest first', () => {
    const v = 'ab!c d/e-12345';
    for (const form of [v, encodeURIComponent(v), new URLSearchParams({ x: v }).toString().slice(2), new URL(`http://x/${v}`).pathname.slice(1), JSON.stringify(v).slice(1, -1)]) {
      assert.equal(scrubValues(`<${form}>`, [v]), '<***redacted***>', form);
    }
    assert.equal(scrubValues('secret-1234567-and-more', ['secret-1234567', 'secret-1234567-and-more']), '***redacted***');
    assert.equal(scrubValues('shoes 7', ['shoes', '7']), 'shoes 7', 'short or plain stays');
    assert.equal(scrubValues('<ab%2fcd%20ef-12345678>', ['ab/cd ef-12345678']), '<***redacted***>', 'hex in lower case');
    assert.equal(scrubValues('<a&amp;b-12345678>', ['a&b-12345678']), '<***redacted***>', 'in HTML');
  });

  it('rewrites no ordinary text by a part of a value', () => {
    for (const v of ['ok?abcdefghijklmnop123', 'P#ssw0rd-123', '1?abcdefgh', 'Ab?cd-1234', 'x#abcdef-123456']) {
      const ordinary = 'GET /Products/1 Price 100 "status":"ok" book Abacus x';
      assert.equal(scrubValues(ordinary, [v]), ordinary, v);
    }
  });

  it('names what it took and what it could not, and no value', () => {
    assert.deepEqual(scrubNotes({ tok: [TOKEN], sid: ['abc'] }), ['Taken out of this report wherever they appeared, as they look like secrets: tok.', 'Too short or plain to take out of this report: sid.']);
    assert.deepEqual(scrubNotes({}), []);
  });
});

describe('a chain\'s report, digest and log', () => {
  it('hold no secret in an answer, a later address, a body or a form', async () => {
    const value = 'abc!DEF 1234/ghi-567890';
    const r = await runChain([{ id: 7, code: value, sessid: 'abc' }], [
      { method: 'GET', path: 'x', save: { order: 'id', apiKey: 'code', sid: 'sessid' } },
      { method: 'GET', path: 'y/${apiKey}' },
      { method: 'POST', path: 'z', json: { value: '${apiKey}' } },
      { method: 'POST', path: 'f', form: { value: '${apiKey}' } },
    ]);
    for (const form of [value, encodeURIComponent(value), new URLSearchParams({ x: value }).toString().slice(2)]) absent(r, form, form);
    assert.deepEqual(r.entry.input.saved, { order: '7' });
    assert.match(r.report, /Not kept for --vars-from, as they look like secrets: apiKey, sid\./);
    assert.match(r.report, /Taken out of this report wherever they appeared, as they look like secrets: apiKey\./);
    assert.match(r.report, /Too short or plain to take out of this report: sid\./);
    assert.ok(r.entry.digest.some((l) => /Taken out of this report/.test(l)), 'the digest says so too');
  });

  it('hold neither of two values saved under one name', async () => {
    const first = `first-${TOKEN}`; const second = `second-${TOKEN}`;
    const r = await runChain([{ code: first }, { code: second }], [
      { method: 'GET', path: 'a', save: { apiKey: 'code' } },
      { method: 'GET', path: 'b/${apiKey}', save: { apiKey: 'code' } },
      { method: 'GET', path: 'c/${apiKey}' },
    ]);
    absent(r, first, 'the first'); absent(r, second, 'the second');
  });

  it('keep no saved value that holds a secret, under a harmless name or inside a longer one', async () => {
    const r = await runChain([{ code: TOKEN, link: `http://h/?t=${TOKEN}`, id: 1 }], [{ method: 'GET', path: 'x', save: { apiKey: 'code', v: 'code', link: 'link', order: 'id' } }]);
    absent(r, TOKEN, 'the secret');
    assert.deepEqual(r.entry.input.saved, { order: '1' });
  });

  it('hold no part of a long answer clipped by the limit, nor of a clipped request body', async () => {
    const jwt = `eyJ${'a'.repeat(600)}.b.c`;
    const r = await runChain([{ padding: 'x'.repeat(10), val: jwt }], [
      { method: 'GET', path: 'x', save: { val: 'val' } },
      { method: 'POST', path: 'y', json: { padding: 'x'.repeat(150), value: '${val}' } },
    ]);
    absent(r, 'eyJaaaa', 'a part of it');
  });

  it('hold none of a parallel step\'s answers', async () => {
    const r = await runChain([{ code: `one-${TOKEN}` }, { code: `two-${TOKEN}` }, { code: `three-${TOKEN}` }], [{ method: 'GET', path: 'x', parallel: 3, save: { apiKey: 'code' } }]);
    for (const v of [`one-${TOKEN}`, `two-${TOKEN}`, `three-${TOKEN}`]) absent(r, v, v);
  });

  it('hold no address saved under a secret\'s name, in a later step', async () => {
    const link = 'https://h/reset?token=abcdef123456';
    const r = await runChain([{ link }], [{ method: 'GET', path: 'x', save: { resetPasswordUrl: 'link' } }, { method: 'POST', path: 'y', json: { value: '${resetPasswordUrl}' } }]);
    absent(r, 'abcdef123456', 'the link');
    assert.match(r.report, /Taken out of this report wherever they appeared, as they look like secrets: resetPasswordUrl\./);
  });

  it('keep hiding the rest of an answer when a number in it is replaced', async () => {
    const other = `other-${TOKEN}`;
    const r = await runChain([{ sessionId: 1234567890123456, password: other }], [{ method: 'GET', path: 'x', save: { sessionId: 'sessionId' } }]);
    absent(r, '1234567890123456', 'the number'); absent(r, other, 'the rest');
  });

  it('hold a parallel step\'s secrets though its first answer has none, and name what they left out', async () => {
    const r = await runChain([{ error: 'taken' }, { code: `two-${TOKEN}` }], [{ method: 'GET', path: 'x', parallel: 2, save: { apiKey: 'code' } }]);
    absent(r, `two-${TOKEN}`, 'the second');
    assert.match(r.report, /Not kept for --vars-from, as they look like secrets: apiKey\./);
  });

  it('hold neither a list\'s nor an object\'s values saved under a secret\'s name', async () => {
    const r = await runChain([{ list: [{ code: `one-${TOKEN}` }], data: { inner: `two-${TOKEN}` } }], [{ method: 'GET', path: 'x', save: { apiKeys: 'list.*.code', auth: 'data' } }]);
    absent(r, `one-${TOKEN}`, 'the list'); absent(r, `two-${TOKEN}`, 'the object');
    assert.match(r.report, /Not kept for --vars-from, as they look like secrets: apiKeys, auth\./);
  });

  it('keep no saved value holding a secret in another form, and say so', async () => {
    const value = 'ab+cd/ef=1234567890xyz';
    const r = await runChain([{ code: value, link: `http://h/?t=${encodeURIComponent(value)}` }], [{ method: 'GET', path: 'x', save: { apiKey: 'code', link: 'link' } }]);
    absent(r, encodeURIComponent(value), 'in a link');
    assert.match(r.report, /Not kept for --vars-from, as they look like secrets: apiKey, link\./);
  });

  it('show what a saved token was replaced by, and no token\'s signature', async () => {
    const jwt = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from('{"sub":"7"}').toString('base64url')}.c2lnbmF0dXJlLXZhbHVl`;
    const saved = await runChain([{ token: jwt }], [{ method: 'GET', path: 'x', save: { token: 'token' }, show: ['token|jwt'] }]);
    assert.match(saved.report, /`token\|jwt` = `"\*\*\*redacted\*\*\*"`/);
    const unsaved = await runChain([{ token: jwt }], [{ method: 'GET', path: 'x', show: ['token|jwt'] }]);
    assert.ok(!unsaved.report.includes('c2lnbmF0dXJl') && !unsaved.report.includes('signature-value'), 'no signature');
    assert.match(unsaved.report, /"sub":"7"/, 'its claims are what was asked for');
  });

  it('hide a secret\'s field read by its path, by `show` and `expectBody`', async () => {
    const r = await runChain([{ jwt: TOKEN, data: { password: `pw-${TOKEN}` } }], [{ method: 'GET', path: 'x', show: ['jwt', 'data.password'], expectBody: { jwt: 'nope' } }]);
    absent(r, TOKEN, 'the field');
  });

  it('take a saved secret out of a redirect\'s address', async () => {
    const r = await runChain([{ code: TOKEN }], [{ method: 'GET', path: 'x', save: { apiKey: 'code' } }], { status: 302, headers: { Location: `/next?t=${TOKEN}` } });
    absent(r, TOKEN, 'the header');
  });

  it('leave an ordinary value that the wide check leaves out of the log, for the evidence', async () => {
    const r = await runChain([{ author: 'Jane Doe', key: 'ABC-123', title: 'by Jane Doe on ABC-123' }], [{ method: 'GET', path: 'x', save: { author: 'author', issueKey: 'key' } }]);
    assert.deepEqual(r.entry.input.saved ?? {}, {}, 'not in the log');
    assert.match(r.report, /by Jane Doe on ABC-123/, 'in the report');
    assert.match(r.report, /Not kept for --vars-from, as they look like secrets: author, issueKey\./, 'and said');
    assert.doesNotMatch(r.report, /Taken out of this report/);
  });
});

describe('inspect', () => {
  it('takes out what --save found, and keeps no saved value that holds it', () => {
    const src = fs.readFileSync(path.join(import.meta.dirname, '..', '.github', 'scripts', 'probe', 'inspect.ts'), 'utf8');
    assert.match(src, /if \(scrubsFromReport\(s\.name, String\(value\), s\.field\)\) \(savedSecrets\[s\.name\]/);
    assert.match(src, /scrubValues\(\[\.\.\.out, /);
    assert.match(src, /filter\(\(k\) => scrubValues\(saved\[k\], found\) !== saved\[k\]\)/);
    assert.match(src, /\(savedSecrets\[s\.name\] \?\?= \[\]\)\.push/);
  });
});
