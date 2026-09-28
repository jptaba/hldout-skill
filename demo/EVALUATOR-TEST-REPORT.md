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

## 5. Onboarding, end to end, until smooth

After the blind round, the whole journey was repeated from an empty folder fourteen times, on six applications. Each
round installed the skill the way a team would, from a git repository with no GitHub-specific steps. It then went
through `init`, `doctor`, the story, contract, review, scenarios, tests, freeze, hardening, the run, triage, the
verdict and publishing. Every hiccup was fixed in the skill before the next round.

| Round | Story (AUT) | Path exercised | Result | Skill hiccups found |
| --- | --- | --- | --- | --- |
| 1 | DQ-2 (DemoQA) | first onboarding, accounts created by the tests | ✅ PASS, 21/21 | 12 |
| 2 | DQ-2 (DemoQA) | install from a git clone, skill update, accounts recipe | ✅ 21/21 (PASS WITH WARNINGS: one open question touching two ACs) | 9 |
| 3 | AE-1 (Automation Exercise) | second application, ad-heavy, PO comment, `@needs-clarification` | ✅ PASS WITH WARNINGS (as the key) | 8 |
| 4 | DQ-3 (DemoQA) | the FAIL path: defects, audited amendments, grouped confirmation | ✅ FAIL, 2/2 defects (as the key) | 2 bugs, 2 wording |
| 5 | AE-3 (Automation Exercise) | an image mock-up transcribed into the contract, review → fix → re-review | ✅ 14/14 (PASS WITH WARNINGS: invalid-e-mail question) | 1 hint |
| 6 | DQ-2 (DemoQA) | **existing accounts**: 2 with passwords in `.env`, 2 entirely in a real HashiCorp Vault (KV v2); `vault login` token, `VAULT_TOKEN` and AppRole | ✅ 21/21, no password in any artifact | 4 (all fixed) |
| 7 | CL-3 (Contact List, new app) | tests create their own users and delete them; UI sign-in saved on its own and checked in a browser; a mock-up transcribed | ✅ PASS, 20/20 (as the key) | 6 (all fixed) |
| 8 | TOOL-4 (Toolshop, new app) | API on a separate host; users created with no delete permission (kept, tagged); two accounts in one test; favourites cleaned up | ✅ PASS, 11/11 (as the key) | 5 (all fixed) |
| 9 | JS-2 (OWASP Juice Shop in Docker, new app) | a localhost app; sign-up needing a lookup first; users kept by design; two users in one test; cookie and welcome overlays; the FAIL path with a security defect | ✅ FAIL, 2/2 defects (as the key) | 9 (all fixed) |
| 10 | PB-4 (ParaBank, rate-limited shared demo) | users only on the sign-up page (no API); a page address pasted as the base URL; a 429 mid-run; an unverifiable "shall" | ✅ PASS WITH WARNINGS, 11/11 (as the key) | 8 (all fixed) |
| 11 | DQ-2 (DemoQA, from the published repository) | a page address pasted as the base URL; a strict password policy; UI sign-in and the token it revokes; a two-reviewer contract loop | ✅ PASS, 21/21 (as the key) | 7 (all fixed) |
| 12 | AE-1 (Automation Exercise, from the published repository) | an ad script mistaken for the API; a product page as the base URL; a PO comment replacing an AC; an open question tested literally | ✅ PASS WITH WARNINGS, 13/14 (as the key: the open question) | 3 (all fixed) |
| 13 | DQ-3 (DemoQA, from the published repository) | the FAIL path: a redirect without Location, a misspelled message; a PO path correction; new tabs and page-issued requests | ✅ FAIL, 2/2 defects (as the key) | 3 (all fixed) |
| 14 | AE-3 (Automation Exercise, from the published repository) | an image mock-up transcribed and reviewed; native confirm dialogs; three non-required open questions; two audited amendments | ✅ PASS, 15/15 (as the key) | 4 (all fixed) |

**What changed for the people using it:**
- **Install and update from any git host.** A sparse clone fetches only the skill (about 2 MB, a few seconds). `init`
  copies the skill into the project. Running it again after a pull updates the skill and refreshes the template copies
  the project hasn't changed. `doctor` shows the installed version and the exact update command. `--ci` writes a
  GitLab CI job (GitHub Actions for a GitHub remote).
- **The app profile fills itself in.** `init` visits the app once and records its id (from the host) and its name (from
  the page title). It also finds the test-id attribute, including on pages linked from the navigation, and blocks the
  ad and analytics networks the pages load.
- **Test users need no code.** The AUT profile's accounts recipe covers creating, signing in and deleting a user, and
  signing in through the UI. It's written once, from the API probe already made while hardening
  (`heldout accounts --from-chain`), and checked live by `doctor`. After that, `seed.account()` and `signIn()` work in
  every story on that app. `heldout secret NAME --generate` writes a strong test password to `.env` without showing it.
- **Test accounts from wherever they already live.** When the app can't (or you may not) create users, existing
  accounts are added once with `heldout accounts --add-existing`. User names can be literal or come from `.env` or Vault.
  Passwords come from `.env`, CI variables or Vault (`${vault:path#field}`), and a literal password is refused.
  Accounts are shared out among parallel workers and never deleted, and runs cap the workers to fit (`--per-test`).
  Vault is reached with the `vault login` token, `VAULT_TOKEN` or AppRole, read once per run, and never written to disk.
  `heldout secret NAME --ask` takes a password at a hidden prompt. Apps that let tests create users but not delete
  them are supported too, and `doctor` never leaves a check account behind on them.
- **Seeding and teardown say what happened.** Every run ends with one line: how much test data was created, cleaned
  up, already gone, kept by design (such as accounts on an app that forbids deleting them) or left behind, with advice
  for each kind of cleanup error. A cleanup answered 404 or 410 counts as already gone. Seed calls ask for fresh answers
  and retry once on 502, 503 and 504.
- **Separate API hosts are found at onboarding.** `init` watches the requests the web app makes and records the API
  host when it differs from the web host (Toolshop). `doctor` warns when the configured API host disagrees.
- **Round 9 (Juice Shop) made test users and pages work for more apps.** A recipe can run `before` calls (a CSRF
  token, a security-question id) and keeps number types. Tests read other sign-in values from `me.signInBody`. The
  profile's `overlays` close cookie and welcome dialogs whenever they appear. A `localhost` app gets its profile id from
  its title. Hash routes survive Git Bash. Confirmed decisions now carry over when the failing value is a per-run id,
  so CI keeps recognising a known defect.
- **Round 10 (ParaBank) covered apps without a sign-up API and stated requirements nobody can check.** Test users can
  be made on the app's sign-up page (`signUp`, with an id `lookup`). A page address such as `…/index.htm` becomes its
  folder. The inspector prefers stable `name` attributes and flags generated ids. A 429 is waited out on every page, and
  the run prints the pacing command. A non-functional requirement no scenario verifies is listed and keeps the verdict at
  PASS WITH WARNINGS. The verdict always takes the latest evaluation run, triaging it itself when everything passed.
- **Round 11 (DQ-2 again, from the published repository) tightened onboarding.** A pasted page address such as
  `…/books` becomes the app's root, and discovery still visits that page (its ads, its test ids); `doctor` warns about a
  base URL that is a page. Generated test passwords always include one of `! @ *`, which strict password rules require,
  and a rejected password says how to regenerate it. An API chain no longer sends `${id}` literally after a failed
  step. The inspector lists read-only text that has a stable id. The contract check says how much it checked.
- **Round 12 (AE-1) made discovery robust on ad-heavy sites.** An ad script's JSON calls were taken for the app's API:
  only a host on the app's own site is suggested now. A page address is traced to the app root through the page's own
  links first (`/products` → `/`, `/parabank/billpay.htm` → `/parabank/`). The verdict no longer counts one scenario twice.
- **Round 13 (DQ-3, the FAIL path) sharpened evidence.** An API chain shows a redirect's `Location` (or its absence) on
  every 3xx, and `show` reads any header as `header:<name>`. The contract check's pass line counts coverage entries, not
  lines, and the reference says where intended 4xx answers belong.
- **Round 14 (AE-3) aligned the verdict with its answer key.** An open question about a gap the review marked "not
  required" is listed for the owner and no longer lowers a PASS (AE-3 now PASS, as the key; round 5 gave warnings). The
  inspector answers browser dialogs (`{"do": "dialog", "value": "accept"}`) and lists every dialog it saw. The test guide
  warns that "not shown" is `toBeHidden()`: two assertions that counted a hidden banner were fixed by audited amendments.
- **Every step says what comes next.** This includes `new` → `fetch`, a missing secret, transcribing a mock-up with its
  exact file name, and questions for the owner.
- **Less to write by hand.** `scaffold` pre-fills the requirement review and the hardening log, and imports
  `expectResponse` for API checks. `triage --set SCN-007` confirms every failing row of an outline with one decision.
- **Quieter, faster runs.** Inside an agent session (Claude Code on its own, GitHub Copilot with `--quiet`), a run prints a digest (one line per failing test) and keeps the full
  output in the run folder. Cleanup reuses tokens (DQ-2: 88 s → 67 s). Dropped connections on preconditions are
  retried.

**Integrity and correctness bugs found by these rounds (fixed, with tests):**
- **Assertions the integrity freeze never saw.** `[REQ]` messages containing a different kind of quote
  (`` `[REQ AC-7] "${link}" …` ``) were never frozen. Neither were assertions inside a spec's own helper. The freeze now
  reads both kinds of quote, `expectResponse()` is frozen, and lint flags messages built from a variable. A re-check of
  every evaluation found no hidden changes.
- **Other freeze and lint gaps.** Integrity blocked adding a timeout to a matcher, and a draft that didn't compile
  could be frozen. Lint now type-checks the story's specs, and freezing refuses a draft that doesn't compile.
- **A cleanup that answered 401 was recorded as done.** Leftover data went unreported.
- **Verdict and triage rules:**
  - A confirmed failure of a `@needs-clarification` scenario is now a question for the owner, not a defect.
  - Triage had cited the wrong API call for a precondition that got no answer.
- **CI.** The CI template's verdict step was rejected by the command dispatcher (`--exit-code`); a test now checks
  every documented flag.
- **Secrets.** Two test passwords were found in pushed files: a unit-test fixture and an answer key. Both are replaced,
  and `doctor` now fails when any `.env` secret value is in a file git would commit.

## 6. Limitations and honest caveats

1. **Same model family throughout.** The authors, contract builders, reviewers and evaluators were separate agents,
   and the evaluators never saw the answer keys. All of them were the same model (Opus), though, so shared blind spots are possible.
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
   - API-only tests still start a browser;
   - there is no pattern for apps whose data can only be seeded through the UI.

## 7. Recommended next steps

1. Run the remaining authored stories (PB-4, JS-1, JS-2) blind, to widen the sample.
2. Exercise the interactive path: answer oracle gaps with `AskUserQuestion` in a live session.
3. Point the skill at an AUT you own, with a dedicated environment and a seeding/reset API. That removes the
   sandbox noise that cost the most time here.
4. The two leaked test passwords are still in the git history of the public repository: change them, and rewrite the
   history before the move to the internal GitLab if the old commits go with it.
