# Audit — round r27, TOOL-1 (fresh onboarding)

Project: `heldout-rounds/r27-fresh` · profile `practicesoftwaretesting` · skill clone `r27-skill` · answer key `demo/answer-keys/TOOL-1.json`.

## Score (`npx tsx demo/score.ts TOOL-1 --from ../heldout-rounds/r27-fresh`)

| | |
| --- | --- |
| Verdict | expected FAIL, got **FAIL** (match) |
| Defects | 2/2 found: D1 (9 per page, not 12) as APP-1, D2 (empty search returns nothing) as APP-2 |
| False positives | 0 (precision 100%) |
| Automatic triage vs confirmed | 5/5 agree, 0 abstained, 0 wrong |
| Tests | 15 (14 scenarios), 10 passed, 5 failed, all 5 are the real defects |
| Seeded script defect S6 (caption test id) | not seeded in this fresh round (the spec finds the caption by its text), so it was not tested |

## Runs

| Run | Why |
| --- | --- |
| 01-harden | first hardening run: 10 passed, the 5 deviations failed |
| 02-harden (`--repeat-each 3`) | stability check. SCN-002, SCN-003 and SCN-010 failed in the first repetition only, because the live demo reset its data and gave the categories new ids (hardening-log.md "Stability") |
| 03-harden (`--repeat-each 3`) | stability check repeated: only the 5 deviations ×3 failed |
| 04-eval | official run, after the one integrity amendment (01:08:15 → run 01:08:53) |

One more stability run than the minimum, caused by the environment. No SCRIPT_DEFECT, NEEDS_INVESTIGATION or BLOCKED anywhere. 02 and 03 have no triage.json (repeat runs, as designed).

## Hiccups

| # | What | Evidence | Class | Proposed change |
| --- | --- | --- | --- | --- |
| 1 | SCN-013 needed an assertion amendment: the last page's expected count came from the application's own `last_page` | `hardening/amendments.json`; `draft/tool-1.spec.ts:271,280`; hardening-log.md "Assertion implementation to review" | Skill defect, **already known (3)** | Already fixed in `test-authoring.md` (the new row says to derive the page to read and the count to expect from the requirement) |
| 1b | More of the same as (3): the amendment also changed `pageNo()` from `lastPage` / `lastPage - 1` to `reqLastPage()`. That changed **which page SCN-013.1 checks** (page 5 in 01-harden, page 4 in 04-eval). Integrity did not record it, because only the `toBe(...)` text is tracked | `draft/tool-1.spec.ts:271` vs `tests/tool-1.spec.ts` `pageNo`; `runs/01-harden/triage.json` "page 5 (before the last)" vs `runs/04-eval/triage.json` "page 4" | Skill defect, covered by known fix (3) | The new test-authoring.md row already covers "the page to read", so no new change for authoring. Optional: `hardening.md` could also say that a change to the request an assertion depends on (which page or record it reads) gets mentioned in the amendment reason |
| 2 | The verdict's traceability matrix shows an unrendered template: `SCN-013 GET /products pagination at 12 per page: ${row.name}` | `verdict.md`, Traceability matrix, AC-6 row 4 | Skill defect | `.github/scripts/spec-model.ts` (TEST_CALL title) / `verdict.ts` (line ~321): when a scenario title holds `${…}`, use the titles from the run results (one per case, `SCN-013.1`, `.2`), or drop the template part and append "(N cases)". Never print a raw `${…}` |
| 3 | A multi-line `// ASSUMPTION:` is cut after its first line: the verdict reads "…the search term used" and stops | `tests/tool-1.spec.ts` (the ASSUMPTION spans two comment lines); `verdict.md` "Assumptions the evaluation made" | Skill defect | `.github/scripts/spec-model.ts` `readSpec`: append the indented `//` lines that follow an ASSUMPTION / OPEN-QUESTION / OBSERVATION line (until a blank or non-comment line). Or have `lint.ts` warn about a continuation line that would be dropped |
| 4 | Read-only `seed.step` lookups appear under "Preconditions the test seeded … recreate equivalent data", with value `-` and "cleanup: none" (SCN-011: "catalogue total (GET /products): `-`") | `verdict.md` APP-1 and APP-2 "How to reproduce"; `verdict.ts:243-245` | Skill defect (cosmetic, but it misleads the reviewer) | `.github/scripts/verdict.ts`: list only the records created with `seed.create` / `seed.track` under "Preconditions the test seeded". Lookups already show as API pre-steps (P1…) |
| 5 | The contract reviewer's `reviewedAt` is a made-up round number (`2026-10-05T01:00:00.000Z`) | `requirement-contract.review.json` | Skill defect, **already known (2)** | Already fixed in `contract-review-prompt.md` |
| 6 | Tier-2 (native Playwright MCP) snapshots were saved in the agent's working folder, not the project. `hardening/tier2/` is empty and the tier-2 walk left no evidence (tier-3 reports cover it) | hardening-log.md "Tiers used"; empty `hardening/tier2/` | Skill defect (minor) | `references/hardening.md` "Tier 2 in practice", Loaded natively: save each snapshot you rely on under `output/<profile>/KEY/hardening/tier2/` (the snapshot tool's file name argument), or write the walk as `<walk>.steps.json` and replay it with `mcp-probe --out` so it becomes evidence |
| 7 | 02-harden: SCN-002/003/010 failed in one repetition (search gave 0, Hammer id stale) | hardening-log.md "Stability"; the Hammer id changed between probes | Environment (the live demo resets its data and gives categories new ids) | none. The tests look ids up live, which is correct |
| 8 | `Requirement source` in APP-1 repeats `story.md#L28; story.md#L28 (status: G3…)` | `verdict.md` APP-1 | Skill defect (cosmetic) | `verdict.ts` `sourceOf` join: remove a source that another entry in the set already contains |
| 9 | The spec's header comment still says "G1, G2 (mechanics, open)" after both were resolved discovered-in-aut | `tests/tool-1.spec.ts` gap comment | Expected / trivial | none (only a comment) |
| 10 | Known (1) init "keep .mcp.json" and (4) amend prefix | not visible in the round's artifacts. The amendment is recorded with the `tool-1.spec.ts: ` prefix | Already known | — |

## Traps and criteria

- **Trap "shared sandbox: don't rely on counts beyond the search term": avoided.** No count is hard-coded. Totals, page counts, the Hammer id and the hammer set are read live (`seed.step`, `readWholeCatalogue`, `findCategoryId`). Small leftover risk: SCN-014 compares two totals read a moment apart. Another user adding a product in between could cause a rare flake. That is acceptable, and it was not seen.
- **Held-out leaks: none.** The actions (`actions/practicesoftwaretesting/**`) hold only mechanics. Every expected value is in `@req-constants` (12, captions, 200) or comes from the requirement. The one exception was the SCN-013.2 count, which came from the application. It was caught by the hardener, amended and audited (known item 3).
- **Contract:** one review round, all items supported, no gap left `open` or `assumed` in the contract. G3–G6 were provided by the user, G1–G2 were discovered in the AUT (mechanics only). G2 records a concrete category id that the demo later changed. That is harmless because no test or action uses it.
- **Criteria:** AC-1…AC-5 met and AC-6, AC-7 not met. This matches the answer key (D1 on AC-6, D2 on AC-7). No expected outcome is contradicted.

## Skill defects ranked by cost to this round

1. **Known (3)** SCN-013 implemented against the application's own `last_page`, including the page it read (1b). It cost an amendment, an unrecorded change to SCN-013.1's subject and the main agent's review. It is fixed in test-authoring.md.
2. **Verdict rendering (2, 3, 4, 8)**: `${row.name}` in the matrix, the cut-off assumption, lookups shown as seeded data, the duplicated source. None changed the verdict, but each one lowers the reviewer's trust in the report. Fix in `spec-model.ts` and `verdict.ts`.
3. **Tier-2 evidence lost (6)**: no cost this time, because tier 3 covered it. It would matter in a round where the UI walk is the only evidence.
4. **Known (2)** made-up `reviewedAt`: fixed.

## Re-run

A confirmation re-run from a fresh onboarding is **advisable but not urgent**. The score is perfect and the remaining defects are verdict rendering only. The re-run should check that the test-authoring.md change (3) stops the author from deriving pages or counts from the application, so that `integrity --amend` is not needed, and that items 2–4 are gone from verdict.md once they are fixed. A unit check on `spec-model.ts` / `verdict.ts` with a table-driven test title and a two-line ASSUMPTION would cover 2–3 without a full round.
