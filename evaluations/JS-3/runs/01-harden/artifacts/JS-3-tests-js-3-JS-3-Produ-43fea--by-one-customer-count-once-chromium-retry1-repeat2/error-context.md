# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: JS-3\tests\js-3.spec.ts >> JS-3 Product reviews — write, like and edit >> SCN-009: Simultaneous likes by one customer count once
- Location: evaluations\JS-3\tests\js-3.spec.ts:235:7

# Error details

```
Error: [REQ AC-8] GET /rest/products/1/reviews likesCount rose by exactly 1 in every round

expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

  Array [
    1,
-   1,
-   1,
+   3,
+   3,
  ]
```

# Test source

```ts
  150 |     test(`SCN-004.${i + 1}: Writing, liking and editing without a token are refused and change nothing (${row.call.split(' ')[0]})`, { tag: ['@AC-4', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  151 |       let review!: Review; let res!: ApiResponse; const message = unique();
  152 |       await journey.step('Given a review written by a signed-in customer exists for product 1', async () => { review = await seedReview(api, seed, await seed.account()); });
  153 |       await journey.step(`When a client sends ${row.call} without an Authorization header`, async () => {
  154 |         if (i === 0) { res = await api.put(EP.restProductsReviewsById(PRODUCT.id), { data: { message, author: review.author } }); seed.track('a review the application may have stored', { message }); }
  155 |         if (i === 1) res = await api.post(EP.restProductsReviews, { data: { id: review._id } });
  156 |         if (i === 2) res = await api.patch(EP.restProductsReviews, { data: { id: review._id, message } });
  157 |       });
  158 |       await journey.step('Then the answer is HTTP 401', async () => {
  159 |         expect.soft(res.status, `[REQ AC-4] ${row.call.split(' ').slice(0, 2).join(' ')} without a token → 401`).toBe(REQ.STATUS.S401);
  160 |       });
  161 |       await journey.step(`And ${row.stays}`, async () => {
  162 |         const list = await reviews(api);
  163 |         if (i === 0) expect.soft(byMessage(list, message), '[REQ AC-4] PUT /rest/products/1/reviews without a token stores nothing').toEqual([]);
  164 |         const now = list.find((r) => r._id === review._id);
  165 |         if (i === 1) expect.soft({ likesCount: now?.likesCount, likedBy: now?.likedBy }, '[REQ AC-4] POST /rest/products/reviews without a token changes no like').toEqual({ likesCount: review.likesCount, likedBy: review.likedBy });
  166 |         if (i === 2) expect.soft(now?.message, '[REQ AC-4] PATCH /rest/products/reviews without a token changes no message').toBe(review.message);
  167 |       });
  168 |     });
  169 |   });
  170 | 
  171 |   test('SCN-005: Another customer cannot edit my review', { tag: ['@AC-5', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  172 |     let review!: Review; let b!: Account; let res!: ApiResponse;
  173 |     await journey.step('Given customer A has written a review for product 1', async () => { review = await seedReview(api, seed, await seed.account('customer A')); });
  174 |     await journey.step('And customer B is signed in', async () => { b = await seed.account('customer B'); });
  175 |     await journey.step('When B sends PATCH /rest/products/reviews with A\'s review id and a new message', async () => {
  176 |       res = await api.patch(EP.restProductsReviews, { headers: b.headers, data: { id: review._id, message: unique() } });
  177 |     });
  178 |     await journey.step('Then the answer is HTTP 403', async () => {
  179 |       expect.soft(res.status, '[REQ AC-5] PATCH /rest/products/reviews by another customer → 403').toBe(REQ.STATUS.S403);
  180 |     });
  181 |     await journey.step('And the review\'s message is still A\'s', async () => {
  182 |       const now = (await reviews(api)).find((r) => r._id === review._id);
  183 |       expect.soft(now?.message, '[REQ AC-5] PATCH /rest/products/reviews by another customer leaves the message unchanged').toBe(review.message);
  184 |     });
  185 |   });
  186 | 
  187 |   test('SCN-006: A review\'s author comes from the session, not from the request', { tag: ['@AC-6', '@type:audit', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  188 |     let me!: Account; const message = unique();
  189 |     await journey.step('Given I am a signed-in customer', async () => { me = await seed.account(); });
  190 |     await journey.step('When I PUT a new review message for product 1 whose author names another e-mail', async () => {
  191 |       await api.put(EP.restProductsReviewsById(PRODUCT.id), { headers: me.headers, data: { message, author: `${unique().replace(/\s+/g, '-')}@example.com` } });
  192 |       seed.track('the review under test', { message });
  193 |     });
  194 |     await journey.step('Then the stored review with my message names my e-mail as its author', async () => {
  195 |       const stored = byMessage(await reviews(api), message);
  196 |       expect(stored.map((r) => r.author), '[REQ AC-6] GET /rest/products/1/reviews the review\'s author is my e-mail').toEqual([me.username]);
  197 |     });
  198 |   });
  199 | 
  200 |   test('SCN-007: A like records who gave it', { tag: ['@AC-6', '@type:audit', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  201 |     let review!: Review; let b!: Account;
  202 |     await journey.step('Given customer A has written a review for product 1', async () => { review = await seedReview(api, seed, await seed.account('customer A')); });
  203 |     await journey.step('When customer B likes it', async () => {
  204 |       b = await seed.account('customer B');
  205 |       await api.post(EP.restProductsReviews, { headers: b.headers, data: { id: review._id } });
  206 |     });
  207 |     let now: Review | undefined;
  208 |     await journey.step('Then the review\'s likedBy contains B\'s e-mail', async () => {
  209 |       now = (await reviews(api)).find((r) => r._id === review._id);
  210 |       expect.soft(now?.likedBy, '[REQ AC-6] GET /rest/products/1/reviews likedBy contains the liker\'s e-mail').toContain(b.username);
  211 |     });
  212 |     await journey.step('And its likesCount equals the number of entries in likedBy', async () => {
  213 |       expect.soft(now?.likesCount, '[REQ AC-6] GET /rest/products/1/reviews likesCount equals the entries in likedBy').toBe(now?.likedBy?.length);
  214 |     });
  215 |   });
  216 | 
  217 |   test('SCN-008: A second like by the same customer is refused and changes nothing', { tag: ['@AC-7', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  218 |     let review!: Review; let b!: Account; let afterFirst: Review | undefined; let res!: ApiResponse;
  219 |     await journey.step('Given customer A has written a review for product 1', async () => { review = await seedReview(api, seed, await seed.account('customer A')); });
  220 |     await journey.step('And customer B has liked it once', async () => {
  221 |       b = await seed.account('customer B');
  222 |       await seedLike(api, seed, b, review);
  223 |       afterFirst = await seed.step('read the review after the first like', async () => (await reviews(api)).find((r) => r._id === review._id));
  224 |     });
  225 |     await journey.step('When B likes it again', async () => { res = await api.post(EP.restProductsReviews, { headers: b.headers, data: { id: review._id } }); });
  226 |     await journey.step('Then the answer is HTTP 403 with {"error":"Not allowed"}', async () => {
  227 |       expectResponse(res, { status: REQ.STATUS.S403, body: REQ.NOT_ALLOWED }, '[REQ AC-7] POST /rest/products/reviews second like');
  228 |     });
  229 |     await journey.step('And the review\'s likesCount and likedBy are as they were after the first like', async () => {
  230 |       const now = (await reviews(api)).find((r) => r._id === review._id);
  231 |       expect.soft({ likesCount: now?.likesCount, likedBy: now?.likedBy }, '[REQ AC-7] GET /rest/products/1/reviews a second like changes no count').toEqual({ likesCount: afterFirst?.likesCount, likedBy: afterFirst?.likedBy });
  232 |     });
  233 |   });
  234 | 
  235 |   test('SCN-009: Simultaneous likes by one customer count once', { tag: ['@AC-8', '@type:concurrency', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  236 |     let a!: Account; let b!: Account;
  237 |     const rounds: { review: Review; after?: Review }[] = [];
  238 |     await journey.step('Given customer A has written a review for product 1', async () => {
  239 |       a = await seed.account('customer A');
  240 |       b = await seed.account('customer B');
  241 |       for (let round = 1; round <= 3; round++) rounds.push({ review: await seedReview(api, seed, a, `a fresh review for round ${round}`) });
  242 |     });
  243 |     await journey.step('When customer B sends three likes for it at the same time', async () => {
  244 |       for (const r of rounds) {
  245 |         await Promise.all([1, 2, 3].map(() => api.post(EP.restProductsReviews, { headers: b.headers, data: { id: r.review._id } })));
  246 |         r.after = (await reviews(api)).find((x) => x._id === r.review._id);
  247 |       }
  248 |     });
  249 |     await journey.step('Then the review\'s likesCount has risen by exactly 1', async () => {
> 250 |       expect(rounds.map((r) => (r.after?.likesCount ?? NaN) - r.review.likesCount), '[REQ AC-8] GET /rest/products/1/reviews likesCount rose by exactly 1 in every round').toEqual(rounds.map(() => 1));
      |                                                                                                                                                                            ^ Error: [REQ AC-8] GET /rest/products/1/reviews likesCount rose by exactly 1 in every round
  251 |     });
  252 |     await journey.step('And B\'s e-mail appears once in its likedBy', async () => {
  253 |       expect(rounds.map((r) => (r.after?.likedBy ?? []).filter((e) => e === b.username).length), '[REQ AC-8] GET /rest/products/1/reviews the liker\'s e-mail appears once in likedBy in every round').toEqual(rounds.map(() => 1));
  254 |     });
  255 |   });
  256 | 
  257 |   test('SCN-010: A like for a review that does not exist is refused', { tag: ['@AC-9', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
  258 |     let me!: Account; let res!: ApiResponse;
  259 |     await journey.step('Given I am a signed-in customer', async () => { me = await seed.account(); });
  260 |     await journey.step('When I like a review id that does not exist', async () => {
  261 |       res = await api.post(EP.restProductsReviews, { headers: me.headers, data: { id: unique().replace(/\s+/g, '') } });
  262 |     });
  263 |     await journey.step('Then the answer is HTTP 404 with {"error":"Not found"}', async () => {
  264 |       expectResponse(res, { status: REQ.STATUS.S404, body: REQ.NOT_FOUND }, '[REQ AC-9] POST /rest/products/reviews unknown id');
  265 |     });
  266 |   });
  267 | 
  268 |   test('SCN-011: Submit stays disabled while the review field is empty', { tag: ['@AC-9', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, seed }) => {
  269 |     let dialog!: ReturnType<Page['getByRole']>;
  270 |     await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
  271 |       await signIn(page, await seed.account());
  272 |       dialog = await openProductDialog(page);
  273 |     });
  274 |     await journey.step('When the review field is empty', async () => { await expect(reviewField(dialog), 'the review field is empty (precondition)').toHaveValue(''); });
  275 |     await journey.step('Then the Submit button is disabled', async () => {
  276 |       await expect(submitButton(dialog), '[REQ AC-9] Submit is disabled while the review field is empty').toBeDisabled();
  277 |     });
  278 |   });
  279 | 
  280 |   test('SCN-012: A review of exactly 160 characters is accepted and submitted', { tag: ['@AC-10', '@type:boundary', '@layer:ui', '@P2'] }, async ({ page, api, journey, seed }) => {
  281 |     let dialog!: ReturnType<Page['getByRole']>;
  282 |     const base = `${unique()} `;
  283 |     const message = (base + 'x'.repeat(REQ.MAX_LENGTH)).slice(0, REQ.MAX_LENGTH);
  284 |     await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
  285 |       await signIn(page, await seed.account());
  286 |       dialog = await openProductDialog(page);
  287 |     });
  288 |     await journey.step('When I type a message of exactly 160 characters and press Submit', async () => {
  289 |       await reviewField(dialog).fill(message);
  290 |     });
  291 |     await journey.step('Then the field held all 160 characters before submitting', async () => {
  292 |       await expect(reviewField(dialog), '[REQ AC-10] the field holds all 160 characters').toHaveValue(message);
  293 |       await submitButton(dialog).click();
  294 |       seed.track('the 160-character review', { message });
  295 |     });
  296 |     await journey.step('And GET /rest/products/1/reviews lists the 160-character review', async () => {
  297 |       await expect.poll(async () => byMessage(await reviews(api), message).length, { message: '[REQ AC-10] GET /rest/products/1/reviews lists the 160-character review' }).toBe(1);
  298 |     });
  299 |   });
  300 | 
  301 |   test('SCN-013: A 161st character is not accepted', { tag: ['@AC-10', '@type:boundary', '@layer:ui', '@P2'] }, async ({ page, journey, seed }) => {
  302 |     let dialog!: ReturnType<Page['getByRole']>;
  303 |     await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
  304 |       await signIn(page, await seed.account());
  305 |       dialog = await openProductDialog(page);
  306 |     });
  307 |     await journey.step('When I type a message of 161 characters', async () => {
  308 |       // Typing key by key lost characters while the dialog was still settling (01-harden: 85 of 161); fill enters the
  309 |       // text as one input, which the field's own limit applies to in the same way.
  310 |       await reviewField(dialog).fill('y'.repeat(REQ.MAX_LENGTH + 1));
  311 |     });
  312 |     await journey.step('Then the review field holds 160 characters', async () => {
  313 |       expect((await reviewField(dialog).inputValue()).length, '[REQ AC-10] the field holds 160 characters after typing 161').toBe(REQ.MAX_LENGTH);
  314 |     });
  315 |     await journey.step('And the field\'s counter shows 160/160', async () => {
  316 |       await expect(dialog.getByText(REQ.COUNTER_FULL, { exact: true }), '[REQ AC-10] the counter shows 160/160').toBeVisible();
  317 |     });
  318 |   });
  319 | 
  320 |   test('SCN-014: The review field and the Submit button have accessible names and the field describes its limit', { tag: ['@AC-11', '@type:accessibility', '@layer:ui', '@P2'] }, async ({ page, journey, seed }) => {
  321 |     let dialog!: ReturnType<Page['getByRole']>;
  322 |     await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
  323 |       await signIn(page, await seed.account());
  324 |       dialog = await openProductDialog(page);
  325 |     });
  326 |     await journey.step('Then the review field has an accessible name', async () => {
  327 |       await expect(dialog.getByRole('textbox'), '[REQ AC-11 strict] the review field has an accessible name').toHaveAccessibleName(/\S/);
  328 |     });
  329 |     await journey.step('And the review field\'s accessible description includes "Max. 160 characters"', async () => {
  330 |       await expect(dialog.getByRole('textbox'), '[REQ AC-11 strict] the review field\'s description includes the limit hint').toHaveAccessibleDescription(new RegExp(REQ.LIMIT_HINT.replace(/\./g, '\\.')));
  331 |     });
  332 |     await journey.step('And the Submit button has an accessible name', async () => {
  333 |       await expect(dialog.locator('button[type="submit"]'), '[REQ AC-11 strict] the Submit button has an accessible name').toHaveAccessibleName(/\S/);
  334 |     });
  335 |   });
  336 | 
  337 |   test('SCN-015: Write, like and edit: the review keeps its author and its like', { tag: ['@AC-12', '@type:composition', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  338 |     let a!: Account; let b!: Account; let review: Review | undefined; const message = unique(); const edited = unique();
  339 |     await journey.step('Given customers A and B are signed in', async () => { a = await seed.account('customer A'); b = await seed.account('customer B'); });
  340 |     await journey.step('When A writes a review for product 1', async () => {
  341 |       await api.put(EP.restProductsReviewsById(PRODUCT.id), { headers: a.headers, data: { message, author: a.username } });
  342 |       review = byMessage(await reviews(api), message)[0];
  343 |       expect(review, '[REQ AC-12] GET /rest/products/1/reviews lists A\'s new review').toBeDefined();
  344 |       seed.track('the review under test', { message });
  345 |     });
  346 |     await journey.step('And B likes that review', async () => { await api.post(EP.restProductsReviews, { headers: b.headers, data: { id: review!._id } }); });
  347 |     await journey.step('And A edits that review\'s message', async () => { await api.patch(EP.restProductsReviews, { headers: a.headers, data: { id: review!._id, message: edited } }); });
  348 |     let now: Review | undefined;
  349 |     await journey.step('Then the review shows A\'s edited message', async () => {
  350 |       now = (await reviews(api)).find((r) => r._id === review!._id);
```