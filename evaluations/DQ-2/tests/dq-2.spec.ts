/**
 * Held-out acceptance tests for DQ-2 — "Personal book collection - browse the catalogue and manage my books".
 * Written from evaluations/DQ-2/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import { test, expect, expectResponse, gotoPage, signIn, type Account, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';
import type { Page } from '@playwright/test';

// Accounts: `const me = await seed.account()` hands this test one of the existing test accounts, for it alone; they are
// shared with later runs, so their collections are left empty (the profile's accounts reset).

// @req-constants-start — expected outcomes copied verbatim from DQ-2 (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, CREATED: 201, NO_CONTENT: 204, BAD_REQUEST: 400, UNAUTHORIZED: 401 },
  BOOK_FIELDS: ['isbn', 'title', 'subTitle', 'author', 'publish_date', 'publisher', 'pages', 'description', 'website'],
  ERR: {
    NOT_AUTHORIZED: { code: '1200', message: 'User not authorized!' },
    NOT_IN_CATALOGUE: { code: '1205', message: 'ISBN supplied is not available in Books Collection!' },
    NOT_IN_COLLECTION: { code: '1206', message: "ISBN supplied is not available in User's Collection!" },
    ALREADY_PRESENT: { code: '1210', message: "ISBN already present in the User's Collection!" },
  },
  SEARCH: {
    javascript: ['Learning JavaScript Design Patterns', 'Speaking JavaScript', 'Programming JavaScript Applications', 'Eloquent JavaScript, Second Edition'],
    zakas: ['Understanding ECMAScript 6'],
    'No Starch': ['Eloquent JavaScript, Second Edition', 'Understanding ECMAScript 6'],
  } as Record<string, string[]>,
  CONFIRM: 'Do you want to delete this book?',
} as const;
// @req-constants-end

const EP = {
  books: '/BookStore/v1/Books',
  book: (isbn: string) => `/BookStore/v1/Book?ISBN=${isbn}`,
  deleteBook: '/BookStore/v1/Book',
  user: (id: string) => `/Account/v1/User/${id}`,
};
const GIT = '9781449325862'; const ES6 = '9781593277574';
const UNKNOWN_ISBN = '9780000000001';
interface Book { isbn: string; title: string; subTitle: string; author: string; publisher: string; pages: number }

/** The catalogue (reference data, read only). */
const catalogue = (api: Api, seed: Seed) => seed.step('the catalogue (GET /BookStore/v1/Books)', async () => {
  const r = await api.get<{ books: Book[] }>(EP.books);
  expect(r.status, 'the catalogue answers (precondition)').toBe(200);
  return r.body.books;
});
/** Books in the user's collection, as a precondition. */
const addBooks = (api: Api, seed: Seed, me: Account, isbns: string[]) => seed.step(`add ${isbns.join(', ')} to ${me.username}'s collection`, async () => {
  const r = await api.post(EP.books, { headers: me.headers, data: { userId: me.id, collectionOfIsbns: isbns.map((isbn) => ({ isbn })) } });
  expect(r.status, 'books added (precondition)').toBe(201);
});
const collectionOf = async (api: Api, me: Account) => ((await api.get<{ books: Book[] }>(EP.user(me.id), { headers: me.headers })).body?.books ?? []).map((b) => b.isbn);
/** Book rows of the /books or /profile table: the rows that carry a title link. */
const bookRows = (page: Page) => page.getByRole('row').filter({ has: page.getByRole('link') });

test.describe('DQ-2 Personal book collection', () => {
  test('SCN-001: The catalogue lists every book with all its fields', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse<{ books: Record<string, unknown>[] }>;
    await journey.step('When a client requests GET /BookStore/v1/Books', async () => { res = await api.get(EP.books); });
    await journey.step('Then the answer is 200 with a books list', async () => {
      expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-1] GET /BookStore/v1/Books');
      expect(Array.isArray(res.body?.books) && res.body.books.length > 0, '[REQ AC-1] GET /BookStore/v1/Books answers a books list').toBe(true);
    });
    await journey.step('And every entry has isbn, title, subTitle, author, publish_date, publisher, pages, description and website', async () => {
      const missing = (res.body?.books ?? []).flatMap((b) => REQ.BOOK_FIELDS.filter((f) => !(f in b)).map((f) => `${String(b.isbn)}: ${f}`));
      expect(missing, '[REQ AC-1] GET /BookStore/v1/Books: every entry carries every catalogue field').toEqual([]);
    });
  });

  test('SCN-002: Looking one book up returns its catalogue entry', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let entry!: Book; let res!: ApiResponse<Book>;
    await journey.step('Given the catalogue entry of 9781449325862', async () => { entry = (await catalogue(api, seed)).find((b) => b.isbn === GIT)!; expect(entry, 'the book is in the catalogue (precondition)').toBeDefined(); });
    await journey.step('When a client requests GET /BookStore/v1/Book?ISBN=9781449325862', async () => { res = await api.get(EP.book(GIT)); });
    await journey.step('Then the answer is 200 with the same data as the catalogue entry', async () => {
      expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-2] GET /BookStore/v1/Book');
      expect(res.body, '[REQ AC-2] GET /BookStore/v1/Book answers the catalogue entry').toEqual(entry);
    });
  });

  test('SCN-003: The Book Store page lists every catalogue book', { tag: ['@AC-3', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
    let books!: Book[];
    await journey.step('Given the books GET /BookStore/v1/Books returns', async () => { books = await catalogue(api, seed); });
    await journey.step('When I open the Book Store page', async () => { await gotoPage(page, 'books'); await expect(bookRows(page).first()).toBeVisible(); });
    await journey.step('Then every one of them is listed with its title, author and publisher', async () => {
      for (const b of books) {
        const row = bookRows(page).filter({ has: page.getByRole('link', { name: b.title, exact: true }) });
        await expect.soft(row, `[REQ AC-3] /books lists "${b.title}"`).toHaveCount(1);
        await expect.soft(row.getByRole('cell').filter({ hasText: b.author }), `[REQ AC-3] /books shows the author of "${b.title}"`).toHaveCount(1);
        await expect.soft(row.getByRole('cell').filter({ hasText: b.publisher }), `[REQ AC-3] /books shows the publisher of "${b.title}"`).toHaveCount(1);
      }
      await expect(bookRows(page), '[REQ AC-3] /books lists every catalogue book').toHaveCount(books.length);
    });
  });

  Object.entries(REQ.SEARCH).forEach(([term, titles], i) => {
    test(`SCN-004.${i + 1}: The search box filters by title, author or publisher ("${term}")`, { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
      await journey.step('Given I am on the Book Store page', async () => { await gotoPage(page, 'books'); await expect(bookRows(page).first()).toBeVisible(); });
      await journey.step(`When I type "${term}" in the "Type to search" box`, async () => { await page.getByPlaceholder('Type to search').pressSequentially(term); });
      await journey.step(`Then exactly these books are listed: ${titles.join(', ')}`, async () => {
        // The list filters while typing: let it settle on the expected number of rows (a wait, not the check).
        await bookRows(page).nth(titles.length).waitFor({ state: 'detached', timeout: 5_000 }).catch(() => undefined);
        const shown = (await bookRows(page).getByRole('link').allTextContents()).map((t) => t.trim()).sort();
        expect(shown, `[REQ AC-4] searching "${term}" lists exactly the expected books`).toEqual([...titles].sort());
      });
    });
  });

  test('SCN-005: A search term that matches no book leaves no book rows', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Book Store page', async () => { await gotoPage(page, 'books'); await expect(bookRows(page).first()).toBeVisible(); });
    await journey.step('When I type a term that matches no book', async () => { await page.getByPlaceholder('Type to search').pressSequentially('zzqx-no-such-book'); });
    await journey.step('Then no book rows are listed', async () => {
      await expect(bookRows(page), '[REQ AC-4] a term that matches no book leaves no book rows').toHaveCount(0);
    });
  });

  test('SCN-006: A book\'s detail page shows its catalogue data', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let b!: Book;
    await journey.step('Given I am on the Book Store page', async () => {
      b = (await catalogue(api, seed)).find((x) => x.isbn === GIT)!;
      await gotoPage(page, 'books');
    });
    await journey.step('When I click the title "Git Pocket Guide"', async () => { await page.getByRole('link', { name: 'Git Pocket Guide', exact: true }).click(); });
    await journey.step('Then the detail page shows its ISBN, title, sub title, author, publisher and total pages as in the catalogue', async () => {
      const fields: [string, string][] = [['#ISBN-wrapper', b.isbn], ['#title-wrapper', b.title], ['#subtitle-wrapper', b.subTitle], ['#author-wrapper', b.author], ['#publisher-wrapper', b.publisher], ['#pages-wrapper', String(b.pages)]];
      for (const [where, value] of fields) await expect.soft(page.locator(where), `[REQ AC-5] the detail page shows ${where.slice(1, -8)} ${value}`).toContainText(value);
    });
  });

  test('SCN-007: Adding books to my collection', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let res!: ApiResponse<{ books: { isbn: string }[] }>;
    await journey.step('Given I am a test user with an empty collection', async () => { me = await seed.account(); });
    await journey.step('When I POST /BookStore/v1/Books with two catalogue ISBNs', async () => { res = await api.post(EP.books, { headers: me.headers, data: { userId: me.id, collectionOfIsbns: [{ isbn: GIT }, { isbn: ES6 }] } }); });
    await journey.step('Then the answer is 201 and echoes the two ISBNs', async () => {
      expectResponse(res, { status: REQ.STATUS.CREATED, body: { books: [{ isbn: GIT }, { isbn: ES6 }] } }, '[REQ AC-6] POST /BookStore/v1/Books');
    });
    await journey.step('And GET /Account/v1/User/{UUID} lists both books', async () => {
      expect((await collectionOf(api, me)).sort(), '[REQ AC-6] GET /Account/v1/User/{UUID} lists the added books').toEqual([GIT, ES6].sort());
    });
  });

  test('SCN-008: A book added through the API appears on my Profile page', { tag: ['@AC-7', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let b!: Book;
    await journey.step('Given I am a test user with "Git Pocket Guide" added through the API', async () => {
      b = (await catalogue(api, seed)).find((x) => x.isbn === GIT)!;
      me = await seed.account(); await addBooks(api, seed, me, [GIT]);
    });
    await journey.step('When I sign in on /login and open my Profile', async () => { await signIn(page, me); await gotoPage(page, 'profile'); });
    await journey.step('Then "Git Pocket Guide" is listed with its title, author and publisher', async () => {
      const row = bookRows(page).filter({ hasText: b.title });
      await expect(row, '[REQ AC-7] /profile lists the book added through the API').toHaveCount(1);
      await expect.soft(row, '[REQ AC-7] /profile shows its author').toContainText(b.author);
      await expect.soft(row, '[REQ AC-7] /profile shows its publisher').toContainText(b.publisher);
    });
  });

  test('SCN-009: Adding a book that is already in my collection is refused', { tag: ['@AC-8', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let res!: ApiResponse;
    await journey.step('Given I am a test user with "Git Pocket Guide" in my collection', async () => { me = await seed.account(); await addBooks(api, seed, me, [GIT]); });
    await journey.step('When I POST /BookStore/v1/Books with it again', async () => { res = await api.post(EP.books, { headers: me.headers, data: { userId: me.id, collectionOfIsbns: [{ isbn: GIT }] } }); });
    await journey.step('Then the answer is 400 with code "1210" and "ISBN already present in the User\'s Collection!"', async () => {
      expectResponse(res, { status: REQ.STATUS.BAD_REQUEST, body: REQ.ERR.ALREADY_PRESENT }, '[REQ AC-8] POST /BookStore/v1/Books duplicate');
    });
    await journey.step('And my collection contains it exactly once', async () => {
      expect((await collectionOf(api, me)).filter((i) => i === GIT), '[REQ AC-8] GET /Account/v1/User/{UUID} lists the book exactly once').toHaveLength(1);
    });
  });

  test('SCN-010: Deleting one book on the Profile page', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account;
    await journey.step('Given I am a test user with "Git Pocket Guide" and "Understanding ECMAScript 6" in my collection, signed in on /login', async () => {
      me = await seed.account(); await addBooks(api, seed, me, [GIT, ES6]);
      await signIn(page, me); await gotoPage(page, 'profile');
      await expect(bookRows(page), 'both books are on the profile (precondition)').toHaveCount(2);
    });
    await journey.step('When I press the delete icon of "Git Pocket Guide" and confirm "Do you want to delete this book?" with OK', async () => {
      page.once('dialog', (d) => d.accept()); // the "Book deleted." alert that follows OK
      await page.locator(`#delete-record-${GIT}`).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog, '[REQ AC-9] the confirmation asks "Do you want to delete this book?"').toContainText(REQ.CONFIRM);
      await page.locator('#closeSmallModal-ok').click();
    });
    await journey.step('Then its row is gone and "Understanding ECMAScript 6" remains', async () => {
      await expect(bookRows(page).filter({ hasText: 'Git Pocket Guide' }), '[REQ AC-9] the deleted book\'s row is gone').toHaveCount(0);
      await expect(bookRows(page).filter({ hasText: 'Understanding ECMAScript 6' }), '[REQ AC-9] the other book remains').toHaveCount(1);
    });
    await journey.step('And GET /Account/v1/User/{UUID} no longer lists "Git Pocket Guide" and still lists "Understanding ECMAScript 6"', async () => {
      await me.refresh(); // the UI sign-in issued a new token
      expect(await collectionOf(api, me), '[REQ AC-9] GET /Account/v1/User/{UUID} after the delete').toEqual([ES6]);
    });
  });

  test('SCN-011: Removing one book through the API', { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let res!: ApiResponse;
    await journey.step('Given I am a test user with two books in my collection', async () => { me = await seed.account(); await addBooks(api, seed, me, [GIT, ES6]); });
    await journey.step('When I DELETE /BookStore/v1/Book for one of them', async () => { res = await api.delete(EP.deleteBook, { headers: me.headers, data: { isbn: GIT, userId: me.id } }); });
    await journey.step('Then the answer is 204', async () => { expectResponse(res, { status: REQ.STATUS.NO_CONTENT }, '[REQ AC-10] DELETE /BookStore/v1/Book'); });
    await journey.step('And the other book remains in my collection', async () => {
      expect(await collectionOf(api, me), '[REQ AC-10] GET /Account/v1/User/{UUID}: the other book remains').toEqual([ES6]);
    });
  });

  test('SCN-012: Removing a book that is not in my collection is refused', { tag: ['@AC-10', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let me!: Account; let res!: ApiResponse;
    await journey.step('Given I am a test user with an empty collection', async () => { me = await seed.account(); });
    await journey.step('When I DELETE /BookStore/v1/Book for a catalogue book', async () => { res = await api.delete(EP.deleteBook, { headers: me.headers, data: { isbn: GIT, userId: me.id } }); });
    await journey.step('Then the answer is 400 with code "1206" and "ISBN supplied is not available in User\'s Collection!"', async () => {
      expectResponse(res, { status: REQ.STATUS.BAD_REQUEST, body: REQ.ERR.NOT_IN_COLLECTION }, '[REQ AC-10] DELETE /BookStore/v1/Book not in the collection');
    });
  });

  const UNKNOWN: { call: string; send: (api: Api, me: Account) => Promise<ApiResponse> }[] = [
    { call: 'look it up with GET /BookStore/v1/Book', send: (api) => api.get(EP.book(UNKNOWN_ISBN)) },
    { call: 'add it with POST /BookStore/v1/Books', send: (api, me) => api.post(EP.books, { headers: me.headers, data: { userId: me.id, collectionOfIsbns: [{ isbn: UNKNOWN_ISBN }] } }) },
  ];
  UNKNOWN.forEach((row, i) => {
    test(`SCN-013.${i + 1}: An ISBN that is not in the catalogue is refused (${row.call})`, { tag: ['@AC-11', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let me!: Account; let res!: ApiResponse;
      await journey.step('Given I am a test user with an empty collection', async () => { me = await seed.account(); });
      await journey.step(`When I ${row.call} with an ISBN that is not in the catalogue`, async () => { res = await row.send(api, me); });
      await journey.step('Then the answer is 400 with code "1205" and "ISBN supplied is not available in Books Collection!"', async () => {
        expectResponse(res, { status: REQ.STATUS.BAD_REQUEST, body: REQ.ERR.NOT_IN_CATALOGUE }, `[REQ AC-11] ${row.call.split(' with ')[1]} unknown ISBN`);
      });
      await journey.step('And nothing is added to my collection', async () => {
        expect(await collectionOf(api, me), '[REQ AC-11] GET /Account/v1/User/{UUID}: nothing added').toEqual([]);
      });
    });
  });

  const REFUSED: { call: string; send: (api: Api, a: Account, b: Account) => Promise<ApiResponse> }[] = [
    { call: "adds a book to A's collection without a token", send: (api, a) => api.post(EP.books, { data: { userId: a.id, collectionOfIsbns: [{ isbn: GIT }] } }) },
    { call: "deletes a book from A's collection without a token", send: (api, a) => api.delete(EP.deleteBook, { data: { isbn: GIT, userId: a.id } }) },
    { call: "reads A's collection without a token", send: (api, a) => api.get(EP.user(a.id)) },
    { call: "reads B's collection with A's token", send: (api, a, b) => api.get(EP.user(b.id), { headers: a.headers }) },
    { call: "adds a book to B's collection with A's token", send: (api, a, b) => api.post(EP.books, { headers: a.headers, data: { userId: b.id, collectionOfIsbns: [{ isbn: GIT }] } }) },
  ];
  REFUSED.forEach((row, i) => {
    test(`SCN-014.${i + 1}: Collection calls without a valid token are refused (${row.call})`, { tag: ['@AC-12', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let a!: Account; let b!: Account; let res!: ApiResponse;
      await journey.step('Given two test users, A and B', async () => { a = await seed.account('user A'); b = await seed.account('user B'); if (i === 1) await addBooks(api, seed, a, [GIT]); });
      await journey.step(`When a client ${row.call}`, async () => { res = await row.send(api, a, b); });
      await journey.step('Then the answer is 401 with code "1200" and "User not authorized!"', async () => {
        expectResponse(res, { status: REQ.STATUS.UNAUTHORIZED, body: REQ.ERR.NOT_AUTHORIZED }, `[REQ AC-12] ${row.call}`);
      });
    });
  });
});
