# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-707\tests\demo-707.spec.ts >> DEMO-707 Conduit platform core >> SCN-008: A second article with the same title gets its own slug
- Location: evaluations\DEMO-707\tests\demo-707.spec.ts:174:3

# Error details

```
Error: [REQ AC-6] same title → 201

expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 422
```

# Test source

```ts
  81  |     const r = await api.post<{ comment: Comment }>(EP.comments(article.slug), { data: { comment: { body: `Comment ${uid()}` } }, headers: auth(commenter.token) });
  82  |     expect(r.status, 'add comment (seed)').toBe(REQ.STATUS.OK);
  83  |     expect(typeof r.body?.comment?.id, 'comment has an id (seed)').toBe('number');
  84  |     return r.body.comment;
  85  |   });
  86  | }
  87  | const slugsIn = (r: ApiResponse) => ((r.body as { articles?: Article[] })?.articles ?? []).map((a) => a.slug);
  88  | const commentIdsIn = (r: ApiResponse) => ((r.body as { comments?: Comment[] })?.comments ?? []).map((c) => c.id);
  89  | const errorFields = (r: ApiResponse) => Object.keys((r.body as { errors?: Record<string, unknown> })?.errors ?? {});
  90  | 
  91  | test.describe('DEMO-707 Conduit platform core', () => {
  92  |   // ---- Accounts & authentication ------------------------------------------------------------------
  93  |   test('SCN-001: Registering a new user returns the user with a token', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  94  |     const input = newUserInput(data);
  95  |     let r!: ApiResponse<{ user: Record<string, unknown> }>;
  96  |     await journey.step('When I POST a new unique username, email and password to /api/users', async () => { r = await api.post(EP.users, { data: { user: input } }); });
  97  |     await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-1] register → 201').toBe(REQ.STATUS.CREATED); });
  98  |     await journey.step("And the body's user has the username, the email and a non-empty token", async () => {
  99  |       expect(checkShape(r.body?.user, {
  100 |         username: (v) => v === input.username || `should be ${input.username}`,
  101 |         email: (v) => v === input.email || `should be ${input.email}`,
  102 |         token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string',
  103 |       }, 'user'), '[REQ AC-1] user fields').toEqual([]);
  104 |     });
  105 |   });
  106 | 
  107 |   REQ.TAKEN_FIELDS.forEach((field, i) => {
  108 |     test(`SCN-002.${i + 1}: Registering a taken ${field} is rejected with a field-level error`, { tag: ['@AC-2', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  109 |       let existing!: User; let r!: ApiResponse;
  110 |       await journey.step('Given a registered user exists', async () => { existing = await freshUser(seed, api, data); });
  111 |       await journey.step(`When I register a new user reusing that user's ${field}`, async () => {
  112 |         r = await api.post(EP.users, { data: { user: { ...newUserInput(data), [field]: existing[field as 'email' | 'username'] } } });
  113 |       });
  114 |       await journey.step('Then the response status is 422', async () => { expect.soft(r.status, `[REQ AC-2] taken ${field} → 422`).toBe(REQ.STATUS.UNPROCESSABLE); });
  115 |       await journey.step(`And the errors object names "${field}"`, async () => { expect.soft(errorFields(r), `[REQ AC-2] errors names ${field}`).toContain(field); });
  116 |     });
  117 |   });
  118 | 
  119 |   test('SCN-003: Logging in with valid credentials returns a token', { tag: ['@AC-3', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  120 |     let u!: User; let r!: ApiResponse<{ user: { token?: string } }>;
  121 |     await journey.step('Given a registered user exists', async () => { u = await freshUser(seed, api, data); });
  122 |     await journey.step('When I POST their email and password to /api/users/login', async () => { r = await api.post(EP.login, { data: { user: { email: u.email, password: u.password } } }); });
  123 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-3] valid login → 200').toBe(REQ.STATUS.OK); });
  124 |     await journey.step("And the body's user has a non-empty token", async () => {
  125 |       expect(typeof r.body?.user?.token === 'string' && r.body.user.token.length > 0, '[REQ AC-3] login returns a token').toBe(true);
  126 |     });
  127 |   });
  128 | 
  129 |   test('SCN-004: A wrong password is refused with 401 and an errors object', { tag: ['@AC-3', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  130 |     let u!: User; let r!: ApiResponse<{ errors?: unknown }>;
  131 |     await journey.step('Given a registered user exists', async () => { u = await freshUser(seed, api, data); });
  132 |     await journey.step('When I POST their email with a wrong password to /api/users/login', async () => { r = await api.post(EP.login, { data: { user: { email: u.email, password: `${u.password}-wrong` } } }); });
  133 |     await journey.step('Then the response status is 401', async () => { expect.soft(r.status, '[REQ AC-3] wrong password → 401').toBe(REQ.STATUS.UNAUTHORIZED); });
  134 |     await journey.step('And the body has an errors object', async () => {
  135 |       expect.soft(typeof r.body?.errors === 'object' && r.body.errors !== null, '[REQ AC-3] errors object on wrong password').toBe(true);
  136 |     });
  137 |   });
  138 | 
  139 |   test('SCN-005: A valid Token header is accepted', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  140 |     let me!: User; let r!: ApiResponse<{ user?: { username?: string } }>;
  141 |     await journey.step('Given I am a registered user with a token', async () => { me = await actor(seed, api, data, 'reader'); });
  142 |     await journey.step('When I GET /api/user with "Authorization: Token <jwt>"', async () => { r = await api.get(EP.user, { headers: auth(me.token) }); });
  143 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-4] valid token → 200').toBe(REQ.STATUS.OK); });
  144 |     await journey.step("And the body's user is me", async () => { expect(r.body?.user?.username, '[REQ AC-4] current user').toBe(me.username); });
  145 |   });
  146 | 
  147 |   [{ name: 'no header', headers: {} }, { name: 'an invalid token', headers: auth('not-a-valid-jwt') }].forEach((row, i) => {
  148 |     test(`SCN-006.${i + 1}: A request to an authenticated endpoint with ${row.name} is refused with 401`, { tag: ['@AC-4', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  149 |       let r!: ApiResponse;
  150 |       await journey.step(`When I GET /api/user with ${row.name}`, async () => { r = await api.get(EP.user, { headers: row.headers }); });
  151 |       await journey.step('Then the response status is 401', async () => { expect(r.status, `[REQ AC-4] ${row.name} → 401`).toBe(REQ.STATUS.UNAUTHORIZED); });
  152 |     });
  153 |   });
  154 | 
  155 |   // ---- Articles -------------------------------------------------------------------------------------
  156 |   test('SCN-007: A writer creates an article', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  157 |     let writer!: User; let r!: ApiResponse<{ article?: Article }>;
  158 |     const input = articleInput();
  159 |     await journey.step('Given I am a signed-in writer', async () => { writer = await actor(seed, api, data, 'writer'); });
  160 |     await journey.step('When I POST a new article with title, description, body and two tags to /api/articles', async () => {
  161 |       r = await api.post(EP.articles, { data: input, headers: auth(writer.token) });
  162 |       trackArticle(seed, api, writer, r);
  163 |     });
  164 |     await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-5] create article → 201').toBe(REQ.STATUS.CREATED); });
  165 |     await journey.step('And the article has a slug, me as the author and the tags I sent', async () => {
  166 |       expect(checkShape(r.body?.article, {
  167 |         slug: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string',
  168 |         author: (v) => (v as { username?: string })?.username === writer.username || `should be ${writer.username}`,
  169 |         tagList: (v) => (Array.isArray(v) && input.tagList.every((t) => v.includes(t))) || `should contain ${input.tagList.join(', ')}`,
  170 |       }, 'article'), '[REQ AC-5] article fields').toEqual([]);
  171 |     });
  172 |   });
  173 | 
  174 |   test('SCN-008: A second article with the same title gets its own slug', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  175 |     let writer!: User; let first!: Article; let r!: ApiResponse<{ article?: Article }>;
  176 |     await journey.step('Given I am a signed-in writer who published an article', async () => { writer = await actor(seed, api, data, 'writer'); first = await publish(seed, api, writer); });
  177 |     await journey.step('When I POST a second article with exactly the same title', async () => {
  178 |       r = await api.post(EP.articles, { data: { article: articleInput({ title: first.title }) }, headers: auth(writer.token) });
  179 |       trackArticle(seed, api, writer, r);
  180 |     });
> 181 |     await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-6] same title → 201').toBe(REQ.STATUS.CREATED); });
      |                                                                                                                         ^ Error: [REQ AC-6] same title → 201
  182 |     await journey.step("And its slug differs from the first article's slug", async () => { expect(r.body?.article?.slug, '[REQ AC-6] distinct slug').not.toBe(first.slug); });
  183 |   });
  184 | 
  185 |   REQ.REQUIRED_ARTICLE_FIELDS.forEach((field, i) => {
  186 |     test(`SCN-009.${i + 1}: An article without a ${field} is rejected with 422`, { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  187 |       let writer!: User; let r!: ApiResponse;
  188 |       await journey.step('Given I am a signed-in writer', async () => { writer = await actor(seed, api, data, 'writer'); });
  189 |       await journey.step(`When I POST an article without a ${field}`, async () => {
  190 |         const input: Record<string, unknown> = articleInput();
  191 |         delete input[field];
  192 |         r = await api.post(EP.articles, { data: { article: input }, headers: auth(writer.token) });
  193 |         trackArticle(seed, api, writer, r);
  194 |       });
  195 |       await journey.step('Then the response status is 422', async () => { expect.soft(r.status, `[REQ AC-7] missing ${field} → 422`).toBe(REQ.STATUS.UNPROCESSABLE); });
  196 |       await journey.step(`And the errors object names "${field}"`, async () => { expect.soft(errorFields(r), `[REQ AC-7] errors names ${field}`).toContain(field); });
  197 |     });
  198 |   });
  199 | 
  200 |   (['update', 'delete'] as const).forEach((action, i) => {
  201 |     test(`SCN-010.${i + 1}: Another signed-in user cannot ${action} someone else's article`, { tag: ['@AC-8', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  202 |       let writer!: User; let other!: User; let article!: Article; let r!: ApiResponse;
  203 |       await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  204 |       await journey.step('And I am a different signed-in user', async () => { other = await actor(seed, api, data, 'other'); });
  205 |       await journey.step(`When I ${action} that article`, async () => {
  206 |         r = action === 'update'
  207 |           ? await api.put(EP.article(article.slug), { data: { article: { title: `Hijacked ${uid()}` } }, headers: auth(other.token) })
  208 |           : await api.delete(EP.article(article.slug), { headers: auth(other.token) });
  209 |       });
  210 |       await journey.step('Then the response status is 403', async () => { expect.soft(r.status, `[REQ AC-8] other user ${action} → 403`).toBe(REQ.STATUS.FORBIDDEN); });
  211 |       await journey.step('And the article still exists with its original title', async () => {
  212 |         const after = await api.get<{ article?: Article }>(EP.article(article.slug));
  213 |         expect.soft(after.status, `[REQ AC-8] article still exists after refused ${action}`).toBe(REQ.STATUS.OK);
  214 |         expect.soft(after.body?.article?.title, `[REQ AC-8] title unchanged after refused ${action}`).toBe(article.title);
  215 |       });
  216 |     });
  217 |   });
  218 | 
  219 |   test('SCN-011: The author updates and then deletes an article', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  220 |     let writer!: User; let article!: Article; let r!: ApiResponse<{ article?: Article }>;
  221 |     const newBody = `Updated body ${uid()}`;
  222 |     await journey.step('Given I am a signed-in writer who published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  223 |     await journey.step('When I PUT a new body for the article', async () => { r = await api.put(EP.article(article.slug), { data: { article: { body: newBody } }, headers: auth(writer.token) }); });
  224 |     await journey.step('Then the response status is 200 and the article has the new body', async () => {
  225 |       expect(r.status, '[REQ AC-9] author update → 200').toBe(REQ.STATUS.OK);
  226 |       expect(r.body?.article?.body, '[REQ AC-9] changed field returned').toBe(newBody);
  227 |     });
  228 |     const slug = r.body?.article?.slug ?? article.slug;
  229 |     let del!: ApiResponse;
  230 |     await journey.step('When I DELETE the article', async () => { del = await api.delete(EP.article(slug), { headers: auth(writer.token) }); });
  231 |     await journey.step('Then the response status is 204', async () => { expect(del.status, '[REQ AC-9] author delete → 204').toBe(REQ.STATUS.NO_CONTENT); });
  232 |     await journey.step('And GET /api/articles/{slug} responds 404', async () => { expect((await api.get(EP.article(slug))).status, '[REQ AC-9] deleted article → 404').toBe(REQ.STATUS.NOT_FOUND); });
  233 |   });
  234 | 
  235 |   // ---- Discovery ------------------------------------------------------------------------------------
  236 |   (['another signed-in reader', 'an anonymous visitor'] as const).forEach((reader, i) => {
  237 |     test(`SCN-012.${i + 1}: ${reader} filtering by author finds an article published moments ago`, { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  238 |       let writer!: User; let article!: Article; let headers: Record<string, string> = {};
  239 |       await journey.step('Given a writer published an article just now', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  240 |       await journey.step(`When ${reader} lists articles with ?author=<the writer's username>`, async () => {
  241 |         if (reader === 'another signed-in reader') headers = auth((await actor(seed, api, data, 'reader')).token);
  242 |       });
  243 |       await journey.step('Then within 10 seconds the list contains the new article', async () => {
  244 |         await expect.poll(async () => slugsIn(await api.get(EP.articles, { params: { author: writer.username }, headers })),
  245 |           { message: `[REQ AC-10] ${reader} finds the new article by author`, timeout: REQ.DISCOVERABLE_WITHIN_MS, intervals: [1_000, 2_000] }).toContain(article.slug);
  246 |       });
  247 |     });
  248 |   });
  249 | 
  250 |   REQ.LIMIT_ROWS.forEach((row, i) => {
  251 |     test(`SCN-013.${i + 1}: limit=${row.limit} is ${row.accepted ? 'accepted' : 'rejected with 422'}`, { tag: ['@AC-11', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  252 |       let r!: ApiResponse<{ articles?: unknown[] }>;
  253 |       await journey.step(`When I GET /api/articles?limit=${row.limit}`, async () => { r = await api.get(EP.articles, { params: { limit: row.limit } }); });
  254 |       await journey.step(`Then the request is ${row.accepted ? 'accepted' : 'rejected with 422'}`, async () => {
  255 |         if (row.accepted) {
  256 |           expect(r.status, `[REQ AC-11] limit=${row.limit} accepted`).toBe(REQ.STATUS.OK);
  257 |           expect((r.body?.articles ?? []).length, `[REQ AC-11] at most ${row.limit} article(s)`).toBeLessThanOrEqual(row.limit);
  258 |         } else {
  259 |           expect(r.status, `[REQ AC-11] limit=${row.limit} → 422`).toBe(REQ.STATUS.UNPROCESSABLE);
  260 |         }
  261 |       });
  262 |     });
  263 |   });
  264 | 
  265 |   test('SCN-014: offset pages through the list', { tag: ['@AC-11', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  266 |     await journey.step('When I GET /api/articles?limit=2 and /api/articles?limit=1&offset=1', async () => { /* both calls are made together below so a concurrent insert cannot skew them */ });
  267 |     await journey.step('Then the article at offset 1 is the second article of the first page', async () => {
  268 |       await expect.poll(async () => {
  269 |         const [page, second] = [slugsIn(await api.get(EP.articles, { params: { limit: 2 } })), slugsIn(await api.get(EP.articles, { params: { limit: 1, offset: 1 } }))];
  270 |         return page.length === 2 && second.length === 1 && page[1] === second[0];
  271 |       }, { message: '[REQ AC-11] offset=1 returns the second article', timeout: 10_000 }).toBe(true);
  272 |     });
  273 |   });
  274 | 
  275 |   test('SCN-015: A followed author\'s new article appears in the reader\'s feed', { tag: ['@AC-12', '@type:integration', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  276 |     let writer!: User; let reader!: User; let article!: Article; let r!: ApiResponse;
  277 |     await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  278 |     await journey.step('And I am a signed-in reader who follows that writer', async () => {
  279 |       reader = await actor(seed, api, data, 'reader');
  280 |       await seed.step('reader follows the writer', async () => {
  281 |         const f = await api.post<{ profile?: { following?: boolean } }>(EP.follow(writer.username), { headers: auth(reader.token) });
```