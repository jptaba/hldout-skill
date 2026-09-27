# Requirement review and scenario format (phase 2)

## 1. Requirement review — `evaluations/<KEY>/requirement-review.md`

Write this before any scenario, from `requirement/story.md` and **every** attachment (images and
PDFs via the Read tool), with no AUT access. It should contain:

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
# Attachments used: <file> (what it contributed), …
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
| `@type:<t>` | yes (exactly 1) | Test type, from the taxonomy below |
| `# from …` | strongly recommended (lint warns) | Story section / attachment the scenario comes from, shown in the traceability matrix |
| `@layer:ui\|api\|e2e` | recommended | Which layer the test drives |
| `@priority:P1..P3` | recommended | P1: core journey / money / security; P3: cosmetic |
| `# ENDPOINT: METHOD /path/{param}` | for API stories | The declared contract. Triage flags calls to undeclared endpoints as script defects |
| `# ASSUMPTION:` / `# OPEN-QUESTION:` / `@needs-clarification` | when needed | Surfaced in the verdict. A `@needs-clarification` scenario tests the literal reading of an open question: a confirmed failure is a question for the owner (verdict at most PASS_WITH_WARNINGS), never a defect |
| `# OBSERVATION:` | when needed | Something seen during evaluation that the story's goal implies but no AC states (e.g. "the form sends no request"). Listed in the verdict for the owner; it doesn't change the verdict. May be added after the freeze |
| `@assumes:G<n>` | on every scenario whose expected value comes from an assumed oracle gap, not from the requirement | A confirmed failure there is listed as "an assumption the application contradicts" (a question for the owner, verdict at most PASS_WITH_WARNINGS), never as a defect. Keep requirement-backed checks in separate scenarios so they still count. An assumption that only leaves something unasserted ("no status is asserted") has no expectation to tag: write `# ASSUMPTION: G<n> … (not asserted)` and tag nothing |

### Test-type taxonomy (`@type:`)

| Type | Use for | Aliases |
| --- | --- | --- |
| `functional` | the happy path does what the AC says | positive, happy |
| `negative` | invalid input, error handling, refusals | validation |
| `boundary` | values on and just outside limits (use Scenario Outline) | |
| `security` | authentication, authorisation, data exposure | auth |
| `idempotency` | retries, repeated submits, safe/idempotent methods | |
| `performance` | response-time / throughput limits stated in the requirement | perf |
| `accessibility` | accessible names, alt text, keyboard, WCAG criteria | a11y |
| `integration` | cross-layer journeys (UI ↔ API ↔ data) | e2e, cross-layer |
| `contract` | API schema / shape / status-code contract | schema |
| `usability`, `compatibility`, `resilience` | when the requirement states them | |

## Rules

1. **Cover every AC**, and cover each with the types the requirement implies. An AC that states
   limits needs `boundary`; "requires a token" needs `security`; "retries are safe" needs
   `idempotency`; field labels or WCAG need `accessibility`; a schema needs `contract`.
2. **Quote the requirement.** Expected texts, numbers, formulas and codes are copied verbatim from
   the story or attachment. Never "improve" them: a mismatch is what the evaluation exists to find.
3. **Concrete data.** Put reusable or secret values in `test-data.json`. Use unique values
   (`unique()` in tests) on shared environments.
4. **Black-box language.** Describe what a user or client sees and does. Locators are decided later.
5. **One root cause, one failure.** Don't assert the same rule in many scenarios (for example,
   boundary rows assert "accepted", and only one scenario asserts the exact success status).
   Record that choice as an ASSUMPTION.
6. **Ambiguity:** take the most literal reading and tag it `@needs-clarification` (tested), or
   write an `# OPEN-QUESTION:` (not tested). Never ask the AUT which reading is right.

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
