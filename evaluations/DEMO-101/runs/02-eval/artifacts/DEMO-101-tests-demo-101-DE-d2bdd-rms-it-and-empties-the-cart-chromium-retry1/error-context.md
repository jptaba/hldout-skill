# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-101\tests\demo-101.spec.ts >> DEMO-101 Shopper can sign in, build a cart and complete checkout >> SCN-011: Finishing the order confirms it and empties the cart
- Location: evaluations\DEMO-101\tests\demo-101.spec.ts:269:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Checkout' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - button "Open Menu" [ref=e8] [cursor=pointer]
          - img "Open Menu" [ref=e9]
        - generic [ref=e10]: Swag Labs
        - button "Cart, 1 items" [ref=e13]:
          - generic [ref=e14]: "1"
      - generic [ref=e15]: Your Cart
    - main [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: QTY
          - generic [ref=e21]: Description
          - generic [ref=e22]:
            - generic [ref=e23]: "1"
            - generic [ref=e24]:
              - button "View details for Sauce Labs Backpack" [ref=e25] [cursor=pointer]:
                - generic [ref=e26]: Sauce Labs Backpack
              - generic [ref=e27]: carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.
              - generic [ref=e28]:
                - generic [ref=e29]: $29.99
                - button "Remove" [ref=e30] [cursor=pointer]
        - generic [ref=e31]:
          - button "Continue Shopping" [ref=e32] [cursor=pointer]
          - button "Checkout" [ref=e33] [cursor=pointer]
  - contentinfo [ref=e34]:
    - list [ref=e35]:
      - listitem [ref=e36]:
        - link "X" [ref=e37] [cursor=pointer]:
          - /url: https://x.com/saucelabs
      - listitem [ref=e38]:
        - link "Facebook" [ref=e39] [cursor=pointer]:
          - /url: https://www.facebook.com/saucelabs
      - listitem [ref=e40]:
        - link "LinkedIn" [ref=e41] [cursor=pointer]:
          - /url: https://www.linkedin.com/company/sauce-labs/
    - generic [ref=e42]: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  178 |     });
  179 |     await journey.step('When I remove the 2nd listed product', async () => {
  180 |       await removeButton(page, 1).click();
  181 |     });
  182 |     await journey.step('Then the cart badge shows 1', async () => {
  183 |       await expect(ui(page).cartBadge, '[REQ AC-5] badge -1 after remove').toHaveText('1');
  184 |     });
  185 |     await journey.step('When I remove the 1st listed product', async () => {
  186 |       await removeButton(page, 0).click();
  187 |     });
  188 |     await journey.step('Then the cart badge is not shown', async () => {
  189 |       await expect(ui(page).cartBadge, '[REQ AC-5] badge hidden when cart empty').toBeHidden();
  190 |     });
  191 |   });
  192 | 
  193 |   test('SCN-008: Checkout requires a First Name', { tag: ['@AC-6', '@P2'] }, async ({ page, journey, data }) => {
  194 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  195 |       await signInAsStandard(page, data);
  196 |     });
  197 |     await journey.step('And I have added the 1st listed product to the cart', async () => {
  198 |       await addButton(page, 0).click();
  199 |     });
  200 |     await journey.step('When I open the cart and proceed to checkout', async () => {
  201 |       await openCartAndCheckout(page);
  202 |     });
  203 |     await journey.step('And I continue with Last Name and Postal Code but no First Name', async () => {
  204 |       await checkoutWith(page, { lastName: data.checkout.lastName, postalCode: data.checkout.postalCode });
  205 |     });
  206 |     await journey.step('Then I see the error "Error: First Name is required"', async () => {
  207 |       await expect(ui(page).error, '[REQ AC-6] First Name required message').toHaveText(REQ.AC6_FIRST_NAME_MESSAGE);
  208 |     });
  209 |   });
  210 | 
  211 |   test('SCN-009: Checkout requires a Last Name and a Postal Code', { tag: ['@AC-6', '@P3'] }, async ({ page, journey, data }) => {
  212 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  213 |       await signInAsStandard(page, data);
  214 |     });
  215 |     await journey.step('And I have added the 1st listed product to the cart', async () => {
  216 |       await addButton(page, 0).click();
  217 |     });
  218 |     await journey.step('When I open the cart and proceed to checkout', async () => {
  219 |       await openCartAndCheckout(page);
  220 |     });
  221 |     await journey.step('And I continue with First Name and Postal Code but no Last Name', async () => {
  222 |       await checkoutWith(page, { firstName: data.checkout.firstName, postalCode: data.checkout.postalCode });
  223 |     });
  224 |     await journey.step('Then I cannot continue and an error is shown', async () => {
  225 |       await expect(ui(page).error, '[REQ AC-6] Last Name is mandatory (error shown)').toBeVisible();
  226 |       await expect(ui(page).itemTotal, '[REQ AC-6] Last Name is mandatory (not on overview)').toBeHidden();
  227 |     });
  228 |     await journey.step('When I continue with First Name and Last Name but no Postal Code', async () => {
  229 |       await checkoutWith(page, { firstName: data.checkout.firstName, lastName: data.checkout.lastName });
  230 |     });
  231 |     await journey.step('Then I cannot continue and an error is shown', async () => {
  232 |       await expect(ui(page).error, '[REQ AC-6] Postal Code is mandatory (error shown)').toBeVisible();
  233 |       await expect(ui(page).itemTotal, '[REQ AC-6] Postal Code is mandatory (not on overview)').toBeHidden();
  234 |     });
  235 |   });
  236 | 
  237 |   test('SCN-010: Checkout overview totals follow the pricing rules', { tag: ['@AC-7', '@P1'] }, async ({ page, journey, data }) => {
  238 |     const noted: number[] = [];
  239 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  240 |       await signInAsStandard(page, data);
  241 |     });
  242 |     await journey.step('And I have added the 1st and 2nd listed products to the cart, noting their prices', async () => {
  243 |       for (const nth of [0, 1]) {
  244 |         noted.push(money(await productPrice(page, nth).innerText()));
  245 |         await addButton(page, nth).click();
  246 |       }
  247 |     });
  248 |     await journey.step('When I open the cart and proceed to checkout', async () => {
  249 |       await openCartAndCheckout(page);
  250 |     });
  251 |     await journey.step('And I continue with my First Name, Last Name and Postal Code', async () => {
  252 |       await checkoutWith(page, data.checkout);
  253 |       await expect(ui(page).itemTotal).toBeVisible();
  254 |     });
  255 |     const itemTotal = money(await ui(page).itemTotal.innerText());
  256 |     const tax = money(await ui(page).tax.innerText());
  257 |     const total = money(await ui(page).total.innerText());
  258 |     await journey.step('Then the Item total equals the sum of the noted prices', async () => {
  259 |       expect.soft(itemTotal, '[REQ AC-7] Item total = sum of item prices').toBeCloseTo(round2(noted.reduce((a, b) => a + b, 0)), 2);
  260 |     });
  261 |     await journey.step('And the Tax equals 10% of the Item total rounded half-up to 2 decimals', async () => {
  262 |       expect.soft(tax, '[REQ AC-7] Tax = 10% of Item total (pricing-rules.md)').toBeCloseTo(round2(itemTotal * REQ.AC7_TAX_RATE), 2);
  263 |     });
  264 |     await journey.step('And the Total equals the Item total plus the Tax', async () => {
  265 |       expect.soft(total, '[REQ AC-7] Total = Item total + Tax').toBeCloseTo(round2(itemTotal + tax), 2);
  266 |     });
  267 |   });
  268 | 
  269 |   test('SCN-011: Finishing the order confirms it and empties the cart', { tag: ['@AC-8', '@P1'] }, async ({ page, journey, data }) => {
  270 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  271 |       await signInAsStandard(page, data);
  272 |     });
  273 |     await journey.step('And I have added the 1st listed product to the cart', async () => {
  274 |       await addButton(page, 0).click();
  275 |     });
  276 |     await journey.step('When I open the cart and proceed to checkout', async () => {
  277 |       await ui(page).cartLink.click();
> 278 |       await page.getByRole('link', { name: 'Checkout' }).click();
      |                                                          ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  279 |     });
  280 |     await journey.step('And I continue with my First Name, Last Name and Postal Code', async () => {
  281 |       await checkoutWith(page, data.checkout);
  282 |     });
  283 |     await journey.step('And I finish the order', async () => {
  284 |       await ui(page).finish.click();
  285 |     });
  286 |     await journey.step('Then I see the confirmation "Thank you for your order!"', async () => {
  287 |       await expect(ui(page).confirmation, '[REQ AC-8] order confirmation message').toHaveText(REQ.AC8_CONFIRMATION);
  288 |     });
  289 |     await journey.step('And the cart badge is not shown', async () => {
  290 |       await expect(ui(page).cartBadge, '[REQ AC-8] cart empty after order').toBeHidden();
  291 |     });
  292 |   });
  293 | 
  294 |   test('SCN-012: Logging out returns to sign-in and protects the Products page', { tag: ['@AC-9', '@P1'] }, async ({ page, journey, data }) => {
  295 |     let productsUrl = '';
  296 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  297 |       await signInAsStandard(page, data);
  298 |     });
  299 |     await journey.step('And I note the address of the Products page', async () => {
  300 |       productsUrl = page.url();
  301 |     });
  302 |     await journey.step('When I log out', async () => {
  303 |       await ui(page).openMenu.click();
  304 |       await ui(page).logout.click();
  305 |     });
  306 |     await journey.step('Then I am on the sign-in page', async () => {
  307 |       await expect(ui(page).signIn, '[REQ AC-9] back on the sign-in page after logout').toBeVisible();
  308 |     });
  309 |     await journey.step('When I open the noted Products page address directly', async () => {
  310 |       await page.goto(productsUrl);
  311 |     });
  312 |     await journey.step('Then I am not shown the Products page', async () => {
  313 |       await expect(ui(page).pageTitle, '[REQ AC-9] Products page not shown when signed out').toBeHidden();
  314 |     });
  315 |     await journey.step('And I am on the sign-in page', async () => {
  316 |       await expect(ui(page).signIn, '[REQ AC-9] redirected to sign-in when signed out').toBeVisible();
  317 |     });
  318 |   });
  319 | });
  320 | 
```