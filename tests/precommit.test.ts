/**
 * The adopter's opt-in pre-commit check: `heldout precommit` refuses a staged secret value or an oversized record
 * file, and `init --git-hooks` installs the hook without replacing one the project has.
 */
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { strongSecret } from '../.github/scripts/core/redact';
import { writeZip } from '../.github/scripts/core/zip';
import { HOOK_LINE, hookScript, installGitHook } from '../.github/scripts/setup/git-hook';
import { MAX_RECORD_FILE, precommitProblems, stagedFiles } from '../.github/scripts/setup/precommit';

const DISPATCHER = path.join(import.meta.dirname, '..', '.github', 'scripts', 'heldout.ts');
const TSX = path.join(import.meta.dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
const SECRET = strongSecret(); // made here, so no secret is written in this file
const { SHOP_PASSWORD: _p, ...ENV } = process.env;
const roots: string[] = [];
after(() => { for (const r of roots) fs.rmSync(r, { recursive: true, force: true }); });

const git = (cwd: string, ...args: string[]) => spawnSync('git', args, { cwd, encoding: 'utf8' });
function repo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-precommit-'));
  roots.push(root);
  git(root, 'init', '-q');
  fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/' } } }));
  fs.writeFileSync(path.join(root, '.env'), `SHOP_PASSWORD=${SECRET}\n`);
  return root;
}
function stage(root: string, file: string, data: string | Buffer): void {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), data);
  git(root, 'add', '--', file);
}
const precommit = (cwd: string) => spawnSync(process.execPath, [TSX, DISPATCHER, 'precommit'], { cwd, encoding: 'utf8', env: { ...ENV, npm_lifecycle_event: '' } });

describe('heldout precommit', () => {
  it('passes a clean commit and refuses a staged secret value, naming the secret, never its value', () => {
    const root = repo();
    stage(root, 'notes.md', 'nothing secret here\n');
    assert.equal(precommit(root).status, 0);
    stage(root, 'journeys/fixtures/login.ts', `const pw = '${SECRET}';\n`);
    const r = precommit(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /journeys\/fixtures\/login\.ts: holds the value of SHOP_PASSWORD/);
    assert.ok(!(r.stdout + r.stderr).includes(SECRET), 'the value is never printed');
  });

  it('reads what is staged, not the working tree, and looks inside zip archives', () => {
    const root = repo();
    stage(root, 'a.txt', `password ${SECRET}\n`);
    fs.writeFileSync(path.join(root, 'a.txt'), 'cleaned but not staged\n');
    assert.equal(precommit(root).status, 1, 'the staged content still holds it');
    git(root, 'add', 'a.txt');
    assert.equal(precommit(root).status, 0);
    stage(root, 'output/shop/ABC-1/5-run/trace.zip', writeZip([{ name: 'network.txt', data: Buffer.from(`Authorization: ${SECRET}`) }]));
    assert.match(precommit(root).stderr, /trace\.zip › network\.txt: holds the value of SHOP_PASSWORD/);
  });

  it('refuses a file over 1 MB in the output folder, and nowhere else', () => {
    const big = 'x'.repeat(MAX_RECORD_FILE + 1);
    assert.deepEqual(precommitProblems([{ file: 'docs/big.txt', data: Buffer.from(big) }], []), []);
    assert.match(precommitProblems([{ file: 'output/shop/ABC-1/5-run/results.json', data: Buffer.from(big) }], [])[0], /1\.0 MB in the output folder/);
    assert.match(precommitProblems([{ file: 'runs/x.json', data: Buffer.from(big) }], [], 'runs/')[0], /output folder/, 'the configured output folder');
  });

  it('lets a value through that a story publishes in its requirement (a demo password), and only that', () => {
    const root = repo();
    stage(root, 'output/shop/ABC-1/1-requirement/story.md', `The demo password is ${SECRET}\n`);
    stage(root, 'output/shop/ABC-1/3-tests/test-data.json', JSON.stringify({ password: SECRET }));
    assert.equal(precommit(root).status, 0);
    // A decoy outside the output folder, or an untracked file in a requirement folder, publishes nothing.
    const other = repo();
    stage(other, 'src/leak.ts', `const k = '${SECRET}';\n`);
    stage(other, 'x/y/z/1-requirement/a.txt', SECRET);
    fs.mkdirSync(path.join(other, 'output/shop/K-1/1-requirement'), { recursive: true });
    fs.writeFileSync(path.join(other, 'output/shop/K-1/1-requirement/scratch.txt'), SECRET);
    assert.match(precommit(other).stderr, /src\/leak\.ts: holds the value of SHOP_PASSWORD/);
  });

  it('finds a value in a run record\'s base64 body and in an archive it can\'t open', () => {
    const root = repo();
    stage(root, 'output/shop/ABC-1/5-run/results.json', JSON.stringify({ attachments: [{ body: Buffer.from(`token ${SECRET}`).toString('base64') }] }));
    stage(root, 'output/shop/ABC-1/5-run/broken.zip', Buffer.concat([Buffer.from('PK\x03\x04garbage '), Buffer.from(SECRET)]));
    const r = precommit(root);
    assert.match(r.stderr, /results\.json \(a base64 body\): holds the value of SHOP_PASSWORD/);
    assert.match(r.stderr, /broken\.zip \(as bytes: the archive couldn't be opened\): holds the value/);
  });

  it('reads the staged files of a project in a sub-folder, with paths relative to it, and its nested output folder', () => {
    const top = repo();
    const project = path.join(top, 'qa');
    fs.mkdirSync(project);
    fs.writeFileSync(path.join(project, 'heldout.config.json'), JSON.stringify({ outputDir: 'runs/out', defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/' } } }));
    fs.writeFileSync(path.join(project, '.env'), `SHOP_PASSWORD=${SECRET}\n`);
    stage(top, 'elsewhere.txt', 'outside the project');
    stage(top, 'qa/runs/out/shop/ABC-1/1-requirement/story.md', `demo ${SECRET}`);
    stage(top, 'qa/runs/out/shop/ABC-1/5-run/big.json', 'x'.repeat(MAX_RECORD_FILE + 1));
    assert.deepEqual(stagedFiles(project).map((s) => s.file).sort(), ['runs/out/shop/ABC-1/1-requirement/story.md', 'runs/out/shop/ABC-1/5-run/big.json']);
    const r = precommit(project);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /runs\/out\/shop\/ABC-1\/5-run\/big\.json: 1\.0 MB in the output folder/);
    assert.doesNotMatch(r.stderr, /holds the value/, 'the nested output folder\'s requirement publishes the demo value');
  });

  it('reads renames, unicode names and an empty index, and skips a deleted file', () => {
    const root = repo();
    assert.deepEqual(stagedFiles(root), [], 'nothing staged');
    stage(root, 'one.txt', 'one');
    stage(root, 'two words.txt', 'two');
    stage(root, 'ünï.txt', 'three');
    assert.deepEqual(stagedFiles(root).map((s) => [s.file, s.data.toString()]), [['one.txt', 'one'], ['two words.txt', 'two'], ['ünï.txt', 'three']]);
    git(root, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'x');
    git(root, 'mv', 'one.txt', 'moved.txt');
    git(root, 'rm', '-q', 'two words.txt');
    assert.deepEqual(stagedFiles(root).map((s) => [s.file, s.data.toString()]), [['moved.txt', 'one']]);
  });

  it('reads a path that was a symbolic link and is staged as a file (a type change)', () => {
    const root = repo();
    const blob = (text: string) => spawnSync('git', ['hash-object', '-w', '--stdin'], { cwd: root, input: text, encoding: 'utf8' }).stdout.trim();
    git(root, 'update-index', '--add', '--cacheinfo', `120000,${blob('target.txt')},link.txt`);
    git(root, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'link');
    git(root, 'update-index', '--cacheinfo', `100644,${blob(`k=${SECRET}`)},link.txt`);
    assert.match(precommit(root).stderr, /link\.txt: holds the value of SHOP_PASSWORD/);
  });

  it('says which secret a requirement file publishes, by name only', () => {
    const root = repo();
    stage(root, 'output/shop/ABC-1/1-requirement/story.md', `demo ${SECRET}`);
    const r = precommit(root);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /SHOP_PASSWORD is published in output\/shop\/ABC-1\/1-requirement\/story\.md: not looked for/);
    assert.ok(!r.stdout.includes(SECRET));
  });

  it('runs without a config, and says when Vault values can\'t be checked', () => {
    const root = repo();
    fs.rmSync(path.join(root, 'heldout.config.json'));
    stage(root, 'a.txt', SECRET);
    const r = precommit(root);
    assert.equal(r.status, 1, 'the .env values are still checked');
    assert.match(r.stderr, /heldout\.config\.json not read/);
    const vault = repo();
    fs.writeFileSync(path.join(vault, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/', accounts: { existing: [{ username: 'a@shop.test', password: '${vault:secret/qa#pw}', role: 'admin', shared: true }] } } } }));
    stage(vault, 'notes.md', 'clean');
    const v = spawnSync(process.execPath, [TSX, DISPATCHER, 'precommit'], { cwd: vault, encoding: 'utf8', env: { ...ENV, VAULT_ADDR: '', npm_lifecycle_event: '' } });
    assert.equal(v.status, 0);
    assert.match(v.stderr, /Vault values not checked/);
  });

  it('waits for a Vault that doesn\'t answer at most 5 seconds, and still refuses what it should', async () => {
    const root = repo();
    fs.writeFileSync(path.join(root, 'heldout.config.json'), JSON.stringify({ defaultAut: 'shop', auts: { shop: { name: 'Shop', baseURL: 'https://shop.test/', accounts: { existing: [{ username: 'a@shop.test', password: '${vault:secret/qa#pw}', role: 'admin', shared: true }] } } } }));
    stage(root, 'a.txt', SECRET);
    // A server that accepts the connection and never answers.
    const server = net.createServer((socket) => socket.on('error', () => {})); // the child's exit resets it
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const { port } = server.address() as net.AddressInfo;
    try {
      const t0 = Date.now();
      const r = await new Promise<{ status: number | null; stderr: string }>((done) => {
        const child = spawn(process.execPath, [TSX, DISPATCHER, 'precommit'], { cwd: root, env: { ...ENV, VAULT_ADDR: `http://127.0.0.1:${port}`, VAULT_TOKEN: 'x', npm_lifecycle_event: '' } });
        let stderr = '';
        child.stderr.on('data', (d) => { stderr += d; });
        child.on('close', (status) => done({ status, stderr }));
      });
      assert.ok(Date.now() - t0 < 12_000, `took ${Date.now() - t0} ms`);
      assert.match(r.stderr, /Vault didn't answer within 5 s/);
      assert.equal(r.status, 1, 'the .env value is still refused');
      assert.match(r.stderr, /a\.txt: holds the value of SHOP_PASSWORD/, 'the whole report, though the process ends early');
    } finally { server.close(); }
  });
});

describe('init --git-hooks', () => {
  it('installs the hook once, and never replaces one the project has', () => {
    const root = repo();
    const said: string[] = [];
    const say = (mark: string, msg: string) => said.push(`${mark} ${msg}`);
    installGitHook(root, say);
    const hook = path.join(root, '.git', 'hooks', 'pre-commit');
    assert.ok(fs.readFileSync(hook, 'utf8').includes(HOOK_LINE));
    installGitHook(root, say);
    assert.match(said.at(-1)!, /^• keep/);
    fs.writeFileSync(hook, '#!/bin/sh\nmy-own-check\n');
    installGitHook(root, say);
    assert.equal(fs.readFileSync(hook, 'utf8'), '#!/bin/sh\nmy-own-check\n');
    assert.match(said.at(-1)!, /add this line to it/);
  });

  it('follows core.hooksPath inside the repository, and never writes to one outside it', () => {
    const root = repo();
    git(root, 'config', 'core.hooksPath', '.githooks');
    installGitHook(root, () => {});
    assert.ok(fs.existsSync(path.join(root, '.githooks', 'pre-commit')));
    const other = repo();
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-globalhooks-'));
    roots.push(outside);
    git(other, 'config', 'core.hooksPath', outside);
    const said: string[] = [];
    installGitHook(other, (m, s) => said.push(s));
    assert.deepEqual(fs.readdirSync(outside), []);
    assert.match(said.join('\n'), /outside this repository/);
  });

  it('goes to the project\'s folder first when the project is in a sub-folder of its repository', () => {
    const top = repo();
    fs.mkdirSync(path.join(top, 'qa'));
    installGitHook(path.join(top, 'qa'), () => {});
    assert.match(fs.readFileSync(path.join(top, '.git', 'hooks', 'pre-commit'), 'utf8'), /^cd "\$\(git rev-parse --show-toplevel\)"\/'qa' \|\| exit 1$/m);
    assert.match(hookScript(`it's $(x)`), /^cd "\$\(git rev-parse --show-toplevel\)"\/'it'\\''s \$\(x\)' \|\| exit 1$/m, 'a folder name is quoted, never run');
  });

  it('installs into the shared hooks folder from a linked worktree', () => {
    const root = repo();
    git(root, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'x');
    const wt = path.join(path.dirname(root), `${path.basename(root)}-wt`);
    roots.push(wt);
    git(root, 'worktree', 'add', '-q', wt);
    const said: string[] = [];
    installGitHook(wt, (m, s) => said.push(`${m} ${s}`));
    assert.match(said.join('\n'), /^✔ installed/m);
    assert.ok(fs.existsSync(path.join(root, '.git', 'hooks', 'pre-commit')));
  });
});
