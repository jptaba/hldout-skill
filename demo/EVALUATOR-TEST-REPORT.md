# Held-out evaluator — test report

**Date:** 2026-09-27 · **Subject under test:** the `heldout-evaluator` skill (scripts, fixtures, contract gates, triage, verdict rules)
**Method:** nine new stories across three AUTs, three per AUT, each mixing UI and API. A separate author agent wrote
each story and its machine-readable answer key, probing the live AUT, before any evaluation. The requirement contract
was built by the `heldout-contract-extractor` subagent and checked by a fresh `heldout-contract-reviewer`. A **blind
evaluator** then ran the skill end to end: a fresh general-purpose agent that saw only the skill and the story, never
the answer key or another evaluation. Scores come from `npx tsx demo/score.ts` → [SCORECARD.md](SCORECARD.md).
112 unit and integration tests cover the skill itself (`npm run test:skill`).

> The evaluations, run folders and robustness notes of the rounds below were made by earlier versions of the skill.
> They are kept in the repository history under the tag `blind-round-evaluations` (`git checkout blind-round-evaluations
> -- evaluations demo/robustness`). The `evaluations/` folder now holds samples made with the current skill.

## 1. Blind evaluation results

| Story | AUT | What it tests | Expected | Actual | Defects found | False positives | Tests (passed/total) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AE-1 | Automation Exercise (UI + form API) | product search API + UI; a status the story words loosely | PASS_WITH_WARNINGS | ✅ PASS_WITH_WARNINGS | — | 0 | 19/20 |
| AE-2 | Automation Exercise | account API (always HTTP 200, code in the body) + shop sign-in | FAIL | ✅ FAIL | 3/3 | 0 | 32/38 |
| AE-3 | Automation Exercise | brands API ↔ sidebar, Contact Us form from an image mock-up | PASS | ❌ PASS_WITH_WARNINGS | — | 0 | 16/16 |
| PB-1 | ParaBank (UI + REST, Cloudflare) | registration, sign-in, customer REST | FAIL ¹ | ✅ FAIL | 1/1 | 0 | 13/14 |
| PB-2 | ParaBank | open account: page + service + rules in a CSV attachment | FAIL | ✅ FAIL | 2/2 | 1 ² | 9/13 |
| PB-3 | ParaBank | transfers; a PO comment replaces one AC | FAIL | ✅ FAIL | 2/2 | 0 | 6/12 |
| DQ-1 | DemoQA (React UI + JSON API) | account/token API; a PO comment changes a status; JWT leak | FAIL | ✅ FAIL | 2/2 | 0 | 24/27 |
| DQ-2 | DemoQA | Book Store catalogue, collection API, profile UI, 401 matrix | PASS | ✅ PASS | — | 0 | 28/28 |
| DQ-3 | DemoQA | Links page: new-tab links, status links, a PO path correction | FAIL | ✅ FAIL | 2/2 | 0 | 24/32 |
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
| R1 | Tampering: expected value aligned with the AUT; matcher weakened inline; failing test skipped | ✅ integrity VIOLATED → INCONCLUSIVE; skip blocked by lint. |
| R3 | Malformed evaluation (11 injected traceability errors) | ✅ all rejected by lint. |
| R5 | API pre-step failure (wrong credentials) | ✅ BLOCKED / NEEDS_INVESTIGATION, no false defects. |
| R7 | Contract gates: paraphrased AC, invented endpoint or quote, oracle read off the AUT, oracle changed after the freeze, attachment changed | ✅ all rejected. |
| — | Jira Cloud adapter against a fake Jira REST server | ✅ `tests/jira-cloud.test.ts` |
| — | Real rate-limiting WAF (Cloudflare 1015 on ParaBank), AUT restart (502), database reset | ✅ handled as ENVIRONMENT after fix #8; no false defects |

## 5. Onboarding, end to end, until smooth

After the blind round, the whole journey was repeated from an empty folder twenty-four times, on six applications. Each
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
| 15 | DQ-2 (DemoQA, from the published repository) | **existing accounts only** (user creation forbidden by the story): 2 with passwords in `.env`, 2 entirely in a real HashiCorp Vault; the user's id found in the login page's own API call; a reset that empties each shared account before and after every test; a skill update mid-round; then the whole story again from a fresh onboarding | ✅ PASS, 21/21 (as the key), no password in any artifact; again from a fresh onboarding (15b): PASS 21/21, the tests and runs needed no fix | 12 + 5 wording (all fixed) |
| 16 | CL-3 (Contact List, from the published repository), then twice more from a fresh onboarding | tests create and delete their own users; a UI sign-in saved and checked live; a native confirm on a page that loads its record after opening; two review → fix → re-review loops | ✅ PASS, 20/20 (as the key), in all three runs; the third needed no fix to the tests or the run | 22 over the three runs (10, 6, 6; all fixed) |
| 17 | TOOL-4 (Toolshop, from the published repository), then again from a fresh onboarding | ACs in a custom field and a PO comment that changes a status; API on its own host; users the app won't let tests delete, now named `hldout-…`; a DELETE in the probe chain answered 403 | ✅ PASS, 11/11 (as the key), in both runs; the second needed no fix to the tests or the run | 16 over the two runs (10, 6; all fixed) |
| 18 | JS-2 (OWASP Juice Shop in Docker, from the published repository), then again from a fresh onboarding | the FAIL path; a localhost app with a hash-route address; overlays found by `init`; a security question fetched before sign-up; a deliberately short password as the evidence | ✅ FAIL, 2/2 defects (as the key), in both runs; the second needed no fix to the tests or the run | 13 over the two runs (10, 3; all fixed) |
| 19 | PB-4 (ParaBank, shared demo) | a page address as the base URL; users made on the sign-up page; a Cloudflare rate limit; the demo's data access mode changed by someone else; an unobservable "shall" (NFR) | ⏸ INCONCLUSIVE: 4 failures confirmed as the environment (key: PASS WITH WARNINGS on a healthy demo); re-run pending | 7 (all fixed) |

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
- **Round 15 (DQ-2 with existing accounts only) made shared accounts safe.** The accounts recipe takes a `reset`
  (`heldout accounts --reset 'DELETE /BookStore/v1/Books?UserId=${id}'`): it runs when a test takes an existing account and
  again after it, so what one test (or a crashed run) leaves never reaches the next; the run prints how often accounts
  were taken and reset, instead of calling them "created, kept by design". The inspector lists the API calls the page
  made (method, path, status, answer shape; no values): that is how the user id was found (the login page's
  `POST /Account/v1/Login`), and a secret-scrub now guards its report. A UI sign-in whose user name and password both
  come from Vault is saved correctly (the user name had become the password). `--add-existing` checks only the account
  it added; `doctor` no longer says existing accounts "sign in" before a sign-in is saved; the scaffolded spec says
  existing accounts are shared, not deleted; re-running `init` to update the skill ends with `doctor`, not the
  onboarding list; a clean hardening run says what to record next; the contract's pass line says what "grounded" checked.
- **Round 16 (CL-3, run three times from a fresh onboarding) closed a review loophole.** Changing the `auth` a stated
  endpoint requires did not change the contract's hash, so a review stayed valid after it (found on the second run,
  when the builder fixed exactly that). The hash now covers each stated endpoint's auth and success and the stated auth
  scheme. The reference now settles what builders and reviewers disagreed on: a blanket "all endpoints require a token"
  line covers its own document's endpoints; an AC that states its outcome ("`null`") is judged as written even when
  another line is looser; sign-up and sign-in calls are not listed on ACs; a cleanup-only gap is not required. The
  CLI's `--pack` names the builder's own check, one recorded gap prints one line of what is left, the rendered contract
  no longer says "reviewed" before the review, and the reviewer's instructions tell an accepted review from its
  findings. The test guide says to wait for a page's record, not only its address (a flaky "the confirm never
  appeared" on the first run).
- **Confirmation runs.** After a round's fixes, the same story is run again from a fresh onboarding with the pushed
  skill. Round 15b (DQ-2, existing accounts in `.env` and Vault) and round 16c (CL-3) ran clean: no fix to the tests or
  to a run. What they still found was wording, fixed: `init` names the app root without an example path that may be the
  page given, `doctor` and `--add-existing` say what is known before a sign-in is saved, and the reference says what a
  "(public)" tag, an envelope-plus-table error body and an existing user's id mean for the contract.
- **Round 17 (TOOL-4, twice) gave test data one recognisable prefix.** Every name the tests make starts with the AUT
  profile's data prefix, `hldout` by default: users `hldout-…@example.com`, records `hldout …` (`unique()`), seed tags.
  Leftovers from interrupted runs, and users an application won't let tests delete, are easy to find and sweep. An
  application whose rules need another prefix (letters only, a length limit) gets one with
  `npm run heldout -- init --profile <id> --data-prefix <prefix>`; `init` says which prefix applies, and a sign-up that
  rejects the name says how to change it. A DELETE in a probe chain without a 2xx `expect` (a probe of whether deleting
  is allowed) no longer becomes the recipe's delete, and a delete saved earlier goes when the chain has none; before, the
  live check made a user and left it behind. The inspector's list of the page's own API calls leaves out CDN beacons and
  static files and shows the host of an API on its own host.
- **Round 18 (JS-2 on Juice Shop, twice; the FAIL path) made evidence faithful and overlays automatic.** `init` now finds
  the buttons that close what covers the start page (Juice Shop's cookie message and welcome banner) and saves them as
  the profile's overlays. One overlay's button covered by another (the welcome dialog over the cookie banner) is
  clicked by dispatching the click, where the sign-in check and the inspector had timed out. The literal values a probe
  or a test sends stay readable: the verdict's reproduction of "a 4-character password is accepted" had shown the
  password as a secret placeholder, so a reviewer would have replayed it with the real, long password and seen no
  defect. Real secrets are still redacted and scrubbed from every artifact. After a re-run, triage points to
  `--carry-from auto` when an earlier run confirmed the same failures. The contract reference now says where sign-up
  and sign-in belong when they are what an AC is about, that "rejected", "refused" or "fails" is judged as written
  with a non-required gap for the exact status, and that a source limiting what is tested rules out derived boundaries.
- **Cleanup after round 18.** The repository keeps only what a new team needs: the skill, four complete sample
  evaluations made with the current skill (DQ-2, CL-3, TOOL-4, JS-2), the stories and answer keys to try, and this
  report; the earlier evaluations are under the tag `blind-round-evaluations`. Run artifacts now name files relative to
  the project, not by the machine's folders. `heldout status` judges a verdict stale by the run it judged, not by file
  times (after a clone every committed verdict looked stale). The tests' fixtures take secret redaction and the page
  helpers (locator expressions, overlays) from the installed skill instead of keeping copies that drifted apart.
- **Round 19 (PB-4 on ParaBank) met a shared demo someone had reconfigured.** The first run was rate-limited by
  Cloudflare ("Error 1015"), which reached the tests only as timeouts; `heldout run` now also reads the failed tests'
  page snapshots and prints the pacing command, and triage's advice names that command. Paced, four criteria still
  failed the same way: a payment made on the Bill Pay page said "Bill Payment Complete" but was never recorded, while
  the same payment through the REST service was. The demo's admin page showed why: its data access mode had been set
  to SOAP (the default is JDBC). Triage suggested APPLICATION_DEFECT; the evaluator confirmed ENVIRONMENT_ISSUE with
  the admin page as evidence, and the verdict is INCONCLUSIVE, now saying that the environment caused it and to run
  again once it is fixed. The triage guide says to check a shared sandbox's own settings before confirming a defect,
  and never to change them. The contract check now grounds endpoint paths under a base the story states as a bare
  path (`/parabank/services/bank`, relative to the API origin), and reads ids such as AC-6 in an outcome as references.
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
