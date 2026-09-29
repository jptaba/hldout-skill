# Requirement contract — JS-3: Product reviews — write, like and edit

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-29T12:40

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context, test data, acceptance criteria AC-1..AC-13, out of scope |
| attachments/api-contract.md | authentication, review object fields and types, the four review endpoints and the login call, like errors |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | A signed-in customer can write a review from the product details dialog: after typing a message in the review field and pressing Submit, the review appears in the dialog's Reviews list with that message and the customer's e-mail as its author. | after typing a message and pressing Submit, the review appears in the dialog's Reviews list; the listed review shows that message; the listed review shows the signed-in customer's e-mail as its author | story.md#L35 |
| AC-2 | api | Writing a review through the API (PUT /rest/products/{id}/reviews with the customer's token) answers HTTP 201 with {"status":"success"}. The review is then listed by GET /rest/products/{id}/reviews with the submitted message, the customer's e-mail as author, likesCount 0 and an empty likedBy. | PUT with the customer's token → HTTP 201; body {"status":"success"}; GET lists the review with the submitted message; its author is the customer's e-mail; its likesCount is 0; its likedBy is empty | story.md#L36 |
| AC-3 | api | GET /rest/products/{id}/reviews answers HTTP 200 with the envelope and review fields described in api-contract.md, with the stated types. | HTTP 200; envelope {"status": "success", "data": [ <review>, ... ]}: status is "success" and data is an array of reviews (attachments/api-contract.md#L22); each review has `_id` as a string (attachments/api-contract.md#L10); each review has `message` as a string (attachments/api-contract.md#L11); each review has `author` as a string (attachments/api-contract.md#L12); each review has a `product` field, type not stated (attachments/api-contract.md#L13); each review has `likesCount` as a number (attachments/api-contract.md#L14); each review has `likedBy` as an array of strings (attachments/api-contract.md#L15); other fields may be present and are not judged (R4) | story.md#L37 |
| AC-4 | api | Writing, liking and editing reviews require a signed-in customer: PUT /rest/products/{id}/reviews, POST /rest/products/reviews and PATCH /rest/products/reviews without a token are refused with HTTP 401, and nothing is stored or changed. | PUT /rest/products/{id}/reviews without a token → HTTP 401; no review with that message is stored (not listed by GET); POST /rest/products/reviews (like) without a token → HTTP 401; the liked review's likesCount and likedBy are unchanged; PATCH /rest/products/reviews without a token → HTTP 401; the review's message is unchanged | story.md#L38 |
| AC-5 | api | Only its author can edit a review: a PATCH /rest/products/reviews by another signed-in customer is refused with HTTP 403, and the review's message stays unchanged. | PATCH by another signed-in customer → HTTP 403; the review's message stays unchanged | story.md#L39 |
| AC-6 | api | Reviews and likes record who made them, from the session and not from the request: a review's author is the e-mail of the signed-in customer who wrote it, even when the request names someone else, and each like adds the liking customer's e-mail to the review's likedBy. likesCount always equals the number of entries in likedBy. | a review written with a request whose author names another e-mail has the signed-in writer's e-mail as author; each like adds the liking customer's e-mail to the review's likedBy; likesCount always equals the number of entries in likedBy | story.md#L40 |
| AC-7 | api | A customer can like a review only once: a second like by the same customer is refused with HTTP 403 and {"error":"Not allowed"}, and likesCount and likedBy stay as they were after the first like. | second like by the same customer → HTTP 403; body {"error":"Not allowed"}; likesCount stays as it was after the first like; likedBy stays as it was after the first like | story.md#L41 |
| AC-8 | api | The like-once rule also holds when requests arrive at the same time: when one customer sends several likes for the same review simultaneously, exactly one is counted — likesCount rises by 1 and the customer's e-mail appears once in likedBy. | several simultaneous likes by one customer for the same review: exactly one is counted; likesCount rises by 1; the customer's e-mail appears once in likedBy | story.md#L42 |
| AC-9 | e2e | Invalid requests are refused: a like for a review id that does not exist answers HTTP 404 with {"error":"Not found"}, and in the dialog the Submit button stays disabled while the review field is empty. | like for a review id that does not exist → HTTP 404; body {"error":"Not found"}; in the dialog, the Submit button stays disabled while the review field is empty | story.md#L43 |
| AC-10 | ui | A review message is at most 160 characters: the review field accepts 160 characters and a review of exactly 160 characters can be submitted; a 161st character is not accepted, and the field's counter shows 160/160. | the review field accepts 160 characters; a review of exactly 160 characters can be submitted; a 161st character is not accepted (the field still holds 160 characters); the field's counter shows `160/160` | story.md#L44 |
| AC-11 | ui | The review form is accessible: the review field has an accessible name, and its accessible description includes the hint "Max. 160 characters"; the Submit button has an accessible name. | the review field has an accessible name (non-empty); the review field's accessible description includes the hint "Max. 160 characters"; the Submit button has an accessible name (non-empty) | story.md#L45 |
| AC-12 | api | A review keeps its history through its lifecycle: a review written by customer A, liked by customer B and then edited by A shows A's edited message, still names A as its author, and keeps B's like (likesCount 1, likedBy containing B's e-mail). | after A writes, B likes and A edits, the review shows A's edited message; the review still names A's e-mail as its author; likesCount 1; likedBy contains B's e-mail | story.md#L46 |
| AC-13 | e2e | What the API stores is what the shop shows: a review written through the API appears in the dialog's Reviews list with its author and message, and after one like through the API the review shows 1 as its like count in the dialog. | a review written through the API appears in the dialog's Reviews list; it shows the author (the writer's e-mail) and the message; after one like through the API, the review shows 1 as its like count in the dialog | story.md#L47 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /rest/products/{id}/reviews | none | 200 {"status": "success", "data": [ <review>, ... ]} | attachments/api-contract.md#L21 |
| PUT /rest/products/{id}/reviews | required | 201 {"status": "success"} | attachments/api-contract.md#L24 |
| POST /rest/products/reviews | required | 200 an object whose `updated` array holds the review after the like | attachments/api-contract.md#L28 |
| PATCH /rest/products/reviews | required | 200 an object whose `updated` array holds the review after the edit | attachments/api-contract.md#L33 |
| POST /rest/user/login |  | the token is `authentication.token` in the answer | attachments/api-contract.md#L4 |

## Rules and boundaries

- **R1** Reviews are public, but writing, liking and editing are for signed-in customers only. _(story.md#L20, attachments/api-contract.md#L21, attachments/api-contract.md#L24, attachments/api-contract.md#L28, attachments/api-contract.md#L33)_
- **R2** Every review and like must record truthfully who made it (marketing shows "most liked" reviews and moderation relies on the author field). _(story.md#L20-L22)_
- **R3** Use the product "Apple Juice (1000ml)" (product id 1) for every review. _(story.md#L27)_
- **R4** Review object: `_id` string, `message` string, `author` string (e-mail of the writer), `product` (type —: the product's id), `likesCount` number, `likedBy` array of strings (e-mails of the likers). Other fields may be present and are not part of this contract. _(attachments/api-contract.md#L10-L15, attachments/api-contract.md#L17)_
- **R5** A review message is at most 160 characters. _(story.md#L44)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | PUT /rest/products/{id}/reviews, POST /rest/products/reviews or PATCH /rest/products/reviews without a token; nothing is stored or changed | 401 |  | story.md#L38 |
| E2 | PATCH /rest/products/reviews by a signed-in customer who is not the review's author; the message stays unchanged | 403 |  | story.md#L39 |
| E3 | second like of the same review by the same customer | 403 | {"error": "Not allowed"} | story.md#L41, attachments/api-contract.md#L31 |
| E4 | like for a review id that does not exist | 404 | {"error": "Not found"} | story.md#L43, attachments/api-contract.md#L31 |

## Authentication

Authorization: Bearer <token>, where the token is `authentication.token` from POST /rest/user/login (body {"email": "...", "password": "..."}) — credentials: customers the tests create themselves with a unique e-mail per run; password from the environment variable JS_USER_PASSWORD _(attachments/api-contract.md#L3-L4, story.md#L25-L26)_

## Test data

tests create their own customers with a unique e-mail per run (password from JS_USER_PASSWORD) and as many reviews as they need
- every review is on the product "Apple Juice (1000ml)" (product id 1)
- a unique customer e-mail per run
- Cleanup: nothing has to be deleted afterwards: the shop runs in a throw-away environment (a fresh container) created for this evaluation

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | product details dialog: how to open the dialog of "Apple Juice (1000ml)" in the shop, and how its review field, Submit button, character counter, Reviews list (author, message) and a review's like count are found | mechanics | yes | AC-1, AC-9, AC-10, AC-11, AC-13 | story → config → aut | discovered-in-aut: start page lists the products; the card opens role=dialog; field = its only textbox; Submit = button 'Send the review'; list = button 'Reviews (N)', entries '.comment' (author, message, like button with the count); counter 'N/160' |
| G2 | how a UI test is signed in to the shop as the customer (sign-in page, or the API token handed to the browser) | mechanics | yes | AC-1, AC-9, AC-10, AC-11 | story → config → aut | discovered-in-aut: UI sign-in on #/login: e-mail and password text fields, button Login; done at url /search (recipe signIn) |
| G3 | how tests create their customers: story.md#L25 says tests create their own customers with a unique e-mail per run but names no registration call (method, path, request fields) | mechanics | yes | * | story → attachments → config → aut | discovered-in-aut: GET /api/SecurityQuestions, then POST /api/Users {email, password, passwordRepeat, securityQuestion:{id}, securityAnswer} → 201; saved as the profile's accounts recipe |
| G4 | type of the review field `product`: api-contract.md#L13 gives '—' as its type, so AC-3's 'with the stated types' states none for it; checked for presence only. What type must it have? | oracle | no | AC-3 | attachments | open |
| G5 | answer to the extra likes in a simultaneous burst (AC-8): the story states only that exactly one is counted, not what the other requests must answer (e.g. the 403 of AC-7). Judged on the count and likedBy only | oracle | no | AC-8 | story | open |
| G6 | whether a customer may like their own review: story.md#L19 speaks of liking other customers' reviews; no source says what liking one's own review must do. Tests of liking use a review written by another customer | oracle | no | AC-6, AC-7, AC-8, AC-13 | story | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19-L22 | context, R1, R2, G6 |  |
| story.md#L24-L26 | test-data, auth, G3 |  |
| story.md#L27 | R3, test-data |  |
| story.md#L29 | context | points to the attachment, which is part of this pack |
| story.md#L35 | AC-1 |  |
| story.md#L36 | AC-2 |  |
| story.md#L37 | AC-3 |  |
| story.md#L38 | AC-4, E1 |  |
| story.md#L39 | AC-5, E2 |  |
| story.md#L40 | AC-6 |  |
| story.md#L41 | AC-7, E3 |  |
| story.md#L42 | AC-8 |  |
| story.md#L43 | AC-9, E4 |  |
| story.md#L44 | AC-10, R5 |  |
| story.md#L45 | AC-11 |  |
| story.md#L46 | AC-12 |  |
| story.md#L47 | AC-13 |  |
| story.md#L51-L52 | out-of-scope |  |
| attachments/api-contract.md#L3-L4 | auth, endpoint |  |
| attachments/api-contract.md#L10-L15 | R4, AC-3 |  |
| attachments/api-contract.md#L13 | G4 |  |
| attachments/api-contract.md#L17 | R4, AC-3 |  |
| attachments/api-contract.md#L22 | endpoint, AC-3 |  |
| attachments/api-contract.md#L25-L26 | endpoint |  |
| attachments/api-contract.md#L29-L30 | endpoint |  |
| attachments/api-contract.md#L31 | E3, E4 |  |
| attachments/api-contract.md#L34-L35 | endpoint |  |
