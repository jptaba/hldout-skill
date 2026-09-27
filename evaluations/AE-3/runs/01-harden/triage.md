# Triage — AE-3 / run 01-harden

Generated 2026-09-27T12:07:39.798Z

**13/16 passed**, 3 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | contract | AC-1 | passed | - | - | - |
| SCN-002 | integration | AC-1 | passed | - | - | - |
| SCN-003.1 | negative | AC-2 | passed | - | - | - |
| SCN-003.2 | negative | AC-2 | passed | - | - | - |
| SCN-003.3 | negative | AC-2 | passed | - | - | - |
| SCN-004 | functional | AC-3 | passed | - | - | - |
| SCN-005 | integration | AC-4 | passed | - | - | - |
| SCN-006.1 | integration | AC-5 | passed | - | - | - |
| SCN-006.2 | integration | AC-5 | passed | - | - | - |
| SCN-006.3 | integration | AC-5 | passed | - | - | - |
| SCN-007 | functional | AC-6 | passed | - | - | - |
| SCN-008 | negative | AC-6 | passed | - | - | - |
| SCN-009 | negative | AC-6 | passed | - | - | - |
| SCN-010 | functional | AC-6 | failed | NEEDS_INVESTIGATION | low | ⏳ pending |
| SCN-011 | functional | AC-7 | failed | APPLICATION_DEFECT | high | ⏳ pending |
| SCN-012 | negative | AC-8 | failed | APPLICATION_DEFECT | high | ⏳ pending |

## SCN-010: The form can be sent with only a valid Email

- Requirement refs: AC-6 · type: functional · layer: ui
- Failing step: Then the success message is shown
- Error: `[REQ AC-6] optional fields empty: the form is sent (success message)`
- Locator: `getByText('Success! Your details have been submitted successfully.')`
- Expected: `visible`
- Evidence: [screenshot](artifacts/AE-3-tests-ae-3-AE-3-Brand-b4249-ent-with-only-a-valid-Email-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-3/runs/01-harden/artifacts/AE-3-tests-ae-3-AE-3-Brand-b4249-ent-with-only-a-valid-Email-chromium-retry1/trace.zip` · [error-context](artifacts/AE-3-tests-ae-3-AE-3-Brand-b4249-ent-with-only-a-valid-Email-chromium-retry1/error-context.md)

**Auto: NEEDS_INVESTIGATION (low)**

- Target not found: getByText('Success! Your details have been submitted successfully.')
- Target text "Success! Your details have been submitted successfully." is absent from the failure-time snapshot.

Next: Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION.

## SCN-011: Sending the form asks for confirmation, shows success and offers a Home button

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Then a browser confirmation "Press OK to proceed!" is shown
- Error: `[REQ AC-7] a browser confirmation is shown`
- Expected: `"confirm"`
- Received: `"no dialog"`
- Evidence: [screenshot](artifacts/AE-3-tests-ae-3-AE-3-Brand-2c820-ss-and-offers-a-Home-button-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-3/runs/01-harden/artifacts/AE-3-tests-ae-3-AE-3-Brand-2c820-ss-and-offers-a-Home-button-chromium-retry1/trace.zip` · [error-context](artifacts/AE-3-tests-ae-3-AE-3-Brand-2c820-ss-and-offers-a-Home-button-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: "confirm"
- Received: "no dialog"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

## SCN-012: Cancelling the confirmation keeps the form as filled

- Requirement refs: AC-8 · type: negative · layer: ui
- Failing step: When I click "Submit" and cancel the confirmation
- Error: `a confirmation was shown to cancel (precondition)`
- Expected: `> 0`
- Received: `0`
- Evidence: [screenshot](artifacts/AE-3-tests-ae-3-AE-3-Brand-09582-on-keeps-the-form-as-filled-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/AE-3/runs/01-harden/artifacts/AE-3-tests-ae-3-AE-3-Brand-09582-on-keeps-the-form-as-filled-chromium-retry1/trace.zip` · [error-context](artifacts/AE-3-tests-ae-3-AE-3-Brand-09582-on-keeps-the-form-as-filled-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-8] failed on a located element.
- Expected: > 0
- Received: 0

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.
