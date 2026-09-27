/**
 * Held-out acceptance tests for DQ-2 — "Personal book collection - browse the catalogue and manage my books".
 * Written from evaluations/DQ-2/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Locator, Page } from '@playwright/test';
import { test, expect, gotoPage, checkShape, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from DQ-2 (never edit during hardening)
const REQ = {
  STATUS: { S200: 200, S201: 201, S204: 204, S400: 400, S401: 401 },
  CATALOGUE_FIELDS: ['isbn', 'title', 'subTitle', 'author', 'publish_date', 'publisher', 'pages', 'description', 'website'],
  LOOKUP_ISBNS: ['9781449325862', '9781593277574', '9781449331818'],
  SEARCH_PLACEHOLDER: 'Type to search',
  SEARCH_EXAMPLES: [
    { term: 'javascript', titles: ['Learning JavaScript Design Patterns', 'Speaking JavaScript', 'Programming JavaScript Applications', 'Eloquent JavaScript, Second Edition'] },
    { term: 'zakas', titles: ['Understanding ECMAScript 6'] },
    { term: 'No Starch', titles: ['Eloquent JavaScript, Second Edition', 'Understanding ECMAScript 6'] },
    { term: 'JAVASCRIPT', titles: ['Learning JavaScript Design Patterns', 'Speaking JavaScript', 'Programming JavaScript Applications', 'Eloquent JavaScript, Second Edition'] },
  ],
  DETAIL_BOOK: { isbn: '9781449325862', title: 'Git Pocket Guide' },
  DELETE_CONFIRMATION: 'Do you want to delete this book?',
  E1_NOT_AUTHORIZED: { status: 401, code: '1200', message: 'User not authorized!' },
  E2_NOT_IN_CATALOGUE: { status: 400, code: '1205', message: 'ISBN supplied is not available in Books Collection!' },
  E3_NOT_IN_COLLECTION: { status: 400, code: '1206', message: "ISBN supplied is not available in User's Collection!" },
  E4_ALREADY_PRESENT: { status: 400, code: '1210', message: "ISBN already present in the User's Collection!" },
  ISO_8601: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** GET, POST, DELETE /BookStore/v1/Books */ bookstoreBooks: '/BookStore/v1/Books',
  /** GET, DELETE /BookStore/v1/Book */ bookstoreBook: '/BookStore/v1/Book',
  /** GET, DELETE /Account/v1/User/{UUID} */ accountUserByUUID: (UUID: string | number) => `/Account/v1/User/${UUID}`,
  /** POST /Account/v1/User */ accountUser: '/Account/v1/User',
  /** POST /Account/v1/GenerateToken */ accountGenerateToken: '/Account/v1/GenerateToken',
};

interface Book { isbn: string; title: string; subTitle: string; author: string; publish_date: string; publisher: string; pages: number; description: string; website: string }
interface User { userId: string; userName: string; token: string }
interface ApiError { code?: unknown; message?: unknown }

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
const userName = (data: TestData) => `${data.user.namePrefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Given I created my own user and obtained a token (seed; deleted after the test). */
async function createUser(seed: Seed, api: Api, data: TestData, label = 'my user'): Promise<User> {
  return seed.create(`${label} (POST /Account/v1/User + POST /Account/v1/GenerateToken)`, async () => {
    const name = userName(data);
    const password = data.user.password as string;
    const created = await api.post<{ userID?: string }>(EP.accountUser, { data: { userName: name, password } }); // G1: { userName, password } discovered in hardening (api-mechanics.md)
    expect(created.status, 'create user (seed)').toBe(201);
    expect(created.body.userID, 'create user returned a userID (seed)').toBeTruthy();
    const tok = await api.post<{ token?: string }>(EP.accountGenerateToken, { data: { userName: name, password } });
    expect(tok.body.token, 'GenerateToken returned a token (seed)').toBeTruthy();
    return { userId: created.body.userID as string, userName: name, token: tok.body.token as string };
  }, async (u) => {
    // A newer sign-in (UI login or GenerateToken) revokes earlier tokens (hardening/token-rotation.md): take a fresh one.
    const tok = await api.post<{ token?: string }>(EP.accountGenerateToken, { data: { userName: u.userName, password: data.user.password } });
    const r = await api.delete(EP.accountUserByUUID(u.userId), { headers: bearer(tok.body.token ?? u.token) });
    if (r.status !== 204 && r.status !== 200) throw new Error(`delete user ${u.userId} → ${r.status}`);
  });
}

/** A UI sign-in issues a new token and revokes the one the test holds (hardening/token-rotation.md). */
async function refreshToken(seed: Seed, api: Api, user: User, data: TestData): Promise<User> {
  return seed.step('fresh API token after the UI sign-in (POST /Account/v1/GenerateToken)', async () => {
    const tok = await api.post<{ token?: string }>(EP.accountGenerateToken, { data: { userName: user.userName, password: data.user.password } });
    expect(tok.body.token, 'GenerateToken returned a token (seed)').toBeTruthy();
    return { ...user, token: tok.body.token as string };
  });
}

/** Given I added <isbns> to my collection through the API (seed; removed with the user). */
async function addBooksSeed(seed: Seed, api: Api, user: User, isbns: string[]): Promise<void> {
  await seed.step(`add ${isbns.join(', ')} to my collection (POST /BookStore/v1/Books)`, async () => {
    const r = await api.post(EP.bookstoreBooks, { headers: bearer(user.token), data: { userId: user.userId, collectionOfIsbns: isbns.map((isbn) => ({ isbn })) } });
    expect(r.status, 'add books (seed)').toBeLessThan(300);
  });
}

async function readCatalogue(seed: Seed, api: Api): Promise<Book[]> {
  return seed.step('read the catalogue (GET /BookStore/v1/Books)', async () => {
    const r = await api.get<{ books?: Book[] }>(EP.bookstoreBooks);
    expect(Array.isArray(r.body.books) && r.body.books.length > 0, 'catalogue has books (precondition)').toBe(true);
    return r.body.books as Book[];
  });
}

async function unknownIsbn(seed: Seed, api: Api, data: TestData): Promise<string> {
  const books = await readCatalogue(seed, api);
  const known = new Set(books.map((b) => b.isbn));
  const isbn = (data.unknownIsbnCandidates as string[]).find((c) => !known.has(c));
  expect(isbn, 'an ISBN absent from the catalogue (precondition)').toBeTruthy();
  return isbn as string;
}

/** The ISBNs in the user's collection, read with the owner's token. */
async function collectionIsbns(api: Api, user: User): Promise<string[]> {
  const r = await api.get<{ books?: { isbn: string }[] }>(EP.accountUserByUUID(user.userId), { headers: bearer(user.token) });
  expect(r.status, 'read my collection (GET /Account/v1/User/{UUID})').toBe(200);
  return (r.body.books ?? []).map((b) => b.isbn);
}

// ---- UI mechanics -------------------------------------------------------------------------------
const searchBox = (page: Page) => page.getByPlaceholder(REQ.SEARCH_PLACEHOLDER);
const bookRows = (page: Page) => page.getByRole('row').filter({ has: page.getByRole('link') });
const rowOf = (page: Page, title: string): Locator => bookRows(page).filter({ has: page.getByRole('link', { name: title, exact: true }) });
async function visibleTitles(page: Page): Promise<string[]> {
  return (await bookRows(page).getByRole('link').allInnerTexts()).map((t) => t.trim()).sort();
}

async function signIn(page: Page, user: User, password: string) {
  await page.getByRole('textbox', { name: 'UserName' }).fill(user.userName);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
}

test.describe('DQ-2 Personal book collection - browse the catalogue and manage my books', () => {
  test('SCN-001: The catalogue API returns every book with all catalogue fields', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse<{ books?: Record<string, unknown>[] }>;
    await journey.step('When I GET /BookStore/v1/Books', async () => { res = await api.get(EP.bookstoreBooks); });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-1] GET /BookStore/v1/Books → 200').toBe(REQ.STATUS.S200);
    });
    await journey.step('And the body has a books list', async () => {
      expect(Array.isArray(res.body?.books), '[REQ AC-1] body has a books list').toBe(true);
    });
    await journey.step('And every entry in books carries isbn, title, subTitle, author, publish_date, publisher, pages, description and website', async () => {
      const missing = (res.body?.books ?? []).flatMap((b, i) => REQ.CATALOGUE_FIELDS.filter((f) => !(f in b)).map((f) => `books[${i}] (${String(b.isbn)}) lacks ${f}`));
      expect(missing, '[REQ AC-1] every entry carries all catalogue fields').toEqual([]);
    });
  });

  test('SCN-002: Every catalogue entry has the field types of the Book object', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
    let res!: ApiResponse<{ books?: Record<string, unknown>[] }>;
    await journey.step('When I GET /BookStore/v1/Books', async () => { res = await api.get(EP.bookstoreBooks); });
    await journey.step("Then every entry's isbn, title, subTitle, author, publisher, description and website are strings, pages is a number and publish_date is an ISO-8601 string", async () => {
      const shape = {
        isbn: 'string', title: 'string', subTitle: 'string', author: 'string', publisher: 'string', description: 'string', website: 'string', pages: 'number',
        publish_date: (v: unknown) => (typeof v === 'string' && REQ.ISO_8601.test(v)) || 'is not an ISO-8601 string',
      } as const;
      const violations = (res.body?.books ?? []).flatMap((b, i) => checkShape(b, shape, `books[${i}]`));
      expect(violations, '[REQ AC-1] Book object field types (api-contract.md#L28-L38)').toEqual([]);
    });
  });

  REQ.LOOKUP_ISBNS.forEach((isbn, i) => {
    test(`SCN-003.${i + 1}: Looking up one book returns the same data as its catalogue entry (${isbn})`, { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let entry: Book | undefined;
      let res!: ApiResponse<Book>;
      await journey.step(`Given I read the catalogue entry for ${isbn} from GET /BookStore/v1/Books`, async () => {
        entry = (await readCatalogue(seed, api)).find((b) => b.isbn === isbn);
        expect(entry, `catalogue lists ${isbn} (precondition)`).toBeTruthy();
      });
      await journey.step(`When I GET /BookStore/v1/Book?ISBN=${isbn}`, async () => { res = await api.get(EP.bookstoreBook, { params: { ISBN: isbn } }); });
      await journey.step('Then the response status is 200', async () => {
        expect(res.status, '[REQ AC-2] lookup → 200').toBe(REQ.STATUS.S200);
      });
      await journey.step('And the returned book equals the catalogue entry', async () => {
        expect(res.body, '[REQ AC-2] same data as the catalogue entry').toEqual(entry);
      });
    });
  });

  test('SCN-004: The Book Store page lists every catalogue book with title, author and publisher', { tag: ['@AC-3', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
    let books: Book[] = [];
    await journey.step('Given I read the catalogue from GET /BookStore/v1/Books', async () => { books = await readCatalogue(seed, api); });
    await journey.step('And I am on the Book Store page /books', async () => {
      await gotoPage(page, '/books');
      await expect(searchBox(page), 'Book Store page rendered (precondition)').toBeVisible();
    });
    await journey.step('Then every catalogue book is listed on the page', async () => {
      await expect(bookRows(page).first(), 'book rows rendered (precondition)').toBeVisible();
      const titles = await visibleTitles(page);
      const missing = books.map((b) => b.title).filter((t) => !titles.includes(t));
      expect(missing, '[REQ AC-3] every catalogue book is listed on /books').toEqual([]);
    });
    await journey.step('And each listed book shows its title, author and publisher', async () => {
      for (const b of books) {
        const row = rowOf(page, b.title);
        if (!(await row.count())) continue; // absence is already reported by the previous step
        await expect.soft(row.first(), `[REQ AC-3] ${b.title} shows its author`).toContainText(b.author);
        await expect.soft(row.first(), `[REQ AC-3] ${b.title} shows its publisher`).toContainText(b.publisher);
      }
    });
  });

  REQ.SEARCH_EXAMPLES.forEach((ex, i) => {
    test(`SCN-005.${i + 1}: Searching filters the list while typing, case-insensitively (${ex.term})`, { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
      await journey.step('Given I am on the Book Store page /books', async () => {
        await gotoPage(page, '/books');
        await expect(bookRows(page).first(), 'book rows rendered (precondition)').toBeVisible();
      });
      await journey.step(`When I type "${ex.term}" into the search box with placeholder "Type to search" without submitting`, async () => {
        await expect(searchBox(page), '[REQ AC-4 strict] search box with placeholder "Type to search"').toBeVisible();
        await searchBox(page).pressSequentially(ex.term);
      });
      await journey.step(`Then exactly the books ${ex.titles.join('; ')} are listed`, async () => {
        await expect.poll(() => visibleTitles(page), { message: `[REQ AC-4] "${ex.term}" shows exactly the expected books` }).toEqual([...ex.titles].sort());
      });
    });
  });

  test('SCN-006: A search term that matches no book leaves no book rows', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
    await journey.step('Given I am on the Book Store page /books', async () => {
      await gotoPage(page, '/books');
      await expect(bookRows(page).first(), 'book rows rendered (precondition)').toBeVisible();
    });
    await journey.step('When I type a term that matches no book into the search box with placeholder "Type to search"', async () => {
      await expect(searchBox(page), '[REQ AC-4 strict] search box with placeholder "Type to search"').toBeVisible();
      await searchBox(page).pressSequentially(data.noMatchSearchTerm as string);
    });
    await journey.step('Then no book rows are listed', async () => {
      await expect(bookRows(page), '[REQ AC-4] no-match term leaves no book rows').toHaveCount(0);
    });
  });

  test('SCN-007: Clicking a book title opens its detail page with the catalogue values', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let entry!: Book;
    await journey.step('Given I read the catalogue entry for 9781449325862 from GET /BookStore/v1/Books', async () => {
      const found = (await readCatalogue(seed, api)).find((b) => b.isbn === REQ.DETAIL_BOOK.isbn);
      expect(found, 'catalogue lists 9781449325862 (precondition)').toBeTruthy();
      entry = found as Book;
    });
    await journey.step('And I am on the Book Store page /books', async () => {
      await gotoPage(page, '/books');
      await expect(bookRows(page).first(), 'book rows rendered (precondition)').toBeVisible();
    });
    await journey.step('When I click the title "Git Pocket Guide"', async () => {
      await page.getByRole('link', { name: REQ.DETAIL_BOOK.title, exact: true }).click();
    });
    await journey.step("Then the book's detail page shows its ISBN, title, sub title, author, publisher and total pages as in the catalogue", async () => {
      const fields: [string, string, string][] = [['ISBN', 'ISBN', entry.isbn], ['Title', 'title', entry.title], ['Sub Title', 'subtitle', entry.subTitle], ['Author', 'author', entry.author], ['Publisher', 'publisher', entry.publisher], ['Total Pages', 'pages', String(entry.pages)]];
      for (const [label, id, value] of fields) {
        await expect.soft(page.getByTestId(`${id}-wrapper`).getByText(value, { exact: true }), `[REQ AC-5] detail page shows ${label} = ${value}`).toBeVisible();
      }
    });
  });

  test('SCN-008: Adding books to my collection returns 201, echoes the ISBNs and lists them on my account', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let user!: User;
    let res!: ApiResponse<{ books?: { isbn: string }[] }>;
    const isbns = [data.books.git.isbn as string, data.books.es6.isbn as string];
    await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
    await journey.step('When I POST /BookStore/v1/Books with ISBNs 9781449325862 and 9781593277574', async () => {
      res = await api.post(EP.bookstoreBooks, { headers: bearer(user.token), data: { userId: user.userId, collectionOfIsbns: isbns.map((isbn) => ({ isbn })) } });
    });
    await journey.step('Then the response status is 201', async () => {
      expect(res.status, '[REQ AC-6] POST /BookStore/v1/Books → 201').toBe(REQ.STATUS.S201);
    });
    await journey.step('And the response books list exactly the added ISBNs', async () => {
      expect.soft((res.body?.books ?? []).map((b) => b.isbn).sort(), '[REQ AC-6] response echoes the added ISBNs').toEqual([...isbns].sort());
    });
    await journey.step('And GET /Account/v1/User/{UUID} lists both books in my books', async () => {
      expect((await collectionIsbns(api, user)).sort(), '[REQ AC-6] collection lists the added books').toEqual([...isbns].sort());
    });
  });

  test('SCN-009: A book added through the API appears on the Profile page after signing in', { tag: ['@AC-7', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let user!: User;
    let book!: Book;
    await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
    await journey.step('And I added 9781449325862 to my collection through the API', async () => {
      book = (await readCatalogue(seed, api)).find((b) => b.isbn === data.books.git.isbn) as Book;
      await addBooksSeed(seed, api, user, [data.books.git.isbn]);
    });
    await journey.step('And I am on the sign-in page /login', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in with my user name and password', async () => { await signIn(page, user, data.user.password); });
    await journey.step('Then the Profile page lists the book with its title, author and publisher', async () => {
      await expect(page, 'signed in and on the Profile page').toHaveURL(/\/profile/, { timeout: 20_000 }); // sign-in can take > 5 s ('Loading...', run 03-eval)
      const row = rowOf(page, book.title);
      await expect(row, '[REQ AC-7] Profile lists the added book').toHaveCount(1);
      await expect.soft(row, '[REQ AC-7] listed book shows its author').toContainText(book.author);
      await expect.soft(row, '[REQ AC-7] listed book shows its publisher').toContainText(book.publisher);
    });
  });

  test('SCN-010: Adding a book already in my collection is rejected and the book stays once', { tag: ['@AC-8', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let user!: User;
    let res!: ApiResponse;
    const isbn = data.books.git.isbn as string;
    await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
    await journey.step('And I added 9781449325862 to my collection through the API', async () => { await addBooksSeed(seed, api, user, [isbn]); });
    await journey.step('When I POST /BookStore/v1/Books with 9781449325862 again', async () => {
      res = await api.post(EP.bookstoreBooks, { headers: bearer(user.token), data: { userId: user.userId, collectionOfIsbns: [{ isbn }] } });
    });
    await journey.step('Then the response status is 400', async () => {
      expect.soft(res.status, '[REQ AC-8] duplicate add → 400').toBe(REQ.E4_ALREADY_PRESENT.status);
    });
    await journey.step('And the error is code "1210" with message "ISBN already present in the User\'s Collection!"', async () => {
      const body = (res.body ?? {}) as ApiError;
      expect.soft(body.code, '[REQ AC-8] error code "1210"').toBe(REQ.E4_ALREADY_PRESENT.code);
      expect.soft(body.message, '[REQ AC-8] error message').toBe(REQ.E4_ALREADY_PRESENT.message);
    });
    await journey.step('And GET /Account/v1/User/{UUID} lists 9781449325862 exactly once', async () => {
      expect((await collectionIsbns(api, user)).filter((x) => x === isbn), '[REQ AC-8] the book is in the collection exactly once').toEqual([isbn]);
    });
  });

  test('SCN-011: Deleting one book on the Profile page removes only that book', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let user!: User;
    const git = data.books.git; const es6 = data.books.es6;
    await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
    await journey.step('And I added 9781449325862 and 9781593277574 to my collection through the API', async () => { await addBooksSeed(seed, api, user, [git.isbn, es6.isbn]); });
    await journey.step('And I signed in on /login and I am on the Profile page', async () => {
      await gotoPage(page, '/login');
      await signIn(page, user, data.user.password);
      await expect(page, 'signed in and on the Profile page (precondition)').toHaveURL(/\/profile/, { timeout: 20_000 }); // sign-in can take > 5 s ('Loading...', run 03-eval)
      await expect(rowOf(page, git.title), 'seeded book listed (precondition)').toHaveCount(1);
    });
    await journey.step('When I click the delete icon of the "Git Pocket Guide" row', async () => {
      await rowOf(page, git.title).getByTitle('Delete').click();
    });
    await journey.step('Then the confirmation "Do you want to delete this book?" is shown', async () => {
      await expect(page.getByRole('dialog').getByText(REQ.DELETE_CONFIRMATION), '[REQ AC-9] confirmation text').toBeVisible();
    });
    await journey.step('When I confirm with OK', async () => {
      await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click();
    });
    await journey.step('Then the "Git Pocket Guide" row is removed and "Understanding ECMAScript 6" remains', async () => {
      await expect.soft(rowOf(page, git.title), '[REQ AC-9] deleted row is removed').toHaveCount(0);
      await expect.soft(rowOf(page, es6.title), '[REQ AC-9] other book remains').toHaveCount(1);
    });
    await journey.step('And GET /Account/v1/User/{UUID} no longer lists 9781449325862 and still lists 9781593277574', async () => {
      user = await refreshToken(seed, api, user, data);
      expect(await collectionIsbns(api, user), '[REQ AC-9] API collection after the UI delete').toEqual([es6.isbn]);
    });
  });

  test('SCN-012: Deleting one book through the API returns 204 and keeps the others', { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let user!: User;
    let res!: ApiResponse;
    const git = data.books.git.isbn as string; const es6 = data.books.es6.isbn as string;
    await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
    await journey.step('And I added 9781449325862 and 9781593277574 to my collection through the API', async () => { await addBooksSeed(seed, api, user, [git, es6]); });
    await journey.step('When I DELETE /BookStore/v1/Book with 9781449325862', async () => {
      res = await api.delete(EP.bookstoreBook, { headers: bearer(user.token), data: { isbn: git, userId: user.userId } });
    });
    await journey.step('Then the response status is 204', async () => {
      expect.soft(res.status, '[REQ AC-10] DELETE /BookStore/v1/Book → 204').toBe(REQ.STATUS.S204);
    });
    await journey.step('And GET /Account/v1/User/{UUID} no longer lists 9781449325862 and still lists 9781593277574', async () => {
      expect(await collectionIsbns(api, user), '[REQ AC-10] only the deleted book is gone').toEqual([es6]);
    });
  });

  test('SCN-013: Deleting a book that is not in my collection is rejected', { tag: ['@AC-10', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let user!: User;
    let res!: ApiResponse;
    await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
    await journey.step('And I added 9781593277574 to my collection through the API', async () => { await addBooksSeed(seed, api, user, [data.books.es6.isbn]); });
    await journey.step('When I DELETE /BookStore/v1/Book with 9781449325862, which is not in my collection', async () => {
      res = await api.delete(EP.bookstoreBook, { headers: bearer(user.token), data: { isbn: data.books.git.isbn, userId: user.userId } });
    });
    await journey.step('Then the response status is 400', async () => {
      expect.soft(res.status, '[REQ AC-10] delete of a book not in the collection → 400').toBe(REQ.E3_NOT_IN_COLLECTION.status);
    });
    await journey.step('And the error is code "1206" with message "ISBN supplied is not available in User\'s Collection!"', async () => {
      const body = (res.body ?? {}) as ApiError;
      expect.soft(body.code, '[REQ AC-10] error code "1206"').toBe(REQ.E3_NOT_IN_COLLECTION.code);
      expect.soft(body.message, '[REQ AC-10] error message').toBe(REQ.E3_NOT_IN_COLLECTION.message);
    });
  });

  test('SCN-014: Looking up an ISBN that is not in the catalogue is rejected', { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let isbn = '';
    let res!: ApiResponse;
    await journey.step('Given an ISBN that is not in the catalogue returned by GET /BookStore/v1/Books', async () => { isbn = await unknownIsbn(seed, api, data); });
    await journey.step('When I GET /BookStore/v1/Book?ISBN=<that ISBN>', async () => { res = await api.get(EP.bookstoreBook, { params: { ISBN: isbn } }); });
    await journey.step('Then the response status is 400', async () => {
      expect.soft(res.status, '[REQ AC-11] lookup of an unknown ISBN → 400').toBe(REQ.E2_NOT_IN_CATALOGUE.status);
    });
    await journey.step('And the error is code "1205" with message "ISBN supplied is not available in Books Collection!"', async () => {
      const body = (res.body ?? {}) as ApiError;
      expect.soft(body.code, '[REQ AC-11] error code "1205"').toBe(REQ.E2_NOT_IN_CATALOGUE.code);
      expect.soft(body.message, '[REQ AC-11] error message').toBe(REQ.E2_NOT_IN_CATALOGUE.message);
    });
  });

  test('SCN-015: Adding an ISBN that is not in the catalogue is rejected and nothing is added', { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let user!: User;
    let isbn = '';
    let res!: ApiResponse;
    await journey.step('Given I created my own user and obtained a token', async () => { user = await createUser(seed, api, data); });
    await journey.step('And an ISBN that is not in the catalogue returned by GET /BookStore/v1/Books', async () => { isbn = await unknownIsbn(seed, api, data); });
    await journey.step('When I POST /BookStore/v1/Books with that ISBN', async () => {
      res = await api.post(EP.bookstoreBooks, { headers: bearer(user.token), data: { userId: user.userId, collectionOfIsbns: [{ isbn }] } });
    });
    await journey.step('Then the response status is 400', async () => {
      expect.soft(res.status, '[REQ AC-11] add of an unknown ISBN → 400').toBe(REQ.E2_NOT_IN_CATALOGUE.status);
    });
    await journey.step('And the error is code "1205" with message "ISBN supplied is not available in Books Collection!"', async () => {
      const body = (res.body ?? {}) as ApiError;
      expect.soft(body.code, '[REQ AC-11] error code "1205"').toBe(REQ.E2_NOT_IN_CATALOGUE.code);
      expect.soft(body.message, '[REQ AC-11] error message').toBe(REQ.E2_NOT_IN_CATALOGUE.message);
    });
    await journey.step('And GET /Account/v1/User/{UUID} shows my collection is still empty', async () => {
      expect(await collectionIsbns(api, user), '[REQ AC-11] nothing was added').toEqual([]);
    });
  });

  // AC-12 rows: which call, and with which credentials (plumbing, not expected values).
  type AuthCase = { call: string; auth: string; run: (api: Api, me: User, other: User, data: TestData) => Promise<ApiResponse> };
  const add = (api: Api, userId: string, isbn: string, headers: Record<string, string>) => api.post(EP.bookstoreBooks, { headers, data: { userId, collectionOfIsbns: [{ isbn }] } });
  const AUTH_CASES: AuthCase[] = [
    { call: 'POST /BookStore/v1/Books for my user', auth: 'without a token', run: (api, me, _o, d) => add(api, me.userId, d.books.git.isbn, {}) },
    { call: 'DELETE /BookStore/v1/Book for my user', auth: 'without a token', run: (api, me, _o, d) => api.delete(EP.bookstoreBook, { data: { isbn: d.books.git.isbn, userId: me.userId } }) },
    { call: 'GET /Account/v1/User/{my UUID}', auth: 'without a token', run: (api, me) => api.get(EP.accountUserByUUID(me.userId)) },
    { call: 'POST /BookStore/v1/Books for my user', auth: 'with an invalid token', run: (api, me, _o, d) => add(api, me.userId, d.books.git.isbn, bearer(d.invalidToken)) },
    { call: 'DELETE /BookStore/v1/Book for my user', auth: 'with an invalid token', run: (api, me, _o, d) => api.delete(EP.bookstoreBook, { headers: bearer(d.invalidToken), data: { isbn: d.books.git.isbn, userId: me.userId } }) },
    { call: 'GET /Account/v1/User/{my UUID}', auth: 'with an invalid token', run: (api, me, _o, d) => api.get(EP.accountUserByUUID(me.userId), { headers: bearer(d.invalidToken) }) },
    { call: "GET /Account/v1/User/{other user's UUID}", auth: 'with my own token', run: (api, me, other) => api.get(EP.accountUserByUUID(other.userId), { headers: bearer(me.token) }) },
    { call: 'POST /BookStore/v1/Books for the other userId', auth: 'with my own token', run: (api, me, other, d) => add(api, other.userId, d.books.git.isbn, bearer(me.token)) },
  ];

  AUTH_CASES.forEach((c, i) => {
    test(`SCN-016.${i + 1}: Collection calls without a valid token are refused (${c.call} ${c.auth})`, { tag: ['@AC-12', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let me!: User; let other!: User;
      let res!: ApiResponse;
      await journey.step('Given I created my own user and obtained a token', async () => { me = await createUser(seed, api, data); });
      await journey.step('And another user exists', async () => { other = await createUser(seed, api, data, 'other user'); });
      await journey.step(`When I call ${c.call} ${c.auth}`, async () => { res = await c.run(api, me, other, data); });
      await journey.step('Then the response status is 401', async () => {
        expect.soft(res.status, '[REQ AC-12] refused with 401').toBe(REQ.E1_NOT_AUTHORIZED.status);
      });
      await journey.step('And the error is code "1200" with message "User not authorized!"', async () => {
        const body = (res.body ?? {}) as ApiError;
        expect.soft(body.code, '[REQ AC-12] error code "1200"').toBe(REQ.E1_NOT_AUTHORIZED.code);
        expect.soft(body.message, '[REQ AC-12] error message').toBe(REQ.E1_NOT_AUTHORIZED.message);
      });
    });
  });
});

