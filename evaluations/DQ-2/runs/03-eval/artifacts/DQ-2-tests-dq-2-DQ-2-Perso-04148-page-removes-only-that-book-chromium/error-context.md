# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DQ-2\tests\dq-2.spec.ts >> DQ-2 Personal book collection - browse the catalogue and manage my books >> SCN-011: Deleting one book on the Profile page removes only that book
- Location: evaluations\DQ-2\tests\dq-2.spec.ts:301:3

# Error details

```
Error: signed in and on the Profile page (precondition)

expect(page).toHaveURL(expected) failed

Expected pattern: /\/profile/
Received string:  "https://demoqa.com/login"
Timeout: 5000ms

Call log:
  - signed in and on the Profile page (precondition) with timeout 5000ms
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "https://demoqa.com/login"

```

```yaml
- banner:
  - link:
    - /url: https://demoqa.com
    - img
- img
- text: Elements
- img
- img
- text: Forms
- img
- img
- text: Alerts, Frame & Windows
- img
- img
- text: Widgets
- img
- img
- text: Interactions
- img
- img
- text: Book Store Application
- img
- list:
  - listitem:
    - link "Login":
      - /url: /login
      - img
      - text: Login
  - listitem:
    - link "Book Store":
      - /url: /books
      - img
      - text: Book Store
  - listitem:
    - link "Profile":
      - /url: /profile
      - img
      - text: Profile
  - listitem:
    - link "Book Store API":
      - /url: /swagger
      - img
      - text: Book Store API
- text: Loading...
- contentinfo: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```

# Test source

```ts
  209 |     });
  210 |     await journey.step('When I type a term that matches no book into the search box with placeholder "Type to search"', async () => {
  211 |       await expect(searchBox(page), '[REQ AC-4 strict] search box with placeholder "Type to search"').toBeVisible();
  212 |       await searchBox(page).pressSequentially(data.noMatchSearchTerm as string);
  213 |     });
  214 |     await journey.step('Then no book rows are listed', async () => {
  215 |       await expect(bookRows(page), '[REQ AC-4] no-match term leaves no book rows').toHaveCount(0);
  216 |     });
  217 |   });
  218 | 
  219 |   test('SCN-007: Clicking a book title opens its detail page with the catalogue values', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
  220 |     let entry!: Book;
  221 |     await journey.step('Given I read the catalogue entry for 9781449325862 from GET /BookStore/v1/Books', async () => {
  222 |       const found = (await readCatalogue(seed, api)).find((b) => b.isbn === REQ.DETAIL_BOOK.isbn);
  223 |       expect(found, 'catalogue lists 9781449325862 (precondition)').toBeTruthy();
  224 |       entry = found as Book;
  225 |     });
  226 |     await journey.step('And I am on the Book Store page /books', async () => {
  227 |       await gotoPage(page, '/books');
  228 |       await expect(bookRows(page).first(), 'book rows rendered (precondition)').toBeVisible();
  229 |     });
  230 |     await journey.step('When I click the title "Git Pocket Guide"', async () => {
  231 |       await page.getByRole('link', { name: REQ.DETAIL_BOOK.title, exact: true }).click();
  232 |     });
  233 |     await journey.step("Then the book's detail page shows its ISBN, title, sub title, author, publisher and total pages as in the catalogue", async () => {
  234 |       const fields: [string, string, string][] = [['ISBN', 'ISBN', entry.isbn], ['Title', 'title', entry.title], ['Sub Title', 'subtitle', entry.subTitle], ['Author', 'author', entry.author], ['Publisher', 'publisher', entry.publisher], ['Total Pages', 'pages', String(entry.pages)]];
  235 |       for (const [label, id, value] of fields) {
  236 |         await expect.soft(page.getByTestId(`${id}-wrapper`).getByText(value, { exact: true }), `[REQ AC-5] detail page shows ${label} = ${value}`).toBeVisible();
  237 |       }
  238 |     });
  239 |   });
  240 | 
  241 |   test('SCN-008: Adding books to my collection returns 201, echoes the ISBNs and lists them on my account', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  242 |     let user!: User;
  243 |     let res!: ApiResponse<{ books?: { isbn: string }[] }>;
  244 |     const isbns = [data.books.git.isbn as string, data.books.es6.isbn as string];
  245 |     await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
  246 |     await journey.step('When I POST /BookStore/v1/Books with ISBNs 9781449325862 and 9781593277574', async () => {
  247 |       res = await api.post(EP.bookstoreBooks, { headers: bearer(user.token), data: { userId: user.userId, collectionOfIsbns: isbns.map((isbn) => ({ isbn })) } });
  248 |     });
  249 |     await journey.step('Then the response status is 201', async () => {
  250 |       expect(res.status, '[REQ AC-6] POST /BookStore/v1/Books → 201').toBe(REQ.STATUS.S201);
  251 |     });
  252 |     await journey.step('And the response books list exactly the added ISBNs', async () => {
  253 |       expect.soft((res.body?.books ?? []).map((b) => b.isbn).sort(), '[REQ AC-6] response echoes the added ISBNs').toEqual([...isbns].sort());
  254 |     });
  255 |     await journey.step('And GET /Account/v1/User/{UUID} lists both books in my books', async () => {
  256 |       expect((await collectionIsbns(api, user)).sort(), '[REQ AC-6] collection lists the added books').toEqual([...isbns].sort());
  257 |     });
  258 |   });
  259 | 
  260 |   test('SCN-009: A book added through the API appears on the Profile page after signing in', { tag: ['@AC-7', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  261 |     let user!: User;
  262 |     let book!: Book;
  263 |     await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
  264 |     await journey.step('And I added 9781449325862 to my collection through the API', async () => {
  265 |       book = (await readCatalogue(seed, api)).find((b) => b.isbn === data.books.git.isbn) as Book;
  266 |       await addBooksSeed(seed, api, user, [data.books.git.isbn]);
  267 |     });
  268 |     await journey.step('And I am on the sign-in page /login', async () => { await gotoPage(page, '/login'); });
  269 |     await journey.step('When I sign in with my user name and password', async () => { await signIn(page, user, data.user.password); });
  270 |     await journey.step('Then the Profile page lists the book with its title, author and publisher', async () => {
  271 |       await expect(page, 'signed in and on the Profile page').toHaveURL(/\/profile/);
  272 |       const row = rowOf(page, book.title);
  273 |       await expect(row, '[REQ AC-7] Profile lists the added book').toHaveCount(1);
  274 |       await expect.soft(row, '[REQ AC-7] listed book shows its author').toContainText(book.author);
  275 |       await expect.soft(row, '[REQ AC-7] listed book shows its publisher').toContainText(book.publisher);
  276 |     });
  277 |   });
  278 | 
  279 |   test('SCN-010: Adding a book already in my collection is rejected and the book stays once', { tag: ['@AC-8', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  280 |     let user!: User;
  281 |     let res!: ApiResponse;
  282 |     const isbn = data.books.git.isbn as string;
  283 |     await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
  284 |     await journey.step('And I added 9781449325862 to my collection through the API', async () => { await addBooksSeed(seed, api, user, [isbn]); });
  285 |     await journey.step('When I POST /BookStore/v1/Books with 9781449325862 again', async () => {
  286 |       res = await api.post(EP.bookstoreBooks, { headers: bearer(user.token), data: { userId: user.userId, collectionOfIsbns: [{ isbn }] } });
  287 |     });
  288 |     await journey.step('Then the response status is 400', async () => {
  289 |       expect.soft(res.status, '[REQ AC-8] duplicate add → 400').toBe(REQ.E4_ALREADY_PRESENT.status);
  290 |     });
  291 |     await journey.step('And the error is code "1210" with message "ISBN already present in the User\'s Collection!"', async () => {
  292 |       const body = (res.body ?? {}) as ApiError;
  293 |       expect.soft(body.code, '[REQ AC-8] error code "1210"').toBe(REQ.E4_ALREADY_PRESENT.code);
  294 |       expect.soft(body.message, '[REQ AC-8] error message').toBe(REQ.E4_ALREADY_PRESENT.message);
  295 |     });
  296 |     await journey.step('And GET /Account/v1/User/{UUID} lists 9781449325862 exactly once', async () => {
  297 |       expect((await collectionIsbns(api, user)).filter((x) => x === isbn), '[REQ AC-8] the book is in the collection exactly once').toEqual([isbn]);
  298 |     });
  299 |   });
  300 | 
  301 |   test('SCN-011: Deleting one book on the Profile page removes only that book', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  302 |     let user!: User;
  303 |     const git = data.books.git; const es6 = data.books.es6;
  304 |     await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
  305 |     await journey.step('And I added 9781449325862 and 9781593277574 to my collection through the API', async () => { await addBooksSeed(seed, api, user, [git.isbn, es6.isbn]); });
  306 |     await journey.step('And I signed in on /login and I am on the Profile page', async () => {
  307 |       await gotoPage(page, '/login');
  308 |       await signIn(page, user, data.user.password);
> 309 |       await expect(page, 'signed in and on the Profile page (precondition)').toHaveURL(/\/profile/);
      |                                                                              ^ Error: signed in and on the Profile page (precondition)
  310 |       await expect(rowOf(page, git.title), 'seeded book listed (precondition)').toHaveCount(1);
  311 |     });
  312 |     await journey.step('When I click the delete icon of the "Git Pocket Guide" row', async () => {
  313 |       await rowOf(page, git.title).getByTitle('Delete').click();
  314 |     });
  315 |     await journey.step('Then the confirmation "Do you want to delete this book?" is shown', async () => {
  316 |       await expect(page.getByRole('dialog').getByText(REQ.DELETE_CONFIRMATION), '[REQ AC-9] confirmation text').toBeVisible();
  317 |     });
  318 |     await journey.step('When I confirm with OK', async () => {
  319 |       await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click();
  320 |     });
  321 |     await journey.step('Then the "Git Pocket Guide" row is removed and "Understanding ECMAScript 6" remains', async () => {
  322 |       await expect.soft(rowOf(page, git.title), '[REQ AC-9] deleted row is removed').toHaveCount(0);
  323 |       await expect.soft(rowOf(page, es6.title), '[REQ AC-9] other book remains').toHaveCount(1);
  324 |     });
  325 |     await journey.step('And GET /Account/v1/User/{UUID} no longer lists 9781449325862 and still lists 9781593277574', async () => {
  326 |       user = await refreshToken(seed, api, user, data);
  327 |       expect(await collectionIsbns(api, user), '[REQ AC-9] API collection after the UI delete').toEqual([es6.isbn]);
  328 |     });
  329 |   });
  330 | 
  331 |   test('SCN-012: Deleting one book through the API returns 204 and keeps the others', { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  332 |     let user!: User;
  333 |     let res!: ApiResponse;
  334 |     const git = data.books.git.isbn as string; const es6 = data.books.es6.isbn as string;
  335 |     await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
  336 |     await journey.step('And I added 9781449325862 and 9781593277574 to my collection through the API', async () => { await addBooksSeed(seed, api, user, [git, es6]); });
  337 |     await journey.step('When I DELETE /BookStore/v1/Book with 9781449325862', async () => {
  338 |       res = await api.delete(EP.bookstoreBook, { headers: bearer(user.token), data: { isbn: git, userId: user.userId } });
  339 |     });
  340 |     await journey.step('Then the response status is 204', async () => {
  341 |       expect.soft(res.status, '[REQ AC-10] DELETE /BookStore/v1/Book → 204').toBe(REQ.STATUS.S204);
  342 |     });
  343 |     await journey.step('And GET /Account/v1/User/{UUID} no longer lists 9781449325862 and still lists 9781593277574', async () => {
  344 |       expect(await collectionIsbns(api, user), '[REQ AC-10] only the deleted book is gone').toEqual([es6]);
  345 |     });
  346 |   });
  347 | 
  348 |   test('SCN-013: Deleting a book that is not in my collection is rejected', { tag: ['@AC-10', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  349 |     let user!: User;
  350 |     let res!: ApiResponse;
  351 |     await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
  352 |     await journey.step('And I added 9781593277574 to my collection through the API', async () => { await addBooksSeed(seed, api, user, [data.books.es6.isbn]); });
  353 |     await journey.step('When I DELETE /BookStore/v1/Book with 9781449325862, which is not in my collection', async () => {
  354 |       res = await api.delete(EP.bookstoreBook, { headers: bearer(user.token), data: { isbn: data.books.git.isbn, userId: user.userId } });
  355 |     });
  356 |     await journey.step('Then the response status is 400', async () => {
  357 |       expect.soft(res.status, '[REQ AC-10] delete of a book not in the collection → 400').toBe(REQ.E3_NOT_IN_COLLECTION.status);
  358 |     });
  359 |     await journey.step('And the error is code "1206" with message "ISBN supplied is not available in User\'s Collection!"', async () => {
  360 |       const body = (res.body ?? {}) as ApiError;
  361 |       expect.soft(body.code, '[REQ AC-10] error code "1206"').toBe(REQ.E3_NOT_IN_COLLECTION.code);
  362 |       expect.soft(body.message, '[REQ AC-10] error message').toBe(REQ.E3_NOT_IN_COLLECTION.message);
  363 |     });
  364 |   });
  365 | 
  366 |   test('SCN-014: Looking up an ISBN that is not in the catalogue is rejected', { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  367 |     let isbn = '';
  368 |     let res!: ApiResponse;
  369 |     await journey.step('Given an ISBN that is not in the catalogue returned by GET /BookStore/v1/Books', async () => { isbn = await unknownIsbn(seed, api, data); });
  370 |     await journey.step('When I GET /BookStore/v1/Book?ISBN=<that ISBN>', async () => { res = await api.get(EP.bookstoreBook, { params: { ISBN: isbn } }); });
  371 |     await journey.step('Then the response status is 400', async () => {
  372 |       expect.soft(res.status, '[REQ AC-11] lookup of an unknown ISBN → 400').toBe(REQ.E2_NOT_IN_CATALOGUE.status);
  373 |     });
  374 |     await journey.step('And the error is code "1205" with message "ISBN supplied is not available in Books Collection!"', async () => {
  375 |       const body = (res.body ?? {}) as ApiError;
  376 |       expect.soft(body.code, '[REQ AC-11] error code "1205"').toBe(REQ.E2_NOT_IN_CATALOGUE.code);
  377 |       expect.soft(body.message, '[REQ AC-11] error message').toBe(REQ.E2_NOT_IN_CATALOGUE.message);
  378 |     });
  379 |   });
  380 | 
  381 |   test('SCN-015: Adding an ISBN that is not in the catalogue is rejected and nothing is added', { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  382 |     let user!: User;
  383 |     let isbn = '';
  384 |     let res!: ApiResponse;
  385 |     await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
  386 |     await journey.step('And an ISBN that is not in the catalogue returned by GET /BookStore/v1/Books', async () => { isbn = await unknownIsbn(seed, api, data); });
  387 |     await journey.step('When I POST /BookStore/v1/Books with that ISBN', async () => {
  388 |       res = await api.post(EP.bookstoreBooks, { headers: bearer(user.token), data: { userId: user.userId, collectionOfIsbns: [{ isbn }] } });
  389 |     });
  390 |     await journey.step('Then the response status is 400', async () => {
  391 |       expect.soft(res.status, '[REQ AC-11] add of an unknown ISBN → 400').toBe(REQ.E2_NOT_IN_CATALOGUE.status);
  392 |     });
  393 |     await journey.step('And the error is code "1205" with message "ISBN supplied is not available in Books Collection!"', async () => {
  394 |       const body = (res.body ?? {}) as ApiError;
  395 |       expect.soft(body.code, '[REQ AC-11] error code "1205"').toBe(REQ.E2_NOT_IN_CATALOGUE.code);
  396 |       expect.soft(body.message, '[REQ AC-11] error message').toBe(REQ.E2_NOT_IN_CATALOGUE.message);
  397 |     });
  398 |     await journey.step('And GET /Account/v1/User/{UUID} shows my collection is still empty', async () => {
  399 |       expect(await collectionIsbns(api, user), '[REQ AC-11] nothing was added').toEqual([]);
  400 |     });
  401 |   });
  402 | 
  403 |   // AC-12 rows: which call, and with which credentials (plumbing, not expected values).
  404 |   type AuthCase = { call: string; auth: string; run: (api: Api, me: User, other: User, data: TestData) => Promise<ApiResponse> };
  405 |   const add = (api: Api, userId: string, isbn: string, headers: Record<string, string>) => api.post(EP.bookstoreBooks, { headers, data: { userId, collectionOfIsbns: [{ isbn }] } });
  406 |   const AUTH_CASES: AuthCase[] = [
  407 |     { call: 'POST /BookStore/v1/Books for my user', auth: 'without a token', run: (api, me, _o, d) => add(api, me.userId, d.books.git.isbn, {}) },
  408 |     { call: 'DELETE /BookStore/v1/Book for my user', auth: 'without a token', run: (api, me, _o, d) => api.delete(EP.bookstoreBook, { data: { isbn: d.books.git.isbn, userId: me.userId } }) },
  409 |     { call: 'GET /Account/v1/User/{my UUID}', auth: 'without a token', run: (api, me) => api.get(EP.accountUserByUUID(me.userId)) },
```