// Live reproduction of the 02-eval failures (DEMO-707), independent of the test code.
// Usage: node evaluations/DEMO-707/runs/02-eval/confirm/confirm-live.mjs   (reads CONDUIT_USER_PASSWORD from .env)
// Writes one markdown file per finding next to this script. Tokens and passwords are redacted.
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://conduit-api.bondaracademy.com';
const OUT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const PW = (fs.readFileSync('.env', 'utf8').match(/^CONDUIT_USER_PASSWORD=(.*)$/m) ?? [])[1];
if (!PW) throw new Error('CONDUIT_USER_PASSWORD missing in .env');
const id = () => Date.now().toString(36).slice(-6) + Math.random().toString(36).slice(2, 5);
let log = [];
async function call(method, p, { token, body } = {}) {
  const headers = { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Token ${token}` } : {}) };
  const res = await fetch(API + p, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  const safe = JSON.stringify(json, (k, v) => (/token|password/i.test(k) ? '***' : v));
  log.push(`- \`${method} ${p}\`${token ? ' (Token …)' : ''}${body !== undefined ? ` body \`${JSON.stringify(body, (k, v) => (/password/i.test(k) ? '***' : v)).slice(0, 160)}\`` : ''} → **${res.status}** \`${safe.slice(0, 220)}\``);
  return { status: res.status, body: json };
}
const user = async () => { const u = `qa${id()}`; const r = await call('POST', '/api/users', { body: { user: { username: u, email: `${u}@example.com`, password: PW } } }); return { username: u, email: `${u}@example.com`, token: r.body.user.token }; };
const article = async (w, over = {}) => (await call('POST', '/api/articles', { token: w.token, body: { article: { title: `Confirm ${id()}`, description: 'd', body: 'b', tagList: ['heldout'], ...over } } })).body.article;
function save(name, title, verdict) {
  fs.writeFileSync(path.join(OUT, `${name}.md`), [`# ${name}: ${title}`, '', `Reproduced live ${new Date().toISOString()} against ${API}.`, '', ...log, '', `**Conclusion:** ${verdict}`, ''].join('\n'));
  console.log(`${name}: ${verdict}`); log = [];
}

const w = await user(); const r1 = await user(); const r2 = await user();
log = []; // user setup is not evidence

// SCN-004 — wrong password
await call('POST', '/api/users/login', { body: { user: { email: w.email, password: `${PW}-wrong` } } });
save('SCN-004', 'wrong password', 'the API answers 403 with an errors object; the requirement says 401 → APPLICATION_DEFECT (AC-3)');

// SCN-007 — create article: envelope as the test sent it vs as the contract declares it
await call('POST', '/api/articles', { token: w.token, body: { title: `Confirm ${id()}`, description: 'd', body: 'b', tagList: ['x'] } });
const ok = (await call('POST', '/api/articles', { token: w.token, body: { article: { title: `Confirm ${id()}`, description: 'd', body: 'b', tagList: ['x', 'y'] } } })).body.article;
await call('DELETE', `/api/articles/${ok.slug}`, { token: w.token });
save('SCN-007', 'create article', 'without the {"article": …} envelope the API crashes with 500; with the declared envelope it answers 201 with slug, author and tags → SCRIPT_DEFECT (the test omitted the envelope). Observation outside the ACs: malformed input gives 500 instead of a 4xx.');

// SCN-008 — same title twice
const a1 = await article(w);
await call('POST', '/api/articles', { token: w.token, body: { article: { title: a1.title, description: 'd2', body: 'b2', tagList: [] } } });
await call('DELETE', `/api/articles/${a1.slug}`, { token: w.token });
save('SCN-008', 'same title twice', 'the second article with the same title is rejected with 422 {"errors":{"title":["must be unique"]}}; the requirement says titles need not be unique → APPLICATION_DEFECT (AC-6)');

// SCN-012 — author filter as author / other reader / anonymous
const a2 = await article(w);
await new Promise((r) => setTimeout(r, 3000));
await call('GET', `/api/articles?author=${w.username}`, { token: w.token });
await call('GET', `/api/articles?author=${w.username}`, { token: r1.token });
await call('GET', `/api/articles?author=${w.username}`);
await new Promise((r) => setTimeout(r, 10000));
await call('GET', `/api/articles?author=${w.username}`, { token: r1.token });
await call('DELETE', `/api/articles/${a2.slug}`, { token: w.token });
save('SCN-012', 'filter by author', "the author sees the article; another signed-in reader and an anonymous visitor get an empty list, still after 13 s → APPLICATION_DEFECT (AC-10; not a timing issue, so it doesn't depend on assumption G4)");

// SCN-013 — limit boundaries
for (const l of [0, 101, 1, 100]) await call('GET', `/api/articles?limit=${l}`);
save('SCN-013', 'limit outside 1–100', 'limit=0 and limit=101 are answered 200 (accepted) instead of 422; limit=1 and 100 are accepted → APPLICATION_DEFECT (AC-11)');

// SCN-018 / SCN-019 — comment visibility and deleting someone else's comment
const a3 = await article(w);
const c = (await call('POST', `/api/articles/${a3.slug}/comments`, { token: r1.token, body: { comment: { body: 'confirm comment' } } })).body.comment;
await call('GET', `/api/articles/${a3.slug}/comments`, { token: r1.token });
await call('GET', `/api/articles/${a3.slug}/comments`, { token: w.token });
await call('GET', `/api/articles/${a3.slug}/comments`, { token: r2.token });
await call('GET', `/api/articles/${a3.slug}/comments`);
save('SCN-018', 'comment visibility', 'only the commenter sees the comment; the article author, another user and an anonymous visitor get [] → APPLICATION_DEFECT (AC-14)');
await call('DELETE', `/api/articles/${a3.slug}/comments/${c.id}`, { token: w.token });
await call('GET', `/api/articles/${a3.slug}/comments`, { token: r1.token });
await call('DELETE', `/api/articles/${a3.slug}`, { token: w.token });
save('SCN-019', "deleting someone else's comment", 'the article author (not the commenter) gets 404 instead of 403; the comment remains → APPLICATION_DEFECT (AC-15: wrong status; the "comment remains" half holds)');

// SCN-020 — favourite twice
const a4 = await article(w);
await call('POST', `/api/articles/${a4.slug}/favorite`, { token: r1.token });
await call('POST', `/api/articles/${a4.slug}/favorite`, { token: r1.token });
await call('DELETE', `/api/articles/${a4.slug}/favorite`, { token: r1.token });
await call('DELETE', `/api/articles/${a4.slug}`, { token: w.token });
save('SCN-020', 'favourite twice', 'the second favourite raises favoritesCount from 1 to 2 and unfavourite leaves 1 → APPLICATION_DEFECT (AC-16 idempotency)');
