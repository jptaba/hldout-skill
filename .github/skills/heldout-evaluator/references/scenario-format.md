# Requirement review and scenario format (phase 2)

## 1. Requirement review — `evaluations/<KEY>/requirement-review.md`

Write this before any scenario, from `requirement/story.md`, **every** page it links (`requirement/linked/*.md`) and the
transcript of every image it shows, with no AUT access. It should contain:

- **Sources used**: a table of each source and what it contributes (ACs, rules, contract, copy, test data).
- **Testability decisions**: how each hard-to-test clause will be verified, for example "nothing is
  stored" becomes "a unique subject is absent from the authenticated list".
- **Ambiguities / open questions**: how each is handled (tested literally, tagged
  `@needs-clarification`, or deliberately not tested with `# OPEN-QUESTION:`).
- **Revisions**: when `jira-fetch` reports a change (`requirement/CHANGES.md`), append what changed
  and how the scenarios were updated.

## 2. Scenarios — `evaluations/<KEY>/scenarios.feature`

Gherkin user journeys: one journey per scenario, one observable action or outcome per line,
concrete data, explicit expected results. The scripts parse the conventions below, so follow them
exactly.

```gherkin
# Source: <KEY> — <story summary>
# Linked pages and images used: <file> (what it contributed), …
#
# Acceptance criteria (each AC's `text` from the contract, one line each; this list drives coverage and traceability):
# AC-1: <criterion text exactly as written>
# AC-2: …
#
# ENDPOINT: POST /api/orders — create order (public)        ← every API endpoint the requirement declares
# ENDPOINT: GET /api/orders/{id} — order detail (auth)
#
# ASSUMPTION: <what you assumed, and why>
# OPEN-QUESTION: <question the PO must answer; deliberately not tested>

@story:<KEY>
Feature: <story summary>
  As a <role>
  I want <capability>
  So that <benefit>

  Background:
    Given <state shared by every scenario>

  # from story AC-1, pricing-rules.md §Tax              ← requirement source(s) of this scenario
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:ui
  Scenario: <who does what, and the outcome>
    Given …
    When …
    Then …

  # from story AC-4, field-rules.csv
  @SCN-002 @AC-4 @priority:P1 @type:boundary @layer:api
  Scenario Outline: <boundary journey>
    When I submit a <field> of <length> characters
    Then it is <outcome>
    Examples:
      | field | length | outcome  |
      | name  | 1      | rejected |
      | name  | 2      | accepted |
```

## Tag and comment reference

| Element | Required | Meaning |
| --- | --- | --- |
| `# AC-n: …` | yes | Acceptance criteria, copied from the contract's `text` (`heldout scaffold` writes them; lint checks they match). Uncovered ACs downgrade the verdict |
| `@SCN-nnn` | yes | Unique scenario id. Outline rows become tests `SCN-nnn.1 … .n` |
| `@AC-n` | yes (≥1) | Which criteria the scenario proves |
| `@type:<t>` | yes (exactly 1) | Test type, from the taxonomy below. One per scenario; any number of scenarios may share a type |
| `# from …` | strongly recommended (lint warns) | Story section, linked page or image transcript the scenario comes from, shown in the traceability matrix |
| `@layer:ui\|api\|e2e` | recommended | Which layer the test drives |
| `@priority:P1..P3` | recommended | P1: core journey / money / security; P3: cosmetic |
| `# ENDPOINT: METHOD /path/{param}` | for API stories | The declared contract. Triage flags calls to undeclared endpoints as script defects |
| `# ASSUMPTION:` / `# OPEN-QUESTION:` / `@needs-clarification` | when needed | Surfaced in the verdict. A `@needs-clarification` scenario tests the literal reading of an open question: a confirmed failure is a question for the owner (verdict at most PASS_WITH_WARNINGS), never a defect |
| `# OBSERVATION:` | when needed | Something seen during evaluation that the story's goal implies but no AC states (e.g. "the form sends no request"). Listed in the verdict for the owner; it doesn't change the verdict. May be added after the freeze |
| `@NFR-<n>` | on a scenario that verifies one of the contract's non-functional requirements | A requirement the story states but no scenario verifies (it can't be observed in the application, for example) is listed in the verdict as not verified: at most PASS_WITH_WARNINGS. A scenario may carry only `@NFR-n` |
| `@assumes:G<n>` | on every scenario whose expected value comes from an assumed oracle gap, not from the requirement | A confirmed failure there is listed as "an assumption the application contradicts" (a question for the owner, verdict at most PASS_WITH_WARNINGS), never as a defect. Keep requirement-backed checks in separate scenarios so they still count. An assumption that only leaves something unasserted ("no status is asserted") has no expectation to tag: write `# ASSUMPTION: G<n> … (not asserted)` and tag nothing |

### Test-type taxonomy (`@type:`)

| Type | Use for | Aliases |
| --- | --- | --- |
| `functional` | the happy path does what the AC says | positive, happy |
| `negative` | invalid input, error handling, refusals | validation |
| `boundary` | values on and just outside limits (use Scenario Outline) | |
| `security` | authentication, authorisation, data exposure | auth |
| `idempotency` | the same request sent again, one after the other: retries, repeated submits, safe/idempotent methods | |
| `concurrency` | different requests at the same moment on shared state: two buyers and the last item, a double booking, simultaneous edits | race, parallel |
| `audit` | an observable record of who did what and when: a history page, an activity or audit endpoint, "last changed by" | audit-trail, history |
| `composition` | several steps or ACs chained into one flow, where one step's output is the next one's input (create → edit → delete) | workflow, chain |
| `integration` | cross-layer consistency: what the UI does is what the API returns, and back | e2e, cross-layer |
| `contract` | API schema / shape / status-code contract | schema |
| `accessibility` | accessible names, alt text, keyboard, WCAG criteria | a11y |

These are the only types. A requirement that fits none of them either has a concrete, observable outcome, and then
it is one of the types above (a message shown in red is `functional`), or it is a `nonFunctional` item the verdict
lists as not verified. A slow environment is never read as a defect: raise the config's `run` timeouts
(`testTimeoutMs`, `expectTimeoutMs`, `actionTimeoutMs`) instead.

**What a throw-away environment can't show.** It usually runs one instance of each service, with its own settings:
- A `concurrency` scenario that passes shows the rule holds on one instance (the database-level races); a race
  between replicas only shows on a multi-instance deployment. Say so in an `# ASSUMPTION:` when the requirement is
  about a scaled system.
- `security` scenarios test the application's own authentication and authorisation. Controls added by the
  platform in front of it (TLS, security headers, gateway rate limits, a WAF) are tested only when the environment
  is built with them; otherwise they are `nonFunctional` items, not verified.

## Rules

1. **Cover every AC**, and cover each with the types the requirement implies. An AC that states
   limits needs `boundary`; "requires a token" needs `security`; "retries are safe" needs
   `idempotency`; "only one", a stock, a balance or a unique name under simultaneous use needs
   `concurrency`; "every change is recorded" with a place to read it needs `audit`; ACs that hand data
   to each other (the id created in AC-1 is edited in AC-2) need one `composition` scenario; field
   labels or WCAG need `accessibility`; a schema needs `contract`. Add a type only when the
   requirement states or clearly implies it: an unstated expectation is a gap, not a scenario.
2. **Quote the requirement.** Expected texts, numbers, formulas and codes are copied verbatim from
   the story, a linked page or an image transcript. Never "improve" them: a mismatch is what the evaluation exists to find.
3. **Concrete data.** Put reusable or secret values in `test-data.json`. Use unique values
   (`unique()` in tests) on shared environments.
4. **Black-box language.** Describe what a user or client sees and does. Locators are decided later.
5. **One root cause, one failure.** Don't assert the same rule in many scenarios (for example,
   boundary rows assert "accepted", and only one scenario asserts the exact success status).
   Record that choice as an ASSUMPTION.
6. **Ambiguity:** take the most literal reading and tag it `@needs-clarification` (tested), or
   write an `# OPEN-QUESTION:` (not tested). Never ask the AUT which reading is right. Keep the tag on what the question
   decides only: what holds under **every** reading (two criteria disagree on the status for a missing record, but both
   say its message is "Not found") goes in a scenario of its own without the tag, so a failure there is a defect. When
   the readings share nothing (one says 204, the other 404 with "Not found"), that scenario asserts the answer is one of
   them: an answer that meets no reading (404 with another message) is a defect whatever the owner decides.
7. **Concurrency:** API layer. Send the competing requests together (`Promise.all`), a few at a time
   (2–5; respect the profile's `maxWorkers` and `minTestIntervalMs`), and assert the invariant the
   requirement states (exactly one succeeds, the stock never goes below zero), never an order. Repeat
   the burst a few rounds inside the test and fail on the first round that breaks the invariant, so a
   race reads as a failure, not as a flaky test.
8. **Audit:** assert the record through the UI or API that shows it (who, what, when, before/after as
   the requirement lists them). A trail kept only in server logs can't be observed: it is a
   `nonFunctional` item, not a scenario.
9. **Composition:** tag every AC the flow chains (`@AC-1 @AC-2 @AC-3`) and assert the hand-offs (the
   record created is the one edited, then gone). The single-AC scenarios keep their own checks (rule 5):
   a composition that fails while each step passes on its own is an interaction defect.

## test-data.json

```json
{ "users": { "standard": { "username": "…", "password": "${env:AUT_PASSWORD}" } } }
```

Loaded by the `data` fixture, with `${env:NAME}` resolved from `.env`. Expected *outcomes* belong
in the spec's `@req-constants` block, not here: test data is plumbing, expected values are the oracle.

## Preconditions and entry points

- Put every precondition in a **Given**: where the journey starts ("Given I am on the Checkboxes
  page") and what data or state exists ("Given I created a valid booking", "Given I am not signed in").
- **Start where the AC starts.** Deep-link to the page the AC names. Start from the base URL only
  when navigation is part of the requirement. See [data-and-journeys.md](data-and-journeys.md).
- Data preconditions are **seeded** by the test (API first). Declare plumbing-only endpoints used for
  seeding or cleanup as `# SEED-ENDPOINT: METHOD /path — why`. They are not part of the requirement's contract.
