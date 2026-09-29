/**
 * Held-out acceptance tests for JS-3 — "Product reviews — write, like and edit".
 * Written from evaluations/JS-3/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, expectResponse, gotoPage, checkShape, signIn, unique, type Account, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from JS-3 (never edit during hardening)
const REQ = {
  STATUS: { S200: 200, S201: 201, S401: 401, S403: 403, S404: 404 },
  WRITTEN: { status: 'success' },
  NOT_ALLOWED: { error: 'Not allowed' },
  NOT_FOUND: { error: 'Not found' },
  MAX_LENGTH: 160,
  COUNTER_FULL: '160/160',
  LIMIT_HINT: 'Max. 160 characters',
  LIKES_AFTER_ONE: 1,
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** POST /rest/user/login */ restUserLogin: '/rest/user/login',
  /** GET, PUT /rest/products/{id}/reviews */ restProductsReviewsById: (id: string | number) => `/rest/products/${id}/reviews`,
  /** POST, PATCH /rest/products/reviews */ restProductsReviews: '/rest/products/reviews',
};

/** The story's product: "Apple Juice (1000ml)" (product id 1). */
const PRODUCT = { id: 1, name: 'Apple Juice (1000ml)' };

interface Review { _id: string; message: string; author: string; product: unknown; likesCount: number; likedBy: string[] }
interface ReviewList { status: string; data: Review[] }

const REVIEW_SHAPE = { _id: 'string', message: 'string', author: 'string', likesCount: 'number', likedBy: 'string[]' } as const;

/** Every review listed for the product (GET is public). */
async function reviews(api: Api): Promise<Review[]> {
  const res = await api.get<ReviewList>(EP.restProductsReviewsById(PRODUCT.id));
  return Array.isArray(res.body?.data) ? res.body.data : [];
}
const byMessage = (list: Review[], message: string) => list.filter((r) => r.message === message);

/** Precondition: a review written by `author` through the API, found back by its unique message. */
async function seedReview(api: Api, seed: Seed, author: Account, label = 'a review for product 1'): Promise<Review> {
  return seed.create(label, async () => {
    const message = unique();
    const res = await api.put(EP.restProductsReviewsById(PRODUCT.id), { headers: author.headers, data: { message, author: author.username } });
    expect(res.status, 'write the review (seed)').toBe(201);
    const found = byMessage(await reviews(api), message);
    expect(found, 'the written review is listed (seed)').toHaveLength(1);
    return found[0];
  });
}

/** Precondition: `liker` likes the review once. */
async function seedLike(api: Api, seed: Seed, liker: Account, review: Review): Promise<void> {
  await seed.step('like the review once', async () => {
    const res = await api.post(EP.restProductsReviews, { headers: liker.headers, data: { id: review._id } });
    expect(res.status, 'like the review (seed)').toBe(200);
  });
}

/** The shop's product details dialog of the story's product (the dialog opens from the product list). */
async function openProductDialog(page: Page) {
  await gotoPage(page, '/'); // TODO(harden)
  await page.getByText(PRODUCT.name).first().click(); // TODO(harden)
  const dialog = page.getByRole('dialog'); // TODO(harden)
  await expect(dialog, 'the product details dialog is open (precondition)').toBeVisible();
  return dialog;
}
const reviewField = (dialog: ReturnType<Page['getByRole']>) => dialog.getByRole('textbox'); // TODO(harden)
const submitButton = (dialog: ReturnType<Page['getByRole']>) => dialog.getByRole('button', { name: 'Submit' }); // TODO(harden)
/** The review entries of the dialog's Reviews list, after opening it. */
async function openReviewsList(dialog: ReturnType<Page['getByRole']>) {
  await dialog.getByRole('button', { name: /Reviews/ }).click(); // TODO(harden)
}
const reviewEntry = (dialog: ReturnType<Page['getByRole']>, message: string) => dialog.locator('div').filter({ hasText: message }).last(); // TODO(harden)

test.describe('JS-3 Product reviews — write, like and edit', () => {
  test('SCN-001: A signed-in customer writes a review in the product details dialog and sees it listed', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, seed }) => {
    const message = unique();
    let me!: Account; let dialog!: ReturnType<Page['getByRole']>;
    await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
      me = await seed.account();
      await signIn(page, me);
      dialog = await openProductDialog(page);
    });
    await journey.step('When I type a new review message and press Submit', async () => {
      await reviewField(dialog).fill(message);
      await submitButton(dialog).click();
      seed.track('the review written in the dialog', { message });
    });
    await journey.step('Then the dialog\'s Reviews list shows my message', async () => {
      await openReviewsList(dialog);
      await expect(dialog.getByText(message, { exact: true }), '[REQ AC-1] the Reviews list shows the typed message').toBeVisible();
    });
    await journey.step('And that review names my e-mail as its author', async () => {
      await expect(reviewEntry(dialog, message), '[REQ AC-1] the listed review names my e-mail as author').toContainText(me.username);
    });
  });

  test('SCN-002: A review written through the API is stored with its message and author and no likes', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    const message = unique();
    let me!: Account; let res!: ApiResponse; let listed: Review[] = [];
    await journey.step('Given I am a signed-in customer', async () => { me = await seed.account(); });
    await journey.step('When I PUT a new review message for product 1 with my token', async () => {
      res = await api.put(EP.restProductsReviewsById(PRODUCT.id), { headers: me.headers, data: { message, author: me.username } });
      seed.track('the review under test', { message });
    });
    await journey.step('Then the answer is HTTP 201 with {"status":"success"}', async () => {
      expectResponse(res, { status: REQ.STATUS.S201, body: REQ.WRITTEN }, '[REQ AC-2] PUT /rest/products/1/reviews');
    });
    await journey.step('And GET /rest/products/1/reviews lists a review with my message', async () => {
      listed = byMessage(await reviews(api), message);
      expect(listed, '[REQ AC-2] GET /rest/products/1/reviews lists the review once').toHaveLength(1);
    });
    await journey.step('And its author is my e-mail, its likesCount is 0 and its likedBy is empty', async () => {
      expect.soft(listed[0]?.author, '[REQ AC-2] GET /rest/products/1/reviews author is my e-mail').toBe(me.username);
      expect.soft(listed[0]?.likesCount, '[REQ AC-2] GET /rest/products/1/reviews likesCount is 0').toBe(0);
      expect.soft(listed[0]?.likedBy, '[REQ AC-2] GET /rest/products/1/reviews likedBy is empty').toEqual([]);
    });
  });

  test('SCN-003: The reviews list has the stated envelope and review fields', { tag: ['@AC-3', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let res!: ApiResponse<ReviewList>;
    await journey.step('Given a review of mine exists for product 1', async () => { await seedReview(api, seed, await seed.account()); });
    await journey.step('When I GET /rest/products/1/reviews', async () => { res = await api.get<ReviewList>(EP.restProductsReviewsById(PRODUCT.id)); });
    await journey.step('Then the answer is HTTP 200 with status "success" and data an array', async () => {
      expect.soft(res.status, '[REQ AC-3] GET /rest/products/1/reviews → 200').toBe(REQ.STATUS.S200);
      expect.soft(res.body?.status, '[REQ AC-3] GET /rest/products/1/reviews status is "success"').toBe(REQ.WRITTEN.status);
      expect(Array.isArray(res.body?.data), '[REQ AC-3] GET /rest/products/1/reviews data is an array').toBe(true);
    });
    await journey.step('And every review has _id, message and author as strings, likesCount as a number and likedBy as an array of strings', async () => {
      expect.soft(res.body.data.flatMap((r, i) => checkShape(r, REVIEW_SHAPE, `data[${i}]`)), '[REQ AC-3] GET /rest/products/1/reviews review fields and types').toEqual([]);
    });
    await journey.step('And every review\'s product identifies product 1', async () => {
      expect.soft(res.body.data.filter((r) => String(r.product) !== String(PRODUCT.id)).map((r) => r._id), '[REQ AC-3] GET /rest/products/1/reviews every product is product 1').toEqual([]);
    });
  });

  const ANONYMOUS = [
    { call: 'PUT /rest/products/1/reviews with a new message', stays: 'no review with that message is listed' },
    { call: 'POST /rest/products/reviews for the review', stays: 'the review\'s likesCount and likedBy are unchanged' },
    { call: 'PATCH /rest/products/reviews for the review', stays: 'the review\'s message is unchanged' },
  ] as const;
  ANONYMOUS.forEach((row, i) => {
    test(`SCN-004.${i + 1}: Writing, liking and editing without a token are refused and change nothing (${row.call.split(' ')[0]})`, { tag: ['@AC-4', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let review!: Review; let res!: ApiResponse; const message = unique();
      await journey.step('Given a review written by a signed-in customer exists for product 1', async () => { review = await seedReview(api, seed, await seed.account()); });
      await journey.step(`When a client sends ${row.call} without an Authorization header`, async () => {
        if (i === 0) { res = await api.put(EP.restProductsReviewsById(PRODUCT.id), { data: { message, author: review.author } }); seed.track('a review the application may have stored', { message }); }
        if (i === 1) res = await api.post(EP.restProductsReviews, { data: { id: review._id } });
        if (i === 2) res = await api.patch(EP.restProductsReviews, { data: { id: review._id, message } });
      });
      await journey.step('Then the answer is HTTP 401', async () => {
        expect.soft(res.status, `[REQ AC-4] ${row.call.split(' ').slice(0, 2).join(' ')} without a token → 401`).toBe(REQ.STATUS.S401);
      });
      await journey.step(`And ${row.stays}`, async () => {
        const list = await reviews(api);
        if (i === 0) expect.soft(byMessage(list, message), '[REQ AC-4] PUT /rest/products/1/reviews without a token stores nothing').toEqual([]);
        const now = list.find((r) => r._id === review._id);
        if (i === 1) expect.soft({ likesCount: now?.likesCount, likedBy: now?.likedBy }, '[REQ AC-4] POST /rest/products/reviews without a token changes no like').toEqual({ likesCount: review.likesCount, likedBy: review.likedBy });
        if (i === 2) expect.soft(now?.message, '[REQ AC-4] PATCH /rest/products/reviews without a token changes no message').toBe(review.message);
      });
    });
  });

  test('SCN-005: Another customer cannot edit my review', { tag: ['@AC-5', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let review!: Review; let b!: Account; let res!: ApiResponse;
    await journey.step('Given customer A has written a review for product 1', async () => { review = await seedReview(api, seed, await seed.account('customer A')); });
    await journey.step('And customer B is signed in', async () => { b = await seed.account('customer B'); });
    await journey.step('When B sends PATCH /rest/products/reviews with A\'s review id and a new message', async () => {
      res = await api.patch(EP.restProductsReviews, { headers: b.headers, data: { id: review._id, message: unique() } });
    });
    await journey.step('Then the answer is HTTP 403', async () => {
      expect.soft(res.status, '[REQ AC-5] PATCH /rest/products/reviews by another customer → 403').toBe(REQ.STATUS.S403);
    });
    await journey.step('And the review\'s message is still A\'s', async () => {
      const now = (await reviews(api)).find((r) => r._id === review._id);
      expect.soft(now?.message, '[REQ AC-5] PATCH /rest/products/reviews by another customer leaves the message unchanged').toBe(review.message);
    });
  });

  test('SCN-006: A review\'s author comes from the session, not from the request', { tag: ['@AC-6', '@type:audit', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; const message = unique();
    await journey.step('Given I am a signed-in customer', async () => { me = await seed.account(); });
    await journey.step('When I PUT a new review message for product 1 whose author names another e-mail', async () => {
      await api.put(EP.restProductsReviewsById(PRODUCT.id), { headers: me.headers, data: { message, author: `${unique().replace(/\s+/g, '-')}@example.com` } });
      seed.track('the review under test', { message });
    });
    await journey.step('Then the stored review with my message names my e-mail as its author', async () => {
      const stored = byMessage(await reviews(api), message);
      expect(stored.map((r) => r.author), '[REQ AC-6] GET /rest/products/1/reviews the review\'s author is my e-mail').toEqual([me.username]);
    });
  });

  test('SCN-007: A like records who gave it', { tag: ['@AC-6', '@type:audit', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let review!: Review; let b!: Account;
    await journey.step('Given customer A has written a review for product 1', async () => { review = await seedReview(api, seed, await seed.account('customer A')); });
    await journey.step('When customer B likes it', async () => {
      b = await seed.account('customer B');
      await api.post(EP.restProductsReviews, { headers: b.headers, data: { id: review._id } });
    });
    let now: Review | undefined;
    await journey.step('Then the review\'s likedBy contains B\'s e-mail', async () => {
      now = (await reviews(api)).find((r) => r._id === review._id);
      expect.soft(now?.likedBy, '[REQ AC-6] GET /rest/products/1/reviews likedBy contains the liker\'s e-mail').toContain(b.username);
    });
    await journey.step('And its likesCount equals the number of entries in likedBy', async () => {
      expect.soft(now?.likesCount, '[REQ AC-6] GET /rest/products/1/reviews likesCount equals the entries in likedBy').toBe(now?.likedBy?.length);
    });
  });

  test('SCN-008: A second like by the same customer is refused and changes nothing', { tag: ['@AC-7', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let review!: Review; let b!: Account; let afterFirst: Review | undefined; let res!: ApiResponse;
    await journey.step('Given customer A has written a review for product 1', async () => { review = await seedReview(api, seed, await seed.account('customer A')); });
    await journey.step('And customer B has liked it once', async () => {
      b = await seed.account('customer B');
      await seedLike(api, seed, b, review);
      afterFirst = await seed.step('read the review after the first like', async () => (await reviews(api)).find((r) => r._id === review._id));
    });
    await journey.step('When B likes it again', async () => { res = await api.post(EP.restProductsReviews, { headers: b.headers, data: { id: review._id } }); });
    await journey.step('Then the answer is HTTP 403 with {"error":"Not allowed"}', async () => {
      expectResponse(res, { status: REQ.STATUS.S403, body: REQ.NOT_ALLOWED }, '[REQ AC-7] POST /rest/products/reviews second like');
    });
    await journey.step('And the review\'s likesCount and likedBy are as they were after the first like', async () => {
      const now = (await reviews(api)).find((r) => r._id === review._id);
      expect.soft({ likesCount: now?.likesCount, likedBy: now?.likedBy }, '[REQ AC-7] GET /rest/products/1/reviews a second like changes no count').toEqual({ likesCount: afterFirst?.likesCount, likedBy: afterFirst?.likedBy });
    });
  });

  test('SCN-009: Simultaneous likes by one customer count once', { tag: ['@AC-8', '@type:concurrency', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let a!: Account; let b!: Account;
    const rounds: { review: Review; after?: Review }[] = [];
    await journey.step('Given customer A has written a review for product 1', async () => {
      a = await seed.account('customer A');
      b = await seed.account('customer B');
      for (let round = 1; round <= 3; round++) rounds.push({ review: await seedReview(api, seed, a, `a fresh review for round ${round}`) });
    });
    await journey.step('When customer B sends three likes for it at the same time', async () => {
      for (const r of rounds) {
        await Promise.all([1, 2, 3].map(() => api.post(EP.restProductsReviews, { headers: b.headers, data: { id: r.review._id } })));
        r.after = (await reviews(api)).find((x) => x._id === r.review._id);
      }
    });
    await journey.step('Then the review\'s likesCount has risen by exactly 1', async () => {
      expect(rounds.map((r) => (r.after?.likesCount ?? NaN) - r.review.likesCount), '[REQ AC-8] GET /rest/products/1/reviews likesCount rose by exactly 1 in every round').toEqual(rounds.map(() => 1));
    });
    await journey.step('And B\'s e-mail appears once in its likedBy', async () => {
      expect(rounds.map((r) => (r.after?.likedBy ?? []).filter((e) => e === b.username).length), '[REQ AC-8] GET /rest/products/1/reviews the liker\'s e-mail appears once in likedBy in every round').toEqual(rounds.map(() => 1));
    });
  });

  test('SCN-010: A like for a review that does not exist is refused', { tag: ['@AC-9', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let me!: Account; let res!: ApiResponse;
    await journey.step('Given I am a signed-in customer', async () => { me = await seed.account(); });
    await journey.step('When I like a review id that does not exist', async () => {
      res = await api.post(EP.restProductsReviews, { headers: me.headers, data: { id: unique().replace(/\s+/g, '') } });
    });
    await journey.step('Then the answer is HTTP 404 with {"error":"Not found"}', async () => {
      expectResponse(res, { status: REQ.STATUS.S404, body: REQ.NOT_FOUND }, '[REQ AC-9] POST /rest/products/reviews unknown id');
    });
  });

  test('SCN-011: Submit stays disabled while the review field is empty', { tag: ['@AC-9', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, seed }) => {
    let dialog!: ReturnType<Page['getByRole']>;
    await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
      await signIn(page, await seed.account());
      dialog = await openProductDialog(page);
    });
    await journey.step('When the review field is empty', async () => { await expect(reviewField(dialog), 'the review field is empty (precondition)').toHaveValue(''); });
    await journey.step('Then the Submit button is disabled', async () => {
      await expect(submitButton(dialog), '[REQ AC-9] Submit is disabled while the review field is empty').toBeDisabled();
    });
  });

  test('SCN-012: A review of exactly 160 characters is accepted and submitted', { tag: ['@AC-10', '@type:boundary', '@layer:ui', '@P2'] }, async ({ page, api, journey, seed }) => {
    let dialog!: ReturnType<Page['getByRole']>;
    const base = `${unique()} `;
    const message = (base + 'x'.repeat(REQ.MAX_LENGTH)).slice(0, REQ.MAX_LENGTH);
    await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
      await signIn(page, await seed.account());
      dialog = await openProductDialog(page);
    });
    await journey.step('When I type a message of exactly 160 characters and press Submit', async () => {
      await reviewField(dialog).fill(message);
    });
    await journey.step('Then the field held all 160 characters before submitting', async () => {
      await expect(reviewField(dialog), '[REQ AC-10] the field holds all 160 characters').toHaveValue(message);
      await submitButton(dialog).click();
      seed.track('the 160-character review', { message });
    });
    await journey.step('And GET /rest/products/1/reviews lists the 160-character review', async () => {
      await expect.poll(async () => byMessage(await reviews(api), message).length, { message: '[REQ AC-10] GET /rest/products/1/reviews lists the 160-character review' }).toBe(1);
    });
  });

  test('SCN-013: A 161st character is not accepted', { tag: ['@AC-10', '@type:boundary', '@layer:ui', '@P2'] }, async ({ page, journey, seed }) => {
    let dialog!: ReturnType<Page['getByRole']>;
    await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
      await signIn(page, await seed.account());
      dialog = await openProductDialog(page);
    });
    await journey.step('When I type a message of 161 characters', async () => {
      await reviewField(dialog).pressSequentially('y'.repeat(REQ.MAX_LENGTH + 1));
    });
    await journey.step('Then the review field holds 160 characters', async () => {
      expect((await reviewField(dialog).inputValue()).length, '[REQ AC-10] the field holds 160 characters after typing 161').toBe(REQ.MAX_LENGTH);
    });
    await journey.step('And the field\'s counter shows 160/160', async () => {
      await expect(dialog.getByText(REQ.COUNTER_FULL, { exact: true }), '[REQ AC-10] the counter shows 160/160').toBeVisible(); // TODO(harden)
    });
  });

  test('SCN-014: The review field and the Submit button have accessible names and the field describes its limit', { tag: ['@AC-11', '@type:accessibility', '@layer:ui', '@P2'] }, async ({ page, journey, seed }) => {
    let dialog!: ReturnType<Page['getByRole']>;
    await journey.step('Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"', async () => {
      await signIn(page, await seed.account());
      dialog = await openProductDialog(page);
    });
    await journey.step('Then the review field has an accessible name', async () => {
      await expect(dialog.getByRole('textbox'), '[REQ AC-11 strict] the review field has an accessible name').toHaveAccessibleName(/\S/); // TODO(harden)
    });
    await journey.step('And the review field\'s accessible description includes "Max. 160 characters"', async () => {
      await expect(dialog.getByRole('textbox'), '[REQ AC-11 strict] the review field\'s description includes the limit hint').toHaveAccessibleDescription(new RegExp(REQ.LIMIT_HINT.replace(/\./g, '\\.'))); // TODO(harden)
    });
    await journey.step('And the Submit button has an accessible name', async () => {
      await expect(dialog.locator('button[type="submit"]'), '[REQ AC-11 strict] the Submit button has an accessible name').toHaveAccessibleName(/\S/); // TODO(harden)
    });
  });

  test('SCN-015: Write, like and edit: the review keeps its author and its like', { tag: ['@AC-12', '@type:composition', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let a!: Account; let b!: Account; let review: Review | undefined; const message = unique(); const edited = unique();
    await journey.step('Given customers A and B are signed in', async () => { a = await seed.account('customer A'); b = await seed.account('customer B'); });
    await journey.step('When A writes a review for product 1', async () => {
      await api.put(EP.restProductsReviewsById(PRODUCT.id), { headers: a.headers, data: { message, author: a.username } });
      review = byMessage(await reviews(api), message)[0];
      expect(review, '[REQ AC-12] GET /rest/products/1/reviews lists A\'s new review').toBeDefined();
      seed.track('the review under test', { message });
    });
    await journey.step('And B likes that review', async () => { await api.post(EP.restProductsReviews, { headers: b.headers, data: { id: review!._id } }); });
    await journey.step('And A edits that review\'s message', async () => { await api.patch(EP.restProductsReviews, { headers: a.headers, data: { id: review!._id, message: edited } }); });
    let now: Review | undefined;
    await journey.step('Then the review shows A\'s edited message', async () => {
      now = (await reviews(api)).find((r) => r._id === review!._id);
      expect.soft(now?.message, '[REQ AC-12] GET /rest/products/1/reviews shows the edited message').toBe(edited);
    });
    await journey.step('And it still names A\'s e-mail as its author', async () => {
      expect.soft(now?.author, '[REQ AC-12] GET /rest/products/1/reviews still names A as author').toBe(a.username);
    });
    await journey.step('And its likesCount is 1 and its likedBy contains B\'s e-mail', async () => {
      expect.soft(now?.likesCount, '[REQ AC-12] GET /rest/products/1/reviews likesCount is 1').toBe(REQ.LIKES_AFTER_ONE);
      expect.soft(now?.likedBy, '[REQ AC-12] GET /rest/products/1/reviews likedBy contains B').toContain(b.username);
    });
  });

  test('SCN-016: A review written and liked through the API is shown in the dialog', { tag: ['@AC-13', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
    let a!: Account; let review!: Review; let dialog!: ReturnType<Page['getByRole']>;
    await journey.step('Given customer A has written a review for product 1 through the API', async () => { a = await seed.account('customer A'); review = await seedReview(api, seed, a); });
    await journey.step('And customer B has liked it through the API', async () => { await seedLike(api, seed, await seed.account('customer B'), review); });
    await journey.step('When I open the details dialog of "Apple Juice (1000ml)" and its Reviews list', async () => {
      dialog = await openProductDialog(page);
      await openReviewsList(dialog);
    });
    await journey.step('Then the list shows the review\'s message with A\'s e-mail as its author', async () => {
      await expect(dialog.getByText(review.message, { exact: true }), '[REQ AC-13] the dialog lists the API-written review\'s message').toBeVisible();
      await expect(reviewEntry(dialog, review.message), '[REQ AC-13] the listed review names A as author').toContainText(a.username);
    });
    await journey.step('And the review shows 1 as its like count', async () => {
      await expect(reviewEntry(dialog, review.message), '[REQ AC-13] the listed review shows 1 like').toContainText(String(REQ.LIKES_AFTER_ONE)); // TODO(harden)
    });
  });
});
