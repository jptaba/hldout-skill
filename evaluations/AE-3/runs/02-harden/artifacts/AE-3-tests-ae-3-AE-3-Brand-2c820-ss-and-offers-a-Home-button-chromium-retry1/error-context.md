# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-3\tests\ae-3.spec.ts >> AE-3 Brands in the catalogue API and shop, and the Contact Us form >> SCN-011: Sending the form asks for confirmation, shows success and offers a Home button
- Location: evaluations\AE-3\tests\ae-3.spec.ts:322:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Submit' })
    - locator resolved to <input type="submit" name="submit" value="Submit" data-qa="submit-button" class="btn btn-primary pull-left submit_form"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action

```

# Test source

```ts
  9   | const REQ = {
  10  |   HTTP_STATUS: 200,
  11  |   RESPONSE_CODE_OK: 200,
  12  |   RESPONSE_CODE_NOT_SUPPORTED: 405,
  13  |   NOT_SUPPORTED_MESSAGE: 'This request method is not supported.',
  14  |   UNSUPPORTED_METHODS: ['PUT', 'POST', 'DELETE'],
  15  |   BRANDS_KEY: 'brands',
  16  |   COUNT_IN_PARENTHESES: /\((\d+)\)/,
  17  |   BRAND_PAGE_HEADING: (brand: string) => `Brand - ${brand} Products`,
  18  |   BRANDS_TO_CHECK: ['Polo', 'H&M', 'Mast & Harbour'],
  19  |   PLACEHOLDERS: { name: 'Name', email: 'Email', subject: 'Subject', message: 'Your Message Here' },
  20  |   SUBMIT_LABEL: 'Submit',
  21  |   CONFIRM_TEXT: 'Press OK to proceed!',
  22  |   CONFIRM_TYPE: 'confirm',
  23  |   SUCCESS_MESSAGE: 'Success! Your details have been submitted successfully.',
  24  |   HOME_LABEL: 'Home',
  25  |   HOME_PATH: '/',
  26  | } as const;
  27  | // @req-constants-end
  28  | 
  29  | // Endpoints exactly as declared in the requirement.
  30  | const EP = {
  31  |   /** GET, PUT, POST, DELETE /api/brandsList */ brandslist: '/api/brandsList',
  32  |   /** GET /api/productsList */ productslist: '/api/productsList',
  33  | };
  34  | 
  35  | type BrandEntry = { id?: unknown; brand?: unknown };
  36  | type Product = { id?: unknown; brand?: unknown; name?: unknown };
  37  | 
  38  | /** The catalogue API may label its JSON with a non-JSON content type: parse the text when needed (mechanics). */
  39  | function jsonOf(res: ApiResponse): Record<string, unknown> {
  40  |   if (res.body && typeof res.body === 'object') return res.body as Record<string, unknown>;
  41  |   try { return JSON.parse(res.text) as Record<string, unknown>; } catch { return {}; }
  42  | }
  43  | 
  44  | /** GET /api/productsList → products (G1: shape discovered in hardening). */
  45  | async function readProducts(api: Api): Promise<Product[]> {
  46  |   const res = await api.get(EP.productslist);
  47  |   const products = jsonOf(res).products; // TODO(harden) G1 shape of productsList
  48  |   expect(Array.isArray(products), 'productsList returns a product list (precondition)').toBe(true);
  49  |   return products as Product[];
  50  | }
  51  | 
  52  | // ---------- UI helpers (locators hardened in phase 4) ----------
  53  | const brandsPanel = (page: Page): Locator => page.locator('.brands_products'); // TODO(harden)
  54  | const brandEntries = (page: Page): Locator => brandsPanel(page).getByRole('link'); // TODO(harden)
  55  | 
  56  | const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  57  | 
  58  | /** Reads each Brands-panel entry as { name, count } from its text (the count "(n)" may sit before or after the name). */
  59  | async function readBrandPanel(page: Page): Promise<{ raw: string; name: string; count: number | null }[]> {
  60  |   await expect(brandEntries(page).first(), 'Brands panel has entries (precondition)').toBeVisible();
  61  |   const texts = await brandEntries(page).evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()));
  62  |   return texts.map((raw) => {
  63  |     const m = raw.match(REQ.COUNT_IN_PARENTHESES);
  64  |     return { raw, name: raw.replace(REQ.COUNT_IN_PARENTHESES, '').replace(/\s+/g, ' ').trim(), count: m ? Number(m[1]) : null };
  65  |   });
  66  | }
  67  | 
  68  | /** Product ids listed on a brand page (G2: matched through each product's details link). */
  69  | async function productIdsOnPage(page: Page): Promise<string[]> {
  70  |   const links = page.getByRole('link', { name: 'View Product' }); // TODO(harden) G2
  71  |   await expect(links.first(), 'brand page lists products (precondition)').toBeVisible();
  72  |   const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
  73  |   return hrefs.map((h) => h.match(/(\d+)\/?$/)?.[1] ?? `?${h}`);
  74  | }
  75  | 
  76  | const contact = {
  77  |   name: (page: Page) => page.getByPlaceholder(REQ.PLACEHOLDERS.name, { exact: true }), // TODO(harden)
  78  |   email: (page: Page) => page.getByPlaceholder(REQ.PLACEHOLDERS.email, { exact: true }), // TODO(harden)
  79  |   subject: (page: Page) => page.getByPlaceholder(REQ.PLACEHOLDERS.subject, { exact: true }), // TODO(harden)
  80  |   message: (page: Page) => page.getByPlaceholder(REQ.PLACEHOLDERS.message, { exact: true }), // TODO(harden)
  81  |   submit: (page: Page) => page.getByRole('button', { name: REQ.SUBMIT_LABEL }), // TODO(harden)
  82  |   success: (page: Page) => page.getByText(REQ.SUCCESS_MESSAGE), // TODO(harden)
  83  |   home: (page: Page) => page.getByRole('link', { name: REQ.HOME_LABEL }).last(), // TODO(harden)
  84  | };
  85  | 
  86  | type Typed = { name: string; email: string; subject: string; message: string };
  87  | function validValues(data: TestData): Typed {
  88  |   const tag = unique('qa');
  89  |   const local = tag.replace(/[^A-Za-z0-9-]+/g, '.'); // unique() contains a space: not usable in an e-mail local part
  90  |   return { name: `QA ${tag}`, email: `${local}@${data.contact.emailDomain}`, subject: `QA subject ${tag}`, message: `QA held-out message ${tag}` };
  91  | }
  92  | 
  93  | async function fill(page: Page, v: Partial<Typed>) {
  94  |   if (v.name !== undefined) await contact.name(page).fill(v.name);
  95  |   if (v.email !== undefined) await contact.email(page).fill(v.email);
  96  |   if (v.subject !== undefined) await contact.subject(page).fill(v.subject);
  97  |   if (v.message !== undefined) await contact.message(page).fill(v.message);
  98  | }
  99  | 
  100 | /**
  101 |  * Clicks Submit and waits (bounded) for the form's request, if any, then for the page to settle.
  102 |  * `onDialog` decides how a confirmation is answered. Returns the dialogs seen.
  103 |  */
  104 | async function submitForm(page: Page, onDialog: (d: Dialog) => Promise<void>): Promise<{ dialogs: { type: string; message: string }[]; posted: boolean }> {
  105 |   const dialogs: { type: string; message: string }[] = [];
  106 |   const handler = async (d: Dialog) => { dialogs.push({ type: d.type(), message: d.message() }); await onDialog(d); };
  107 |   page.on('dialog', handler);
  108 |   const post = page.waitForRequest((r: Request) => r.method() === 'POST' && r.resourceType() === 'document', { timeout: 5_000 }).catch(() => null);
> 109 |   await contact.submit(page).click();
      |                              ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  110 |   const posted = Boolean(await post);
  111 |   if (posted) await page.waitForLoadState('domcontentloaded');
  112 |   page.off('dialog', handler);
  113 |   return { dialogs, posted };
  114 | }
  115 | 
  116 | test.describe('AE-3 Brands in the catalogue API and shop, and the Contact Us form', () => {
  117 |   // ---------------- API ----------------
  118 |   test('SCN-001: The brands list has the agreed shape', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  119 |     let res!: ApiResponse;
  120 |     let body: Record<string, unknown> = {};
  121 |     await journey.step('Given the public catalogue API is reachable', async () => { /* checked by the run preflight healthcheck */ });
  122 |     await journey.step('When I request GET /api/brandsList', async () => { res = await api.get(EP.brandslist); body = jsonOf(res); });
  123 |     await journey.step('Then the HTTP status is 200', async () => {
  124 |       expect.soft(res.status, '[REQ AC-1] HTTP status 200').toBe(REQ.HTTP_STATUS);
  125 |     });
  126 |     await journey.step('And the body responseCode is 200', async () => {
  127 |       expect.soft(body.responseCode, '[REQ AC-1] body responseCode 200').toBe(REQ.RESPONSE_CODE_OK);
  128 |     });
  129 |     await journey.step('And the body has a "brands" array', async () => {
  130 |       expect(Array.isArray(body[REQ.BRANDS_KEY]), '[REQ AC-1] body has a "brands" array').toBe(true);
  131 |     });
  132 |     await journey.step('And every entry has an "id" and a "brand"', async () => {
  133 |       const entries = body[REQ.BRANDS_KEY] as BrandEntry[];
  134 |       const violations = entries.flatMap((e, i) => checkShape(e, {
  135 |         id: (v) => v !== undefined && v !== null && v !== '' || 'missing',
  136 |         brand: (v) => v !== undefined && v !== null && v !== '' || 'missing',
  137 |       }, `brands[${i}]`));
  138 |       expect(violations, '[REQ AC-1] every entry has an id and a brand').toEqual([]);
  139 |     });
  140 |   });
  141 | 
  142 |   test('SCN-002: Every brandsList entry names the brand of the product with that id', { tag: ['@AC-1', '@type:integration', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  143 |     let products: Product[] = [];
  144 |     let entries: BrandEntry[] = [];
  145 |     await journey.step('Given I read the catalogue with GET /api/productsList', async () => {
  146 |       products = await seed.step('read the catalogue (GET /api/productsList)', () => readProducts(api));
  147 |     });
  148 |     await journey.step('When I request GET /api/brandsList', async () => {
  149 |       const res = await api.get(EP.brandslist);
  150 |       entries = (jsonOf(res)[REQ.BRANDS_KEY] ?? []) as BrandEntry[];
  151 |       expect(Array.isArray(entries) && entries.length > 0, 'brandsList returned entries (precondition)').toBe(true);
  152 |     });
  153 |     await journey.step('Then for every entry, the product with that id in GET /api/productsList has exactly that brand', async () => {
  154 |       const byId = new Map(products.map((p) => [String(p.id), p]));
  155 |       const mismatches = entries.flatMap((e) => {
  156 |         const p = byId.get(String(e.id));
  157 |         if (!p) return [`id ${String(e.id)} (${String(e.brand)}): no product with that id`];
  158 |         return p.brand === e.brand ? [] : [`id ${String(e.id)}: brandsList "${String(e.brand)}" vs productsList "${String(p.brand)}"`];
  159 |       });
  160 |       expect.soft(mismatches, '[REQ AC-1] each entry\'s brand equals the brand of the product with that id').toEqual([]);
  161 |     });
  162 |     await journey.step('And there is exactly one entry per catalogue product', async () => {
  163 |       const ids = entries.map((e) => String(e.id)).sort();
  164 |       const productIds = products.map((p) => String(p.id)).sort();
  165 |       expect.soft(ids, '[REQ AC-1] one brandsList entry per catalogue product (R1)').toEqual(productIds);
  166 |     });
  167 |   });
  168 | 
  169 |   REQ.UNSUPPORTED_METHODS.forEach((method, i) => {
  170 |     test(`SCN-003.${i + 1}: Unsupported methods on the brands list are refused in the body (${method})`, { tag: ['@AC-2', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  171 |       let res!: ApiResponse;
  172 |       await journey.step('Given the public catalogue API is reachable', async () => { /* checked by the run preflight healthcheck */ });
  173 |       await journey.step(`When I send ${method} /api/brandsList`, async () => { res = await api.call(method, EP.brandslist); });
  174 |       await journey.step('Then the HTTP status is 200', async () => {
  175 |         expect.soft(res.status, `[REQ AC-2] ${method}: HTTP status stays 200`).toBe(REQ.HTTP_STATUS);
  176 |       });
  177 |       await journey.step('And the body responseCode is 405 with message "This request method is not supported."', async () => {
  178 |         const body = jsonOf(res);
  179 |         expect.soft(body.responseCode, `[REQ AC-2] ${method}: body responseCode 405`).toBe(REQ.RESPONSE_CODE_NOT_SUPPORTED);
  180 |         expect.soft(body.message, `[REQ AC-2] ${method}: body message`).toBe(REQ.NOT_SUPPORTED_MESSAGE);
  181 |       });
  182 |     });
  183 |   });
  184 | 
  185 |   // ---------------- Brands panel (UI / E2E) ----------------
  186 |   test('SCN-004: The Brands panel lists each brand once with its product count', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  187 |     let panel: Awaited<ReturnType<typeof readBrandPanel>> = [];
  188 |     await journey.step('Given I am on the Products page', async () => { await gotoPage(page, '/products'); });
  189 |     await journey.step('When I read the "Brands" panel in the left-hand sidebar', async () => {
  190 |       await expect(brandsPanel(page), 'Brands panel present (precondition)').toBeVisible();
  191 |       panel = await readBrandPanel(page);
  192 |     });
  193 |     await journey.step('Then each brand entry shows the number of its products in parentheses, e.g. "(6)"', async () => {
  194 |       const withoutCount = panel.filter((b) => b.count === null).map((b) => b.raw);
  195 |       expect.soft(withoutCount, '[REQ AC-3] every brand entry shows "(n)"').toEqual([]);
  196 |     });
  197 |     await journey.step('And no brand is listed more than once', async () => {
  198 |       const names = panel.map((b) => b.name);
  199 |       const dupes = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
  200 |       expect.soft(dupes, '[REQ AC-3] each brand listed exactly once').toEqual([]);
  201 |     });
  202 |   });
  203 | 
  204 |   test('SCN-005: The Brands panel matches the brands list of the API', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
  205 |     let entries: BrandEntry[] = [];
  206 |     let panel: Awaited<ReturnType<typeof readBrandPanel>> = [];
  207 |     await journey.step('Given I read the brands with GET /api/brandsList', async () => {
  208 |       entries = await seed.step('read the brands (GET /api/brandsList)', async () => {
  209 |         const list = (jsonOf(await api.get(EP.brandslist))[REQ.BRANDS_KEY] ?? []) as BrandEntry[];
```