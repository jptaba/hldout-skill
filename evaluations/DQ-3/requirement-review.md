# Requirement review — DQ-3: Links page - new-tab links and HTTP status diagnostic links

Written from `requirement/story.md` and the requirement contract only (no attachments; no AUT access).

## Sources used

| Source | Contributes |
| --- | --- |
| story.md — Description | user goal; route `/links` (Elements > Links); endpoints are plain GET, same host, no parameters, no auth |
| story.md — Acceptance criteria (Gherkin AC-1..AC-9) | layout, new-tab links, diagnostic endpoint status codes, empty bodies, redirect Location, on-page message text, request/message consistency, latest-result-only |
| story.md — Notes | public page, no account (no test data, no secrets) |
| story.md — PO comment (Priya Nair) | Not Found link calls `GET /invalid-url` (not `/not-found`); AC-5 and AC-8 apply to it (contract gap G1) |

## Testability decisions

| AC | Clause | How it is verified |
| --- | --- | --- |
| AC-1 | sections "captioned" | the caption text is visible on the page; the api-call links are read from the container of the api-call caption |
| AC-1 | "exactly these links, in this order" | the ordered list of link labels in the api-call section equals the 7 labels |
| AC-1 | "no response message before a click" | after the page is ready (the api-call links are visible: positive control), no text "Link has responded" is present |
| AC-2 / AC-3 | "opens in a new browser tab" | a `popup` page opens from the click and its URL is the home page `https://demoqa.com/`; the original tab's URL is still `/links` |
| AC-3 | "random suffix … different after reload" | label matches `^Home` with a non-empty suffix; label read again after a reload differs |
| AC-4 | "status is <code> <text>" | the status code is asserted; the reason phrase is **not** asserted (G2 is an open question — HTTP/2 carries no reason phrase) |
| AC-4 / AC-6 | GET /moved → 301 | the request is made **without following redirects**, otherwise the client would see the home page's status |
| AC-5 | "body is empty" | the raw response text has length 0 for the six endpoints other than /moved |
| AC-6 | Location "points to the site home page" | the Location header, resolved against the request URL, equals `https://demoqa.com/` (literal reading; tagged `@needs-clarification` for G3 relative-vs-absolute) |
| AC-7 | message text | exact text "Link has responded with status <code> and status text <text>" shown after each click (one test per link) |
| AC-8 | "one GET request to that link's endpoint" | browser requests whose path equals the link's endpoint are recorded: exactly one, method GET; the code in the message equals that request's response status; page URL unchanged; no extra page opened |
| AC-9 | "only one message" | after Forbidden then Created, exactly one "Link has responded" message exists and it reads the 201 Created text |

## Ambiguities / open questions

| Gap | Handling |
| --- | --- |
| G1 — Not Found endpoint | found in the requirement: `/invalid-url` (PO comment). Used in AC-4, AC-5, AC-8 |
| G2 — must the HTTP reason phrase equal <text>? | `# OPEN-QUESTION:`; the reason phrase is not asserted at API level. The UI message (AC-7) still asserts the text verbatim, as the story states it |
| G3 — relative vs absolute Location | tested with the most literal reading ("points to" the home page after URL resolution) and tagged `@needs-clarification` |

"Below the links" (AC-7) is a layout statement; the test checks the message is shown, not its pixel position (ASSUMPTION).

## Revisions

None (single fetch).
