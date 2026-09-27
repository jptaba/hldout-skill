# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-3\tests\ae-3.spec.ts >> AE-3 Brands in the catalogue API and shop, and the Contact Us form >> SCN-010: The form can be sent with only a valid Email
- Location: evaluations\AE-3\tests\ae-3.spec.ts:313:3

# Error details

```
Error: [REQ AC-6] optional fields empty: the form is sent (success message)

expect(locator).toBeVisible() failed

Locator: getByText('Success! Your details have been submitted successfully.')
Expected: visible
Error: strict mode violation: getByText('Success! Your details have been submitted successfully.') resolved to 2 elements:
    1) <div class="status alert alert-success">Success! Your details have been submitted success…</div> aka locator('#contact-page').getByText('Success! Your details have')
    2) <div class="alert-success alert">Success! Your details have been submitted success…</div> aka locator('#success-subscribe').getByText('Success! Your details have')

Call log:
  - [REQ AC-6] optional fields empty: the form is sent (success message) getByText('Success! Your details have been submitted successfully.') with timeout 5000ms
  - waiting for getByText('Success! Your details have been submitted successfully.')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e5]:
      - link [ref=e8] [cursor=pointer]:
        - /url: /
        - img "Website for automation practice" [ref=e9]
      - list [ref=e12]:
        - listitem [ref=e13]:
          - link " Home" [ref=e14] [cursor=pointer]:
            - /url: /
            - generic [ref=e15]: 
            - text: Home
        - listitem [ref=e16]:
          - link " Products" [ref=e17] [cursor=pointer]:
            - /url: /products
            - generic [ref=e18]: 
            - text: Products
        - listitem [ref=e19]:
          - link " Cart" [ref=e20] [cursor=pointer]:
            - /url: /view_cart
            - generic [ref=e21]: 
            - text: Cart
        - listitem [ref=e22]:
          - link " Signup / Login" [ref=e23] [cursor=pointer]:
            - /url: /login
            - generic [ref=e24]: 
            - text: Signup / Login
        - listitem [ref=e25]:
          - link " Test Cases" [ref=e26] [cursor=pointer]:
            - /url: /test_cases
            - generic [ref=e27]: 
            - text: Test Cases
        - listitem [ref=e28]:
          - link " API Testing" [ref=e29] [cursor=pointer]:
            - /url: /api_list
            - generic [ref=e30]: 
            - text: API Testing
        - listitem [ref=e31]:
          - link " Video Tutorials" [ref=e32] [cursor=pointer]:
            - /url: https://www.youtube.com/c/AutomationExercise
            - generic [ref=e33]: 
            - text: Video Tutorials
        - listitem [ref=e34]:
          - link " Contact us" [ref=e35] [cursor=pointer]:
            - /url: /contact_us
            - generic [ref=e36]: 
            - text: Contact us
  - generic [ref=e37]:
    - heading [level=2] [ref=e41]:
      - text: Contact
      - strong [ref=e42]: Us
    - generic [ref=e43]:
      - generic [ref=e45]:
        - generic [ref=e46]: "Note: Below contact form is for testing purpose."
        - heading "Get In Touch" [level=2] [ref=e47]
        - generic [ref=e48]: Success! Your details have been submitted successfully.
        - link " Home" [ref=e50] [cursor=pointer]:
          - /url: /
          - generic [ref=e51]:
            - generic [ref=e52]: 
            - text: Home
      - generic [ref=e54]:
        - heading "Feedback For Us" [level=2] [ref=e55]
        - generic [ref=e56]:
          - paragraph [ref=e57]: We really appreciate your response to our website.
          - paragraph [ref=e58]:
            - text: Kindly share your feedback with us at
            - link "feedback@automationexercise.com" [ref=e59] [cursor=pointer]:
              - /url: mailto:feedback@automationexercise.com
            - text: .
          - paragraph [ref=e60]: If you have any suggestion areas or improvements, do let us know. We will definitely work on it.
          - paragraph [ref=e61]: Thank you
  - contentinfo [ref=e62]:
    - generic [ref=e67]:
      - heading "Subscription" [level=2] [ref=e68]
      - generic [ref=e69]:
        - textbox "Your email address" [ref=e70]
        - button "" [ref=e71] [cursor=pointer]
        - paragraph [ref=e73]: Get the most recent updates from our site and be updated your self...
    - paragraph [ref=e77]: Copyright © 2021 All rights reserved
  - text: 
```

# Test source

```ts
  218 |       for (const e of entries) counts.set(String(e.brand), (counts.get(String(e.brand)) ?? 0) + 1);
  219 |       return counts;
  220 |     };
  221 |     await journey.step('Then the brands in the panel are exactly the distinct brand names in brandsList', async () => {
  222 |       const apiBrands = [...expected().keys()].sort();
  223 |       const uiBrands = [...new Set(panel.map((b) => b.name))].sort();
  224 |       expect.soft(uiBrands, '[REQ AC-4] sidebar brands = distinct brandsList brands').toEqual(apiBrands);
  225 |     });
  226 |     await journey.step('And the number next to each brand equals the number of brandsList entries with that brand', async () => {
  227 |       const counts = expected();
  228 |       const wrong = panel
  229 |         .filter((b) => counts.has(b.name) && b.count !== counts.get(b.name))
  230 |         .map((b) => `${b.name}: shows ${b.count === null ? 'no count' : `(${b.count})`}, brandsList has ${counts.get(b.name)}`);
  231 |       expect.soft(wrong, '[REQ AC-4] count next to each brand = number of brandsList entries').toEqual([]);
  232 |     });
  233 |   });
  234 | 
  235 |   REQ.BRANDS_TO_CHECK.forEach((brand, i) => {
  236 |     test(`SCN-006.${i + 1}: A brand's page lists exactly that brand's products (${brand})`, { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
  237 |       let products: Product[] = [];
  238 |       await journey.step('Given I read the catalogue with GET /api/productsList', async () => {
  239 |         products = await seed.step('read the catalogue (GET /api/productsList)', () => readProducts(api));
  240 |       });
  241 |       await journey.step('And I am on the Products page', async () => { await gotoPage(page, '/products'); });
  242 |       await journey.step(`When I click "${brand}" in the "Brands" panel`, async () => {
  243 |         const entry = brandEntries(page).filter({ hasText: new RegExp(`^\\s*(\\(\\d+\\)\\s*)?${esc(brand)}\\s*(\\(\\d+\\)\\s*)?$`) }); // TODO(harden)
  244 |         await entry.click();
  245 |         await page.waitForLoadState('domcontentloaded');
  246 |       });
  247 |       await journey.step(`Then the page is headed "Brand - ${brand} Products"`, async () => {
  248 |         const heading = page.getByRole('heading', { name: /^\s*Brand\b/i }); // TODO(harden)
  249 |         await expect.soft(heading, `[REQ AC-5] heading "Brand - ${brand} Products"`).toHaveText(REQ.BRAND_PAGE_HEADING(brand));
  250 |       });
  251 |       await journey.step(`And the page lists exactly the products that productsList gives "${brand}"`, async () => {
  252 |         const expectedIds = products.filter((p) => p.brand === brand).map((p) => String(p.id)).sort();
  253 |         const shownIds = [...await productIdsOnPage(page)].sort();
  254 |         expect.soft(shownIds, `[REQ AC-5] ${brand} page lists exactly productsList's ${brand} products (by id)`).toEqual(expectedIds);
  255 |       });
  256 |     });
  257 |   });
  258 | 
  259 |   // ---------------- Contact Us (UI) ----------------
  260 |   test('SCN-007: The Contact Us form offers the mock-up\'s fields', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  261 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  262 |     await journey.step('When I look at the "Get In Touch" form', async () => {
  263 |       await expect(page.getByRole('heading', { name: /get in touch/i }), 'form heading visible (precondition)').toBeVisible(); // TODO(harden)
  264 |     });
  265 |     await journey.step('Then it offers a Name field with placeholder "Name"', async () => {
  266 |       await expect.soft(contact.name(page), '[REQ AC-6] Name field').toBeVisible();
  267 |     });
  268 |     await journey.step('And it offers an Email field with placeholder "Email"', async () => {
  269 |       await expect.soft(contact.email(page), '[REQ AC-6] Email field').toBeVisible();
  270 |     });
  271 |     await journey.step('And it offers a Subject field with placeholder "Subject"', async () => {
  272 |       await expect.soft(contact.subject(page), '[REQ AC-6] Subject field').toBeVisible();
  273 |     });
  274 |     await journey.step('And it offers a multi-line Message field with placeholder "Your Message Here"', async () => {
  275 |       await expect.soft(contact.message(page), '[REQ AC-6] Message field').toBeVisible();
  276 |       expect.soft(await contact.message(page).evaluate((e) => e.tagName.toLowerCase()).catch(() => 'missing'), '[REQ AC-6] Message is multi-line').toBe('textarea');
  277 |     });
  278 |     await journey.step('And it offers a "Submit" button', async () => {
  279 |       await expect.soft(contact.submit(page), '[REQ AC-6] Submit button').toBeVisible();
  280 |     });
  281 |   });
  282 | 
  283 |   test('SCN-008: The form is not sent while the mandatory Email is empty', { tag: ['@AC-6', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  284 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  285 |     await journey.step('And I filled Name, Subject and Message with unique values and left Email empty', async () => {
  286 |       const tag = unique('qa');
  287 |       await fill(page, { name: `QA ${tag}`, subject: `QA subject ${tag}`, message: `QA held-out message ${tag}` });
  288 |     });
  289 |     await journey.step('When I click "Submit" and accept any confirmation', async () => { await submitForm(page, (d) => d.accept()); });
  290 |     await journey.step('Then no success message is shown', async () => {
  291 |       await expect.soft(contact.success(page), '[REQ AC-6] Email empty: form not sent (no success message)').toHaveCount(0);
  292 |     });
  293 |     await journey.step('And the form is still on the page', async () => {
  294 |       await expect.soft(contact.email(page), '[REQ AC-6] Email empty: form still on the page').toBeVisible();
  295 |     });
  296 |   });
  297 | 
  298 |   test('SCN-009: The form is not sent with an e-mail that is not a valid address', { tag: ['@AC-6', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  299 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  300 |     await journey.step('And I filled Name, Subject and Message with unique values and Email with "not-an-email"', async () => {
  301 |       const tag = unique('qa');
  302 |       await fill(page, { name: `QA ${tag}`, email: data.contact.invalidEmail, subject: `QA subject ${tag}`, message: `QA held-out message ${tag}` });
  303 |     });
  304 |     await journey.step('When I click "Submit" and accept any confirmation', async () => { await submitForm(page, (d) => d.accept()); });
  305 |     await journey.step('Then no success message is shown', async () => {
  306 |       await expect.soft(contact.success(page), '[REQ AC-6] invalid e-mail: form not sent (no success message)').toHaveCount(0);
  307 |     });
  308 |     await journey.step('And the form is still on the page', async () => {
  309 |       await expect.soft(contact.email(page), '[REQ AC-6] invalid e-mail: form still on the page').toBeVisible();
  310 |     });
  311 |   });
  312 | 
  313 |   test('SCN-010: The form can be sent with only a valid Email', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
  314 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  315 |     await journey.step('And I filled only Email with a unique valid address', async () => { await fill(page, { email: validValues(data).email }); });
  316 |     await journey.step('When I click "Submit" and confirm with OK', async () => { await submitForm(page, (d) => d.accept()); });
  317 |     await journey.step('Then the success message is shown', async () => {
> 318 |       await expect(contact.success(page), '[REQ AC-6] optional fields empty: the form is sent (success message)').toBeVisible();
      |                                                                                                                   ^ Error: [REQ AC-6] optional fields empty: the form is sent (success message)
  319 |     });
  320 |   });
  321 | 
  322 |   test('SCN-011: Sending the form asks for confirmation, shows success and offers a Home button', { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, baseURL }) => {
  323 |     let seen: { dialogs: { type: string; message: string }[]; posted: boolean } = { dialogs: [], posted: false };
  324 |     let pending: Promise<typeof seen> | undefined;
  325 |     let dialogShown!: Promise<Dialog>;
  326 |     let resolveOk!: () => void;
  327 |     const okGiven = new Promise<void>((r) => { resolveOk = r; });
  328 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  329 |     await journey.step('And I filled Name, Email, Subject and Message with unique valid values', async () => { await fill(page, validValues(data)); });
  330 |     await journey.step('When I click "Submit"', async () => {
  331 |       dialogShown = page.waitForEvent('dialog', { timeout: 10_000 });
  332 |       pending = submitForm(page, async (d) => { await okGiven; await d.accept(); });
  333 |     });
  334 |     await journey.step('Then a browser confirmation "Press OK to proceed!" is shown', async () => {
  335 |       const d = await dialogShown.catch(() => null);
  336 |       expect(d?.type() ?? 'no dialog', '[REQ AC-7] a browser confirmation is shown').toBe(REQ.CONFIRM_TYPE);
  337 |       expect.soft(d?.message(), '[REQ AC-7] confirmation text').toBe(REQ.CONFIRM_TEXT);
  338 |     });
  339 |     await journey.step('When I confirm with OK', async () => { resolveOk(); seen = await pending!; });
  340 |     await journey.step('Then the message "Success! Your details have been submitted successfully." is shown', async () => {
  341 |       await expect(contact.success(page), '[REQ AC-7] success message after OK').toBeVisible();
  342 |     });
  343 |     await journey.step('And the form is replaced by a "Home" button', async () => {
  344 |       await expect.soft(contact.email(page), '[REQ AC-7] the form is replaced (fields gone)').toBeHidden();
  345 |       await expect(contact.home(page), '[REQ AC-7] a "Home" button replaces the form').toBeVisible();
  346 |     });
  347 |     await journey.step('When I click "Home"', async () => { await contact.home(page).click(); await page.waitForLoadState('domcontentloaded'); });
  348 |     await journey.step('Then I am on the home page', async () => {
  349 |       await expect(page, '[REQ AC-7] "Home" returns to the home page').toHaveURL(new URL(REQ.HOME_PATH, baseURL).toString()); // G3
  350 |     });
  351 |     void seen;
  352 |   });
  353 | 
  354 |   test('SCN-012: Cancelling the confirmation keeps the form as filled', { tag: ['@AC-8', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
  355 |     const typed = validValues(data);
  356 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  357 |     await journey.step('And I filled Name, Email, Subject and Message with unique valid values', async () => { await fill(page, typed); });
  358 |     await journey.step('When I click "Submit" and cancel the confirmation', async () => {
  359 |       const seen = await submitForm(page, (d) => d.dismiss());
  360 |       expect(seen.dialogs.length, 'a confirmation was shown to cancel (precondition)').toBeGreaterThan(0);
  361 |     });
  362 |     await journey.step('Then no success message is shown', async () => {
  363 |       await expect.soft(contact.success(page), '[REQ AC-8] no success message after Cancel').toHaveCount(0);
  364 |     });
  365 |     await journey.step('And the form is still on the page', async () => {
  366 |       await expect.soft(contact.submit(page), '[REQ AC-8] the form stays on the page').toBeVisible();
  367 |     });
  368 |     await journey.step('And every field still holds what I typed', async () => {
  369 |       await expect.soft(contact.name(page), '[REQ AC-8] Name keeps its value').toHaveValue(typed.name);
  370 |       await expect.soft(contact.email(page), '[REQ AC-8] Email keeps its value').toHaveValue(typed.email);
  371 |       await expect.soft(contact.subject(page), '[REQ AC-8] Subject keeps its value').toHaveValue(typed.subject);
  372 |       await expect.soft(contact.message(page), '[REQ AC-8] Message keeps its value').toHaveValue(typed.message);
  373 |     });
  374 |   });
  375 | });
  376 | 
```