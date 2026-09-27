# Held-out evaluator — test report

**Date:** 2026-09-27 · **Subject under test:** the `heldout-evaluator` skill (scripts, fixtures, contract gates, triage, verdict rules)
**Method:** nine new stories across three AUTs, three per AUT, each mixing UI and API. A separate author agent wrote
each story and its machine-readable answer key, probing the live AUT, before any evaluation. The requirement contract
was built by the `heldout-contract-extractor` subagent and checked by a fresh `heldout-contract-reviewer`. A **blind
evaluator** then ran the skill end to end: a fresh general-purpose agent that saw only the skill and the story, never
the answer key or another evaluation. Scores come from `npx tsx demo/score.ts` → [SCORECARD.md](SCORECARD.md).
112 unit and integration tests cover the skill itself (`npm run test:skill`).

## 1. Blind evaluation results

| Story | AUT | What it tests | Expected | Actual | Defects found | False positives | Tests (passed/total) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [AE-1](../evaluations/AE-1/verdict.md) | Automation Exercise (UI + form API) | product search API + UI; a status the story words loosely | PASS_WITH_WARNINGS | ✅ PASS_WITH_WARNINGS | — | 0 | 19/20 |
| [AE-2](../evaluations/AE-2/verdict.md) | Automation Exercise | account API (always HTTP 200, code in the body) + shop sign-in | FAIL | ✅ FAIL | 3/3 | 0 | 32/38 |
| [AE-3](../evaluations/AE-3/verdict.md) | Automation Exercise | brands API ↔ sidebar, Contact Us form from an image mock-up | PASS | ❌ PASS_WITH_WARNINGS | — | 0 | 16/16 |
| [PB-1](../evaluations/PB-1/verdict.md) | ParaBank (UI + REST, Cloudflare) | registration, sign-in, customer REST | FAIL ¹ | ✅ FAIL | 1/1 | 0 | 13/14 |
| [PB-2](../evaluations/PB-2/verdict.md) | ParaBank | open account: page + service + rules in a CSV attachment | FAIL | ✅ FAIL | 2/2 | 1 ² | 9/13 |
| [PB-3](../evaluations/PB-3/verdict.md) | ParaBank | transfers; a PO comment replaces one AC | FAIL | ✅ FAIL | 2/2 | 0 | 6/12 |
| [DQ-1](../evaluations/DQ-1/verdict.md) | DemoQA (React UI + JSON API) | account/token API; a PO comment changes a status; JWT leak | FAIL | ✅ FAIL | 2/2 | 0 | 24/27 |
| [DQ-2](../evaluations/DQ-2/verdict.md) | DemoQA | Book Store catalogue, collection API, profile UI, 401 matrix | PASS | ✅ PASS | — | 0 | 28/28 |
| [DQ-3](../evaluations/DQ-3/verdict.md) | DemoQA | Links page: new-tab links, status links, a PO path correction | FAIL | ✅ FAIL | 2/2 | 0 | 24/32 |
| **Total** | 3 AUTs | | | **8/9 verdicts** | **12/12** | **1** | |

1. **AUT drift.** PB-1's key was written expecting PASS. By evaluation time the shared ParaBank demo answered every
   failed sign-in with "An internal error has occurred" instead of the required "could not be verified". The test lead
   re-probed this independently of the evaluation and revised the key, recorded under `revisions` in
   [PB-1.json](answer-keys/PB-1.json).
2. **Disputed false positive.** PB-2's third finding (a customer can fund a new account from *another* customer's
   account, which debits them) was reproduced live and contradicts the CSV rule R4. The key doesn't list it, so the
   scorer counts it as a false positive. It is most likely a gap in the key.

**AE-3 (the one mismatch).** All 16 tests passed. The verdict carries warnings because three open questions about
the Contact Us criterion remain: what counts as an invalid e-mail, what "not sent" looks like, and whether the mock-up's
labels are literal. The independent contract reviewer confirmed all three are genuine gaps in the story. The key
expected a plain PASS.

**Integrity:** PRESERVED in 8 of 9 stories. DQ-3 is AMENDED: one audited change, recorded in its verdict, in which
AC-9's assertion stopped re-checking AC-7's message text.

**Automatic triage vs confirmed decisions:** 25 of 31 agreed, 2 abstained, and 4 were confidently wrong. Three of the
wrong ones were in PB-2 and were caused by a matcher defect (#9 below), since fixed. The fourth is a slow sign-in that
passed on retry: triage called it FLAKY, the evaluator called it a script defect (a wait that was too short). Every
application defect was reproduced live before it was confirmed.

**Effort:** 12 to 70 minutes per story, end to end, without a human. Most of the time went on hardening; on ParaBank,
waiting out rate-limit bans took up to 5 minutes per story.

## 2. Requirement contracts

- All nine contracts passed the mechanical gates (quote anchoring, full line coverage, literal grounding) on the
  builder's first or second run.
- **Three reviews found real problems**, and each was fixed and then confirmed by a fresh reviewer:
  - PB-3: an unaccounted-for clause in the PO comment.
  - DQ-2: a misread layer (AC-5 marked e2e when the story says UI).
  - DQ-2: an incomplete criterion (the invalid-token 401 case the API document states was missing).
- **PO comments that override the story** were applied correctly in PB-3 (AC-6 replaced), DQ-1 (401 instead of 200)
  and DQ-3 (`/invalid-url` instead of `/not-found`). Each was recorded as a gap resolved from the requirement, and
  each was checked by the reviewer.
- **Questions for the owner** came out as oracle gaps, 1 to 3 per story. None was invented; the reviewers confirmed
  every one.

## 3. Skill defects found by this round (all fixed)

| # | Found by | Defect | Fix |
| --- | --- | --- | --- |
| 1 | DQ-1, AE-2 | **Secret leak:** `mcp-probe` wrote the Playwright code MCP ran (`fill('<password>')`) into its report, and left MCP's own log in a temp directory | Details redacted (the story's secrets plus typed values); the temp directory is removed after each walk |
| 2 | PB-1 | **Secret leak:** `api-probe` chains printed `${env:…}` values used in paths | Env values in paths are URL-encoded into the request, shown as `***`, and scrubbed from every report |
| 3 | AE-1 | The `@assumes:G<n>` tag was never parsed, so a failed assumption would have been reported as a defect | Parser fixed; tested |
| 4 | AE-3 | Triage read a `[REQ]` tag from the code frame around a failing precondition and suggested APPLICATION (high) | The tag comes from the failing assertion only; tested |
| 5 | AE-3 | An evaluator deleted and renumbered run folders | Guardrail "runs are history"; the verdict flags missing run numbers |
| 6 | AE-2, PB-2 | Contract literal check rejected paths composed from a stated base URL, and decimals one step past a boundary | Both grounded; tested |
| 7 | AE-3, PB-2 | `run --grep "A\|B"` broke on Windows (shell splitting) | Playwright's CLI runs directly through node |
| 8 | PB-1, PB-2, PB-3 | Rate limiting and bot protection were triaged as FLAKY or BLOCKED, and the healthcheck passed on 429 | WAF pages and 429 → ENVIRONMENT; 429 fails the healthcheck; the `api` fixture and `page.goto` wait for `Retry-After`; profile `maxWorkers` and `minTestIntervalMs`; `run --wait-healthy` |
| 9 | PB-2 | **Confidently wrong:** triage ignored the API base path, so three real defects on declared endpoints read as "undeclared → SCRIPT (high)" | Endpoints matched relative to `apiBaseURL`; tested |
| 10 | PB-2, PB-3 | Reproduction evidence pointed at the last API call, even for page assertions | The call an assertion names (`[REQ AC-4] POST /x …`) is chosen, and none for page assertions |
| 11 | Re-triage after #9 | A failure signature included the evidence triage derived, so the better triage dropped a confirmed human decision | Signatures use the failure only; the decision was restored by carry-forward; tested |
| 12 | DQ-2, AE-3 | An open question about something no AC requires downgraded a PASS | Listed "for the owner's information" instead; documented |
| 13 | DQ-2 | Failed seed cleanups were invisible (three users were left behind in a shared sandbox) | `heldout run` lists every failed cleanup; the data guide covers token rotation |
| 14 | DQ-3 | The `api` fixture always followed redirects, so a 301 couldn't be asserted | `maxRedirects` option |
| 15 | many | `scaffold` guessed `@type:functional`, lacked `test-data.json`, and dropped a Gherkin `Feature:` line and code fences into the coverage ledger | No default type (the author chooses); `test-data.json` created with the contract's secret; structure lines not accountable |

About 60 smaller items were also fixed from the evaluators' friction reports. They include:
- **`inspect`:** accessible names, ids with dots, `--var`, and waits on `<option>`.
- **`mcp-probe`:** `nth`/`ref`, `--var`, dialog/network/console output, and `blockHosts`.
- **`api-probe`:** `expectBody`, JWT decode and `notContains` leak checks, and `--body-limit`.
- **Verdict wording:** the Hardening cell, conditional steps, and observations outside the ACs.
- **Lint:** control characters, Given-block-only seeding checks, and reviewer observations shown once.

## 4. Robustness checks

| # | Check | Result |
| --- | --- | --- |
| R1 | Tampering: expected value aligned with the AUT; matcher weakened inline; failing test skipped | ✅ integrity VIOLATED → INCONCLUSIVE; skip blocked by lint. [R1-tamper.md](robustness/R1-tamper.md) |
| R3 | Malformed evaluation (11 injected traceability errors) | ✅ all rejected by lint. [R3-broken-feature.md](robustness/R3-broken-feature.md) |
| R5 | API pre-step failure (wrong credentials) | ✅ BLOCKED / NEEDS_INVESTIGATION, no false defects. [R5-prestep-failure.md](robustness/R5-prestep-failure.md) |
| R7 | Contract gates: paraphrased AC, invented endpoint or quote, oracle read off the AUT, oracle changed after the freeze, attachment changed | ✅ all rejected. [R7-contract-gates.md](robustness/R7-contract-gates.md) |
| — | Jira Cloud adapter against a fake Jira REST server | ✅ `tests/jira-cloud.test.ts` |
| — | Real rate-limiting WAF (Cloudflare 1015 on ParaBank), AUT restart (502), database reset | ✅ handled as ENVIRONMENT after fix #8; no false defects |

## 5. Limitations and honest caveats

1. **Same model family throughout.** The authors, contract builders, reviewers and evaluators were separate agents,
   and the evaluators never saw the answer keys. All of them were Claude models, though, so shared blind spots are possible.
2. **The skill changed during the round.** Fixes landed while later evaluations were running, and evaluators noticed
   it (docs and fixtures changing mid-run). Each run records a fingerprint of the skill (`run-meta.json`). The nine
   verdicts were re-rendered with the final skill, but the tests were not re-run.
3. **Shared public sandboxes drift.** PB-1's expected behaviour changed between key and evaluation. Rate limits
   cost minutes per ParaBank story.
4. **The "ask the user" step was not exercised live.** Every run was non-interactive, so oracle gaps became
   assumptions or open questions.
5. **Tier 1 (IDE browser) and native Playwright MCP tools were not used.** Tier 2 ran through the bundled stdio
   client, because the MCP browser is shared per session and parallel evaluators would drive the same page.
6. **Still open:**
   - verdict reproduction steps show Scenario Outline placeholders instead of row values;
   - `scaffold` doesn't regenerate stubs from an existing feature;
   - `lint` doesn't type-check specs;
   - API-only tests still start a browser;
   - there is no pattern for apps whose data can only be seeded through the UI.

## 6. Recommended next steps

1. Run the remaining authored stories (PB-4, JS-1, JS-2) blind, to widen the sample.
2. Exercise the interactive path: answer oracle gaps with `AskUserQuestion` in a live session.
3. Point the skill at an AUT you own, with a dedicated environment and a seeding/reset API. That removes the
   sandbox noise that cost the most time here.
