# R1 — tampering: expected value aligned with the AUT

Change: REQ.STATUS.NO_CONTENT 204 → 201 (makes SCN-013 pass by adopting the AUT behaviour).

```
Held-out integrity: VIOLATED
  demo-303.spec.ts: 30 REQ assertions in draft → 30 now
  ✖ @req-constants block changed in demo-303.spec.ts
  → evaluations/DEMO-303/hardening/integrity.json
integrity exit=2
Verdict for DEMO-303: ❔ INCONCLUSIVE
  Held-out integrity was violated — requirement assertions changed after the draft was frozen without an audited amendment, so results cannot be trusted.
```

After reverting the tamper:

```
Held-out integrity: PRESERVED
Verdict for DEMO-303: ❌ FAIL
```

# R1b — weakening a matcher inline

Change: `.toBe(REQ.STATUS.NOT_FOUND)` → `.toBeGreaterThanOrEqual(400)` in SCN-014 (405 would then pass).

```
Held-out integrity: VIOLATED
  demo-303.spec.ts: 30 REQ assertions in draft → 30 now
  ✖ changed:  demo-303.spec.ts: [REQ AC-11] ${method} unknown id → 404
      draft:   .toBe(REQ.STATUS.NOT_FOUND)
      current: .toBeGreaterThanOrEqual(400)
```

# R1c — skipping a failing test

Change: `test(` → `test.skip(` for SCN-002.

```
Preflight DEMO-303 → AUT profile "restful-booker" (Restful Booker (booking API demo))
  ✖ [focused-or-skipped] test.only / test.fixme / skip found — requirement scenarios must all run
lint exit=0
  ✖ [focused-or-skipped] test.only / test.fixme / skip found — requirement scenarios must all run
✖ Traceability lint failed — fix the errors above (or --skip-preflight to override).
```

Reverted:
```
Held-out integrity: PRESERVED
  ✔ traceability lint clean
```
