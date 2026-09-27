# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-3\tests\ae-3.spec.ts >> AE-3 Brands in the catalogue API and shop, and the Contact Us form >> SCN-011: Sending the form asks for confirmation, shows success and offers a Home button
- Location: evaluations\AE-3\tests\ae-3.spec.ts:321:3

# Error details

```
Error: [REQ AC-7] a browser confirmation is shown

expect(received).toBe(expected) // Object.is equality

Expected: "confirm"
Received: "no dialog"
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
        - generic [ref=e49]:
          - textbox "Name" [ref=e51]: QA qa jrwztmeo-1
          - textbox "Email" [active] [ref=e53]: qa jrwztmeo-1@example.com
          - textbox "Subject" [ref=e55]: QA subject qa jrwztmeo-1
          - textbox "Your Message Here" [ref=e57]: QA held-out message qa jrwztmeo-1
          - button "Choose File" [ref=e59]
          - button "Submit" [ref=e61] [cursor=pointer]
      - generic [ref=e63]:
        - heading "Feedback For Us" [level=2] [ref=e64]
        - generic [ref=e65]:
          - paragraph [ref=e66]: We really appreciate your response to our website.
          - paragraph [ref=e67]:
            - text: Kindly share your feedback with us at
            - link "feedback@automationexercise.com" [ref=e68] [cursor=pointer]:
              - /url: mailto:feedback@automationexercise.com
            - text: .
          - paragraph [ref=e69]: If you have any suggestion areas or improvements, do let us know. We will definitely work on it.
          - paragraph [ref=e70]: Thank you
  - contentinfo [ref=e71]:
    - generic [ref=e76]:
      - heading "Subscription" [level=2] [ref=e77]
      - generic [ref=e78]:
        - textbox "Your email address" [ref=e79]
        - button "" [ref=e80] [cursor=pointer]
        - paragraph [ref=e82]: Get the most recent updates from our site and be updated your self...
    - paragraph [ref=e86]: Copyright © 2021 All rights reserved
  - text: 
```

# Test source

```ts
  235 |     test(`SCN-006.${i + 1}: A brand's page lists exactly that brand's products (${brand})`, { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
  236 |       let products: Product[] = [];
  237 |       await journey.step('Given I read the catalogue with GET /api/productsList', async () => {
  238 |         products = await seed.step('read the catalogue (GET /api/productsList)', () => readProducts(api));
  239 |       });
  240 |       await journey.step('And I am on the Products page', async () => { await gotoPage(page, '/products'); });
  241 |       await journey.step(`When I click "${brand}" in the "Brands" panel`, async () => {
  242 |         const entry = brandEntries(page).filter({ hasText: new RegExp(`^\\s*(\\(\\d+\\)\\s*)?${esc(brand)}\\s*(\\(\\d+\\)\\s*)?$`) }); // TODO(harden)
  243 |         await entry.click();
  244 |         await page.waitForLoadState('domcontentloaded');
  245 |       });
  246 |       await journey.step(`Then the page is headed "Brand - ${brand} Products"`, async () => {
  247 |         const heading = page.getByRole('heading', { name: /^\s*Brand\b/i }); // TODO(harden)
  248 |         await expect.soft(heading, `[REQ AC-5] heading "Brand - ${brand} Products"`).toHaveText(REQ.BRAND_PAGE_HEADING(brand));
  249 |       });
  250 |       await journey.step(`And the page lists exactly the products that productsList gives "${brand}"`, async () => {
  251 |         const expectedIds = products.filter((p) => p.brand === brand).map((p) => String(p.id)).sort();
  252 |         const shownIds = [...await productIdsOnPage(page)].sort();
  253 |         expect.soft(shownIds, `[REQ AC-5] ${brand} page lists exactly productsList's ${brand} products (by id)`).toEqual(expectedIds);
  254 |       });
  255 |     });
  256 |   });
  257 | 
  258 |   // ---------------- Contact Us (UI) ----------------
  259 |   test('SCN-007: The Contact Us form offers the mock-up\'s fields', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  260 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  261 |     await journey.step('When I look at the "Get In Touch" form', async () => {
  262 |       await expect(page.getByRole('heading', { name: /get in touch/i }), 'form heading visible (precondition)').toBeVisible(); // TODO(harden)
  263 |     });
  264 |     await journey.step('Then it offers a Name field with placeholder "Name"', async () => {
  265 |       await expect.soft(contact.name(page), '[REQ AC-6] Name field').toBeVisible();
  266 |     });
  267 |     await journey.step('And it offers an Email field with placeholder "Email"', async () => {
  268 |       await expect.soft(contact.email(page), '[REQ AC-6] Email field').toBeVisible();
  269 |     });
  270 |     await journey.step('And it offers a Subject field with placeholder "Subject"', async () => {
  271 |       await expect.soft(contact.subject(page), '[REQ AC-6] Subject field').toBeVisible();
  272 |     });
  273 |     await journey.step('And it offers a multi-line Message field with placeholder "Your Message Here"', async () => {
  274 |       await expect.soft(contact.message(page), '[REQ AC-6] Message field').toBeVisible();
  275 |       expect.soft(await contact.message(page).evaluate((e) => e.tagName.toLowerCase()).catch(() => 'missing'), '[REQ AC-6] Message is multi-line').toBe('textarea');
  276 |     });
  277 |     await journey.step('And it offers a "Submit" button', async () => {
  278 |       await expect.soft(contact.submit(page), '[REQ AC-6] Submit button').toBeVisible();
  279 |     });
  280 |   });
  281 | 
  282 |   test('SCN-008: The form is not sent while the mandatory Email is empty', { tag: ['@AC-6', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  283 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  284 |     await journey.step('And I filled Name, Subject and Message with unique values and left Email empty', async () => {
  285 |       const tag = unique('qa');
  286 |       await fill(page, { name: `QA ${tag}`, subject: `QA subject ${tag}`, message: `QA held-out message ${tag}` });
  287 |     });
  288 |     await journey.step('When I click "Submit" and accept any confirmation', async () => { await submitForm(page, (d) => d.accept()); });
  289 |     await journey.step('Then no success message is shown', async () => {
  290 |       await expect.soft(contact.success(page), '[REQ AC-6] Email empty: form not sent (no success message)').toHaveCount(0);
  291 |     });
  292 |     await journey.step('And the form is still on the page', async () => {
  293 |       await expect.soft(contact.email(page), '[REQ AC-6] Email empty: form still on the page').toBeVisible();
  294 |     });
  295 |   });
  296 | 
  297 |   test('SCN-009: The form is not sent with an e-mail that is not a valid address', { tag: ['@AC-6', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  298 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  299 |     await journey.step('And I filled Name, Subject and Message with unique values and Email with "not-an-email"', async () => {
  300 |       const tag = unique('qa');
  301 |       await fill(page, { name: `QA ${tag}`, email: data.contact.invalidEmail, subject: `QA subject ${tag}`, message: `QA held-out message ${tag}` });
  302 |     });
  303 |     await journey.step('When I click "Submit" and accept any confirmation', async () => { await submitForm(page, (d) => d.accept()); });
  304 |     await journey.step('Then no success message is shown', async () => {
  305 |       await expect.soft(contact.success(page), '[REQ AC-6] invalid e-mail: form not sent (no success message)').toHaveCount(0);
  306 |     });
  307 |     await journey.step('And the form is still on the page', async () => {
  308 |       await expect.soft(contact.email(page), '[REQ AC-6] invalid e-mail: form still on the page').toBeVisible();
  309 |     });
  310 |   });
  311 | 
  312 |   test('SCN-010: The form can be sent with only a valid Email', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
  313 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  314 |     await journey.step('And I filled only Email with a unique valid address', async () => { await fill(page, { email: validValues(data).email }); });
  315 |     await journey.step('When I click "Submit" and confirm with OK', async () => { await submitForm(page, (d) => d.accept()); });
  316 |     await journey.step('Then the success message is shown', async () => {
  317 |       await expect(contact.success(page), '[REQ AC-6] optional fields empty: the form is sent (success message)').toBeVisible();
  318 |     });
  319 |   });
  320 | 
  321 |   test('SCN-011: Sending the form asks for confirmation, shows success and offers a Home button', { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, baseURL }) => {
  322 |     let seen: { dialogs: { type: string; message: string }[]; posted: boolean } = { dialogs: [], posted: false };
  323 |     let pending: Promise<typeof seen> | undefined;
  324 |     let dialogShown!: Promise<Dialog>;
  325 |     let resolveOk!: () => void;
  326 |     const okGiven = new Promise<void>((r) => { resolveOk = r; });
  327 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  328 |     await journey.step('And I filled Name, Email, Subject and Message with unique valid values', async () => { await fill(page, validValues(data)); });
  329 |     await journey.step('When I click "Submit"', async () => {
  330 |       dialogShown = page.waitForEvent('dialog', { timeout: 10_000 });
  331 |       pending = submitForm(page, async (d) => { await okGiven; await d.accept(); });
  332 |     });
  333 |     await journey.step('Then a browser confirmation "Press OK to proceed!" is shown', async () => {
  334 |       const d = await dialogShown.catch(() => null);
> 335 |       expect(d?.type() ?? 'no dialog', '[REQ AC-7] a browser confirmation is shown').toBe(REQ.CONFIRM_TYPE);
      |                                                                                      ^ Error: [REQ AC-7] a browser confirmation is shown
  336 |       expect.soft(d?.message(), '[REQ AC-7] confirmation text').toBe(REQ.CONFIRM_TEXT);
  337 |     });
  338 |     await journey.step('When I confirm with OK', async () => { resolveOk(); seen = await pending!; });
  339 |     await journey.step('Then the message "Success! Your details have been submitted successfully." is shown', async () => {
  340 |       await expect(contact.success(page), '[REQ AC-7] success message after OK').toBeVisible();
  341 |     });
  342 |     await journey.step('And the form is replaced by a "Home" button', async () => {
  343 |       await expect.soft(contact.email(page), '[REQ AC-7] the form is replaced (fields gone)').toBeHidden();
  344 |       await expect(contact.home(page), '[REQ AC-7] a "Home" button replaces the form').toBeVisible();
  345 |     });
  346 |     await journey.step('When I click "Home"', async () => { await contact.home(page).click(); await page.waitForLoadState('domcontentloaded'); });
  347 |     await journey.step('Then I am on the home page', async () => {
  348 |       await expect(page, '[REQ AC-7] "Home" returns to the home page').toHaveURL(new URL(REQ.HOME_PATH, baseURL).toString()); // G3
  349 |     });
  350 |     void seen;
  351 |   });
  352 | 
  353 |   test('SCN-012: Cancelling the confirmation keeps the form as filled', { tag: ['@AC-8', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
  354 |     const typed = validValues(data);
  355 |     await journey.step('Given I am on the Contact Us page', async () => { await gotoPage(page, '/contact_us'); });
  356 |     await journey.step('And I filled Name, Email, Subject and Message with unique valid values', async () => { await fill(page, typed); });
  357 |     await journey.step('When I click "Submit" and cancel the confirmation', async () => {
  358 |       const seen = await submitForm(page, (d) => d.dismiss());
  359 |       expect(seen.dialogs.length, 'a confirmation was shown to cancel (precondition)').toBeGreaterThan(0);
  360 |     });
  361 |     await journey.step('Then no success message is shown', async () => {
  362 |       await expect.soft(contact.success(page), '[REQ AC-8] no success message after Cancel').toHaveCount(0);
  363 |     });
  364 |     await journey.step('And the form is still on the page', async () => {
  365 |       await expect.soft(contact.submit(page), '[REQ AC-8] the form stays on the page').toBeVisible();
  366 |     });
  367 |     await journey.step('And every field still holds what I typed', async () => {
  368 |       await expect.soft(contact.name(page), '[REQ AC-8] Name keeps its value').toHaveValue(typed.name);
  369 |       await expect.soft(contact.email(page), '[REQ AC-8] Email keeps its value').toHaveValue(typed.email);
  370 |       await expect.soft(contact.subject(page), '[REQ AC-8] Subject keeps its value').toHaveValue(typed.subject);
  371 |       await expect.soft(contact.message(page), '[REQ AC-8] Message keeps its value').toHaveValue(typed.message);
  372 |     });
  373 |   });
  374 | });
  375 | 
```