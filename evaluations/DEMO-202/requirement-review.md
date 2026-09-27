# Requirement review — DEMO-202

Reviewed before writing any scenario, from `requirement/story.md` and all 4 attachments. No AUT access.

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | AC-1…AC-14, NFR-1 (AC-15), endpoint table, open question |
| field-rules.csv | Min/max length per field, exact length error messages, e-mail TLD rule |
| api-contract.md | Status codes per case (201 / 400 / 401 / 404), Room schema, auth mechanism (cookie `token`), JSON bodies |
| ux-copy.md | Confirmation copy, price format `£<roomPrice> per night`, image alt text `<Type> Room` |
| test-accounts.csv | Staff credentials (stored as `${env:SHADY_STAFF_PASSWORD}`) |

## Testability decisions

| Topic | Decision |
| --- | --- |
| AC-4 "UI and API enforce the same rules" | Full boundary matrix at API level (fast, deterministic, SCN-006 outline). A UI sample (SCN-004 outline) proves the UI surfaces the same rules. |
| Success status inside boundary rows | Valid rows assert **accepted** (2xx and no error list), not exactly 201. The exact 201 is AC-5's job (SCN-005). This keeps one root cause to one failing assertion. |
| AC-3 / AC-6 "nothing is stored" | Verified by posting an invalid enquiry with a unique subject, then checking that subject is absent from the authenticated list (SCN-007). |
| AC-8 message detail needs an id | Taken from the authenticated list (black-box discovery, no fixture data assumed). |
| AC-12 unknown room id | Highest `roomid` from `GET /api/room` + 100000, so the id is guaranteed not to exist. |
| AC-15 performance | 5 sequential requests, each < 3000 ms, measured client-side by the test runner. Environment-sensitive, so a failure is triaged with care. |
| Shared sandbox | Created enquiries use `unique('QA …')` names/subjects so parallel runs and other users never collide. |

## Ambiguities and open questions

| # | Item | Handling |
| --- | --- | --- |
| Q1 | Whitespace trimming before length validation (story "Open questions") | **Not tested**: the PO explicitly said to wait. Listed in the verdict. |
| Q2 | AC-6: "one error string per violated rule" — the exact wording is given only for *length* rules | Assert the exact messages for length rules only; for e-mail format assert 400 plus a non-empty error list. |
| Q3 | AC-1 "programmatically associated label" | Interpreted as: each field is reachable by its accessible name (role textbox + name), which is what assistive technology announces. |

## Revision 2 (2026-09-26)

`jira-fetch` detected a requirement change (`requirement/CHANGES.md`): AC-16 was added and `api-contract.md` is now v1.5 (Idempotency section).

| Topic | Decision |
| --- | --- |
| AC-16(a) "stored only once" | POST the same unique-subject enquiry twice with one `Idempotency-Key`, then count that subject in the authenticated list: it must appear exactly once (SCN-021). |
| AC-16(b) idempotent GET | Three `GET /api/room/{id}` calls must return 200 with deep-equal bodies (SCN-022). |
| Existing scenarios | Unaffected by rev 2. The draft is re-frozen with a logged reason before the new tests are hardened. |
