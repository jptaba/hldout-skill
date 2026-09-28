# Requirement contract (phase 1b)

Stories come in any shape:

- an acceptance-criteria custom field, or bullets in the description
- Given/When/Then
- a table
- prose ("the system shall…")
- rules in a CSV, an API in a spec attachment
- a mock-up image
- clarifications in comments

**The model reads them; no parser does.** Everything after intake works from one shape,
`evaluations/<KEY>/requirement-contract.json`. Scripts only check, mechanically, that what the model wrote is
grounded in the sources:

| Guard | Catches | How (no language understanding needed) |
| --- | --- | --- |
| Anchoring | invented or paraphrased criteria | each AC's `quote` must appear verbatim at its cited lines |
| Coverage ledger | omissions | every ● line of the evidence pack must be in `coverage`, captured or dismissed with a reason |
| Literal grounding | invented facts | every status code, number, quoted message and path in the expected behaviour must appear in the sources, or in a gap answered by the requirement, config, user or an explicit assumption. One step outside a stated boundary is allowed (1–99 grounds 0 and 100). A path under a base URL the sources state is grounded by that URL plus the relative path (`https://host/api` and `/login` ground `/api/login`). A literal found only in what was discovered from the app is rejected |
| Independent review | misreadings, subtle omissions | a fresh subagent (`heldout-contract-reviewer`) checks every item against the evidence pack and writes a verdict, bound to the hash of what the story requires (criteria, rules, error model, oracle gaps, stated endpoints, coverage). Any edit to those makes the review stale; completing mechanics does not |

## Procedure

```bash
heldout contract KEY --pack               # evidence pack (numbered lines) + empty contract bound to this revision
# → build: heldout-contract-extractor subagent (or yourself, following this page)
heldout contract KEY --allow-unreviewed   # anchoring + coverage + literals; the builder fixes until there is no ✖
# → review: heldout-contract-reviewer subagent, fresh context → requirement-contract.review.json
heldout contract KEY                      # clean, including the review
```

Delegate the two steps to subagents: the builder and the reviewer must not share context. In Claude Code:

- Agent tool, `subagent_type: "heldout-contract-extractor"`, prompt "Build the requirement contract for KEY".
- Then `subagent_type: "heldout-contract-reviewer"`, prompt "Review the requirement contract for KEY".

In other agent apps (GitHub Copilot…), run each as its own custom agent or a fresh chat with the same prompt and the
instructions in `.claude/agents/heldout-contract-extractor.md` / `heldout-contract-reviewer.md`.

If the reviewer reports findings, send them back to the builder ("Fix the requirement contract for KEY: <findings>"),
re-run the checks and review again. Stop after 3 rounds and surface what is still disputed as open questions.
`--review-prompt` refuses a contract that still fails the mechanical checks, so an unfinished contract can't be reviewed.

The builder works from the evidence pack only. It does not probe the application: HOW to exercise it (routes,
labels, request fields, an endpoint the story doesn't name) is recorded as an open **mechanics** gap and discovered
during hardening, where the evaluator records it as `discovered-in-aut` with evidence, with no re-review. WHAT is
correct is never discovered: open **oracle** gaps are the questions for the user (`heldout contract KEY` lists both).
The dividing line: where to find something (a response field's name, a locator, a route) is mechanics; the value it
must have (a status, a message, a count, whether an error is an HTTP status or a code in the body) is oracle. When the
sources themselves disagree (a comment corrects the story's path or status), that is an oracle gap resolved
`found-in-requirement` by the later, explicit statement.

Non-text attachments (images, PDFs, office files): open them with the Read tool and transcribe what they say into
`requirement/transcripts/<file>.md`. The first line is `transcribedFrom: attachments/<file>`, followed by a faithful
transcription only. Re-run `--pack` and cite the transcript. The reviewer compares transcript and original.

## Contract shape

`--pack` writes the skeleton (`key`, `title`, `revision`: keep them as they are). Everything else:

| Field | Shape and rule |
| --- | --- |
| `sourcesRead[]` | `{ "file", "read": true, "contributes"? }`. Set `read: true` for each file once you have read it (images and PDFs through their transcript). List the attachment itself, not its transcript; name the transcript in `contributes` |
| `acceptanceCriteria[]` | `{ "id", "quote", "source", "text", "layer", "outcomes", "endpoints"?, "entryPoint"?, "needsData"?, "gaps"? }` |
| · `id` | The story's own numbering if it has one (AC-3 stays AC-3; "NFR-1 (AC-15)" is AC-15). Otherwise AC-1… in source order. One criterion per requirement statement; a sentence with two conditions stays one AC with two outcomes |
| · `quote` | **Verbatim** from the source. The normaliser ignores case, markdown emphasis, quote styles, dashes and whitespace, nothing else. For a Gherkin scenario, quote the whole block |
| · `source` | `story.md#L23` (first line of the quote), `attachments/x.csv#L4` or `transcripts/mockup.png.md#L3` |
| · `text` | The statement used in `scenarios.feature`. Normally the quote itself, cleaned of markdown |
| · `outcomes` | Observable pass/fail facts, **worded with the source's literals** (the status, the message in quotes, the number). No outcome the source doesn't state; a derived boundary only one step outside a stated range. "Without a valid token" covers both a missing and an invalid token: an outcome for each |
| · `layer` | `ui` (web app only), `api` (API only), `e2e` (both, or a UI action checked through the API; a story's "UI + API" is `e2e`, not a misread). An AC with no stated layer takes the one its wording names: an API call → `api`, a page → `ui`, both → `e2e`; naming neither, the layer of the expected value that settles it (a status code from a clarification → `api`) |
| · `endpoints` | `"METHOD /path"` keys of every endpoint the AC's journey calls, including pre-steps (creating the record it acts on); each must be in `endpoints[]`. Signing up and signing in are not listed on an AC: the profile's accounts recipe makes those calls for every test (they are in `endpoints[]` when a source states them). `seed.account()` gives each test a user with its API token and id, created or taken from the existing accounts; how the recipe gets them is completed during hardening, so what no source or config says yet (e.g. where an existing user's id comes from) is a mechanics gap. Needed for api/e2e ACs, unless a mechanics gap in `gaps` stands for the missing one |
| · `entryPoint`, `needsData` | Where a UI journey starts; `needsData`: the AC needs data the tests must create first (→ seeding), before the action the AC is about. A record that is only the target of a request the AC expects to be rejected (deleting a favourite without a token) is data too. An AC whose own action creates the data ("adding a book returns 201") doesn't need it, and neither does one whose only precondition is a signed-in user (`seed.account()` provides users). Read-only data that already exists (a catalogue) is not seeded: list it in `testData.constraints` |
| · `gaps` | Ids of the gaps that affect this AC |
| `endpoints[]` | `{ "method", "path", "source", "auth"?: "required" \| "optional" \| "none", "success"?, "envelope"?, "requestFields"?, "request"? }`. `source` is the cited line (a heading that names the endpoint is fine), or the id of the mechanics gap that discovered it; the ● lines under that heading are still accounted for in the coverage ledger (as `endpoint`). `success` is free text: the success status and, when stated, the body, e.g. `"201 {books:[{isbn}]}"`. An endpoint whose purpose is to answer a 4xx (a diagnostic endpoint) has it in `success`; a request the requirement rejects (a wrong method, a missing parameter) is an `errorModel` case, whatever its HTTP status. `endpoints` on a `ui` AC are welcome when its journey makes the calls, including one that reads the expected values ("as in the catalogue") (setup calls, such as creating the record the journey opens, stay in `endpoints[]` only). Set `auth` only when a source states it (a blanket line such as "All endpoints require a Bearer token" states it for the endpoints of the source that says it, the ones that document describes; an endpoint named only elsewhere gets `auth` when its own source states it, and is left unset otherwise; a tag such as "(public)" states `"none"`; cite the line); unstated protection is left out (and, if a test depends on it, a mechanics gap), never `"none"` by default. `envelope` (the wrapper key of the **request** body: `{"article": {…}}` → `"article"`) and `requestFields` (`["product_id", "quantity"]`) let triage tell a malformed test request from an application defect; `request` is free text for people. `path` is the path alone: query parameters go in `request` (`GET /BookStore/v1/Book` with `request: "?ISBN=<isbn>"`). List every stated endpoint the tests will call, including ones used only to set up or clean up (a stated "delete all" that keeps shared accounts clean); one the story forbids the tests to use goes in `outOfScope` |
| `rules[]` | `{ "id": "R1", "text", "source" }` (`source` may cite several places: `story.md#L34, story.md#L27-L28`): business rules, boundaries and validation tables the sources state |
| `errorModel[]` | `{ "id": "E1", "case", "status"?, "body"?, "source" }`: each error case the sources state. `status` is a number (`400`). `body` is the message, or the whole body as the sources give it (`{"error": "Invalid credentials"}`), which may be an envelope line and a table row together (`{"code": "1200", "message": "User not authorized!"}`) |
| `auth` | `{ "mechanism", "credentials"?, "source" }`. Required when an endpoint has `auth: "required"` |
| `testData` | `{ "strategy", "constraints"? (list of strings), "cleanup"?, "source"? }`: how the evaluation gets its data ("tests register their own customer via POST /users/register", "none stated: the criteria only read the catalogue"). State only what the sources or the project say; when they say nothing about data, write "not stated in the sources" (the evaluator decides the seeding). Data the sources only imply (products to add to favourites) is not a constraint: how a test finds or makes it is a mechanics gap |
| `actors` (list of strings), `context` (string), `nonFunctional[]` (`{ id, text, source }`), `outOfScope[]` (list of strings) | Optional; only what the sources say. A statement that some behaviour may stay as it is ("the web shop can keep its current message") sets no expected value: quote it in `outOfScope`, never read the value off the application |
| `gaps[]` | `{ "id": "G1", "element", "kind": "mechanics" \| "oracle", "required", "affects": ["AC-2"] or ["*"], "tried": [{ "where": "story" \| "attachments" \| "aut" \| "config" \| "user", "result" }], "resolution", "value"?, "evidence"? }`. `resolution` is `found-in-requirement`, `found-in-config`, `discovered-in-aut` (mechanics only), `provided-by-user`, `assumed` or `open`. Omit `value` while open. `required` means the affected ACs can't be evaluated without it; a gap that only concerns cleanup (how a test removes what it made) is not required. An AC that states the outcome itself ("returns `null`") is judged as written, even when another source is looser ("absent or null"): that difference is a question for the owner, not required. For UI mechanics, one gap per page (its route and how its elements are found) is the right size |
| `coverage[]` | `{ "lines": "story.md#L20-L22", "as", "note"? }`. `as` holds one or more refs, separated by commas: item ids (`AC-1`, `R2`, `E1`, `G3`, `NFR-1`) or the kinds `endpoint`, `error-model`, `auth`, `test-data`, `context`, `out-of-scope`, `non-functional`, `example`, `duplicate`, `not-a-requirement` (needs a note saying why). Every ● line must be covered, and every AC referenced by some entry |

## Gaps: find, then ask. Never read expected behaviour off the app

Walk the ladder in order and log each step in `tried[]`:

1. **The requirement**: story, comments, attachments. → `found-in-requirement`, evidence = where.
2. **The app, for mechanics only** (during hardening): paths, routes, labels, header scheme, request fields, and
   published API docs (`/swagger.json`, `/openapi.json`, `/docs`). → `discovered-in-aut`, evidence = the probe output.
3. **Project config**, e.g. the AUT profile. → `found-in-config`.
4. **The user, for oracle gaps**: one `AskUserQuestion` call with at most 4 questions, required first.
   → `provided-by-user`, value plus who and when: `heldout contract KEY --answer G<n> --value "…" --by "<who>"`,
   then a fresh review (the oracle changed). If you can't ask, use `assumed` (it must appear as
   `# ASSUMPTION: G<n> …`) or leave it `open` (`@needs-clarification` on the affected scenarios, or
   `# OPEN-QUESTION: G<n> …` when the criterion can still be tested without the answer).

| Kind | Examples | May come from the app? |
| --- | --- | --- |
| `mechanics` (how) | endpoint path or method, request field names, envelope, `Token` vs `Bearer`, page route, field labels, how to create test data | ✅ with evidence |
| `oracle` (what) | status for a wrong password, an error message, a limit, a field that must be returned, whether a retry is idempotent | ❌ never |

**Conflicting sources** (a description saying 422 and a later PO comment saying 409; a general criterion "any request
for a missing cart → 404" next to a specific one "deleting a deleted cart → 204"): record an oracle gap naming both.
Resolve it as `found-in-requirement` only if one source explicitly supersedes the other (a later clarification by
the owner, "not X as stated above"). Otherwise it's `assumed` (say which reading and why) or `open` for the user.

**A need no criterion covers** (the user story says "discover articles by tag", the API lists a `tag` parameter, but no AC
says what it must do): don't write an AC for it. Record a non-required oracle gap ("no acceptance criterion covers
filtering by tag; is it in scope, and what must it return?") with `affects: []`, and cover the lines with that gap.

**Loose wording for a status** ("response code 400" when the API may put a code in the body and answer HTTP 200): an oracle
gap. Name both readings; if you assume one, the scenarios that rest on it carry `@assumes:G<n>`.

**A clarification that adds to a criterion** (a comment gives the status an AC left out): the value is
`found-in-requirement`; add it to the outcomes of every AC the comment names or clearly covers, and cite the comment.

**A header every call sends** ("clients send Accept: application/json"): mechanics the story states. Note it in each
endpoint's `request` and cover the line as `endpoint`.

**Endpoints written several ways** (a full path in one place, a path relative to a service base in another,
`{id}` here and `{accountId}` there): one entry per endpoint, its path relative to the profile's API base
(`apiBaseURL`) — that is how tests call it — with the parameter name the most specific source uses. A path under a
base URL the sources state is grounded as is; cite the line that gives each part.

**A statement that applies across criteria** (a Background line, "one entry per product"): it is a rule. Add it to
an AC's outcomes only when that AC's check depends on it, citing the rule's line as well as the AC's.

**HTML entities** (`&lt;brand&gt;`): quote the line as the pack shows it or as it reads (`<brand>`); the checks
treat both the same.

**Scenario Outlines** (`"status <code> and status text <text>"` with an Examples table): keep the template as the
quoted literal and list each Examples row as its own outcome (`Created → code 201, text "Created"`). A row
substituted into the template is not a literal the story states.

**Quoting part of a stated message**: an outcome quotes a message whole or not at all. `"Successfully
transferred …"` is a new literal the checks reject; write "the confirmation AC-2 states" instead.

**Money and other decimals at a boundary**: a stated `100.00` grounds one step of its precision on either side
(`99.99`, `100.01`), as `1–99` grounds `0` and `100`.

**A story that points elsewhere** ("same criteria as ABC-12", "see the linked spec"): the contract is built from this
story's sources only. If the criteria are restated here, capture them and cover the pointer as `context`. If they are
not, record a required oracle gap ("the acceptance criteria are in ABC-12, which is not part of this story"); the
owner attaches or pastes the referenced text into this story.

## Worked examples

Each example shows a source excerpt (with evidence-pack line numbers) and the expected contract fragment.

### 1. Numbered list under a heading

```text
● L20 | ## Acceptance Criteria          (heading: not accountable)
● L21 | 1. Searching the web shop for a term shows only matching products and a caption "Searched for: <term>".
● L22 | 2. GET /products/search?q=<term> returns 200 with only matching products, regardless of letter case.
```
```json
{ "id": "AC-1", "quote": "Searching the web shop for a term shows only matching products and a caption \"Searched for: <term>\".",
  "source": "story.md#L21", "layer": "ui", "entryPoint": "catalogue home page",
  "outcomes": ["every product shown matches the term", "caption \"Searched for: <term>\""] },
{ "id": "AC-2", "quote": "GET /products/search?q=<term> returns 200 with only matching products, regardless of letter case.",
  "source": "story.md#L22", "layer": "api", "endpoints": ["GET /products/search"],
  "outcomes": ["200", "only matching products", "same result for upper and lower case"] }
```
coverage: `{ "lines": "story.md#L21", "as": "AC-1" }`, `{ "lines": "story.md#L22", "as": "AC-2" }`

### 2. Gherkin in the story

```text
● L23 | Scenario: A registered e-mail address cannot register twice
● L24 | Given a customer already registered with an e-mail address
● L25 | When the same e-mail address is registered again
● L26 | Then the API responds 409 with the message "A customer with this email address already exists."
```
```json
{ "id": "AC-2", "quote": "Scenario: A registered e-mail address cannot register twice Given a customer already registered with an e-mail address When the same e-mail address is registered again Then the API responds 409 with the message \"A customer with this email address already exists.\"",
  "source": "story.md#L23", "layer": "api", "endpoints": ["POST /users/register"], "needsData": true,
  "outcomes": ["409", "message \"A customer with this email address already exists.\""] }
```
coverage: `{ "lines": "story.md#L23-L26", "as": "AC-2" }`

### 3. Table with ids and a layer column

```text
● L21 | | AC-7 | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. | API |
```
The story names no endpoint for "deleting a cart". That is a **mechanics** gap: the builder records it open, and the
evaluator discovers it while hardening (here from the published API docs) and completes it. No re-review is needed.
Built from the story:
```json
{ "id": "AC-7", "quote": "Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204.",
  "source": "story.md#L21", "layer": "api", "gaps": ["G2"], "outcomes": ["delete → 204", "deleting it again → 204"] }
{ "id": "G2", "element": "endpoint for deleting a cart", "kind": "mechanics", "required": true, "affects": ["AC-7"],
  "tried": [{ "where": "story", "result": "L21 names no method or path" }], "resolution": "open" }
```
Completed during hardening: G2 gets `{ "where": "aut", "result": "API docs: DELETE /carts/{cartId}" }` in `tried`,
`"resolution": "discovered-in-aut"`, `"value": "DELETE /carts/{id}"`, `"evidence": "<api docs URL>"`; AC-7 gets
`"endpoints": ["DELETE /carts/{id}"]`; and `endpoints[]` gets `{ "method": "DELETE", "path": "/carts/{id}", "source": "G2" }`.

### 4. Custom field plus a conflicting comment

```text
● L12 | **Technical notes:** … Saving a search that is already saved is rejected with 422.
● L17 | - AC-3: Saving a search that is already saved is rejected and the list still contains it once.
● L28 | Clarification from refinement: an already saved search is a conflict, so the API must answer **409 Conflict** (not 422 as in the technical notes).
```
```json
{ "id": "AC-3", "quote": "Saving a search that is already saved is rejected and the list still contains it once.", "source": "story.md#L17",
  "outcomes": ["duplicate → 409", "the list contains the search once"], "gaps": ["G1"] }
{ "id": "G1", "element": "status for a duplicate: technical notes say 422, the PO comment says 409", "kind": "oracle", "required": true,
  "affects": ["AC-3"], "tried": [{ "where": "story", "result": "L12: 422; L17: \"rejected\"; L28: 409, explicitly superseding L12" }],
  "resolution": "found-in-requirement", "value": "409", "evidence": "story.md#L28 (PO comment supersedes L12)" }
```
coverage: `L12` → `G1`, `L17` → `AC-3`, `L28` → `G1`. A `source` field holds citations only; a note such as
"supersedes L12" goes in `evidence` or `tried`.

### 5. Prose "shall" statements without a heading

```text
● L18 | The service shall reject orders above 50 items; such orders are answered with HTTP 422 and the message "Too many items".
● L19 | It should be fast.
```
```json
{ "id": "AC-1", "quote": "The service shall reject orders above 50 items; such orders are answered with HTTP 422 and the message \"Too many items\".",
  "source": "story.md#L18", "outcomes": ["51 items → 422", "message \"Too many items\"", "50 items accepted"] }
```
L19 isn't testable as written. Cover it as `non-functional`, and if it matters, record an **oracle gap**
("what response time is acceptable?"). Never invent "under 2 seconds".

### 6. Mock-up image

`attachments/signup.png` → `transcripts/signup.png.md`:
```text
  L1 | transcribedFrom: attachments/signup.png
● L3 | Button: "Create account" (disabled, greyed) — note beside it: "enabled only when all fields are valid"
```
```json
{ "id": "AC-4", "quote": "\"Create account\" (disabled, greyed) — note beside it: \"enabled only when all fields are valid\"",
  "source": "transcripts/signup.png.md#L3", "layer": "ui", "outcomes": ["\"Create account\" is disabled until all fields are valid"] }
```

### 7. A story with no acceptance criteria

"Improve the checkout experience." Don't invent criteria. Record one required oracle gap: "what are the
acceptance criteria?", affecting `*`. Cover the lines as `context`, ask the user, and if nobody answers, report
the story as not evaluable.

## Common mistakes (all of these are caught by the checks or the reviewer)

- **Paraphrasing a quote**, or dropping one of two conditions from a sentence.
- **Adding a status code the story never states.** "Rejected" is not "400". Record an oracle gap.
- **Writing an outcome with a different literal** (the story says "sixth attempt", you write "attempt 7").
- **Using the application's current behaviour as the expected value.**
- **Silently resolving a conflict** between the description, a comment and an attachment.
- **Dismissing a line as "context"** when it carries a constraint (a limit, a role, a default).
