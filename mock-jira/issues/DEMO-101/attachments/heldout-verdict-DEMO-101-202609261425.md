# Held-out Evaluation Verdict — DEMO-101

> **Verdict: ❌ FAIL** — 3 confirmed application defect(s): the AUT does not satisfy AC-2, AC-3, AC-7.

| | |
| --- | --- |
| Story | [DEMO-101](https://your-domain.atlassian.net/browse/DEMO-101) — Shopper can sign in, build a cart and complete checkout |
| Application under test | Swag Labs (saucedemo.com demo shop) — https://www.saucedemo.com |
| Final run | `03-rerun` · 2026-09-26T14:23:41.769Z · 30s |
| Scenarios | 12 total · 9 passed · 3 failed · 0 flaky · 0 skipped |
| Held-out integrity | ✅ PRESERVED — 24 requirement assertions identical to the pre-hardening draft |
| Hardening | Tier 3 (bundled inspector `inspect.ts` + `--capture` run). Tier 1 (IDE browser tool) and tier 2 (Playwright MCP) were not loaded in this session; `.mcp.json` now registers Playwright MCP for later sessions. |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T14:25:32.104Z |

## Application defects (3)

### APP-1 · SCN-002 · AC-2 — Locked-account error message does not match the required wording

| | |
| --- | --- |
| Severity | Minor |
| Requirement AC-2 | A shopper whose account is locked cannot sign in. The error message "Your account has been locked. Please contact customer support." is shown and the shopper stays on the sign-in page. |
| Expected (from requirement) | `"Your account has been locked. Please contact customer support."` |
| Actual (observed in AUT) | `"Epic sadface: Sorry, this user has been locked out."` |
| Failing step | Then I see the error "Your account has been locked. Please contact customer support." |
| Classification | APPLICATION_DEFECT (confirmed live) |

**Steps to reproduce**

1. Given I am on the sign-in page
2. When I sign in as the "locked" shopper
3. Then I see the error "Your account has been locked. Please contact customer support."
4. And I am still on the sign-in page

**Evidence:** [screenshot](runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/test-failed-1.png) · [page snapshot at failure](runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/error-context.md) · trace `npx playwright show-trace evaluations/DEMO-101/runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/trace.zip`

**Why this is an application defect:** The alert is located and visible, the shopper correctly stays on the sign-in page (that part of AC-2 passes), but the message text differs from the verbatim wording AC-2 mandates. Behaviour (blocking the locked account) is correct; the communicated message is not. (Confirmed in run 02-eval; identical failure signature in 03-rerun.)

**Live re-check:** Reproduced live on 2026-09-26 (tier 3): signing in as locked_out_user shows the alert 'Epic sadface: Sorry, this user has been locked out.' — see runs/02-eval/confirm/SCN-002.png

### APP-2 · SCN-004 · AC-3 — Credential fields are not cleared after a failed sign-in

| | |
| --- | --- |
| Severity | Major |
| Requirement AC-3 | When the password is wrong, the error "Epic sadface: Username and password do not match any user in this service" is shown and, for security, both the Username and Password fields are cleared. |
| Expected (from requirement) | `""` |
| Actual (observed in AUT) | `"standard_user"` |
| Failing step | Then the Username field is empty |
| Also failed | [REQ AC-3] Password field cleared — expected `""`, actual `"wrong_password"` |
| Classification | APPLICATION_DEFECT (confirmed live) |

**Steps to reproduce**

1. Given I am on the sign-in page
2. When I sign in as the "standard" shopper with the password "wrong_password"
3. Then the Username field is empty
4. And the Password field is empty

**Evidence:** [screenshot](runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/test-failed-1.png) · [page snapshot at failure](runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/error-context.md) · trace `npx playwright show-trace evaluations/DEMO-101/runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/trace.zip`

**Why this is an application defect:** Both textboxes are located; after the wrong-password error is displayed they still contain the typed username and password. AC-3 requires both to be cleared for security. The error message part of AC-3 passes (SCN-003), so the fault is isolated to field clearing. (Confirmed in run 02-eval; identical failure signature in 03-rerun.)

**Live re-check:** Reproduced live on 2026-09-26 (tier 3): after the error, Username='standard_user' and Password='wrong_password' remain — see runs/02-eval/confirm/SCN-004.png

### APP-3 · SCN-010 · AC-7 — Sales tax charged at 8% instead of the 10% in pricing-rules.md

| | |
| --- | --- |
| Severity | Critical |
| Requirement AC-7 | The checkout overview shows the Item total, Tax and Total. Item total is the sum of the prices of the items in the cart; Tax is calculated according to the attached pricing-rules.md; Total = Item total + Tax. |
| Expected (from requirement) | `4` |
| Actual (observed in AUT) | `3.2` |
| Failing step | And the Tax equals 10% of the Item total rounded half-up to 2 decimals |
| Classification | APPLICATION_DEFECT (confirmed live) |

**Steps to reproduce**

1. Given I am on the sign-in page
2. Given I am signed in as the "standard" shopper
3. And I have added the 1st and 2nd listed products to the cart, noting their prices
4. When I open the cart and proceed to checkout
5. And I continue with my First Name, Last Name and Postal Code
6. Then the Item total equals the sum of the noted prices
7. And the Tax equals 10% of the Item total rounded half-up to 2 decimals
8. And the Total equals the Item total plus the Tax

**Evidence:** [screenshot](runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/test-failed-1.png) · [page snapshot at failure](runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/error-context.md) · trace `npx playwright show-trace evaluations/DEMO-101/runs/03-rerun/artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/trace.zip`

**Why this is an application defect:** Item total ($39.98 = $29.99 + $9.99) and Total = Item total + Tax both hold, isolating the fault to the tax rate: $3.20 is 8.0% of $39.98, while pricing-rules.md (attached to the story, owned by Finance) requires 10% → $4.00. Money is computed wrongly on every order. (Confirmed in run 02-eval; identical failure signature in 03-rerun.)

**Live re-check:** Reproduced live on 2026-09-26 (tier 3) with the first two catalogue products: 'Item total: $39.98', 'Tax: $3.20', 'Total: $43.18' — see runs/02-eval/confirm/SCN-010.png

## Script defects found and repaired (1)

| Found in run | Scenario | Symptom | Diagnosis | Fix applied | Final run |
| --- | --- | --- | --- | --- | --- |
| `02-eval` | SCN-011 | TimeoutError: locator.click: Timeout 10000ms exceeded. | On the cart page the Checkout control exists and works, but it is a button; the spec located it as a link (0 matches). Every other checkout scenario (SCN-008/009/010) passes the same step with the button locator, so the AUT is fine. | Restored the verified locator getByRole('button', { name: 'Checkout' }) via the shared openCartAndCheckout() helper; probe count=1; integrity re-checked (PRESERVED). | ✅ passed |

## Scenario results

| Scenario | Title | Criteria | Result | Classification |
| --- | --- | --- | --- | --- |
| SCN-001 | Standard shopper signs in and sees the full catalogue | AC-1 | ✅ passed | - |
| SCN-002 | Locked shopper cannot sign in and is told the account is locked | AC-2 | ❌ failed | APPLICATION_DEFECT |
| SCN-003 | Wrong password shows the credentials error | AC-3 | ✅ passed | - |
| SCN-004 | Wrong password clears the credential fields for security | AC-3 | ❌ failed | APPLICATION_DEFECT |
| SCN-005 | Sorting by price low to high orders products by ascending price | AC-4 | ✅ passed | - |
| SCN-006 | Adding products increases the cart badge by one each time | AC-5 | ✅ passed | - |
| SCN-007 | Removing products decreases the cart badge and hides it when empty | AC-5 | ✅ passed | - |
| SCN-008 | Checkout requires a First Name | AC-6 | ✅ passed | - |
| SCN-009 | Checkout requires a Last Name and a Postal Code | AC-6 | ✅ passed | - |
| SCN-010 | Checkout overview totals follow the pricing rules | AC-7 | ❌ failed | APPLICATION_DEFECT |
| SCN-011 | Finishing the order confirms it and empties the cart | AC-8 | ✅ passed | - |
| SCN-012 | Logging out returns to sign-in and protects the Products page | AC-9 | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Scenarios | Result |
| --- | --- | --- | --- |
| AC-1 | A registered shopper who signs in with valid credentials lands on the "Products" page, which lists the full catalogue of 6 products. | SCN-001 | ✅ met |
| AC-2 | A shopper whose account is locked cannot sign in. The error message "Your account has been locked. Please contact customer support." is shown and the shopper stays on the sign-in page. | SCN-002 | ❌ not met |
| AC-3 | When the password is wrong, the error "Epic sadface: Username and password do not match any user in this service" is shown and, for security, both the Username and Password fields are cleared. | SCN-003, SCN-004 | ❌ not met |
| AC-4 | The shopper can sort products by "Price (low to high)"; products are then displayed in ascending order of price. | SCN-005 | ✅ met |
| AC-5 | Adding a product to the cart increases the cart badge count by one; removing it decreases the count, and the badge is not shown when the cart is empty. | SCN-006, SCN-007 | ✅ met |
| AC-6 | At checkout, First Name, Last Name and Postal Code are mandatory. Continuing without a First Name shows "Error: First Name is required". | SCN-008, SCN-009 | ✅ met |
| AC-7 | The checkout overview shows the Item total, Tax and Total. Item total is the sum of the prices of the items in the cart; Tax is calculated according to the attached pricing-rules.md; Total = Item total + Tax. | SCN-010 | ❌ not met |
| AC-8 | Finishing the order shows the confirmation "Thank you for your order!" and the cart is empty afterwards. | SCN-011 | ✅ met |
| AC-9 | Logging out returns the shopper to the sign-in page, and protected pages (e.g. the Products page URL) can no longer be opened without signing in again. | SCN-012 | ✅ met |

## How this verdict was produced

1. Requirement and attachments fetched from Jira and converted to Gherkin scenarios (`scenarios.feature`), each tagged with the acceptance criteria it proves.
2. Playwright TypeScript tests written from the scenarios **only** (no access to AUT source or developer tests), expected values copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT — locators, waits and navigation only. Expected outcomes were never changed (integrity check above).
4. The suite ran with retries; every failure was triaged automatically and then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run; this verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 9 | 3 | 0 |
| `02-eval` | 8 | 4 | 0 |
| `03-rerun` (final) | 9 | 3 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/03-rerun/triage.md](runs/03-rerun/triage.md)
- HTML report: `npx playwright show-report evaluations/DEMO-101/runs/03-rerun/html`
