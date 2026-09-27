# R3 — malformed evaluation is rejected by the preflight lint

Inputs: `evaluations/ZZZ-9` (temporary): duplicate ids, missing/unknown type, unknown AC, uncovered AC, scenario without a test, orphan test, tag mismatch, no [REQ] assertion, unhardened locator, unset secret, no entry point.

```
Preflight ZZZ-9 → AUT profile "the-internet" (The Internet (UI test playground))
  ⚠ [no-source] SCN-001 has no "# from <story section / attachment>" line above it — the verdict cannot trace it to a requirement source
  ⚠ [no-source] SCN-001 has no "# from <story section / attachment>" line above it — the verdict cannot trace it to a requirement source
  ✖ [scenario-without-type] SCN-001 has no @type:<t> tag (one of functional, negative, boundary, security, idempotency, performance, accessibility, integration, contract, usability, compatibility, resilience)
  ✖ [unknown-ac] SCN-002 is tagged @AC-9, which is not in the AC list
  ⚠ [no-source] SCN-002 has no "# from <story section / attachment>" line above it — the verdict cannot trace it to a requirement source
  ✖ [unknown-type] SCN-002 has @type:sideways, not in the taxonomy (functional, negative, boundary, security, idempotency, performance, accessibility, integration, contract, usability, compatibility, resilience)
  ✖ [duplicate-scenario-id] SCN-001 is used by 2 scenarios
  ⚠ [ac-uncovered] AC-2 is not covered by any scenario
  ✖ [scenario-without-test] SCN-002 "Unknown AC and unknown type, and no test" has no test
  ✖ [test-without-scenario] Test SCN-003 has no scenario in scenarios.feature
  ✖ [test-type-tag] SCN-001: test must be tagged @type:functional (scenario type), found @type:negative
  ✖ [ac-without-req-assertion] AC-1 has scenarios but no "[REQ AC-1]" assertion in the spec
  ✖ [unhardened] 1 TODO(harden) marker(s) remain
  ⚠ [no-entry-point] SCN-001 starts with "When I do a thing" — state the entry point / preconditions as a Given (deep-link to the page under test unless navigation is part of the AC)
  ⚠ [endpoint-unused] Declared endpoint GET /api/things is not referenced by any test
  ✖ [env-missing] test-data.json needs ${env:NOT_SET_ANYWHERE} — set it in .env
exit=1
```
