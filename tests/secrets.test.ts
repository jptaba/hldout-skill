import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { expandSecrets, kv2Path, loadVaultSecrets, loadedVaultSecrets, vaultRefsIn, vaultSettings } from '../.github/scripts/secrets';
import { dataPrefix, validateConfig } from '../.github/scripts/config';
import { recipeFromChain, signInFromSteps } from '../.github/scripts/accounts-recipe';

/** A fake Vault: KV v2 at secret/qa/app, KV v1 at kv1/legacy, a forbidden path, and AppRole login. */
let server: http.Server;
let addr = '';
before(async () => {
  server = http.createServer((req, res) => {
    const send = (status: number, body: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.url === '/v1/auth/approle/login' && req.method === 'POST') {
      let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => {
        const { role_id: r, secret_id: s } = JSON.parse(b) as { role_id: string; secret_id: string };
        if (r === 'role' && s === 'secret') send(200, { auth: { client_token: 'approle-token' } }); else send(400, { errors: ['invalid'] });
      });
      return;
    }
    const token = req.headers['x-vault-token'];
    if (token !== 'good-token' && token !== 'approle-token') return send(403, { errors: ['permission denied'] });
    if (req.url === '/v1/secret/data/qa/app') return send(200, { data: { data: { user1: 'qa.one@example.com', password1: 'Pw-One-1234!' } } });
    if (req.url === '/v1/kv1/data/legacy') return send(404, { errors: [] });
    if (req.url === '/v1/kv1/legacy') return send(200, { data: { password: 'Legacy-Pw-99!' } });
    if (req.url?.startsWith('/v1/secret/data/locked')) return send(403, { errors: ['permission denied'] });
    return send(404, { errors: [] });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  addr = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => { server.close(); });

describe('secret references', () => {
  it('finds Vault references and maps CLI paths to KV v2 API paths', () => {
    assert.deepEqual(vaultRefsIn({ a: '${vault:secret/qa/app#password1}', b: ['${vault: secret/qa/app # user1 }', '${env:X}'] }), ['secret/qa/app#password1', 'secret/qa/app#user1']);
    assert.equal(kv2Path('secret/qa/app'), 'secret/data/qa/app');
    assert.equal(kv2Path('secret/data/qa/app'), 'secret/data/qa/app');
  });
  it('picks the token: VAULT_TOKEN, then AppRole, then the file `vault login` leaves', () => {
    assert.equal(vaultSettings({ VAULT_TOKEN: 't' }, '/nonexistent').tokenSource, 'VAULT_TOKEN');
    assert.match(vaultSettings({ VAULT_ROLE_ID: 'r', VAULT_SECRET_ID: 's' }, '/nonexistent').tokenSource ?? '', /AppRole/);
    assert.equal(vaultSettings({}, '/nonexistent').tokenSource, undefined);
  });
});

describe('reading Vault', () => {
  it('reads KV v2 and KV v1 fields with a token, and expands them', async () => {
    const problems = await loadVaultSecrets([{ u: '${vault:secret/qa/app#user1}', p: '${vault:secret/qa/app#password1}', l: '${vault:kv1/legacy#password}' }], { VAULT_ADDR: addr, VAULT_TOKEN: 'good-token' });
    assert.deepEqual(problems, []);
    assert.equal(expandSecrets('${vault:secret/qa/app#user1} / ${vault:kv1/legacy#password}'), 'qa.one@example.com / Legacy-Pw-99!');
    assert.equal(loadedVaultSecrets()['secret/qa/app#password1'], 'Pw-One-1234!');
  });
  it('logs in with AppRole', async () => {
    assert.deepEqual(await loadVaultSecrets(['${vault:secret/qa/app#password1}', '${vault:secret/qa/app#user1}'], { VAULT_ADDR: addr, VAULT_ROLE_ID: 'role', VAULT_SECRET_ID: 'secret' }), []);
  });
  it('explains what is wrong without ever printing a value', async () => {
    const env = { VAULT_ADDR: addr, VAULT_TOKEN: 'good-token' };
    const [missingField] = await loadVaultSecrets(['${vault:secret/qa/app#nope}'], env);
    assert.match(missingField, /no field "nope" \(fields: user1, password1\)/);
    assert.doesNotMatch(missingField, /Pw-One/);
    assert.match((await loadVaultSecrets(['${vault:secret/locked/x#a}'], env))[0], /permission denied/);
    assert.match((await loadVaultSecrets(['${vault:secret/other#a}'], {}))[0], /VAULT_ADDR is not set/);
    assert.match((await loadVaultSecrets(['${vault:secret/other2#a}'], { VAULT_ADDR: 'http://127.0.0.1:9' , VAULT_TOKEN: 'x' }))[0], /unreachable/);
  });
});

describe('existing accounts in the config', () => {
  const cfg = (accounts: unknown) => ({ defaultAut: 'app', auts: { app: { name: 'App', baseURL: 'https://app.test', accounts } }, jira: { mode: 'mock', mockRoot: 'mock-jira' }, evaluationsDir: 'evaluations', run: {} });
  it('accepts passwords as .env or Vault references', () => {
    assert.deepEqual(validateConfig(cfg({ existing: [{ username: 'qa1', password: '${env:APP_PW_1}' }, { username: '${vault:secret/qa#u2}', password: '${vault:secret/qa#p2}' }] })), []);
  });
  it('refuses a password written into the committed config', () => {
    assert.match(validateConfig(cfg({ existing: [{ username: 'qa1', password: 'hunter2!' }] })).join(' '), /never the password itself/);
  });
  it('needs create or existing', () => {
    assert.match(validateConfig(cfg({ token: { method: 'POST', path: '/login', token: 'token' } })).join(' '), /needs "create".*or "existing"/);
  });
});

describe('the data prefix of the names tests make', () => {
  it('is "hldout" unless the profile sets another, and must suit names (a letter first, at most 16 characters)', () => {
    assert.equal(dataPrefix({}), 'hldout');
    assert.equal(dataPrefix({ dataPrefix: 'qa' }), 'qa');
    const cfg = (dataPrefix: string) => ({ defaultAut: 'app', auts: { app: { name: 'App', baseURL: 'https://app.test', dataPrefix } }, jira: { mode: 'mock', mockRoot: 'mock-jira' }, evaluationsDir: 'evaluations', run: {} });
    assert.deepEqual(validateConfig(cfg('team.qa')), []);
    assert.match(validateConfig(cfg('1st prefix')).join(' '), /dataPrefix must start with a letter/);
  });
});

describe('an api-probe chain that signs in as an existing account', () => {
  it('takes a step saving "id" after the sign-in as the account-id lookup', () => {
    const r = recipeFromChain({ steps: [
      { method: 'POST', path: 'api/token', json: { userName: 'qa1', password: '${env:APP_PW}' }, save: { token: 'token' } },
      { method: 'POST', path: 'api/login', json: { userName: 'qa1', password: '${env:APP_PW}' }, save: { id: 'userId' } },
    ] });
    assert.deepEqual(r.existing, [{ username: 'qa1', password: '${env:APP_PW}' }]);
    assert.deepEqual(r.lookup, { method: 'POST', path: '/api/login', body: { userName: '${username}', password: '${password}' }, id: 'userId' });
    assert.equal(r.create, undefined);
  });
  it('becomes the sign-in recipe plus that account', () => {
    const r = recipeFromChain({ steps: [
      { method: 'POST', path: 'api/login', json: { userName: '${env:APP_USER}', password: '${vault:secret/qa/app#password1}' }, save: { token: 'token', id: 'userId' } },
      { method: 'GET', path: 'api/users/${id}', headers: { Authorization: 'Bearer ${token}' } },
    ] });
    assert.deepEqual(r, {
      existing: [{ username: '${env:APP_USER}', password: '${vault:secret/qa/app#password1}' }],
      token: { method: 'POST', path: '/api/login', body: { userName: '${username}', password: '${password}' }, token: 'token', id: 'userId' },
      authHeader: 'Authorization: Bearer ${token}',
    });
  });
});

describe('a UI sign-in inspected as an account whose user name is in Vault too', () => {
  const steps = [
    { do: 'fill', target: "getByRole('textbox', { name: 'UserName' })", value: '${vault:secret/qa/app#user3}' },
    { do: 'fill', target: "getByRole('textbox', { name: 'Password' })", value: '${vault:secret/qa/app#password3}' },
    { do: 'click', target: "getByRole('button', { name: 'Login' })" },
  ];
  const values = (r: ReturnType<typeof signInFromSteps>) => r.steps.map((s) => ('value' in s ? s.value : undefined));
  it('fills the user name and the password, by the existing account that names them', () => {
    const r = signInFromSteps({ path: '/login', steps }, [{ username: '${vault:secret/qa/app#user3}', password: '${vault:secret/qa/app#password3}' }]);
    assert.deepEqual(values(r), ['${username}', '${password}', undefined]);
  });
  it('and by the field it fills when no account names them', () => {
    assert.deepEqual(values(signInFromSteps({ path: '/login', steps })), ['${username}', '${password}', undefined]);
  });
  it('takes steps in the recipe\'s own shape too, and refuses steps it cannot read', () => {
    const own = [{ fill: "getByLabel('Email')", value: '${username}' }, { fill: "getByLabel('Password')", value: '${password}' }, { click: "getByRole('button', { name: 'Login' })" }];
    assert.deepEqual(signInFromSteps({ path: '/login', steps: own as never }).steps, own);
    assert.throws(() => signInFromSteps({ path: '/login', steps: [{ type: 'fill', selector: '#email' }] as never }), /no fill or click step/);
  });
});

describe('an application whose accounts can be created but not deleted', () => {
  it('is not sent a check account by doctor unless asked (it would stay behind)', async () => {
    const { checkAccountRecipe } = await import('../.github/scripts/accounts-recipe');
    const steps = await checkAccountRecipe({ password: '${env:X}', create: { method: 'POST', path: '/users', id: 'id' } }, 'http://127.0.0.1:9');
    assert.equal(steps.length, 1);
    assert.equal(steps[0].ok, true);
    assert.match(steps[0].detail, /not run: the application offers no delete/);
  });
});

describe('a sign-up that answers with a token', () => {
  it('is the create step (not a sign-in), and its token is used; the login step refreshes it', () => {
    const r = recipeFromChain({ steps: [
      { method: 'POST', path: 'users', json: { firstName: 'QA', email: 'hldout-${uid}@example.com', password: '${env:PW}' }, save: { id: 'user._id', token: 'token' } },
      { method: 'POST', path: 'users/login', json: { email: 'hldout-${uid}@example.com', password: '${env:PW}' }, save: { token: 'token' } },
      { method: 'DELETE', path: 'users/me', headers: { Authorization: 'Bearer ${token}' }, expect: 200 },
    ] } as never);
    assert.equal(r.existing, undefined);
    assert.deepEqual(r.create, { method: 'POST', path: '/users', body: { firstName: 'QA', email: '${username}', password: '${password}' }, id: 'user._id', token: 'token' });
    assert.equal(r.username, 'hldout-${uid}@example.com');
    assert.deepEqual(r.token, { method: 'POST', path: '/users/login', body: { email: '${username}', password: '${password}' }, token: 'token' });
    assert.deepEqual(r.delete, { method: 'DELETE', path: '/users/me' });
  });
});

describe('the account delete in a chain', () => {
  it('is the DELETE on the account (its id or /me), not one that removes other test data', () => {
    const r = recipeFromChain({ steps: [
      { method: 'POST', path: 'users/register', json: { email: 'hldout-${uid}@example.com', password: '${env:PW}' }, save: { id: 'id' } },
      { method: 'POST', path: 'users/login', json: { email: 'hldout-${uid}@example.com', password: '${env:PW}' }, save: { token: 'access_token' } },
      { method: 'DELETE', path: 'favorites/${fid}', headers: { Authorization: 'Bearer ${token}' } },
      { method: 'DELETE', path: 'users/${id}', headers: { Authorization: 'Bearer ${token}' }, expect: 200 },
    ] } as never);
    assert.deepEqual(r.delete, { method: 'DELETE', path: '/users/${id}' });
  });
  it('is not taken from a step that only probes whether deleting is allowed (no 2xx "expect")', () => {
    const r = recipeFromChain({ steps: [
      { method: 'POST', path: 'users/register', json: { email: 'hldout-${uid}@example.com', password: '${env:PW}' }, save: { id: 'id' } },
      { method: 'POST', path: 'users/login', json: { email: 'hldout-${uid}@example.com', password: '${env:PW}' }, save: { token: 'access_token' } },
      { name: 'delete the user (permission?)', method: 'DELETE', path: 'users/${id}', headers: { Authorization: 'Bearer ${token}' } },
    ] } as never);
    assert.equal(r.delete, undefined);
  });
});

describe('a sign-up that needs a value from an earlier call', () => {
  const chain = { steps: [
    { method: 'GET', path: 'api/SecurityQuestions', save: { qid: 'data.0.id', unused: 'data.1.id' } },
    { method: 'POST', path: 'api/Users', json: { email: 'hldout-${uid}@example.com', password: '${env:PW}', securityQuestion: { id: '${qid}' } }, save: { id: 'data.id' } },
    { method: 'POST', path: 'rest/user/login', json: { email: 'hldout-${uid}@example.com', password: '${env:PW}' }, save: { token: 'authentication.token' } },
  ] };
  it('keeps that call as a "before" step, saving only what the account calls use', () => {
    const r = recipeFromChain(chain as never);
    assert.deepEqual(r.before, [{ method: 'GET', path: '/api/SecurityQuestions', save: { qid: 'data.0.id' } }]);
    assert.deepEqual(r.create?.body, { email: '${username}', password: '${password}', securityQuestion: { id: '${qid}' } });
  });
  it('refuses a chain whose account calls use a value no earlier step saves', () => {
    assert.throws(() => recipeFromChain({ steps: chain.steps.slice(1) } as never), /use \$\{qid\}, which no earlier step of the chain saves/);
  });
  it('runs it live and sends the saved number as a number', async () => {
    const { checkAccountRecipe } = await import('../.github/scripts/accounts-recipe');
    let sent: unknown;
    const app = http.createServer((req, res) => {
      let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => {
        const json = (status: number, body: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
        if (req.url === '/api/SecurityQuestions') return json(200, { data: [{ id: 3 }] });
        if (req.url === '/api/Users') { sent = JSON.parse(b).securityQuestion; return json(201, { data: { id: 7 } }); }
        if (req.url === '/rest/user/login') return json(200, { authentication: { token: 'jwt', bid: 4 } });
        json(404, {});
      });
    });
    await new Promise<void>((r) => app.listen(0, '127.0.0.1', () => r()));
    try {
      process.env.PW_BEFORE_TEST = 'Pw-Before-1234';
      const r = recipeFromChain({ steps: chain.steps.map((s) => ({ ...s, json: s.json && JSON.parse(JSON.stringify(s.json).replace('${env:PW}', '${env:PW_BEFORE_TEST}')) })) } as never);
      const steps = await checkAccountRecipe(r, `http://127.0.0.1:${(app.address() as AddressInfo).port}`, { createUndeletable: true });
      assert.deepEqual(steps.map((s) => s.ok), [true, true, true, true]);
      assert.match(steps[0].step, /^before GET \/api\/SecurityQuestions/);
      assert.deepEqual(sent, { id: 3 });
    } finally { app.close(); delete process.env.PW_BEFORE_TEST; }
  });
});
