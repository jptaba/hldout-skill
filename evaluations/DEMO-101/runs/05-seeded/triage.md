# Triage — DEMO-101 / run 05-seeded

Generated 2026-09-26T17:24:51.182Z

**9/12 passed**, 3 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | negative | AC-2 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-003 | negative | AC-3 | passed | - | - | - |
| SCN-004 | negative | AC-3 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-005 | functional | AC-4 | passed | - | - | - |
| SCN-006 | functional | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-5 | passed | - | - | - |
| SCN-008 | negative | AC-6 | passed | - | - | - |
| SCN-009 | negative | AC-6 | passed | - | - | - |
| SCN-010 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-011 | functional | AC-8 | passed | - | - | - |
| SCN-012 | functional | AC-9 | passed | - | - | - |

## SCN-002: Locked shopper cannot sign in and is told the account is locked

- Requirement refs: AC-2 · type: negative · layer: ui
- Failing step: Then I see the error "Your account has been locked. Please contact customer support."
- Error: `[REQ AC-2] locked-account error message`
- Locator: `getByRole('alert')`
- Expected: `"Your account has been locked. Please contact customer support."`
- Received: `"Epic sadface: Sorry, this user has been locked out."`
- Evidence: [screenshot](artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-101/runs/05-seeded/artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-101-tests-demo-101-DE-d0deb--told-the-account-is-locked-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-2] failed on a located element.
- Expected: "Your account has been locked. Please contact customer support."
- Received: "Epic sadface: Sorry, this user has been locked out."

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — The alert is located and visible, the shopper correctly stays on the sign-in page (that part of AC-2 passes), but the message text differs from the verbatim wording AC-2 mandates. Behaviour (blocking the locked account) is correct; the communicated message is not. (Confirmed in run 04-regression; identical failure signature in 05-seeded.)

## SCN-004: Wrong password clears the credential fields for security

- Requirement refs: AC-3 · type: negative · layer: ui
- Failing step: Then the Username field is empty
- Error: `[REQ AC-3] Username field cleared`
- Locator: `getByRole('textbox', { name: 'Username', exact: true })`
- Expected: `""`
- Received: `"standard_user"`
- Evidence: [screenshot](artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-101/runs/05-seeded/artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-101-tests-demo-101-DE-ff7bc-dential-fields-for-security-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-3] failed on a located element.
- Expected: ""
- Received: "standard_user"
- Also failed: [REQ AC-3] Password field cleared — expected "", received "wrong_password"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Both textboxes are located; after the wrong-password error is displayed they still contain the typed username and password. AC-3 requires both to be cleared for security. The error message part of AC-3 passes (SCN-003), so the fault is isolated to field clearing. (Confirmed in run 04-regression; identical failure signature in 05-seeded.)

## SCN-010: Checkout overview totals follow the pricing rules

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: And the Tax equals 10% of the Item total rounded half-up to 2 decimals
- Error: `[REQ AC-7] Tax = 10% of Item total (pricing-rules.md)`
- Expected: `4`
- Received: `3.2`
- Evidence: [screenshot](artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-101/runs/05-seeded/artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-101-tests-demo-101-DE-bc3c3-ls-follow-the-pricing-rules-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: 4
- Received: 3.2

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Item total ($39.98 = $29.99 + $9.99) and Total = Item total + Tax both hold, isolating the fault to the tax rate: $3.20 is 8.0% of $39.98, while pricing-rules.md (attached to the story, owned by Finance) requires 10% → $4.00. Money is computed wrongly on every order. (Confirmed in run 04-regression; identical failure signature in 05-seeded.)
