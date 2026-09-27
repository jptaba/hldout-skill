# R5 — API pre-step failure (wrong credentials) is BLOCKED, not an application defect

Run: `evaluations/DEMO-303/runs/06-robustness-bad-creds` (`PARTNER_PASSWORD=wrong-on-purpose`, label `robustness-*` so it can never become the final run).

| Scenario(s) | What broke | Classification | Correct? |
| --- | --- | --- | --- |
| SCN-010.1 | auth pre-step `seed.once(partner token)`: the API answered 200 with no token, so output validation failed | **BLOCKED** | ✅ |
| SCN-005, SCN-014.1–.3 | "gone id" pre-step chain (create → delete) refused with 403 | **BLOCKED** | ✅ |
| SCN-001, SCN-002 | the auth endpoint itself (same endpoint as the failed auth pre-step) | NEEDS_INVESTIGATION (auth correlation) | ✅ (no false defect) |
| SCN-010.2, SCN-011, SCN-012, SCN-013 | writes with wrong Basic credentials → 403 (single and repeated calls) | NEEDS_INVESTIGATION (auth plumbing) | ✅ |
| SCN-007.x, SCN-008.x | validation defects that don't depend on credentials | APPLICATION_DEFECT | ✅ (still real) |

The run also carried a warning: *"An auth pre-step failed in this run (SCN-010.1; POST /auth) — check the credentials in test-data.json / .env…"*

**Evaluator bugs this check found (fixed and unit-tested):**
1. A pre-step validated only the status. This API answers bad credentials with 200 plus no token, so the failure leaked onto the AC under test. Pre-steps now validate their *output*.
2. The classifier didn't recognise lists of statuses (`[200, 200]` vs `[403, 403]` from repeated calls) as "success expected, got 403". `toEqual` diffs are now parsed, and the relevant exchange is chosen by the first status in the list.
3. The first version of the auth correlation downgraded every endpoint the blocked test had touched (including `POST /booking`), which hid real defects. It now uses only the call the auth pre-step failed on.

**Hygiene:** cleanup couldn't run with the wrong credentials, and the seed ledger recorded 17 bookings with `cleanup: failed`. Those ids were then deleted with the correct credentials (17/17).
