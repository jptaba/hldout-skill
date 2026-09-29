# Evidence pack — JS-3

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).
This pack is the whole requirement: the story, its acceptance-criteria field, comments and text attachments (`requirement/raw-issue.json` is the tracker's raw answer they came from; nothing to read there).

**Project configuration** (heldout.config.json: not requirement, nothing to cite or cover; a gap it answers is `found-in-config`):

- AUT profile `owasp-juice-shop` "OWASP Juice Shop": web http://localhost:3000/ (API on the same origin)


## story.md

```text
  L1   | ---
  L2   | key: JS-3
  L3   | summary: "Product reviews — write, like and edit"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/JS-3
  L10  | fetchedAt: 2026-09-29T12:36:44.898Z
  L11  | ---
  L12  | 
  L13  | # JS-3: Product reviews — write, like and edit
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Context
  L18  | 
● L19  | Customers can review a product from its details dialog in the shop, like other customers' reviews, and edit their  
● L20  | own. Reviews are public, but writing, liking and editing are for signed-in customers only, and every review and like  
● L21  | must record truthfully who made it, because the marketing team shows "most liked" reviews and moderation relies on  
● L22  | the author field.
  L23  | 
● L24  | The shop runs in a throw-away environment created for this evaluation (a fresh container), so tests may create as  
● L25  | many customers and reviews as they need; nothing has to be deleted afterwards. Tests create their own customers with a  
● L26  | unique e-mail per run; the password to use is provided out of band via the environment variable `JS_USER_PASSWORD`.  
● L27  | Use the product "Apple Juice (1000ml)" (product id 1) for every review.
  L28  | 
● L29  | The request and response details of the review endpoints are in the attachment **api-contract.md**.
  L30  | 
  L31  | ## Acceptance criteria
  L32  | 
  L33  | | ID | Criterion | Layer |
  L34  | | --- | --- | --- |
● L35  | | AC-1 | A signed-in customer can write a review from the product details dialog: after typing a message in the review field and pressing **Submit**, the review appears in the dialog's **Reviews** list with that message and the customer's e-mail as its author. | UI |
● L36  | | AC-2 | Writing a review through the API (`PUT /rest/products/{id}/reviews` with the customer's token) answers **HTTP 201** with `{"status":"success"}`. The review is then listed by `GET /rest/products/{id}/reviews` with the submitted message, the customer's e-mail as `author`, `likesCount` 0 and an empty `likedBy`. | API |
● L37  | | AC-3 | `GET /rest/products/{id}/reviews` answers **HTTP 200** with the envelope and review fields described in api-contract.md, with the stated types. | API |
● L38  | | AC-4 | Writing, liking and editing reviews require a signed-in customer: `PUT /rest/products/{id}/reviews`, `POST /rest/products/reviews` and `PATCH /rest/products/reviews` without a token are refused with **HTTP 401**, and nothing is stored or changed. | API |
● L39  | | AC-5 | Only its author can edit a review: a `PATCH /rest/products/reviews` by another signed-in customer is refused with **HTTP 403**, and the review's message stays unchanged. | API |
● L40  | | AC-6 | Reviews and likes record who made them, from the session and not from the request: a review's `author` is the e-mail of the signed-in customer who wrote it, even when the request names someone else, and each like adds the liking customer's e-mail to the review's `likedBy`. `likesCount` always equals the number of entries in `likedBy`. | API |
● L41  | | AC-7 | A customer can like a review only once: a second like by the same customer is refused with **HTTP 403** and `{"error":"Not allowed"}`, and `likesCount` and `likedBy` stay as they were after the first like. | API |
● L42  | | AC-8 | The like-once rule also holds when requests arrive at the same time: when one customer sends several likes for the same review simultaneously, exactly one is counted — `likesCount` rises by 1 and the customer's e-mail appears once in `likedBy`. | API |
● L43  | | AC-9 | Invalid requests are refused: a like for a review id that does not exist answers **HTTP 404** with `{"error":"Not found"}`, and in the dialog the **Submit** button stays disabled while the review field is empty. | API + UI |
● L44  | | AC-10 | A review message is at most 160 characters: the review field accepts 160 characters and a review of exactly 160 characters can be submitted; a 161st character is not accepted, and the field's counter shows `160/160`. | UI |
● L45  | | AC-11 | The review form is accessible: the review field has an accessible name, and its accessible description includes the hint "Max. 160 characters"; the Submit button has an accessible name. | UI |
● L46  | | AC-12 | A review keeps its history through its lifecycle: a review written by customer A, liked by customer B and then edited by A shows A's edited message, still names A as its author, and keeps B's like (`likesCount` 1, `likedBy` containing B's e-mail). | API |
● L47  | | AC-13 | What the API stores is what the shop shows: a review written through the API appears in the dialog's Reviews list with its author and message, and after one like through the API the review shows **1** as its like count in the dialog. | API + UI |
  L48  | 
  L49  | ## Out of scope
  L50  | 
● L51  | Deleting reviews; reviews on other products; the product's star rating; moderation tools; how "most liked" reviews  
● L52  | are chosen.
  L53  | 
  L54  | ## Attachments
  L55  | 
  L56  | | File | MIME | Bytes | How to read | Local path |
  L57  | | --- | --- | --- | --- | --- |
  L58  | | api-contract.md | text/markdown | 1503 | text — read directly | attachments/api-contract.md |
  L59  | 
```

## attachments/api-contract.md

```text
  L1   | # Product reviews API
  L2   | 
● L3   | Base: the shop's own origin. Authentication: `Authorization: Bearer <token>`, where the token is
● L4   | `authentication.token` from `POST /rest/user/login` (body `{"email": "...", "password": "..."}`).
  L5   | 
  L6   | ## Review object
  L7   | 
  L8   | | Field | Type | Meaning |
  L9   | | --- | --- | --- |
● L10  | | `_id` | string | the review's id |
● L11  | | `message` | string | the review text |
● L12  | | `author` | string | e-mail of the customer who wrote the review |
● L13  | | `product` | — | the id of the product the review belongs to |
● L14  | | `likesCount` | number | how many likes the review has |
● L15  | | `likedBy` | array of strings | e-mails of the customers who liked the review |
  L16  | 
● L17  | Other fields may be present and are not part of this contract.
  L18  | 
  L19  | ## Endpoints
  L20  | 
  L21  | ### `GET /rest/products/{id}/reviews` — public
● L22  | `200` → `{"status": "success", "data": [ <review>, ... ]}`
  L23  | 
  L24  | ### `PUT /rest/products/{id}/reviews` — signed-in customer
● L25  | Body: `{"message": "<text>", "author": "<e-mail of the signed-in customer>"}`
● L26  | `201` → `{"status": "success"}`
  L27  | 
  L28  | ### `POST /rest/products/reviews` — like a review — signed-in customer
● L29  | Body: `{"id": "<review _id>"}`
● L30  | `200` → an object whose `updated` array holds the review after the like.
● L31  | A second like by the same customer → `403` `{"error": "Not allowed"}`. An unknown id → `404` `{"error": "Not found"}`.
  L32  | 
  L33  | ### `PATCH /rest/products/reviews` — edit a review — its author
● L34  | Body: `{"id": "<review _id>", "message": "<new text>"}`
● L35  | `200` → an object whose `updated` array holds the review after the edit.
  L36  | 
```
