# Requirement review — JS-3

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | context, test data, acceptance criteria AC-1..AC-13, out of scope |
| attachments/api-contract.md | authentication, review object fields and types, the four review endpoints and login, like errors |

## Testability decisions

_How each criterion is verified (write the decision after the arrow)._

- **AC-1** (ui) A signed-in customer can write a review from the product details dialog: after typing a message in the review field and pressing Submit, … → SCN-001 (functional): signed in through the UI, write in the dialog, find the message and author in the Reviews list.
- **AC-2** (api) Writing a review through the API (PUT /rest/products/{id}/reviews with the customer's token) answers HTTP 201 with {"status":"success"}. … → SCN-002 (functional): PUT with the token, then GET finds it by its unique message.
- **AC-3** (api) GET /rest/products/{id}/reviews answers HTTP 200 with the envelope and review fields described in api-contract.md, with the stated types. → SCN-003 (contract): envelope and a shape check of every review; `product` only has to identify product 1 (G4 open).
- **AC-4** (api) Writing, liking and editing reviews require a signed-in customer: PUT /rest/products/{id}/reviews, POST /rest/products/reviews and PATCH … → SCN-004 outline (security), one row per call, each also checking nothing was stored or changed.
- **AC-5** (api) Only its author can edit a review: a PATCH /rest/products/reviews by another signed-in customer is refused with HTTP 403, and the review'… → SCN-005 (security) with two customers.
- **AC-6** (api) Reviews and likes record who made them, from the session and not from the request: a review's author is the e-mail of the signed-in custo… → two audit scenarios so each half counts on its own: SCN-006 (author from the session; the request names another e-mail) and SCN-007 (a like records the liker; likesCount = entries in likedBy).
- **AC-7** (api) A customer can like a review only once: a second like by the same customer is refused with HTTP 403 and {"error":"Not allowed"}, and like… → SCN-008 (idempotency): the same like sent again, after the first.
- **AC-8** (api) The like-once rule also holds when requests arrive at the same time: when one customer sends several likes for the same review simultaneo… → SCN-009 (concurrency): three likes sent together (`Promise.all`), three rounds on fresh reviews; only what is counted is judged.
- **AC-9** (e2e) Invalid requests are refused: a like for a review id that does not exist answers HTTP 404 with {"error":"Not found"}, and in the dialog t… → two negative scenarios: SCN-010 (API, unknown id) and SCN-011 (UI, Submit disabled while empty).
- **AC-10** (ui) A review message is at most 160 characters: the review field accepts 160 characters and a review of exactly 160 characters can be submitt… → two boundary scenarios: SCN-012 (160 held and submitted, confirmed through GET) and SCN-013 (161 typed → 160 held, counter 160/160).
- **AC-11** (ui) The review form is accessible: the review field has an accessible name, and its accessible description includes the hint "Max. 160 charac… → SCN-014 (accessibility): non-empty accessible names; description matched against the stated hint. `strict`: the locator is part of the requirement.
- **AC-12** (api) A review keeps its history through its lifecycle: a review written by customer A, liked by customer B and then edited by A shows A's edit… → SCN-015 (composition): one flow A writes → B likes → A edits, checking the hand-offs at the end.
- **AC-13** (e2e) What the API stores is what the shop shows: a review written through the API appears in the dialog's Reviews list with its author and mes… → SCN-016 (integration): written and liked through the API, read in the dialog as a visitor (reviews are public).

## Ambiguities / open questions

- G1 (mechanics, required): the product details dialog and its elements — discovered while hardening
- G2 (mechanics, required): how a UI test signs in as the customer — discovered while hardening
- G3 (mechanics, required): how customers are created — discovered while hardening
- G4 (oracle): the type of `product` — open; assumed: any form of id 1 (not asserted as a type)
- G5 (oracle): what the extra simultaneous likes answer — open; not asserted
- G6 (oracle): whether one may like one's own review — open; likes always come from a second customer
