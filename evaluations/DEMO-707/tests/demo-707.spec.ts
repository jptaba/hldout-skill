/**
 * Held-out acceptance tests for DEMO-707 — "Conduit — accounts, articles, comments, favourites and discovery".
 * Generated from evaluations/DEMO-707/scenarios.feature, which follows requirement-contract.json (requirement + attachments only).
 * API via `api`, web app via `page`. Users are registered through the API; articles are created and deleted through it.
 */
import { test, expect, gotoPage, checkShape, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied from DEMO-707 + api-contract.md (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, CREATED: 201, NO_CONTENT: 204, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, UNPROCESSABLE: 422 },
  TAKEN_FIELDS: ['email', 'username'],                  // AC-2
  REQUIRED_ARTICLE_FIELDS: ['title', 'description', 'body'], // AC-7
  LIMIT_ROWS: [                                         // AC-11: limit 1–100, outside → 422
    { limit: 1, accepted: true }, { limit: 100, accepted: true },
    { limit: 0, accepted: false }, { limit: 101, accepted: false },
  ],
  DISCOVERABLE_WITHIN_MS: 10_000,                       // AC-10 "moments ago" — assumption G4
  NAV: { NEW_ARTICLE: 'New Article', SIGN_IN: 'Sign in', SIGN_UP: 'Sign up' }, // AC-17, AC-19
} as const;
// @req-constants-end

// Endpoints exactly as declared in api-contract.md.
const EP = {
  users: '/api/users', login: '/api/users/login', user: '/api/user',
  articles: '/api/articles', feed: '/api/articles/feed',
  article: (slug: string) => `/api/articles/${slug}`,
  comments: (slug: string) => `/api/articles/${slug}/comments`,
  comment: (slug: string, id: number | string) => `/api/articles/${slug}/comments/${id}`,
  favorite: (slug: string) => `/api/articles/${slug}/favorite`,
  follow: (username: string) => `/api/profiles/${encodeURIComponent(username)}/follow`,
};

interface User { username: string; email: string; password: string; token: string }
interface Article { slug: string; title: string; description: string; body: string; tagList: string[]; author: { username: string }; favorited: boolean; favoritesCount: number }
interface Comment { id: number; body: string; author: { username: string } }

// ---- API mechanics --------------------------------------------------------------------------------
let seq = 0;
/** Compact unique id for usernames/titles on the shared sandbox (usernames must start with "qa"). */
const uid = () => `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 5)}${++seq}`;
const auth = (token: string) => ({ Authorization: `Token ${token}` });
const newUserInput = (data: TestData) => { const id = uid(); return { username: `qa${id}`, email: `qa${id}@example.com`, password: data.userPassword as string }; };

async function register(api: Api, data: TestData): Promise<User> {
  const input = newUserInput(data);
  const r = await api.post<{ user: { token: string } }>(EP.users, { data: { user: input } });
  expect(r.status, 'register (precondition)').toBe(REQ.STATUS.CREATED);
  expect(typeof r.body?.user?.token === 'string' && r.body.user.token.length > 0, 'register returned a token (precondition)').toBe(true);
  return { ...input, token: r.body.user.token };
}
/** Users that are not the subject of the scenario: one per role per worker. Accounts cannot be deleted (story). */
const actor = (seed: Seed, api: Api, data: TestData, role: 'writer' | 'reader' | 'other') =>
  seed.once(`conduit-${role}`, `registered ${role} (API)`, () => register(api, data));
/** A user created for this scenario only (registration/login are the subject, or a fresh identity is needed). */
const freshUser = (seed: Seed, api: Api, data: TestData, label = 'registered user') =>
  seed.create(`${label} (API; accounts cannot be deleted)`, () => register(api, data));

const articleInput = (over: Partial<Article> = {}) => {
  const id = uid();
  return { title: `Heldout ${id}`, description: `About ${id}`, body: `Body of ${id}`, tagList: ['heldout', `t${id}`], ...over };
};
async function deleteArticle(api: Api, token: string, slug: string): Promise<void> {
  const r = await api.delete(EP.article(slug), { headers: auth(token) });
  if (![REQ.STATUS.NO_CONTENT, REQ.STATUS.OK, REQ.STATUS.NOT_FOUND].includes(r.status as never)) throw new Error(`cleanup DELETE ${EP.article(slug)} → ${r.status}`);
}
/** Seed an article through POST /api/articles (documented envelope); the owner deletes it after the test. */
async function publish(seed: Seed, api: Api, writer: User, over: Partial<Article> = {}): Promise<Article> {
  return seed.create('article (API)', async () => {
    const r = await api.post<{ article: Article }>(EP.articles, { data: { article: articleInput(over) }, headers: auth(writer.token) });
    expect(r.status, 'create article (seed)').toBe(REQ.STATUS.CREATED);
    expect(typeof r.body?.article?.slug, 'article has a slug (seed)').toBe('string');
    return r.body.article;
  }, (a) => deleteArticle(api, writer.token, a.slug));
}
function trackArticle(seed: Seed, api: Api, writer: User, r: ApiResponse) {
  const slug = (r.body as { article?: { slug?: string } })?.article?.slug;
  if (r.status < 300 && slug) seed.track('article', slug, (s) => deleteArticle(api, writer.token, s));
}
async function addComment(seed: Seed, api: Api, article: Article, commenter: User): Promise<Comment> {
  return seed.create('comment (API; removed with the article)', async () => {
    const r = await api.post<{ comment: Comment }>(EP.comments(article.slug), { data: { comment: { body: `Comment ${uid()}` } }, headers: auth(commenter.token) });
    expect(r.status, 'add comment (seed)').toBe(REQ.STATUS.OK);
    expect(typeof r.body?.comment?.id, 'comment has an id (seed)').toBe('number');
    return r.body.comment;
  });
}
const slugsIn = (r: ApiResponse) => ((r.body as { articles?: Article[] })?.articles ?? []).map((a) => a.slug);
const commentIdsIn = (r: ApiResponse) => ((r.body as { comments?: Comment[] })?.comments ?? []).map((c) => c.id);
const errorFields = (r: ApiResponse) => Object.keys((r.body as { errors?: Record<string, unknown> })?.errors ?? {});

test.describe('DEMO-707 Conduit platform core', () => {
  // ---- Accounts & authentication ------------------------------------------------------------------
  test('SCN-001: Registering a new user returns the user with a token', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    const input = newUserInput(data);
    let r!: ApiResponse<{ user: Record<string, unknown> }>;
    await journey.step('When I POST a new unique username, email and password to /api/users', async () => { r = await api.post(EP.users, { data: { user: input } }); });
    await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-1] register → 201').toBe(REQ.STATUS.CREATED); });
    await journey.step("And the body's user has the username, the email and a non-empty token", async () => {
      expect(checkShape(r.body?.user, {
        username: (v) => v === input.username || `should be ${input.username}`,
        email: (v) => v === input.email || `should be ${input.email}`,
        token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string',
      }, 'user'), '[REQ AC-1] user fields').toEqual([]);
    });
  });

  REQ.TAKEN_FIELDS.forEach((field, i) => {
    test(`SCN-002.${i + 1}: Registering a taken ${field} is rejected with a field-level error`, { tag: ['@AC-2', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let existing!: User; let r!: ApiResponse;
      await journey.step('Given a registered user exists', async () => { existing = await freshUser(seed, api, data); });
      await journey.step(`When I register a new user reusing that user's ${field}`, async () => {
        r = await api.post(EP.users, { data: { user: { ...newUserInput(data), [field]: existing[field as 'email' | 'username'] } } });
      });
      await journey.step('Then the response status is 422', async () => { expect.soft(r.status, `[REQ AC-2] taken ${field} → 422`).toBe(REQ.STATUS.UNPROCESSABLE); });
      await journey.step(`And the errors object names "${field}"`, async () => { expect.soft(errorFields(r), `[REQ AC-2] errors names ${field}`).toContain(field); });
    });
  });

  test('SCN-003: Logging in with valid credentials returns a token', { tag: ['@AC-3', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let u!: User; let r!: ApiResponse<{ user: { token?: string } }>;
    await journey.step('Given a registered user exists', async () => { u = await freshUser(seed, api, data); });
    await journey.step('When I POST their email and password to /api/users/login', async () => { r = await api.post(EP.login, { data: { user: { email: u.email, password: u.password } } }); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-3] valid login → 200').toBe(REQ.STATUS.OK); });
    await journey.step("And the body's user has a non-empty token", async () => {
      expect(typeof r.body?.user?.token === 'string' && r.body.user.token.length > 0, '[REQ AC-3] login returns a token').toBe(true);
    });
  });

  test('SCN-004: A wrong password is refused with 401 and an errors object', { tag: ['@AC-3', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let u!: User; let r!: ApiResponse<{ errors?: unknown }>;
    await journey.step('Given a registered user exists', async () => { u = await freshUser(seed, api, data); });
    await journey.step('When I POST their email with a wrong password to /api/users/login', async () => { r = await api.post(EP.login, { data: { user: { email: u.email, password: `${u.password}-wrong` } } }); });
    await journey.step('Then the response status is 401', async () => { expect.soft(r.status, '[REQ AC-3] wrong password → 401').toBe(REQ.STATUS.UNAUTHORIZED); });
    await journey.step('And the body has an errors object', async () => {
      expect.soft(typeof r.body?.errors === 'object' && r.body.errors !== null, '[REQ AC-3] errors object on wrong password').toBe(true);
    });
  });

  test('SCN-005: A valid Token header is accepted', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let me!: User; let r!: ApiResponse<{ user?: { username?: string } }>;
    await journey.step('Given I am a registered user with a token', async () => { me = await actor(seed, api, data, 'reader'); });
    await journey.step('When I GET /api/user with "Authorization: Token <jwt>"', async () => { r = await api.get(EP.user, { headers: auth(me.token) }); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-4] valid token → 200').toBe(REQ.STATUS.OK); });
    await journey.step("And the body's user is me", async () => { expect(r.body?.user?.username, '[REQ AC-4] current user').toBe(me.username); });
  });

  [{ name: 'no header', headers: {} }, { name: 'an invalid token', headers: auth('not-a-valid-jwt') }].forEach((row, i) => {
    test(`SCN-006.${i + 1}: A request to an authenticated endpoint with ${row.name} is refused with 401`, { tag: ['@AC-4', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey }) => {
      let r!: ApiResponse;
      await journey.step(`When I GET /api/user with ${row.name}`, async () => { r = await api.get(EP.user, { headers: row.headers }); });
      await journey.step('Then the response status is 401', async () => { expect(r.status, `[REQ AC-4] ${row.name} → 401`).toBe(REQ.STATUS.UNAUTHORIZED); });
    });
  });

  // ---- Articles -------------------------------------------------------------------------------------
  test('SCN-007: A writer creates an article', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let writer!: User; let r!: ApiResponse<{ article?: Article }>;
    const input = articleInput();
    await journey.step('Given I am a signed-in writer', async () => { writer = await actor(seed, api, data, 'writer'); });
    await journey.step('When I POST a new article with title, description, body and two tags to /api/articles', async () => {
      // Repaired (triage 02-eval, SCRIPT_DEFECT): the draft sent the fields without the declared {"article": …} envelope.
      r = await api.post(EP.articles, { data: { article: input }, headers: auth(writer.token) });
      trackArticle(seed, api, writer, r);
    });
    await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-5] create article → 201').toBe(REQ.STATUS.CREATED); });
    await journey.step('And the article has a slug, me as the author and the tags I sent', async () => {
      expect(checkShape(r.body?.article, {
        slug: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string',
        author: (v) => (v as { username?: string })?.username === writer.username || `should be ${writer.username}`,
        tagList: (v) => (Array.isArray(v) && input.tagList.every((t) => v.includes(t))) || `should contain ${input.tagList.join(', ')}`,
      }, 'article'), '[REQ AC-5] article fields').toEqual([]);
    });
  });

  test('SCN-008: A second article with the same title gets its own slug', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let writer!: User; let first!: Article; let r!: ApiResponse<{ article?: Article }>;
    await journey.step('Given I am a signed-in writer who published an article', async () => { writer = await actor(seed, api, data, 'writer'); first = await publish(seed, api, writer); });
    await journey.step('When I POST a second article with exactly the same title', async () => {
      r = await api.post(EP.articles, { data: { article: articleInput({ title: first.title }) }, headers: auth(writer.token) });
      trackArticle(seed, api, writer, r);
    });
    await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-6] same title → 201').toBe(REQ.STATUS.CREATED); });
    await journey.step("And its slug differs from the first article's slug", async () => { expect(r.body?.article?.slug, '[REQ AC-6] distinct slug').not.toBe(first.slug); });
  });

  REQ.REQUIRED_ARTICLE_FIELDS.forEach((field, i) => {
    test(`SCN-009.${i + 1}: An article without a ${field} is rejected with 422`, { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let writer!: User; let r!: ApiResponse;
      await journey.step('Given I am a signed-in writer', async () => { writer = await actor(seed, api, data, 'writer'); });
      await journey.step(`When I POST an article without a ${field}`, async () => {
        const input: Record<string, unknown> = articleInput();
        delete input[field];
        r = await api.post(EP.articles, { data: { article: input }, headers: auth(writer.token) });
        trackArticle(seed, api, writer, r);
      });
      await journey.step('Then the response status is 422', async () => { expect.soft(r.status, `[REQ AC-7] missing ${field} → 422`).toBe(REQ.STATUS.UNPROCESSABLE); });
      await journey.step(`And the errors object names "${field}"`, async () => { expect.soft(errorFields(r), `[REQ AC-7] errors names ${field}`).toContain(field); });
    });
  });

  (['update', 'delete'] as const).forEach((action, i) => {
    test(`SCN-010.${i + 1}: Another signed-in user cannot ${action} someone else's article`, { tag: ['@AC-8', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let writer!: User; let other!: User; let article!: Article; let r!: ApiResponse;
      await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
      await journey.step('And I am a different signed-in user', async () => { other = await actor(seed, api, data, 'other'); });
      await journey.step(`When I ${action} that article`, async () => {
        r = action === 'update'
          ? await api.put(EP.article(article.slug), { data: { article: { title: `Hijacked ${uid()}` } }, headers: auth(other.token) })
          : await api.delete(EP.article(article.slug), { headers: auth(other.token) });
      });
      await journey.step('Then the response status is 403', async () => { expect.soft(r.status, `[REQ AC-8] other user ${action} → 403`).toBe(REQ.STATUS.FORBIDDEN); });
      await journey.step('And the article still exists with its original title', async () => {
        const after = await api.get<{ article?: Article }>(EP.article(article.slug));
        expect.soft(after.status, `[REQ AC-8] article still exists after refused ${action}`).toBe(REQ.STATUS.OK);
        expect.soft(after.body?.article?.title, `[REQ AC-8] title unchanged after refused ${action}`).toBe(article.title);
      });
    });
  });

  test('SCN-011: The author updates and then deletes an article', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let writer!: User; let article!: Article; let r!: ApiResponse<{ article?: Article }>;
    const newBody = `Updated body ${uid()}`;
    await journey.step('Given I am a signed-in writer who published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
    await journey.step('When I PUT a new body for the article', async () => { r = await api.put(EP.article(article.slug), { data: { article: { body: newBody } }, headers: auth(writer.token) }); });
    await journey.step('Then the response status is 200 and the article has the new body', async () => {
      expect(r.status, '[REQ AC-9] author update → 200').toBe(REQ.STATUS.OK);
      expect(r.body?.article?.body, '[REQ AC-9] changed field returned').toBe(newBody);
    });
    const slug = r.body?.article?.slug ?? article.slug;
    let del!: ApiResponse;
    await journey.step('When I DELETE the article', async () => { del = await api.delete(EP.article(slug), { headers: auth(writer.token) }); });
    await journey.step('Then the response status is 204', async () => { expect(del.status, '[REQ AC-9] author delete → 204').toBe(REQ.STATUS.NO_CONTENT); });
    await journey.step('And GET /api/articles/{slug} responds 404', async () => { expect((await api.get(EP.article(slug))).status, '[REQ AC-9] deleted article → 404').toBe(REQ.STATUS.NOT_FOUND); });
  });

  // ---- Discovery ------------------------------------------------------------------------------------
  (['another signed-in reader', 'an anonymous visitor'] as const).forEach((reader, i) => {
    test(`SCN-012.${i + 1}: ${reader} filtering by author finds an article published moments ago`, { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let writer!: User; let article!: Article; let headers: Record<string, string> = {};
      await journey.step('Given a writer published an article just now', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
      await journey.step(`When ${reader} lists articles with ?author=<the writer's username>`, async () => {
        if (reader === 'another signed-in reader') headers = auth((await actor(seed, api, data, 'reader')).token);
      });
      await journey.step('Then within 10 seconds the list contains the new article', async () => {
        await expect.poll(async () => slugsIn(await api.get(EP.articles, { params: { author: writer.username }, headers })),
          { message: `[REQ AC-10] ${reader} finds the new article by author`, timeout: REQ.DISCOVERABLE_WITHIN_MS, intervals: [1_000, 2_000] }).toContain(article.slug);
      });
    });
  });

  REQ.LIMIT_ROWS.forEach((row, i) => {
    test(`SCN-013.${i + 1}: limit=${row.limit} is ${row.accepted ? 'accepted' : 'rejected with 422'}`, { tag: ['@AC-11', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey }) => {
      let r!: ApiResponse<{ articles?: unknown[] }>;
      await journey.step(`When I GET /api/articles?limit=${row.limit}`, async () => { r = await api.get(EP.articles, { params: { limit: row.limit } }); });
      await journey.step(`Then the request is ${row.accepted ? 'accepted' : 'rejected with 422'}`, async () => {
        if (row.accepted) {
          expect(r.status, `[REQ AC-11] limit=${row.limit} accepted`).toBe(REQ.STATUS.OK);
          expect((r.body?.articles ?? []).length, `[REQ AC-11] at most ${row.limit} article(s)`).toBeLessThanOrEqual(row.limit);
        } else {
          expect(r.status, `[REQ AC-11] limit=${row.limit} → 422`).toBe(REQ.STATUS.UNPROCESSABLE);
        }
      });
    });
  });

  test('SCN-014: offset pages through the list', { tag: ['@AC-11', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey }) => {
    await journey.step('When I GET /api/articles?limit=2 and /api/articles?limit=1&offset=1', async () => { /* both calls are made together below so a concurrent insert cannot skew them */ });
    await journey.step('Then the article at offset 1 is the second article of the first page', async () => {
      await expect.poll(async () => {
        const [page, second] = [slugsIn(await api.get(EP.articles, { params: { limit: 2 } })), slugsIn(await api.get(EP.articles, { params: { limit: 1, offset: 1 } }))];
        return page.length === 2 && second.length === 1 && page[1] === second[0];
      }, { message: '[REQ AC-11] offset=1 returns the second article', timeout: 10_000 }).toBe(true);
    });
  });

  test('SCN-015: A followed author\'s new article appears in the reader\'s feed', { tag: ['@AC-12', '@type:integration', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let writer!: User; let reader!: User; let article!: Article; let r!: ApiResponse;
    await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
    await journey.step('And I am a signed-in reader who follows that writer', async () => {
      reader = await actor(seed, api, data, 'reader');
      await seed.step('reader follows the writer', async () => {
        const f = await api.post<{ profile?: { following?: boolean } }>(EP.follow(writer.username), { headers: auth(reader.token) });
        expect(f.status, 'follow (pre-step)').toBe(REQ.STATUS.OK);
        expect(f.body?.profile?.following, 'following is true (pre-step)').toBe(true);
      });
    });
    await journey.step('When I GET /api/articles/feed', async () => { r = await api.get(EP.feed, { headers: auth(reader.token) }); });
    await journey.step("Then the feed contains the writer's article", async () => { expect(slugsIn(r), '[REQ AC-12] followed author\'s article in the feed').toContain(article.slug); });
  });

  // ---- Comments & favourites ------------------------------------------------------------------------
  test('SCN-016: A signed-in reader comments on an article', { tag: ['@AC-13', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let article!: Article; let reader!: User; let r!: ApiResponse<{ comment?: Comment }>;
    const text = `Nice read ${uid()}`;
    await journey.step('Given a writer published an article', async () => { article = await publish(seed, api, await actor(seed, api, data, 'writer')); });
    await journey.step('And I am a signed-in reader', async () => { reader = await actor(seed, api, data, 'reader'); });
    await journey.step('When I POST a comment to the article', async () => { r = await api.post(EP.comments(article.slug), { data: { comment: { body: text } }, headers: auth(reader.token) }); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-13] comment → 200').toBe(REQ.STATUS.OK); });
    await journey.step('And the comment is returned with my text', async () => { expect(r.body?.comment?.body, '[REQ AC-13] comment returned').toBe(text); });
  });

  test('SCN-017: An empty comment is rejected with 422', { tag: ['@AC-13', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let article!: Article; let reader!: User; let r!: ApiResponse;
    await journey.step('Given a writer published an article', async () => { article = await publish(seed, api, await actor(seed, api, data, 'writer')); });
    await journey.step('And I am a signed-in reader', async () => { reader = await actor(seed, api, data, 'reader'); });
    await journey.step('When I POST a comment with an empty body', async () => { r = await api.post(EP.comments(article.slug), { data: { comment: { body: '' } }, headers: auth(reader.token) }); });
    await journey.step('Then the response status is 422', async () => { expect(r.status, '[REQ AC-13] empty comment → 422').toBe(REQ.STATUS.UNPROCESSABLE); });
  });

  (['the article\'s author', 'another signed-in user', 'an anonymous visitor'] as const).forEach((viewer, i) => {
    test(`SCN-018.${i + 1}: ${viewer} sees a reader's comment on the article`, { tag: ['@AC-14', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let writer!: User; let article!: Article; let comment!: Comment; let r!: ApiResponse;
      await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
      await journey.step('And a reader commented on it', async () => { comment = await addComment(seed, api, article, await actor(seed, api, data, 'reader')); });
      await journey.step(`When ${viewer} lists the article's comments`, async () => {
        const headers = viewer === 'an anonymous visitor' ? {} : auth(viewer === 'the article\'s author' ? writer.token : (await actor(seed, api, data, 'other')).token);
        r = await api.get(EP.comments(article.slug), { headers });
      });
      await journey.step("Then the list contains the reader's comment", async () => { expect(commentIdsIn(r), `[REQ AC-14] ${viewer} sees the comment`).toContain(comment.id); });
    });
  });

  test('SCN-019: Someone other than the comment\'s author cannot delete it', { tag: ['@AC-15', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let writer!: User; let reader!: User; let article!: Article; let comment!: Comment; let r!: ApiResponse;
    await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
    await journey.step('And a reader commented on it', async () => { reader = await actor(seed, api, data, 'reader'); comment = await addComment(seed, api, article, reader); });
    await journey.step("When the article's author (not the commenter) deletes the comment", async () => { r = await api.delete(EP.comment(article.slug, comment.id), { headers: auth(writer.token) }); });
    await journey.step('Then the response status is 403', async () => { expect.soft(r.status, '[REQ AC-15] non-author delete comment → 403').toBe(REQ.STATUS.FORBIDDEN); });
    await journey.step('And the comment is still listed for the commenter', async () => {
      expect.soft(commentIdsIn(await api.get(EP.comments(article.slug), { headers: auth(reader.token) })), '[REQ AC-15] comment remains').toContain(comment.id);
    });
  });

  test('SCN-020: Favouriting twice counts once; unfavouriting decrements', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let article!: Article; let reader!: User; let r!: ApiResponse<{ article?: Article }>;
    await journey.step('Given a writer published an article', async () => { article = await publish(seed, api, await actor(seed, api, data, 'writer')); });
    await journey.step('And I am a signed-in reader', async () => { reader = await actor(seed, api, data, 'reader'); });
    await journey.step('When I favourite the article', async () => { r = await api.post(EP.favorite(article.slug), { headers: auth(reader.token) }); });
    await journey.step('Then favoritesCount is 1 and favorited is true', async () => {
      expect(r.status, 'favourite call succeeded').toBe(REQ.STATUS.OK);
      expect({ favorited: r.body?.article?.favorited, favoritesCount: r.body?.article?.favoritesCount }, '[REQ AC-16] first favourite → count 1, favorited').toEqual({ favorited: true, favoritesCount: 1 });
    });
    await journey.step('When I favourite the article again', async () => { r = await api.post(EP.favorite(article.slug), { headers: auth(reader.token) }); });
    await journey.step('Then favoritesCount is still 1', async () => { expect.soft(r.body?.article?.favoritesCount, '[REQ AC-16] second favourite leaves the count unchanged').toBe(1); });
    await journey.step('When I unfavourite the article', async () => { r = await api.delete(EP.favorite(article.slug), { headers: auth(reader.token) }); });
    await journey.step('Then favoritesCount is 0', async () => { expect.soft(r.body?.article?.favoritesCount, '[REQ AC-16] unfavourite decrements to 0').toBe(0); });
  });

  // ---- Web app --------------------------------------------------------------------------------------
  test('SCN-021: A registered user signs in on the web app', { tag: ['@AC-17', '@type:functional', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let u!: User;
    await journey.step('Given a registered user exists', async () => { u = await freshUser(seed, api, data); });
    await journey.step('And I am on the Sign in page', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in with their email and password', async () => {
      await page.getByPlaceholder('Email').fill(u.email);
      await page.getByPlaceholder('Password').fill(u.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
    });
    await journey.step('Then the navigation shows their username', async () => { await expect(page.getByRole('link', { name: u.username }), '[REQ AC-17] username in the navigation').toBeVisible(); });
    await journey.step('And the navigation shows a "New Article" link', async () => { await expect(page.getByRole('link', { name: REQ.NAV.NEW_ARTICLE }), '[REQ AC-17] New Article link').toBeVisible(); });
  });

  test('SCN-022: A writer publishes an article from the editor', { tag: ['@AC-18', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let writer!: User; let slug = '';
    const input = articleInput();
    await journey.step('Given I am signed in on the web app as a registered writer', async () => {
      writer = await freshUser(seed, api, data, 'registered writer');
      await seed.step('sign in on the web app (AC-17 journey)', async () => {
        await gotoPage(page, '/login');
        await page.getByPlaceholder('Email').fill(writer.email);
        await page.getByPlaceholder('Password').fill(writer.password);
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page.getByRole('link', { name: REQ.NAV.NEW_ARTICLE })).toBeVisible();
      });
    });
    await journey.step('And I open the editor from the "New Article" link', async () => { await page.getByRole('link', { name: REQ.NAV.NEW_ARTICLE }).click(); });
    await journey.step('When I fill in a unique title, a description and a body and publish', async () => {
      await page.getByPlaceholder('Article Title').fill(input.title);
      await page.getByPlaceholder("What's this article about?").fill(input.description);
      await page.getByPlaceholder('Write your article (in markdown)').fill(input.body);
      await page.getByRole('button', { name: 'Publish Article' }).click();
      await page.waitForURL(/\/article\//); // hardened: the app navigates to /article/<slug> after publishing
      slug = decodeURIComponent(new URL(page.url()).pathname.split('/').pop() ?? '');
      seed.track('article (published in the UI)', slug, (s) => deleteArticle(api, writer.token, s));
    });
    await journey.step('Then the article page shows the title and the body', async () => {
      await expect(page.getByRole('heading', { level: 1, name: input.title }), '[REQ AC-18] title on the article page').toBeVisible();
      await expect(page.getByText(input.body), '[REQ AC-18] body on the article page').toBeVisible();
    });
    await journey.step('And GET /api/articles/{slug} returns the article with that title', async () => {
      const r = await api.get<{ article?: Article }>(EP.article(slug));
      expect(r.status, '[REQ AC-18] article available from the API').toBe(REQ.STATUS.OK);
      expect(r.body?.article?.title, '[REQ AC-18] API title matches').toBe(input.title);
    });
  });

  test('SCN-023: An anonymous visitor sees Sign in and Sign up', { tag: ['@AC-19', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am an anonymous visitor on the home page', async () => { await gotoPage(page, '/'); });
    await journey.step('Then the navigation shows a "Sign in" link', async () => { await expect(page.getByRole('link', { name: REQ.NAV.SIGN_IN }), '[REQ AC-19] Sign in link').toBeVisible(); });
    await journey.step('And the navigation shows a "Sign up" link', async () => { await expect(page.getByRole('link', { name: REQ.NAV.SIGN_UP }), '[REQ AC-19] Sign up link').toBeVisible(); });
  });
});
