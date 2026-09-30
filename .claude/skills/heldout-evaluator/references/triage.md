# Triage: script defect or application defect? (phase 6)

```bash
npm run heldout -- triage KEY                     # auto-classify the latest run → runs/NN/triage.json + triage.md
npm run heldout -- triage KEY --carry-from auto   # also reuse confirmed decisions for identical failure signatures
```

## Categories

| Category | Meaning | Effect on the verdict |
| --- | --- | --- |
| `APPLICATION_DEFECT` | The AUT does not do what the requirement says (reproduced live) | FAIL (reviewer confirms) |
| `SCRIPT_DEFECT` | The test is wrong about *mechanics*: locator, wait, endpoint path, auth plumbing, payload shape, JS error, over-strict assertion implementation | repair + re-run |
| `ENVIRONMENT_ISSUE` | AUT down, network/DNS, browser launch, gateway 502–504, a rate limit, a shared sandbox whose settings someone changed | re-run; INCONCLUSIVE if it persists |
| `FLAKY` | Failed, then passed on retry, or failed only some of `--repeat-each` repeats | PASS_WITH_WARNINGS |
| `BLOCKED` | A `[SEED]` precondition could not be established, so the scenario was not evaluated | INCONCLUSIVE until the seed works |
| `NEEDS_INVESTIGATION` | Evidence insufficient | INCONCLUSIVE until resolved |

## What the automatic pass looks at

Evidence comes from the failure-time ARIA snapshot, the `[REQ …]` assertion message, and the full
**API exchange sequence** the test made (redacted).

| Signal | Auto category |
| --- | --- |
| `[SEED]` in the failure (seed.create threw) | BLOCKED |
| Failed then passed on retry / failed only some repeats | FLAKY (ENVIRONMENT if every failed repeat was a network error) |
| A `concurrency` test whose `[REQ]` check failed on a retried attempt or in some repeats | counted as **failed** (a race shows only sometimes), classified from the failing attempt; reproduce the burst live before confirming (an `api-probe --chain` step with `"parallel": 3` sends the call three times at once) |
| AUT degraded around the run (pre/post healthcheck slow or failing) and ≥ 2 tests timed out | ENVIRONMENT_ISSUE (run-level correlation) |
| `net::ERR_…`, ECONNREFUSED, browser launch | ENVIRONMENT_ISSUE |
| JS error in test code / strict-mode violation | SCRIPT_DEFECT |
| API call to a method+path **not declared** in `# ENDPOINT:` | SCRIPT_DEFECT (high) |
| API 502/503/504 | ENVIRONMENT_ISSUE |
| `[REQ]` failed and the declared endpoint answered 5xx | APPLICATION_DEFECT (high) |
| `[REQ]` expected 2xx, got 401/403 | NEEDS_INVESTIGATION (check auth plumbing) |
| `[REQ]` expected 2xx, got 400/422 | APPLICATION_DEFECT (medium): compare the payload with the field rules |
| `[REQ … strict]` element not found | APPLICATION_DEFECT (medium): the element isn't exposed as required |
| Element not found, target text **present** in the snapshot (other role/name) | SCRIPT_DEFECT |
| Element not found, text absent | NEEDS_INVESTIGATION |
| Text assertion on an element with **empty** text | NEEDS_INVESTIGATION (probably the wrong element) |
| Regex expectation matches once `\b`/anchors are relaxed | SCRIPT_DEFECT (over-strict implementation → amend) |
| `[REQ]` failed on a located element / declared endpoint with a different value | APPLICATION_DEFECT (high) |

**A shared public sandbox is not only the application.** Anyone can change its settings: ParaBank's admin page switches
its data access mode, and in one mode web payments answer "Bill Payment Complete" but are never recorded. Before
confirming an `APPLICATION_DEFECT` on a shared demo, and above all when several criteria fail the same way while the
same operation works through another path (the REST call records the payment, the page doesn't), look at the
application's own admin, settings or health page for a non-default setting (`heldout inspect --url admin.htm`). If
that explains it, confirm `ENVIRONMENT_ISSUE` with that page as evidence: the verdict is INCONCLUSIVE and says the
environment caused it. Never change a shared sandbox's settings yourself; that is the owner's call.

**Scenarios tagged `@assumes:G<n>` or `@needs-clarification`** (the expected value is an assumption, or the literal
reading of an open question, not a settled requirement): triage them like any other scenario. If the application really
behaves differently, confirm it as `APPLICATION_DEFECT`; the verdict then lists it under "Readings the application
contradicts" (a question for the owner), not as a defect, and asks the owner the question.

## Confirming each failure (mandatory)

1. Read `triage.md`: failing step, expected vs received, API exchanges, screenshot, snapshot, trace
   (`npx playwright show-trace …`).
2. **Reproduce live**: replay UI steps in your browser tier or with `heldout inspect --steps-json`;
   replay API requests with `heldout api-probe`. Save the output under `runs/NN/confirm/`. For a leak finding,
   a chain step checks it without printing the secret: `"show": ["token|jwt"]` decodes a token, and
   `"notContains": [{"field": "token", "decode": "jwt", "value": "${env:PASSWORD}"}]` reports which part holds it.
   Write the test's leak assertion the same way, as a list, e.g. `expect(partsContaining).toEqual([])`, so the
   verdict reads `[] → ["payload"]` rather than `0 → 1`.
3. Decide:

```
Did the app reach the state the previous steps should have produced?
├─ No → did an earlier step's action silently fail (wrong element / endpoint / credentials plumbing)?
│       ├─ Yes → SCRIPT_DEFECT
│       └─ No, the app itself went elsewhere / errored → APPLICATION_DEFECT (at the earlier step)
└─ Yes → is the element / endpoint the step needs present and declared?
        ├─ Present but the locator didn't match, or the test called an undeclared endpoint → SCRIPT_DEFECT
        ├─ Absent although the requirement names it (or not exposed with the required name) → APPLICATION_DEFECT
        └─ Present → does its observed value/behaviour equal the requirement's (verbatim)?
                ├─ Equal (the assertion compared wrongly) → SCRIPT_DEFECT (fix + audited amendment)
                └─ Different → APPLICATION_DEFECT
```

The **requirement is the oracle**. If it is genuinely ambiguous and the app fits one reasonable
reading, use NEEDS_INVESTIGATION with a clarification note.

4. Record the decision. Findings that share a root cause get the **same `--title`**, and the
   verdict groups them into one finding:

```bash
npm run heldout -- triage KEY --set SCN-009 --category APPLICATION_DEFECT --severity Critical \
  --title "Messages API exposes enquiries without authentication" \
  --rationale "<evidence-based reasoning>" --evidence "Replayed live on <date> (tier 3, api-probe): …"
npm run heldout -- triage KEY --set SCN-011 --category SCRIPT_DEFECT \
  --rationale "Test called GET /api/messages (undeclared); declared GET /api/message answers 200." \
  --action "Restored the declared endpoint; probed → 200; integrity re-checked."
```

Suggested severity (the reviewer has the final say): **Critical** means security or privacy, money
wrong, or the core journey blocked. **Major** means the requirement is not met and there is a
workaround or limited scope. **Minor** means wording, contract nuance or cosmetics.

## Repair loop

1. Fix every confirmed SCRIPT_DEFECT (mechanics only). Re-probe.
2. `heldout integrity KEY` must stay PRESERVED or AMENDED.
3. Re-run the **full** suite (`heldout run KEY --label rerun`), then `heldout triage KEY --carry-from auto`.
   Decisions carry over only for identical signatures (assertion, expected, received, locator, API
   method+status). Anything new must be investigated.
4. Stop after 3 cycles. Anything left unexplained stays NEEDS_INVESTIGATION.
