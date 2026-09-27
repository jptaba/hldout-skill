# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-101\tests\demo-101.spec.ts >> DEMO-101 Shopper can sign in, build a cart and complete checkout >> SCN-010: Checkout overview totals follow the pricing rules
- Location: evaluations\DEMO-101\tests\demo-101.spec.ts:237:3

# Error details

```
Error: [REQ AC-7] Tax = 10% of Item total (pricing-rules.md)

expect(received).toBeCloseTo(expected, precision)

Expected: 4
Received: 3.2

Expected precision:    2
Expected difference: < 0.005
Received difference:   0.7999999999999998
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
        - button "Cart, 2 items" [ref=e13]:
          - generic [ref=e14]: "2"
      - generic [ref=e15]: "Checkout: Overview"
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
              - generic [ref=e28]: $29.99
          - generic [ref=e30]:
            - generic [ref=e31]: "1"
            - generic [ref=e32]:
              - button "View details for Sauce Labs Bike Light" [ref=e33] [cursor=pointer]:
                - generic [ref=e34]: Sauce Labs Bike Light
              - generic [ref=e35]: A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.
              - generic [ref=e36]: $9.99
        - generic [ref=e38]:
          - generic [ref=e39]: "Payment Information:"
          - generic [ref=e40]: "SauceCard #31337"
          - generic [ref=e41]: "Shipping Information:"
          - generic [ref=e42]: Free Pony Express Delivery!
          - generic [ref=e43]: Price Total
          - generic [ref=e44]: "Item total: $39.98"
          - generic [ref=e45]: "Tax: $3.20"
          - generic [ref=e46]: "Total: $43.18"
          - generic [ref=e47]:
            - button "Cancel" [ref=e48] [cursor=pointer]
            - button "Finish" [ref=e49] [cursor=pointer]
  - contentinfo [ref=e50]:
    - list [ref=e51]:
      - listitem [ref=e52]:
        - link "X" [ref=e53] [cursor=pointer]:
          - /url: https://x.com/saucelabs
      - listitem [ref=e54]:
        - link "Facebook" [ref=e55] [cursor=pointer]:
          - /url: https://www.facebook.com/saucelabs
      - listitem [ref=e56]:
        - link "LinkedIn" [ref=e57] [cursor=pointer]:
          - /url: https://www.linkedin.com/company/sauce-labs/
    - generic [ref=e58]: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  162 |     await journey.step('When I add the 2nd listed product to the cart', async () => {
  163 |       await addButton(page, 1).click();
  164 |     });
  165 |     await journey.step('Then the cart badge shows 2', async () => {
  166 |       await expect(ui(page).cartBadge, '[REQ AC-5] badge +1 after second add').toHaveText('2');
  167 |     });
  168 |   });
  169 | 
  170 |   test('SCN-007: Removing products decreases the cart badge and hides it when empty', { tag: ['@AC-5', '@P2'] }, async ({ page, journey, data }) => {
  171 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  172 |       await signInAsStandard(page, data);
  173 |     });
  174 |     await journey.step('And I have added the 1st and 2nd listed products to the cart', async () => {
  175 |       await addButton(page, 0).click();
  176 |       await addButton(page, 1).click();
  177 |       await expect(ui(page).cartBadge).toHaveText('2');
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
> 262 |       expect.soft(tax, '[REQ AC-7] Tax = 10% of Item total (pricing-rules.md)').toBeCloseTo(round2(itemTotal * REQ.AC7_TAX_RATE), 2);
      |                                                                                 ^ Error: [REQ AC-7] Tax = 10% of Item total (pricing-rules.md)
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
  278 |       await page.getByRole('link', { name: 'Checkout' }).click();
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