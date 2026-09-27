# Triage — DEMO-101 / run 02-eval

Generated 2026-09-26T14:22:13.167Z

**8/12 passed**, 4 failed, 0 flaky, 0 skipped.

| Scenario | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- |
| SCN-001 | passed | - | - | - |
| SCN-002 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-003 | passed | - | - | - |
| SCN-004 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-005 | passed | - | - | - |
| SCN-006 | passed | - | - | - |
| SCN-007 | passed | - | - | - |
| SCN-008 | passed | - | - | - |
| SCN-009 | passed | - | - | - |
| SCN-010 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-011 | failed | SCRIPT_DEFECT | high | **SCRIPT_DEFECT** |
| SCN-012 | passed | - | - | - |

## SCN-002: Locked shopper cannot sign in and is told the account is locked

- Requirement refs: AC-2
- Failing step: Then I see the error "Your account has been locked. Please contact customer support."
- Error: `[REQ AC-2] locked-account error message`
- Locator: `getByRole('alert')`
- Expected: `"Your account has been locked. Please contact customer support."`
- Received: `"Epic sadface: Sorry, this user has been locked out."`
- Evidence: [screenshot](artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-101/runs/02-eval/artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-2] failed on a located element.
- Expected: "Your account has been locked. Please contact customer support."
- Received: "Epic sadface: Sorry, this user has been locked out."

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — The alert is located and visible, the shopper correctly stays on the sign-in page (that part of AC-2 passes), but the message text differs from the verbatim wording AC-2 mandates. Behaviour (blocking the locked account) is correct; the communicated message is not.

## SCN-004: Wrong password clears the credential fields for security

- Requirement refs: AC-3
- Failing step: Then the Username field is empty
- Error: `[REQ AC-3] Username field cleared`
- Locator: `getByRole('textbox', { name: 'Username', exact: true })`
- Expected: `""`
- Received: `"standard_user"`
- Evidence: [screenshot](artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-101/runs/02-eval/artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-3] failed on a located element.
- Expected: ""
- Received: "standard_user"
- Also failed: [REQ AC-3] Password field cleared — expected "", received "wrong_password"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Both textboxes are located; after the wrong-password error is displayed they still contain the typed username and password. AC-3 requires both to be cleared for security. The error message part of AC-3 passes (SCN-003), so the fault is isolated to field clearing.

## SCN-010: Checkout overview totals follow the pricing rules

- Requirement refs: AC-7
- Failing step: And the Tax equals 10% of the Item total rounded half-up to 2 decimals
- Error: `[REQ AC-7] Tax = 10% of Item total (pricing-rules.md)`
- Expected: `4`
- Received: `3.2`
- Evidence: [screenshot](artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-101/runs/02-eval/artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: 4
- Received: 3.2

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Item total ($39.98 = $29.99 + $9.99) and Total = Item total + Tax both hold, isolating the fault to the tax rate: $3.20 is 8.0% of $39.98, while pricing-rules.md (attached to the story, owned by Finance) requires 10% → $4.00. Money is computed wrongly on every order.

## SCN-011: Finishing the order confirms it and empties the cart

- Requirement refs: AC-8
- Failing step: When I open the cart and proceed to checkout
- Error: `TimeoutError: locator.click: Timeout 10000ms exceeded.`
- Locator: `getByRole('link', { name: 'Checkout' })`
- Evidence: [screenshot](artifacts/DEMO-101-tests-demo-101-DE-d2bdd-rms-it-and-empties-the-cart-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-101/runs/02-eval/artifacts/DEMO-101-tests-demo-101-DE-d2bdd-rms-it-and-empties-the-cart-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-101-tests-demo-101-DE-d2bdd-rms-it-and-empties-the-cart-chromium-retry1/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Target not found: getByRole('link', { name: 'Checkout' })
- Failure-time page snapshot DOES contain the target text: `- button "Checkout" [ref=e33] [cursor=pointer]`
- …but with a different role than the locator's 'link'.

Next: The element exists but the locator does not match it — re-inspect at this step, fix the locator (HOW only), re-run.

**Confirmed: SCRIPT_DEFECT** — On the cart page the Checkout control exists and works, but it is a button; the spec located it as a link (0 matches). Every other checkout scenario (SCN-008/009/010) passes the same step with the button locator, so the AUT is fine.

Action: Restored the verified locator getByRole('button', { name: 'Checkout' }) via the shared openCartAndCheckout() helper; probe count=1; integrity re-checked (PRESERVED).
