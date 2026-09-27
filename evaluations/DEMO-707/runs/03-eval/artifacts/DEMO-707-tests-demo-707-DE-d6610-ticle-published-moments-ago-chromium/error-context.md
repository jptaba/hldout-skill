# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-707\tests\demo-707.spec.ts >> DEMO-707 Conduit platform core >> SCN-012.2: an anonymous visitor filtering by author finds an article published moments ago
- Location: evaluations\DEMO-707\tests\demo-707.spec.ts:238:5

# Error details

```
Error: [REQ AC-10] an anonymous visitor finds the new article by author

[REQ AC-10] an anonymous visitor finds the new article by author

expect(received).toContain(expected) // indexOf

Expected value: "Heldout-irkylpuhz4-74244"
Received array: []

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Test source

```ts
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
  161 |       // Repaired (triage 02-eval, SCRIPT_DEFECT): the draft sent the fields without the declared {"article": …} envelope.
  162 |       r = await api.post(EP.articles, { data: { article: input }, headers: auth(writer.token) });
  163 |       trackArticle(seed, api, writer, r);
  164 |     });
  165 |     await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-5] create article → 201').toBe(REQ.STATUS.CREATED); });
  166 |     await journey.step('And the article has a slug, me as the author and the tags I sent', async () => {
  167 |       expect(checkShape(r.body?.article, {
  168 |         slug: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string',
  169 |         author: (v) => (v as { username?: string })?.username === writer.username || `should be ${writer.username}`,
  170 |         tagList: (v) => (Array.isArray(v) && input.tagList.every((t) => v.includes(t))) || `should contain ${input.tagList.join(', ')}`,
  171 |       }, 'article'), '[REQ AC-5] article fields').toEqual([]);
  172 |     });
  173 |   });
  174 | 
  175 |   test('SCN-008: A second article with the same title gets its own slug', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  176 |     let writer!: User; let first!: Article; let r!: ApiResponse<{ article?: Article }>;
  177 |     await journey.step('Given I am a signed-in writer who published an article', async () => { writer = await actor(seed, api, data, 'writer'); first = await publish(seed, api, writer); });
  178 |     await journey.step('When I POST a second article with exactly the same title', async () => {
  179 |       r = await api.post(EP.articles, { data: { article: articleInput({ title: first.title }) }, headers: auth(writer.token) });
  180 |       trackArticle(seed, api, writer, r);
  181 |     });
  182 |     await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-6] same title → 201').toBe(REQ.STATUS.CREATED); });
  183 |     await journey.step("And its slug differs from the first article's slug", async () => { expect(r.body?.article?.slug, '[REQ AC-6] distinct slug').not.toBe(first.slug); });
  184 |   });
  185 | 
  186 |   REQ.REQUIRED_ARTICLE_FIELDS.forEach((field, i) => {
  187 |     test(`SCN-009.${i + 1}: An article without a ${field} is rejected with 422`, { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  188 |       let writer!: User; let r!: ApiResponse;
  189 |       await journey.step('Given I am a signed-in writer', async () => { writer = await actor(seed, api, data, 'writer'); });
  190 |       await journey.step(`When I POST an article without a ${field}`, async () => {
  191 |         const input: Record<string, unknown> = articleInput();
  192 |         delete input[field];
  193 |         r = await api.post(EP.articles, { data: { article: input }, headers: auth(writer.token) });
  194 |         trackArticle(seed, api, writer, r);
  195 |       });
  196 |       await journey.step('Then the response status is 422', async () => { expect.soft(r.status, `[REQ AC-7] missing ${field} → 422`).toBe(REQ.STATUS.UNPROCESSABLE); });
  197 |       await journey.step(`And the errors object names "${field}"`, async () => { expect.soft(errorFields(r), `[REQ AC-7] errors names ${field}`).toContain(field); });
  198 |     });
  199 |   });
  200 | 
  201 |   (['update', 'delete'] as const).forEach((action, i) => {
  202 |     test(`SCN-010.${i + 1}: Another signed-in user cannot ${action} someone else's article`, { tag: ['@AC-8', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  203 |       let writer!: User; let other!: User; let article!: Article; let r!: ApiResponse;
  204 |       await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  205 |       await journey.step('And I am a different signed-in user', async () => { other = await actor(seed, api, data, 'other'); });
  206 |       await journey.step(`When I ${action} that article`, async () => {
  207 |         r = action === 'update'
  208 |           ? await api.put(EP.article(article.slug), { data: { article: { title: `Hijacked ${uid()}` } }, headers: auth(other.token) })
  209 |           : await api.delete(EP.article(article.slug), { headers: auth(other.token) });
  210 |       });
  211 |       await journey.step('Then the response status is 403', async () => { expect.soft(r.status, `[REQ AC-8] other user ${action} → 403`).toBe(REQ.STATUS.FORBIDDEN); });
  212 |       await journey.step('And the article still exists with its original title', async () => {
  213 |         const after = await api.get<{ article?: Article }>(EP.article(article.slug));
  214 |         expect.soft(after.status, `[REQ AC-8] article still exists after refused ${action}`).toBe(REQ.STATUS.OK);
  215 |         expect.soft(after.body?.article?.title, `[REQ AC-8] title unchanged after refused ${action}`).toBe(article.title);
  216 |       });
  217 |     });
  218 |   });
  219 | 
  220 |   test('SCN-011: The author updates and then deletes an article', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  221 |     let writer!: User; let article!: Article; let r!: ApiResponse<{ article?: Article }>;
  222 |     const newBody = `Updated body ${uid()}`;
  223 |     await journey.step('Given I am a signed-in writer who published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  224 |     await journey.step('When I PUT a new body for the article', async () => { r = await api.put(EP.article(article.slug), { data: { article: { body: newBody } }, headers: auth(writer.token) }); });
  225 |     await journey.step('Then the response status is 200 and the article has the new body', async () => {
  226 |       expect(r.status, '[REQ AC-9] author update → 200').toBe(REQ.STATUS.OK);
  227 |       expect(r.body?.article?.body, '[REQ AC-9] changed field returned').toBe(newBody);
  228 |     });
  229 |     const slug = r.body?.article?.slug ?? article.slug;
  230 |     let del!: ApiResponse;
  231 |     await journey.step('When I DELETE the article', async () => { del = await api.delete(EP.article(slug), { headers: auth(writer.token) }); });
  232 |     await journey.step('Then the response status is 204', async () => { expect(del.status, '[REQ AC-9] author delete → 204').toBe(REQ.STATUS.NO_CONTENT); });
  233 |     await journey.step('And GET /api/articles/{slug} responds 404', async () => { expect((await api.get(EP.article(slug))).status, '[REQ AC-9] deleted article → 404').toBe(REQ.STATUS.NOT_FOUND); });
  234 |   });
  235 | 
  236 |   // ---- Discovery ------------------------------------------------------------------------------------
  237 |   (['another signed-in reader', 'an anonymous visitor'] as const).forEach((reader, i) => {
  238 |     test(`SCN-012.${i + 1}: ${reader} filtering by author finds an article published moments ago`, { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  239 |       let writer!: User; let article!: Article; let headers: Record<string, string> = {};
  240 |       await journey.step('Given a writer published an article just now', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  241 |       await journey.step(`When ${reader} lists articles with ?author=<the writer's username>`, async () => {
  242 |         if (reader === 'another signed-in reader') headers = auth((await actor(seed, api, data, 'reader')).token);
  243 |       });
  244 |       await journey.step('Then within 10 seconds the list contains the new article', async () => {
  245 |         await expect.poll(async () => slugsIn(await api.get(EP.articles, { params: { author: writer.username }, headers })),
> 246 |           { message: `[REQ AC-10] ${reader} finds the new article by author`, timeout: REQ.DISCOVERABLE_WITHIN_MS, intervals: [1_000, 2_000] }).toContain(article.slug);
      |                                                                                                                                                 ^ Error: [REQ AC-10] an anonymous visitor finds the new article by author
  247 |       });
  248 |     });
  249 |   });
  250 | 
  251 |   REQ.LIMIT_ROWS.forEach((row, i) => {
  252 |     test(`SCN-013.${i + 1}: limit=${row.limit} is ${row.accepted ? 'accepted' : 'rejected with 422'}`, { tag: ['@AC-11', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  253 |       let r!: ApiResponse<{ articles?: unknown[] }>;
  254 |       await journey.step(`When I GET /api/articles?limit=${row.limit}`, async () => { r = await api.get(EP.articles, { params: { limit: row.limit } }); });
  255 |       await journey.step(`Then the request is ${row.accepted ? 'accepted' : 'rejected with 422'}`, async () => {
  256 |         if (row.accepted) {
  257 |           expect(r.status, `[REQ AC-11] limit=${row.limit} accepted`).toBe(REQ.STATUS.OK);
  258 |           expect((r.body?.articles ?? []).length, `[REQ AC-11] at most ${row.limit} article(s)`).toBeLessThanOrEqual(row.limit);
  259 |         } else {
  260 |           expect(r.status, `[REQ AC-11] limit=${row.limit} → 422`).toBe(REQ.STATUS.UNPROCESSABLE);
  261 |         }
  262 |       });
  263 |     });
  264 |   });
  265 | 
  266 |   test('SCN-014: offset pages through the list', { tag: ['@AC-11', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  267 |     await journey.step('When I GET /api/articles?limit=2 and /api/articles?limit=1&offset=1', async () => { /* both calls are made together below so a concurrent insert cannot skew them */ });
  268 |     await journey.step('Then the article at offset 1 is the second article of the first page', async () => {
  269 |       await expect.poll(async () => {
  270 |         const [page, second] = [slugsIn(await api.get(EP.articles, { params: { limit: 2 } })), slugsIn(await api.get(EP.articles, { params: { limit: 1, offset: 1 } }))];
  271 |         return page.length === 2 && second.length === 1 && page[1] === second[0];
  272 |       }, { message: '[REQ AC-11] offset=1 returns the second article', timeout: 10_000 }).toBe(true);
  273 |     });
  274 |   });
  275 | 
  276 |   test('SCN-015: A followed author\'s new article appears in the reader\'s feed', { tag: ['@AC-12', '@type:integration', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  277 |     let writer!: User; let reader!: User; let article!: Article; let r!: ApiResponse;
  278 |     await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  279 |     await journey.step('And I am a signed-in reader who follows that writer', async () => {
  280 |       reader = await actor(seed, api, data, 'reader');
  281 |       await seed.step('reader follows the writer', async () => {
  282 |         const f = await api.post<{ profile?: { following?: boolean } }>(EP.follow(writer.username), { headers: auth(reader.token) });
  283 |         expect(f.status, 'follow (pre-step)').toBe(REQ.STATUS.OK);
  284 |         expect(f.body?.profile?.following, 'following is true (pre-step)').toBe(true);
  285 |       });
  286 |     });
  287 |     await journey.step('When I GET /api/articles/feed', async () => { r = await api.get(EP.feed, { headers: auth(reader.token) }); });
  288 |     await journey.step("Then the feed contains the writer's article", async () => { expect(slugsIn(r), '[REQ AC-12] followed author\'s article in the feed').toContain(article.slug); });
  289 |   });
  290 | 
  291 |   // ---- Comments & favourites ------------------------------------------------------------------------
  292 |   test('SCN-016: A signed-in reader comments on an article', { tag: ['@AC-13', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  293 |     let article!: Article; let reader!: User; let r!: ApiResponse<{ comment?: Comment }>;
  294 |     const text = `Nice read ${uid()}`;
  295 |     await journey.step('Given a writer published an article', async () => { article = await publish(seed, api, await actor(seed, api, data, 'writer')); });
  296 |     await journey.step('And I am a signed-in reader', async () => { reader = await actor(seed, api, data, 'reader'); });
  297 |     await journey.step('When I POST a comment to the article', async () => { r = await api.post(EP.comments(article.slug), { data: { comment: { body: text } }, headers: auth(reader.token) }); });
  298 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-13] comment → 200').toBe(REQ.STATUS.OK); });
  299 |     await journey.step('And the comment is returned with my text', async () => { expect(r.body?.comment?.body, '[REQ AC-13] comment returned').toBe(text); });
  300 |   });
  301 | 
  302 |   test('SCN-017: An empty comment is rejected with 422', { tag: ['@AC-13', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  303 |     let article!: Article; let reader!: User; let r!: ApiResponse;
  304 |     await journey.step('Given a writer published an article', async () => { article = await publish(seed, api, await actor(seed, api, data, 'writer')); });
  305 |     await journey.step('And I am a signed-in reader', async () => { reader = await actor(seed, api, data, 'reader'); });
  306 |     await journey.step('When I POST a comment with an empty body', async () => { r = await api.post(EP.comments(article.slug), { data: { comment: { body: '' } }, headers: auth(reader.token) }); });
  307 |     await journey.step('Then the response status is 422', async () => { expect(r.status, '[REQ AC-13] empty comment → 422').toBe(REQ.STATUS.UNPROCESSABLE); });
  308 |   });
  309 | 
  310 |   (['the article\'s author', 'another signed-in user', 'an anonymous visitor'] as const).forEach((viewer, i) => {
  311 |     test(`SCN-018.${i + 1}: ${viewer} sees a reader's comment on the article`, { tag: ['@AC-14', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  312 |       let writer!: User; let article!: Article; let comment!: Comment; let r!: ApiResponse;
  313 |       await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  314 |       await journey.step('And a reader commented on it', async () => { comment = await addComment(seed, api, article, await actor(seed, api, data, 'reader')); });
  315 |       await journey.step(`When ${viewer} lists the article's comments`, async () => {
  316 |         const headers = viewer === 'an anonymous visitor' ? {} : auth(viewer === 'the article\'s author' ? writer.token : (await actor(seed, api, data, 'other')).token);
  317 |         r = await api.get(EP.comments(article.slug), { headers });
  318 |       });
  319 |       await journey.step("Then the list contains the reader's comment", async () => { expect(commentIdsIn(r), `[REQ AC-14] ${viewer} sees the comment`).toContain(comment.id); });
  320 |     });
  321 |   });
  322 | 
  323 |   test('SCN-019: Someone other than the comment\'s author cannot delete it', { tag: ['@AC-15', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  324 |     let writer!: User; let reader!: User; let article!: Article; let comment!: Comment; let r!: ApiResponse;
  325 |     await journey.step('Given a writer published an article', async () => { writer = await actor(seed, api, data, 'writer'); article = await publish(seed, api, writer); });
  326 |     await journey.step('And a reader commented on it', async () => { reader = await actor(seed, api, data, 'reader'); comment = await addComment(seed, api, article, reader); });
  327 |     await journey.step("When the article's author (not the commenter) deletes the comment", async () => { r = await api.delete(EP.comment(article.slug, comment.id), { headers: auth(writer.token) }); });
  328 |     await journey.step('Then the response status is 403', async () => { expect.soft(r.status, '[REQ AC-15] non-author delete comment → 403').toBe(REQ.STATUS.FORBIDDEN); });
  329 |     await journey.step('And the comment is still listed for the commenter', async () => {
  330 |       expect.soft(commentIdsIn(await api.get(EP.comments(article.slug), { headers: auth(reader.token) })), '[REQ AC-15] comment remains').toContain(comment.id);
  331 |     });
  332 |   });
  333 | 
  334 |   test('SCN-020: Favouriting twice counts once; unfavouriting decrements', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  335 |     let article!: Article; let reader!: User; let r!: ApiResponse<{ article?: Article }>;
  336 |     await journey.step('Given a writer published an article', async () => { article = await publish(seed, api, await actor(seed, api, data, 'writer')); });
  337 |     await journey.step('And I am a signed-in reader', async () => { reader = await actor(seed, api, data, 'reader'); });
  338 |     await journey.step('When I favourite the article', async () => { r = await api.post(EP.favorite(article.slug), { headers: auth(reader.token) }); });
  339 |     await journey.step('Then favoritesCount is 1 and favorited is true', async () => {
  340 |       expect(r.status, 'favourite call succeeded').toBe(REQ.STATUS.OK);
  341 |       expect({ favorited: r.body?.article?.favorited, favoritesCount: r.body?.article?.favoritesCount }, '[REQ AC-16] first favourite → count 1, favorited').toEqual({ favorited: true, favoritesCount: 1 });
  342 |     });
  343 |     await journey.step('When I favourite the article again', async () => { r = await api.post(EP.favorite(article.slug), { headers: auth(reader.token) }); });
  344 |     await journey.step('Then favoritesCount is still 1', async () => { expect.soft(r.body?.article?.favoritesCount, '[REQ AC-16] second favourite leaves the count unchanged').toBe(1); });
  345 |     await journey.step('When I unfavourite the article', async () => { r = await api.delete(EP.favorite(article.slug), { headers: auth(reader.token) }); });
  346 |     await journey.step('Then favoritesCount is 0', async () => { expect.soft(r.body?.article?.favoritesCount, '[REQ AC-16] unfavourite decrements to 0').toBe(0); });
```