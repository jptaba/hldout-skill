/**
 * Held-out acceptance tests for AE-3 — "Brands in the catalogue API and shop, and the Contact Us form".
 * Written from evaluations/AE-3/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Dialog, Locator, Page, Request } from '@playwright/test';
import { test, expect, gotoPage, unique, checkShape, type Api, type ApiResponse, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from AE-3 (never edit during hardening)
const REQ = {
  HTTP_STATUS: 200,
  RESPONSE_CODE_OK: 200,
  RESPONSE_CODE_NOT_SUPPORTED: 405,
  NOT_SUPPORTED_MESSAGE: 'This request method is not supported.',
  UNSUPPORTED_METHODS: ['PUT', 'POST', 'DELETE'],
  BRANDS_KEY: 'brands',
  COUNT_IN_PARENTHESES: /\((\d+)\)/,
  BRAND_PAGE_HEADING: (brand: string) => `Brand - ${brand} Products`,
  BRANDS_TO_CHECK: ['Polo', 'H&M', 'Mast & Harbour'],
  PLACEHOLDERS: { name: 'Name', email: 'Email', subject: 'Subject', message: 'Your Message Here' },
  SUBMIT_LABEL: 'Submit',
  CONFIRM_TEXT: 'Press OK to proceed!',
  CONFIRM_TYPE: 'confirm',
  SUCCESS_MESSAGE: 'Success! Your details have been submitted successfully.',
  HOME_LABEL: 'Home',
  HOME_PATH: '/',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** GET, PUT, POST, DELETE /api/brandsList */ brandslist: '/api/brandsList',
  /** GET /api/productsList */ productslist: '/api/productsList',
};

type BrandEntry = { id?: unknown; brand?: unknown };
type Product = { id?: unknown; brand?: unknown; name?: unknown };

/** The catalogue API may label its JSON with a non-JSON content type: parse the text when needed (mechanics). */
function jsonOf(res: ApiResponse): Record<string, unknown> {
  if (res.body && typeof res.body === 'object') return res.body as Record<string, unknown>;
  try { return JSON.parse(res.text) as Record<string, unknown>; } catch { return {}; }
}

/** GET /api/productsList → products (G1: shape discovered in hardening). */
async function readProducts(api: Api): Promise<Product[]> {
  const res = await api.get(EP.productslist);
  const products = jsonOf(res).products; // TODO(harden) G1 shape of productsList
  expect(Array.isArray(products), 'productsList returns a product list (precondition)').toBe(true);
  return products as Product[];
}

// ---------- UI helpers (locators hardened in phase 4) ----------
const brandsPanel = (page: Page): Locator => page.locator('.brands_products'); // TODO(harden)
const brandEntries = (page: Page): Locator => brandsPanel(page).getByRole('link'); // TODO(harden)

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Reads each Brands-panel entry as { name, count } from its text (the count "(n)" may sit before or after the name). */
async function readBrandPanel(page: Page): Promise<{ raw: string; name: string; count: number | null }[]> {
  await expect(brandEntries(page).first(), 'Brands panel has entries (precondition)').toBeVisible();
  const texts = await brandEntries(page).evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()));
  return texts.map((raw) => {
    const m = raw.match(REQ.COUNT_IN_PARENTHESES);
    return { raw, name: raw.replace(REQ.COUNT_IN_PARENTHESES, '').replace(/\s+/g, ' ').trim(), count: m ? Number(m[1]) : null };
  });
}

/** Product ids listed on a brand page (G2: matched through each product's details link). */
async function productIdsOnPage(page: Page): Promise<string[]> {
  const links = page.getByRole('link', { name: 'View Product' }); // TODO(harden) G2
  await expect(links.first(), 'brand page lists products (precondition)').toBeVisible();
  const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
  return hrefs.map((h) => h.match(/(\d+)\/?$/)?.[1] ?? `?${h}`);
}

const contact = {
  name: (page: Page) => page.getByPlaceholder(REQ.PLACEHOLDERS.name, { exact: true }), // TODO(harden)
  email: (page: Page) => page.getByPlaceholder(REQ.PLACEHOLDERS.email, { exact: true }), // TODO(harden)
  subject: (page: Page) => page.getByPlaceholder(REQ.PLACEHOLDERS.subject, { exact: true }), // TODO(harden)
  message: (page: Page) => page.getByPlaceholder(REQ.PLACEHOLDERS.message, { exact: true }), // TODO(harden)
  submit: (page: Page) => page.getByRole('button', { name: REQ.SUBMIT_LABEL }), // TODO(harden)
  success: (page: Page) => page.getByText(REQ.SUCCESS_MESSAGE), // TODO(harden)
  home: (page: Page) => page.getByRole('link', { name: REQ.HOME_LABEL }).last(), // TODO(harden)
};

type Typed = { name: string; email: string; subject: string; message: string };
function validValues(data: TestData): Typed {
  const tag = unique('qa');
  return { name: `QA ${tag}`, email: `${tag}@${data.contact.emailDomain}`, subject: `QA subject ${tag}`, message: `QA held-out message ${tag}` };
}

async function fill(page: Page, v: Partial<Typed>) {
  if (v.name !== undefined) await contact.name(page).fill(v.name);
  if (v.email !== undefined) await contact.email(page).fill(v.email);
  if (v.subject !== undefined) await contact.subject(page).fill(v.subject);
  if (v.message !== undefined) await contact.message(page).fill(v.message);
}

/**
 * Clicks Submit and waits (bounded) for the form's request, if any, then for the page to settle.
 * `onDialog` decides how a confirmation is answered. Returns the dialogs seen.
 */
async function submitForm(page: Page, onDialog: (d: Dialog) => Promise<void>): Promise<{ dialogs: { type: string; message: string }[]; posted: boolean }> {
  const dialogs: { type: string; message: string }[] = [];
  const handler = async (d: Dialog) => { dialogs.push({ type: d.type(), message: d.message() }); await onDialog(d); };
  page.on('dialog', handler);
  const post = page.waitForRequest((r: Request) => r.method() === 'POST' && r.resourceType() === 'document', { timeout: 5_000 }).catch(() => null);
  await contact.submit(page).click();
  const posted = Boolean(await post);
  if (posted) await page.waitForLoadState('domcontentloaded');
  page.off('dialog', handler);
  return { dialogs, posted };
}

test.describe('AE-3 Brands in the catalogue API and shop, and the Contact Us form', () => {
  // ---------------- API ----------------
  test('SCN-001: The brands list has the agreed shape', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: ApiResponse;
    let body: Record<string, unknown> = {};
    await journey.step('Given the public catalogue API is reachable', async () => { /* checked by the run preflight healthcheck */ });
    await journey.step('When I request GET /api/brandsList', async () => { res = await api.get(EP.brandslist); body = jsonOf(res); });
    await journey.step('Then the HTTP status is 200', async () => {
      expect.soft(res.status, '[REQ AC-1] HTTP status 200').toBe(REQ.HTTP_STATUS);
    });
    await journey.step('And the body responseCode is 200', async () => {
      expect.soft(body.responseCode, '[REQ AC-1] body responseCode 200').toBe(REQ.RESPONSE_CODE_OK);
    });
    await journey.step('And the body has a "brands" array', async () => {
      expect(Array.isArray(body[REQ.BRANDS_KEY]), '[REQ AC-1] body has a "brands" array').toBe(true);
    });
    await journey.step('And every entry has an "id" and a "brand"', async () => {
      const entries = body[REQ.BRANDS_KEY] as BrandEntry[];
      const violations = entries.flatMap((e, i) => checkShape(e, {
        id: (v) => v !== undefined && v !== null && v !== '' || 'missing',
        brand: (v) => v !== undefined && v !== null && v !== '' || 'missing',
      }, `brands[${i}]`));
      expect(violations, '[REQ AC-1] every entry has an id and a brand').toEqual([]);
    });
  });

  test('SCN-002: Every brandsList entry names the brand of the product with that id', { tag: ['@AC-1', '@type:integration', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let products: Product[] = [];
    let entries: BrandEntry[] = [];
    await journey.step('Given I read the catalogue with GET /api/productsList', async () => {
      products = await seed.step('read the catalogue (GET /api/productsList)', () => readProducts(api));
    });
    await journey.step('When I request GET /api/brandsList', async () => {
      const res = await api.get(EP.brandslist);
      entries = (jsonOf(res)[REQ.BRANDS_KEY] ?? []) as BrandEntry[];
      expect(Array.isArray(entries) && entries.length > 0, 'brandsList returned entries (precondition)').toBe(true);
    });
    await journey.step('Then for every entry, the product with that id in GET /api/productsList has exactly that brand', async () => {
      const byId = new Map(products.map((p) => [String(p.id), p]));
      const mismatches = entries.flatMap((e) => {
        const p = byId.get(String(e.id));
        if (!p) return [`id ${String(e.id)} (${String(e.brand)}): no product with that id`];
        return p.brand === e.brand ? [] : [`id ${String(e.id)}: brandsList "${String(e.brand)}" vs productsList "${String(p.brand)}"`];
      });
      expect.soft(mismatches, '[REQ AC-1] each entry\'s brand equals the brand of the product with that id').toEqual([]);
    });
    await journey.step('And there is exactly one entry per catalogue product', async () => {
      const ids = entries.map((e) => String(e.id)).sort();
      const productIds = products.map((p) => String(p.id)).sort();
      expect.soft(ids, '[REQ AC-1] one brandsList entry per catalogue product (R1)').toEqual(productIds);
    });
  });

  REQ.UNSUPPORTED_METHODS.forEach((method, i) => {
    test(`SCN-003.${i + 1}: Unsupported methods on the brands list are refused in the body (${method})`, { tag: ['@AC-2', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
      let res!: ApiResponse;
      await journey.step('Given the public catalogue API is reachable', async () => { /* checked by the run preflight healthcheck */ });
      await journey.step(`When I send ${method} /api/brandsList`, async () => { res = await api.call(method, EP.brandslist); });
      await journey.step('Then the HTTP status is 200', async () => {
        expect.soft(res.status, `[REQ AC-2] ${method}: HTTP status stays 200`).toBe(REQ.HTTP_STATUS);
      });
      await journey.step('And the body responseCode is 405 with message "This request method is not supported."', async () => {
        const body = jsonOf(res);
        expect.soft(body.responseCode, `[REQ AC-2] ${method}: body responseCode 405`).toBe(REQ.RESPONSE_CODE_NOT_SUPPORTED);
        expect.soft(body.message, `[REQ AC-2] ${method}: body message`).toBe(REQ.NOT_SUPPORTED_MESSAGE);
      });
    });
  });

  // ---------------- Brands panel (UI / E2E) ----------------
  test('SCN-004: The Brands panel lists each brand once with its product count', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    let panel: Awaited<ReturnType<typeof readBrandPanel>> = [];
    await journey.step('Given I am on the Products page', async () => { await gotoPage(page, '/products'); });
    await journey.step('When I read the "Brands" panel in the left-hand sidebar', async () => {
      await expect(brandsPanel(page), 'Brands panel present (precondition)').toBeVisible();
      panel = await readBrandPanel(page);
    });
    await journey.step('Then each brand entry shows the number of its products in parentheses, e.g. "(6)"', async () => {
      const withoutCount = panel.filter((b) => b.count === null).map((b) => b.raw);
      expect.soft(withoutCount, '[REQ AC-3] every brand entry shows "(n)"').toEqual([]);
    });
    await journey.step('And no brand is listed more than once', async () => {
      const names = panel.map((b) => b.name);
      const dupes = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
      expect.soft(dupes, '[REQ AC-3] each brand listed exactly once').toEqual([]);
    });
  });

  test('SCN-005: The Brands panel matches the brands list of the API', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
    let entries: BrandEntry[] = [];
    let panel: Awaited<ReturnType<typeof readBrandPanel>> = [];
    await journey.step('Given I read the brands with GET /api/brandsList', async () => {
      entries = await seed.step('read the brands (GET /api/brandsList)', async () => {
        const list = (jsonOf(await api.get(EP.brandslist))[REQ.BRANDS_KEY] ?? []) as BrandEntry[];
        expect(Array.isArray(list) && list.length > 0, 'brandsList returned entries (precondition)').toBe(true);
        return list;
      });
    });
    await journey.step('And I am on the Products page', async () => { await gotoPage(page, '/products'); });
    await journey.step('When I read the "Brands" panel in the left-hand sidebar', async () => { panel = await readBrandPanel(page); });
    const expected = () => {
      const counts = new Map<string, number>();
      for (const e of entries) counts.set(String(e.brand), (counts.get(String(e.brand)) ?? 0) + 1);
      return counts;
    };
    await journey.step('Then the brands in the panel are exactly the distinct brand names in brandsList', async () => {
      const apiBrands = [...expected().keys()].sort();
      const uiBrands = [...new Set(panel.map((b) => b.name))].sort();
      expect.soft(uiBrands, '[REQ AC-4] sidebar brands = distinct brandsList brands').toEqual(apiBrands);
    });
    await journey.step('And the number next to each brand equals the number of brandsList entries with that brand', async () => {
      const counts = expected();
      const wrong = panel
        .filter((b) => counts.has(b.name) && b.count !== counts.get(b.name))
        .map((b) => `${b.name}: shows ${b.count === null ? 'no count' : `(${b.count})`}, brandsList has ${counts.get(b.name)}`);
      expect.soft(wrong, '[REQ AC-4] count next to each brand = number of brandsList entries').toEqual([]);
    });
  });

  REQ.BRANDS_TO_CHECK.forEach((brand, i) => {
    test(`SCN-006.${i + 1}: A brand's page lists exactly that brand's products (${brand})`, { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
      let products: Product[] = [];
      await journey.step('Given I read the catalogue with GET /api/productsList', async () => {
        products = await seed.step('read the catalogue (GET /api/productsList)', () => readProducts(api));
      });
      await journey.step('And I am on the Products page', async () => { await gotoPage(page, '/products'); });
      await journey.step(`When I click "${brand}" in the "Brands" panel`, async () => {
        const entry = brandEntries(page).filter({ hasText: new RegExp(`^\\s*(\\(\\d+\\)\\s*)?${esc(brand)}\\s*(\\(\\d+\\)\\s*)?$`) }); // TODO(harden)
        await entry.click();
        await page.waitForLoadState('domcontentloaded');
      });
      await journey.step(`Then the page is headed "Brand - ${brand} Products"`, async () => {
        const heading = page.getByRole('heading', { name: /^\s*Brand\b/i }); // TODO(harden)
        await expect.soft(heading, `[REQ AC-5] heading "Brand - ${brand} Products"`).toHaveText(REQ.BRAND_PAGE_HEADING(brand));
      });
      await journey.step(`And the page lists exactly the products that productsList gives "${brand}"`, async () => {
        const expectedIds = products.filter((p) => p.brand === brand).map((p) => String(p.id)).sort();
        const shownIds = [...await productIdsOnPage(page)].sort();
        expect.soft(shownIds, `[REQ AC-5] ${brand} page lists exactly productsList's ${brand} products (by id)`).toEqual(expectedIds);
      });
    });
  });

  // ---------------- Contact Us (UI) ----------------
  test('SCN-007: The Contact Us form offers the mock-up\'s fields', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
    await journey.step('When I look at the "Get In Touch" form', async () => {
      await expect(page.getByRole('heading', { name: /get in touch/i }), 'form heading visible (precondition)').toBeVisible(); // TODO(harden)
    });
    await journey.step('Then it offers a Name field with placeholder "Name"', async () => {
      await expect.soft(contact.name(page), '[REQ AC-6] Name field').toBeVisible();
    });
    await journey.step('And it offers an Email field with placeholder "Email"', async () => {
      await expect.soft(contact.email(page), '[REQ AC-6] Email field').toBeVisible();
    });
    await journey.step('And it offers a Subject field with placeholder "Subject"', async () => {
      await expect.soft(contact.subject(page), '[REQ AC-6] Subject field').toBeVisible();
    });
    await journey.step('And it offers a multi-line Message field with placeholder "Your Message Here"', async () => {
      await expect.soft(contact.message(page), '[REQ AC-6] Message field').toBeVisible();
      expect.soft(await contact.message(page).evaluate((e) => e.tagName.toLowerCase()).catch(() => 'missing'), '[REQ AC-6] Message is multi-line').toBe('textarea');
    });
    await journey.step('And it offers a "Submit" button', async () => {
      await expect.soft(contact.submit(page), '[REQ AC-6] Submit button').toBeVisible();
    });
  });

  test('SCN-008: The form is not sent while the mandatory Email is empty', { tag: ['@AC-6', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
    await journey.step('And I filled Name, Subject and Message with unique values and left Email empty', async () => {
      const tag = unique('qa');
      await fill(page, { name: `QA ${tag}`, subject: `QA subject ${tag}`, message: `QA held-out message ${tag}` });
    });
    await journey.step('When I click "Submit" and accept any confirmation', async () => { await submitForm(page, (d) => d.accept()); });
    await journey.step('Then no success message is shown', async () => {
      await expect.soft(contact.success(page), '[REQ AC-6] Email empty: form not sent (no success message)').toHaveCount(0);
    });
    await journey.step('And the form is still on the page', async () => {
      await expect.soft(contact.email(page), '[REQ AC-6] Email empty: form still on the page').toBeVisible();
    });
  });

  test('SCN-009: The form is not sent with an e-mail that is not a valid address', { tag: ['@AC-6', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
    await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
    await journey.step('And I filled Name, Subject and Message with unique values and Email with "not-an-email"', async () => {
      const tag = unique('qa');
      await fill(page, { name: `QA ${tag}`, email: data.contact.invalidEmail, subject: `QA subject ${tag}`, message: `QA held-out message ${tag}` });
    });
    await journey.step('When I click "Submit" and accept any confirmation', async () => { await submitForm(page, (d) => d.accept()); });
    await journey.step('Then no success message is shown', async () => {
      await expect.soft(contact.success(page), '[REQ AC-6] invalid e-mail: form not sent (no success message)').toHaveCount(0);
    });
    await journey.step('And the form is still on the page', async () => {
      await expect.soft(contact.email(page), '[REQ AC-6] invalid e-mail: form still on the page').toBeVisible();
    });
  });

  test('SCN-010: The form can be sent with only a valid Email', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
    await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
    await journey.step('And I filled only Email with a unique valid address', async () => { await fill(page, { email: validValues(data).email }); });
    await journey.step('When I click "Submit" and confirm with OK', async () => { await submitForm(page, (d) => d.accept()); });
    await journey.step('Then the success message is shown', async () => {
      await expect(contact.success(page), '[REQ AC-6] optional fields empty: the form is sent (success message)').toBeVisible();
    });
  });

  test('SCN-011: Sending the form asks for confirmation, shows success and offers a Home button', { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, baseURL }) => {
    let seen: { dialogs: { type: string; message: string }[]; posted: boolean } = { dialogs: [], posted: false };
    let pending: Promise<typeof seen> | undefined;
    let dialogShown!: Promise<Dialog>;
    let resolveOk!: () => void;
    const okGiven = new Promise<void>((r) => { resolveOk = r; });
    await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
    await journey.step('And I filled Name, Email, Subject and Message with unique valid values', async () => { await fill(page, validValues(data)); });
    await journey.step('When I click "Submit"', async () => {
      dialogShown = page.waitForEvent('dialog', { timeout: 10_000 });
      pending = submitForm(page, async (d) => { await okGiven; await d.accept(); });
    });
    await journey.step('Then a browser confirmation "Press OK to proceed!" is shown', async () => {
      const d = await dialogShown.catch(() => null);
      expect(d?.type() ?? 'no dialog', '[REQ AC-7] a browser confirmation is shown').toBe(REQ.CONFIRM_TYPE);
      expect.soft(d?.message(), '[REQ AC-7] confirmation text').toBe(REQ.CONFIRM_TEXT);
    });
    await journey.step('When I confirm with OK', async () => { resolveOk(); seen = await pending!; });
    await journey.step('Then the message "Success! Your details have been submitted successfully." is shown', async () => {
      await expect(contact.success(page), '[REQ AC-7] success message after OK').toBeVisible();
    });
    await journey.step('And the form is replaced by a "Home" button', async () => {
      await expect.soft(contact.email(page), '[REQ AC-7] the form is replaced (fields gone)').toBeHidden();
      await expect(contact.home(page), '[REQ AC-7] a "Home" button replaces the form').toBeVisible();
    });
    await journey.step('When I click "Home"', async () => { await contact.home(page).click(); await page.waitForLoadState('domcontentloaded'); });
    await journey.step('Then I am on the home page', async () => {
      await expect(page, '[REQ AC-7] "Home" returns to the home page').toHaveURL(new URL(REQ.HOME_PATH, baseURL).toString()); // G3
    });
    void seen;
  });

  test('SCN-012: Cancelling the confirmation keeps the form as filled', { tag: ['@AC-8', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
    const typed = validValues(data);
    await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
    await journey.step('And I filled Name, Email, Subject and Message with unique valid values', async () => { await fill(page, typed); });
    await journey.step('When I click "Submit" and cancel the confirmation', async () => {
      const seen = await submitForm(page, (d) => d.dismiss());
      expect(seen.dialogs.length, 'a confirmation was shown to cancel (precondition)').toBeGreaterThan(0);
    });
    await journey.step('Then no success message is shown', async () => {
      await expect.soft(contact.success(page), '[REQ AC-8] no success message after Cancel').toHaveCount(0);
    });
    await journey.step('And the form is still on the page', async () => {
      await expect.soft(contact.submit(page), '[REQ AC-8] the form stays on the page').toBeVisible();
    });
    await journey.step('And every field still holds what I typed', async () => {
      await expect.soft(contact.name(page), '[REQ AC-8] Name keeps its value').toHaveValue(typed.name);
      await expect.soft(contact.email(page), '[REQ AC-8] Email keeps its value').toHaveValue(typed.email);
      await expect.soft(contact.subject(page), '[REQ AC-8] Subject keeps its value').toHaveValue(typed.subject);
      await expect.soft(contact.message(page), '[REQ AC-8] Message keeps its value').toHaveValue(typed.message);
    });
  });
});
