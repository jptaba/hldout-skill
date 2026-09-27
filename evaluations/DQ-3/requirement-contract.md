# Requirement contract — DQ-3: Links page - new-tab links and HTTP status diagnostic links

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, page route /links, diagnostic endpoints (plain GET, same host, no parameters, no authentication), AC-1..AC-9 (Gherkin), public/no-account note, PO correction of the Not Found endpoint to /invalid-url |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | Page layout: the Links page shows the heading "Links", a section captioned "Following links will open new tab", a section captioned "Following links will send an api call" containing exactly the links Created, No Content, Moved, Bad Request, Unauthorized, Forbidden, Not Found in this order, and no response message before any api-call link has been clicked | the page heading reads "Links"; a section captioned "Following links will open new tab" is shown; a section captioned "Following links will send an api call" is shown; the api-call section contains exactly the links Created, No Content, Moved, Bad Request, Unauthorized, Forbidden, Not Found, in this order; no response message is shown before any api-call link has been clicked | story.md#L29 |
| AC-2 | ui | Static home link opens in a new tab: clicking the link labelled "Home" on the Links page opens the site home page (https://demoqa.com/) in a new browser tab and the original tab stays on the Links page | clicking the link labelled "Home" opens https://demoqa.com/ in a new browser tab; the original tab stays on the Links page | story.md#L38 |
| AC-3 | ui | Dynamic home link: the second link in the new-tab section has a label that starts with "Home" followed by a random suffix, the suffix is different after the page is reloaded, and clicking that link opens the site home page in a new browser tab | the second link in the new-tab section has a label that starts with "Home" followed by a suffix; the suffix is different after the page is reloaded; clicking that link opens the site home page (https://demoqa.com/, story.md#L41) in a new browser tab | story.md#L44 |
| AC-4 | api | Diagnostic endpoints answer with their status code: GET /created -> 201 Created, GET /no-content -> 204 No Content, GET /moved -> 301 Moved Permanently, GET /bad-request -> 400 Bad Request, GET /unauthorized -> 401 Unauthorized, GET /forbidden -> 403 Forbidden, GET /invalid-url -> 404 Not Found (the PO comment replaces /not-found with /invalid-url) | GET /created -> 201 Created; GET /no-content -> 204 No Content; GET /moved -> 301 Moved Permanently; GET /bad-request -> 400 Bad Request; GET /unauthorized -> 401 Unauthorized; GET /forbidden -> 403 Forbidden; GET /invalid-url -> 404 Not Found (story.md#L110-L112, G1) | story.md#L51 |
| AC-5 | api | Diagnostic responses carry no body: GET to any of the diagnostic endpoints except /moved returns an empty response body (this applies to /invalid-url as well) | the response body of GET /created, /no-content, /bad-request, /unauthorized and /forbidden is empty; the response body of GET /invalid-url is empty (story.md#L112) | story.md#L65 |
| AC-6 | api | Moved endpoint tells the client where to go: GET /moved responds 301 with a Location header that points to the site home page | GET /moved (redirect not followed) -> 301; the response carries a Location header that points to the site home page (https://demoqa.com/, story.md#L41) | story.md#L69 |
| AC-7 | ui | Clicking a diagnostic link reports the result on the page: clicking the "<link>" link shows the message "Link has responded with status <code> and status text <text>" below the links, for Created 201 Created, No Content 204 No Content, Moved 301 Moved Permanently, Bad Request 400 Bad Request, Unauthorized 401 Unauthorized, Forbidden 403 Forbidden, Not Found 404 Not Found | message "Link has responded with status <code> and status text <text>" is shown below the links after clicking the "<link>" link; Created -> <code> 201, <text> Created; No Content -> <code> 204, <text> No Content; Moved -> <code> 301, <text> Moved Permanently; Bad Request -> <code> 400, <text> Bad Request; Unauthorized -> <code> 401, <text> Unauthorized; Forbidden -> <code> 403, <text> Forbidden; Not Found -> <code> 404, <text> Not Found | story.md#L74 |
| AC-8 | e2e | The page reports what the endpoint really answered: clicking any diagnostic link makes the browser send one GET request to that link's endpoint, the status code shown in the message equals the HTTP status of that request, and the browser stays on the Links page (no navigation, no new tab) | clicking a diagnostic link sends exactly one GET request to that link's endpoint (link -> endpoint per R1); the status code shown in the message equals the HTTP status of that request; the browser stays on the Links page: no navigation, no new tab; the Not Found link's endpoint is /invalid-url (story.md#L110-L112) | story.md#L89 |
| AC-9 | ui | Only the latest result is shown: after clicking the "Forbidden" link and seeing its message, clicking the "Created" link leaves only one response message, reporting 201 Created | after clicking "Forbidden" and then "Created", only one response message is shown; that message reports 201 Created | story.md#L96 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /created | none | 201 Created, empty body | story.md#L57 |
| GET /no-content | none | 204 No Content, empty body | story.md#L58 |
| GET /moved | none | 301 Moved Permanently with a Location header pointing to the site home page | story.md#L59 |
| GET /bad-request | none | 400 Bad Request, empty body (the intended diagnostic answer) | story.md#L60 |
| GET /unauthorized | none | 401 Unauthorized, empty body (the intended diagnostic answer) | story.md#L61 |
| GET /forbidden | none | 403 Forbidden, empty body (the intended diagnostic answer) | story.md#L62 |
| GET /invalid-url | none | 404 Not Found, empty body (the intended diagnostic answer) | story.md#L111 |

## Rules and boundaries

- **R1** Each diagnostic link calls its own endpoint: Created -> /created, No Content -> /no-content, Moved -> /moved, Bad Request -> /bad-request, Unauthorized -> /unauthorized, Forbidden -> /forbidden, Not Found -> /invalid-url (corrected from /not-found by the PO). _(story.md#L56-L63, story.md#L110-L112)_
- **R2** The diagnostic endpoints are plain GET endpoints on the same host as the page and take no parameters and no authentication. _(story.md#L21-L22)_

## Authentication

none: the diagnostic endpoints take no authentication and no account is needed; everything on the page is public _(story.md#L22, story.md#L104)_

## Test data

none needed: the page and endpoints are public and need no account; nothing is created

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | endpoint behind the Not Found link: the AC-4 table says /not-found, the PO comment says /invalid-url | oracle | yes | AC-4, AC-5, AC-8 | story | found-in-requirement: /invalid-url (GET /invalid-url -> 404 Not Found; AC-5 and AC-8 apply to it) |
| G2 | AC-4 "the response status is <code> <text>": must the HTTP reason phrase of the response equal <text> (a reason phrase is not transmitted at all over HTTP/2), or is <text> only the standard name of <code> so that the status code alone is checked? | oracle | no | AC-4 | story | open |
| G3 | AC-6 Location header "points to the site home page": does a relative reference to the site root satisfy it, or must the header hold the absolute home page URL? | oracle | no | AC-6 | story | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17-L19 | context |  |
| story.md#L21-L22 | context, R2, endpoint, auth | page route /links (entry point of the UI ACs); diagnostic endpoints are plain GET, same host, no parameters, no authentication |
| story.md#L26 | not-a-requirement | opening ```gherkin code fence |
| story.md#L27 | context | Feature title of the Gherkin block |
| story.md#L29-L36 | AC-1 |  |
| story.md#L38-L42 | AC-2 |  |
| story.md#L44-L49 | AC-3 |  |
| story.md#L51-L62 | AC-4, R1, endpoint |  |
| story.md#L63 | AC-4, G1 | the /not-found path is superseded by story.md#L110-L112 |
| story.md#L65-L67 | AC-5 |  |
| story.md#L69-L72 | AC-6 |  |
| story.md#L74-L87 | AC-7 |  |
| story.md#L89-L94 | AC-8 |  |
| story.md#L96-L99 | AC-9 |  |
| story.md#L100 | not-a-requirement | closing code fence |
| story.md#L104 | auth, test-data |  |
| story.md#L110-L112 | G1, R1, endpoint |  |
