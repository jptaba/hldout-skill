# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DQ-2\tests\dq-2.spec.ts >> DQ-2 Personal book collection - browse the catalogue and manage my books >> SCN-011: Deleting one book on the Profile page removes only that book
- Location: evaluations\DQ-2\tests\dq-2.spec.ts:290:3

# Error details

```
Error: read my collection (GET /Account/v1/User/{UUID})

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 401
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link [ref=e4] [cursor=pointer]:
      - /url: https://demoqa.com
  - generic [ref=e8]:
    - generic [ref=e11]:
      - generic [ref=e12]: Elements
      - generic [ref=e24]: Forms
      - generic [ref=e37]: Alerts, Frame & Windows
      - generic [ref=e49]: Widgets
      - generic [ref=e62]: Interactions
      - generic [ref=e74]:
        - generic [ref=e75] [cursor=pointer]: Book Store Application
        - list [ref=e87]:
          - listitem [ref=e88] [cursor=pointer]:
            - link "Login" [ref=e89]:
              - /url: /login
          - listitem [ref=e92] [cursor=pointer]:
            - link "Book Store" [ref=e93]:
              - /url: /books
          - listitem [ref=e96] [cursor=pointer]:
            - link "Profile" [ref=e97]:
              - /url: /profile
          - listitem [ref=e100] [cursor=pointer]:
            - link "Book Store API" [ref=e101]:
              - /url: /swagger
    - generic [ref=e105]:
      - generic [ref=e106]:
        - generic [ref=e107]: "Books :"
        - generic [ref=e109]:
          - generic [ref=e110]: "User Name :"
          - generic [ref=e111]: qa-dq2-mujsakzdle5vc
          - button "Logout" [ref=e112] [cursor=pointer]
        - generic [ref=e114]:
          - textbox "Type to search" [ref=e115]
          - button [ref=e116] [cursor=pointer]
      - generic [ref=e119]:
        - table [ref=e120]:
          - rowgroup [ref=e121]:
            - row [ref=e122]:
              - columnheader "Image" [ref=e123]
              - columnheader "Title" [ref=e125] [cursor=pointer]
              - columnheader "Author" [ref=e127] [cursor=pointer]
              - columnheader "Publisher" [ref=e129] [cursor=pointer]
              - columnheader "Action" [ref=e131]
          - rowgroup [ref=e133]:
            - row [ref=e134]:
              - cell [ref=e135]:
                - img "book-image" [ref=e136]
              - cell [ref=e137]:
                - link "Understanding ECMAScript 6" [ref=e140] [cursor=pointer]:
                  - /url: /books?search=9781593277574
              - cell "Nicholas C. Zakas" [ref=e141]
              - cell "No Starch Press" [ref=e142]
              - cell [ref=e143]:
                - generic "Delete" [ref=e145]
        - generic [ref=e149]:
          - button "Previous" [disabled]
          - generic [ref=e150]: Page 1 of 1
          - button "Next" [disabled]
      - generic [ref=e151]:
        - button "Go To Book Store" [ref=e153] [cursor=pointer]
        - button "Delete Account" [ref=e155] [cursor=pointer]
        - button "Delete All Books" [ref=e157] [cursor=pointer]
  - contentinfo [ref=e164]:
    - generic [ref=e165]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```

# Test source

```ts
  1   | /**
  2   |  * Held-out acceptance tests for DQ-2 — "Personal book collection - browse the catalogue and manage my books".
  3   |  * Written from evaluations/DQ-2/scenarios.feature (requirement + attachments only; never from the AUT's code).
  4   |  */
  5   | import type { Locator, Page } from '@playwright/test';
  6   | import { test, expect, gotoPage, checkShape, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';
  7   | 
  8   | // @req-constants-start — expected outcomes copied verbatim from DQ-2 (never edit during hardening)
  9   | const REQ = {
  10  |   STATUS: { S200: 200, S201: 201, S204: 204, S400: 400, S401: 401 },
  11  |   CATALOGUE_FIELDS: ['isbn', 'title', 'subTitle', 'author', 'publish_date', 'publisher', 'pages', 'description', 'website'],
  12  |   LOOKUP_ISBNS: ['9781449325862', '9781593277574', '9781449331818'],
  13  |   SEARCH_PLACEHOLDER: 'Type to search',
  14  |   SEARCH_EXAMPLES: [
  15  |     { term: 'javascript', titles: ['Learning JavaScript Design Patterns', 'Speaking JavaScript', 'Programming JavaScript Applications', 'Eloquent JavaScript, Second Edition'] },
  16  |     { term: 'zakas', titles: ['Understanding ECMAScript 6'] },
  17  |     { term: 'No Starch', titles: ['Eloquent JavaScript, Second Edition', 'Understanding ECMAScript 6'] },
  18  |     { term: 'JAVASCRIPT', titles: ['Learning JavaScript Design Patterns', 'Speaking JavaScript', 'Programming JavaScript Applications', 'Eloquent JavaScript, Second Edition'] },
  19  |   ],
  20  |   DETAIL_BOOK: { isbn: '9781449325862', title: 'Git Pocket Guide' },
  21  |   DELETE_CONFIRMATION: 'Do you want to delete this book?',
  22  |   E1_NOT_AUTHORIZED: { status: 401, code: '1200', message: 'User not authorized!' },
  23  |   E2_NOT_IN_CATALOGUE: { status: 400, code: '1205', message: 'ISBN supplied is not available in Books Collection!' },
  24  |   E3_NOT_IN_COLLECTION: { status: 400, code: '1206', message: "ISBN supplied is not available in User's Collection!" },
  25  |   E4_ALREADY_PRESENT: { status: 400, code: '1210', message: "ISBN already present in the User's Collection!" },
  26  |   ISO_8601: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
  27  | } as const;
  28  | // @req-constants-end
  29  | 
  30  | // Endpoints exactly as declared in the requirement.
  31  | const EP = {
  32  |   /** GET, POST, DELETE /BookStore/v1/Books */ bookstoreBooks: '/BookStore/v1/Books',
  33  |   /** GET, DELETE /BookStore/v1/Book */ bookstoreBook: '/BookStore/v1/Book',
  34  |   /** GET, DELETE /Account/v1/User/{UUID} */ accountUserByUUID: (UUID: string | number) => `/Account/v1/User/${UUID}`,
  35  |   /** POST /Account/v1/User */ accountUser: '/Account/v1/User',
  36  |   /** POST /Account/v1/GenerateToken */ accountGenerateToken: '/Account/v1/GenerateToken',
  37  | };
  38  | 
  39  | interface Book { isbn: string; title: string; subTitle: string; author: string; publish_date: string; publisher: string; pages: number; description: string; website: string }
  40  | interface User { userId: string; userName: string; token: string }
  41  | interface ApiError { code?: unknown; message?: unknown }
  42  | 
  43  | const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
  44  | const userName = (data: TestData) => `${data.user.namePrefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  45  | 
  46  | /** Given I created my own user and obtained a token (seed; deleted after the test). */
  47  | async function createUser(seed: Seed, api: Api, data: TestData, label = 'my user'): Promise<User> {
  48  |   return seed.create(`${label} (POST /Account/v1/User + POST /Account/v1/GenerateToken)`, async () => {
  49  |     const name = userName(data);
  50  |     const password = data.user.password as string;
  51  |     const created = await api.post<{ userID?: string }>(EP.accountUser, { data: { userName: name, password } }); // G1: { userName, password } discovered in hardening (api-mechanics.md)
  52  |     expect(created.status, 'create user (seed)').toBe(201);
  53  |     expect(created.body.userID, 'create user returned a userID (seed)').toBeTruthy();
  54  |     const tok = await api.post<{ token?: string }>(EP.accountGenerateToken, { data: { userName: name, password } });
  55  |     expect(tok.body.token, 'GenerateToken returned a token (seed)').toBeTruthy();
  56  |     return { userId: created.body.userID as string, userName: name, token: tok.body.token as string };
  57  |   }, async (u) => {
  58  |     const r = await api.delete(EP.accountUserByUUID(u.userId), { headers: bearer(u.token) });
  59  |     if (r.status !== 204 && r.status !== 200) throw new Error(`delete user ${u.userId} → ${r.status}`);
  60  |   });
  61  | }
  62  | 
  63  | /** Given I added <isbns> to my collection through the API (seed; removed with the user). */
  64  | async function addBooksSeed(seed: Seed, api: Api, user: User, isbns: string[]): Promise<void> {
  65  |   await seed.step(`add ${isbns.join(', ')} to my collection (POST /BookStore/v1/Books)`, async () => {
  66  |     const r = await api.post(EP.bookstoreBooks, { headers: bearer(user.token), data: { userId: user.userId, collectionOfIsbns: isbns.map((isbn) => ({ isbn })) } });
  67  |     expect(r.status, 'add books (seed)').toBeLessThan(300);
  68  |   });
  69  | }
  70  | 
  71  | async function readCatalogue(seed: Seed, api: Api): Promise<Book[]> {
  72  |   return seed.step('read the catalogue (GET /BookStore/v1/Books)', async () => {
  73  |     const r = await api.get<{ books?: Book[] }>(EP.bookstoreBooks);
  74  |     expect(Array.isArray(r.body.books) && r.body.books.length > 0, 'catalogue has books (precondition)').toBe(true);
  75  |     return r.body.books as Book[];
  76  |   });
  77  | }
  78  | 
  79  | async function unknownIsbn(seed: Seed, api: Api, data: TestData): Promise<string> {
  80  |   const books = await readCatalogue(seed, api);
  81  |   const known = new Set(books.map((b) => b.isbn));
  82  |   const isbn = (data.unknownIsbnCandidates as string[]).find((c) => !known.has(c));
  83  |   expect(isbn, 'an ISBN absent from the catalogue (precondition)').toBeTruthy();
  84  |   return isbn as string;
  85  | }
  86  | 
  87  | /** The ISBNs in the user's collection, read with the owner's token. */
  88  | async function collectionIsbns(api: Api, user: User): Promise<string[]> {
  89  |   const r = await api.get<{ books?: { isbn: string }[] }>(EP.accountUserByUUID(user.userId), { headers: bearer(user.token) });
> 90  |   expect(r.status, 'read my collection (GET /Account/v1/User/{UUID})').toBe(200);
      |                                                                        ^ Error: read my collection (GET /Account/v1/User/{UUID})
  91  |   return (r.body.books ?? []).map((b) => b.isbn);
  92  | }
  93  | 
  94  | // ---- UI mechanics -------------------------------------------------------------------------------
  95  | const searchBox = (page: Page) => page.getByPlaceholder(REQ.SEARCH_PLACEHOLDER);
  96  | const bookRows = (page: Page) => page.getByRole('row').filter({ has: page.getByRole('link') });
  97  | const rowOf = (page: Page, title: string): Locator => bookRows(page).filter({ has: page.getByRole('link', { name: title, exact: true }) });
  98  | async function visibleTitles(page: Page): Promise<string[]> {
  99  |   return (await bookRows(page).getByRole('link').allInnerTexts()).map((t) => t.trim()).sort();
  100 | }
  101 | 
  102 | async function signIn(page: Page, user: User, password: string) {
  103 |   await page.getByRole('textbox', { name: 'UserName' }).fill(user.userName);
  104 |   await page.getByRole('textbox', { name: 'Password' }).fill(password);
  105 |   await page.getByRole('button', { name: 'Login', exact: true }).click();
  106 | }
  107 | 
  108 | test.describe('DQ-2 Personal book collection - browse the catalogue and manage my books', () => {
  109 |   test('SCN-001: The catalogue API returns every book with all catalogue fields', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  110 |     let res!: ApiResponse<{ books?: Record<string, unknown>[] }>;
  111 |     await journey.step('When I GET /BookStore/v1/Books', async () => { res = await api.get(EP.bookstoreBooks); });
  112 |     await journey.step('Then the response status is 200', async () => {
  113 |       expect(res.status, '[REQ AC-1] GET /BookStore/v1/Books → 200').toBe(REQ.STATUS.S200);
  114 |     });
  115 |     await journey.step('And the body has a books list', async () => {
  116 |       expect(Array.isArray(res.body?.books), '[REQ AC-1] body has a books list').toBe(true);
  117 |     });
  118 |     await journey.step('And every entry in books carries isbn, title, subTitle, author, publish_date, publisher, pages, description and website', async () => {
  119 |       const missing = (res.body?.books ?? []).flatMap((b, i) => REQ.CATALOGUE_FIELDS.filter((f) => !(f in b)).map((f) => `books[${i}] (${String(b.isbn)}) lacks ${f}`));
  120 |       expect(missing, '[REQ AC-1] every entry carries all catalogue fields').toEqual([]);
  121 |     });
  122 |   });
  123 | 
  124 |   test('SCN-002: Every catalogue entry has the field types of the Book object', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  125 |     let res!: ApiResponse<{ books?: Record<string, unknown>[] }>;
  126 |     await journey.step('When I GET /BookStore/v1/Books', async () => { res = await api.get(EP.bookstoreBooks); });
  127 |     await journey.step("Then every entry's isbn, title, subTitle, author, publisher, description and website are strings, pages is a number and publish_date is an ISO-8601 string", async () => {
  128 |       const shape = {
  129 |         isbn: 'string', title: 'string', subTitle: 'string', author: 'string', publisher: 'string', description: 'string', website: 'string', pages: 'number',
  130 |         publish_date: (v: unknown) => (typeof v === 'string' && REQ.ISO_8601.test(v)) || 'is not an ISO-8601 string',
  131 |       } as const;
  132 |       const violations = (res.body?.books ?? []).flatMap((b, i) => checkShape(b, shape, `books[${i}]`));
  133 |       expect(violations, '[REQ AC-1] Book object field types (api-contract.md#L28-L38)').toEqual([]);
  134 |     });
  135 |   });
  136 | 
  137 |   REQ.LOOKUP_ISBNS.forEach((isbn, i) => {
  138 |     test(`SCN-003.${i + 1}: Looking up one book returns the same data as its catalogue entry (${isbn})`, { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  139 |       let entry: Book | undefined;
  140 |       let res!: ApiResponse<Book>;
  141 |       await journey.step(`Given I read the catalogue entry for ${isbn} from GET /BookStore/v1/Books`, async () => {
  142 |         entry = (await readCatalogue(seed, api)).find((b) => b.isbn === isbn);
  143 |         expect(entry, `catalogue lists ${isbn} (precondition)`).toBeTruthy();
  144 |       });
  145 |       await journey.step(`When I GET /BookStore/v1/Book?ISBN=${isbn}`, async () => { res = await api.get(EP.bookstoreBook, { params: { ISBN: isbn } }); });
  146 |       await journey.step('Then the response status is 200', async () => {
  147 |         expect(res.status, '[REQ AC-2] lookup → 200').toBe(REQ.STATUS.S200);
  148 |       });
  149 |       await journey.step('And the returned book equals the catalogue entry', async () => {
  150 |         expect(res.body, '[REQ AC-2] same data as the catalogue entry').toEqual(entry);
  151 |       });
  152 |     });
  153 |   });
  154 | 
  155 |   test('SCN-004: The Book Store page lists every catalogue book with title, author and publisher', { tag: ['@AC-3', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
  156 |     let books: Book[] = [];
  157 |     await journey.step('Given I read the catalogue from GET /BookStore/v1/Books', async () => { books = await readCatalogue(seed, api); });
  158 |     await journey.step('And I am on the Book Store page /books', async () => {
  159 |       await gotoPage(page, '/books');
  160 |       await expect(searchBox(page), 'Book Store page rendered (precondition)').toBeVisible();
  161 |     });
  162 |     await journey.step('Then every catalogue book is listed on the page', async () => {
  163 |       await expect(bookRows(page).first(), 'book rows rendered (precondition)').toBeVisible();
  164 |       const titles = await visibleTitles(page);
  165 |       const missing = books.map((b) => b.title).filter((t) => !titles.includes(t));
  166 |       expect(missing, '[REQ AC-3] every catalogue book is listed on /books').toEqual([]);
  167 |     });
  168 |     await journey.step('And each listed book shows its title, author and publisher', async () => {
  169 |       for (const b of books) {
  170 |         const row = rowOf(page, b.title);
  171 |         if (!(await row.count())) continue; // absence is already reported by the previous step
  172 |         await expect.soft(row.first(), `[REQ AC-3] ${b.title} shows its author`).toContainText(b.author);
  173 |         await expect.soft(row.first(), `[REQ AC-3] ${b.title} shows its publisher`).toContainText(b.publisher);
  174 |       }
  175 |     });
  176 |   });
  177 | 
  178 |   REQ.SEARCH_EXAMPLES.forEach((ex, i) => {
  179 |     test(`SCN-005.${i + 1}: Searching filters the list while typing, case-insensitively (${ex.term})`, { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  180 |       await journey.step('Given I am on the Book Store page /books', async () => {
  181 |         await gotoPage(page, '/books');
  182 |         await expect(bookRows(page).first(), 'book rows rendered (precondition)').toBeVisible();
  183 |       });
  184 |       await journey.step(`When I type "${ex.term}" into the search box with placeholder "Type to search" without submitting`, async () => {
  185 |         await expect(searchBox(page), '[REQ AC-4 strict] search box with placeholder "Type to search"').toBeVisible();
  186 |         await searchBox(page).pressSequentially(ex.term);
  187 |       });
  188 |       await journey.step(`Then exactly the books ${ex.titles.join('; ')} are listed`, async () => {
  189 |         await expect.poll(() => visibleTitles(page), { message: `[REQ AC-4] "${ex.term}" shows exactly the expected books` }).toEqual([...ex.titles].sort());
  190 |       });
```