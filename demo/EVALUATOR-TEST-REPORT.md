# Held-out evaluator — test report

**Date:** 2026-09-26 · **Subject under test:** the `heldout-evaluator` skill (scripts, fixtures, heuristics, verdict rules)
**Method:** seven requirements across five AUTs, each with a machine-readable answer key written *before* the
evaluation; seven robustness checks; 82 unit and integration tests. Scores come from `npx tsx demo/score.ts` → [SCORECARD.md](SCORECARD.md).

## 1. Results

| Story | AUT | What it tests | Expected | Actual | Findings (recall) | False positives |
| --- | --- | --- | --- | --- | --- | --- |
| DEMO-101 | saucedemo (UI) | UI journeys, requirement in an attachment, seeded locator defect | FAIL | ✅ FAIL | 3/3 | 0 |
| DEMO-202 | Shady Meadows B&B (UI + API) | 16 ACs, boundaries, security, a11y, idempotency, requirement revision, seeding | FAIL | ✅ FAIL | 9/9 | 0 |
| DEMO-303 | restful-booker (pure API) | cookie + Basic auth, PUT/PATCH/DELETE, a seeded auth defect **masking** a real one | FAIL | ✅ FAIL | 6/6 | 0 |
| DEMO-404 | the-internet (UI) | **false-positive resistance**: the app meets every AC; mechanics traps | PASS | ✅ PASS | — | 0 |
| DEMO-505 | the-internet (UI) | ambiguity: `@needs-clarification` + open question | PASS_WITH_WARNINGS | ✅ PASS_WITH_WARNINGS | — | 0 |
| DEMO-606 | the-internet (UI) | nondeterminism: an intermittent copy typo (~50% of clicks) | FAIL | ✅ FAIL | 1/1 | 0 |
| DEMO-707 | Conduit (UI + API, JWT) | **requirement-contract intake**, per-user visibility traps, a seeded script defect the AUT answers with 500 | FAIL | ✅ FAIL | 7/7 | 0 |
| **Total** | 5 AUTs | | | **7/7 verdicts** | **26/26** | **0** |

- **Seeded script defects:** 4/4 detected, repaired, and passing on re-run. One of them was masking a real defect, which surfaced after the repair and was **not** carried over (new failure signature).
- **Automatic triage vs confirmed decisions (evaluation runs):** 41/42 agreed, 1 abstained (NEEDS_INVESTIGATION on the masked-auth case), 0 confidently wrong **after fix #19**. Before that fix, DEMO-707's seeded defect was auto-classified APPLICATION_DEFECT (high). The live reproduction corrected it, and the fixed classifier now gets it right. See §5: hardening runs are not in this number.

## 2. Robustness checks

| # | Check | Result |
| --- | --- | --- |
| R1 | Tampering: expected value aligned with the AUT; matcher weakened inline; failing test skipped | ✅ integrity VIOLATED → verdict INCONCLUSIVE; skip blocked by the lint gate. [R1-tamper.md](robustness/R1-tamper.md) |
| R2 | AUT down / degraded (occurred naturally: 503s, 30 s stalls) | ✅ run refused before any test (3-sample healthcheck); failures during a degraded run → ENVIRONMENT, not defects |
| R3 | Malformed evaluation (11 injected traceability errors) | ✅ all rejected by the lint. [R3-broken-feature.md](robustness/R3-broken-feature.md) |
| R4 | Jira Cloud adapter against a fake Jira REST server (auth, fields, redirect download, multipart upload, ADF comment, labels, `jira-fetch` end-to-end) | ✅ 7/7 tests (`tests/jira-cloud.test.ts`) |
| R5 | API pre-step failure (wrong credentials) | ✅ BLOCKED / NEEDS_INVESTIGATION, no false defects. [R5-prestep-failure.md](robustness/R5-prestep-failure.md) |
| R7 | Requirement-contract gates: paraphrased AC, invented endpoint, invented quote, oracle read off the AUT, oracle changed after the freeze, attachment changed | ✅ all six rejected. [R7-contract-gates.md](robustness/R7-contract-gates.md) |
| R6 | Tier 2: real Playwright MCP server (DEMO-404 re-walk; DEMO-202 accessibility cross-check) | ✅ 21/21 + 12/12 + 17/17 steps after two driver fixes (#16, #17). Walks in `evaluations/*/hardening/tier2/` |

## 3. Evaluator defects found by this testing (all fixed; most now covered by unit tests)

| # | Found by | Defect | Fix |
| --- | --- | --- | --- |
| 1 | DEMO-303 seeded defect | **Credential leak**: a misspelled `Authorisation` header was logged unredacted | Redact by header *name pattern* and *credential-like value*; scrubbed the affected run |
| 2 | DEMO-303 | API evidence used the last request, not the one the assertion was about | Relevant exchange chosen by the failing status (single or list) |
| 3 | DEMO-202 seeding | Cleanup calls polluted the evidence and changed failure signatures | Calls tagged by phase (`[seed]` / `[cleanup]`), and only scenario calls count as evidence |
| 4 | DEMO-404 | Nameless locator not found → NEEDS_INVESTIGATION even though the expected text was on the page | Search the snapshot for the assertion's expected text |
| 5 | DEMO-404 | Snapshot search matched the fixture's own `# step:` header line | Header lines excluded |
| 6 | DEMO-404 | `--repeat-each` produced duplicate entries per scenario | Repeats merged: mixed results → FLAKY ("failed k of n"); all network errors → ENVIRONMENT |
| 7 | DEMO-404 | A single healthcheck sample missed a bimodal 30 s stall | 3 samples, slowest wins; degraded AUT aborts the run (`--allow-degraded` overrides); healthcheck time bounded |
| 8 | DEMO-404 | Degraded-AUT timeouts triaged as script/unknown; then flaky tests were ignored | Run-level correlation with pre/post healthchecks, counting failed timeouts and flaky tests |
| 9 | DEMO-505 | `toHaveCount(1)` receiving 0 was auto-classified APPLICATION (a false positive) | A zero count is treated as "element not found" |
| 10 | R1 | `--skip-preflight` plus a skipped test could still yield PASS | Skipped scenarios force INCONCLUSIVE; a skipped preflight is flagged in the verdict |
| 11 | R5 | Pre-steps validated status only (the API answers bad credentials with 200) | Pre-steps validate their output |
| 12 | R5 | Repeated-call status lists and `toEqual` diffs weren't parsed | Diff parser; list-of-2xx rule |
| 13 | R5 | First auth correlation hid real defects (it downgraded every touched endpoint) | Only the call the auth pre-step failed on |
| 14 | R4 | `spawnSync` deadlock in the Jira E2E test; tsx resolved from the wrong cwd | Async spawn; loader resolved from the project |
| 15 | misc | Scripts crashed with EPIPE when piped into `head`; empty `history/` folders left behind | Handled |
| 16 | Tier-2 test | **Vacuous absence**: on an unhydrated SPA snapshot, "element not exposed" checks passed and would have falsely confirmed accessibility defects | `expectAbsent` requires a ready page (wait anchor or substantial snapshot) and otherwise fails; expectations poll; docs require a positive control |
| 17 | Tier-2 test | Nodes without refs (e.g. `<option>`) couldn't be asserted; large MCP snapshots arrive as files | `nodeFor` vs `refFor`; file-referenced snapshots read; MCP output kept in a temp dir |
| 18 | DEMO-707 contract | Quote anchoring turned emphasis into spaces, so `(**201**)` never matched `(201)` and 5 real quotes were rejected | Emphasis and code markers are removed; structural markers separate words |
| 19 | DEMO-707 seeded defect | **Confidently wrong:** a request without the declared envelope made the AUT crash (500), and "5xx → APPLICATION (high)" blamed the app for AC-5 | Triage checks the request against the contract's declared envelope first. A non-conforming request → SCRIPT_DEFECT; the 5xx is noted as an observation outside the ACs |
| 20 | DEMO-707 re-run | Carry-forward missed identical failures because the signatures contained per-run slugs and ids | Signatures mask generated ids, long numbers and timestamps (statuses and AC ids are kept) |
| 22 | DEMO-707 UI hardening | **Credential leak in evidence:** ARIA snapshots include the *value* of password textboxes. The fixture's step snapshots and Playwright's own `error-context.md` / HTML report data held test passwords in plain text (DEMO-707 run 01; also DEMO-101, whose value is the public demo password) | Fixture, `inspect.ts` and `mcp-probe.ts` redact password-field values. `run.ts` scrubs every text artifact after each run (including base64 attachments in results.json). `scrub.ts KEY` does the same retroactively. The leaking DEMO-707 run was deleted. `trace.zip` and `html/index.html` stay local and git-ignored; only the verdict is published |
| 23 | Fix #22's first version (**caused by the evaluator's own fix**) | The first scrubber took *every* secret-named env var on the machine, including values that are plain words (`password`, `hello`). It rewrote ~4,900 ordinary occurrences of "password" in 721 run/hardening files of five stories. Nothing leaked, but evidence text was altered | Reversed with a context-aware restore: legitimate redactions (JSON values under secret keys or credential headers, password-textbox values, `password123`) were kept. The restore was verified by re-rendering the six older verdicts from the restored triage data: identical except the timestamp (DEMO-101 also lists a run created later). The scrubber now uses only the story's own `${env:…}` secrets and refuses plain-word or short values (`safeToScrub`), reporting them instead. Unit-tested |
| 21 | DEMO-707 intake | Candidate extraction missed endpoints in markdown tables and read "1–100)" as status 100 | Table-cell method/path pattern; ranges excluded |

Earlier sessions also found and fixed: the integrity regex swallowing earlier statements, an over-strict
`\b` assertion (now handled through audited amendments), empty live regions matched as "the error",
and the missing endpoint-declaration check.

## 4. Capabilities added while testing (because the stories needed them)

- **Data seeding** (`seed.create/track`, seed ledger, BLOCKED semantics, `# SEED-ENDPOINT:`, cleanup with
  verified results) and **API pre-steps** (`seed.once/step/until`, `@depends:SCN-x`, pre-steps replayable
  as P1…Pn in the verdict). See [data-and-journeys.md](../.claude/skills/heldout-evaluator/references/data-and-journeys.md).
- **Journey entry points** (`gotoPage`, lint rules `no-entry-point` / `no-seeding`).
- **Stability tooling** (`--repeat-each`), **degraded-AUT gate**, **run-level correlation** (environment and auth).
- **Scorer and machine-readable answer keys** for testing the evaluator itself.
- **Requirement contract (phase 1b).** Stories and attachments in any format are normalised into one shape
  (`requirement-contract.json`). Every AC is quoted verbatim from a cited source, and the quote is verified.
  Missing required elements become **gaps**, resolved through a ladder: requirement → AUT (mechanics only) →
  config → the user. Expected behaviour may never be read off the AUT. The oracle part is frozen with the
  draft. Lint, triage (request envelopes) and the verdict ("elements the story did not state") all use it.
  See [requirement-contract.md](../.claude/skills/heldout-evaluator/references/requirement-contract.md).

## 5. Limitations and honest caveats

1. **Author bias.** The same agent wrote the stories and answer keys *and* acted as the evaluator.
   Answer keys were fixed before each evaluation, but the evaluator knew the AUTs from probing. A stronger
   test is a **blind evaluation**: a fresh agent given only the story (see §6).
2. **Classifier tuned on the same data.** Several heuristics were improved *because* these runs exposed
   gaps (§3). The "0 wrong" auto-triage figure covers confirmed decisions in evaluation runs only. Hardening
   dry-runs, where most misclassifications happened, aren't scored. New AUTs will surface new gaps, which
   is why the live-reproduction step is mandatory.
3. **Browser tiers.** Tier 3 (bundled inspector) did the hardening. **Tier 2 (the real Playwright MCP
   server) was then exercised through the bundled stdio client** (`mcp-probe.ts`). It re-walked DEMO-404
   sign-in and widgets (33/33 steps) and independently confirmed DEMO-202's two accessibility findings on a
   ready page. It hasn't yet been used *natively* by the agent (the server was pending approval in this
   session). Tier 1 (IDE browser) remains unexercised.
4. **Shared public sandboxes** were unstable (the-internet: 503s and 30 s stalls). The evaluator handled it
   correctly (refused or ENVIRONMENT), but it made several runs non-evaluable, and re-runs were needed.
5. **Cleanup cost.** DEMO-202's per-enquiry cleanup does a staff-list lookup each time (89 cleanup calls
   per run). Batching by tag at teardown would be cheaper.
6. **Jira Cloud** is verified against a *fake* REST server, not a real Jira instance.
7. **The "ask the user" step wasn't exercised live.** DEMO-707 ran as a non-interactive continuation, so
   its two oracle gaps became an explicit assumption (G4) and an open question (G5), not user answers.
   The gates for that path are tested (R7, unit tests). A real `AskUserQuestion` round-trip is still to be done.
8. **Weak test secrets can't be scrubbed literally.** `SHADY_STAFF_PASSWORD` is the sandbox's published
   value `password`. It's refused by the scrubber (fix #23), so only field-level redaction covers it. Use strong
   test secrets on real projects.
9. **DEMO-707's API mechanics weren't dry-run before the eval run** (they came from the contract). That's why
   the seeded defect reached triage, which is intended here. In normal use, a hardening dry-run would catch it earlier.

## 6. Recommended next steps

1. **Blind evaluations:** run the skill in a fresh session (or subagent) on a new story whose answer key
   the evaluator cannot see, then score with `demo/score.ts`. This removes the author bias in §5.1.
2. Approve Playwright MCP (`/mcp`) and restart, then harden one UI story using the **native** MCP tools. The stdio walks here are the baseline to compare against.
3. Point the skill at an AUT you own with a **dedicated environment and a seeding/reset API**. That is the
   setup the strategy recommends, and it removes the sandbox noise.
4. Add a generic **sweeper** driven by the seed ledger's recorded ids plus a per-entity cleanup hint.
