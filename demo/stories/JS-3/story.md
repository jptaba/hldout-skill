# JS-3: Product reviews — write, like and edit

## Context
Customers can review a product from its details dialog in the shop, like other customers' reviews, and edit their
own. Reviews are public, but writing, liking and editing are for signed-in customers only, and every review and like
must record truthfully who made it, because the marketing team shows "most liked" reviews and moderation relies on
the author field.

The shop runs in a throw-away environment created for this evaluation (a fresh container), so tests may create as
many customers and reviews as they need; nothing has to be deleted afterwards. Tests create their own customers with a
unique e-mail per run; the password to use is provided out of band via the environment variable `JS_USER_PASSWORD`.
Use the product "Apple Juice (1000ml)" (product id 1) for every review.

The request and response details of the review endpoints are in the attachment **api-contract.md**.

## Acceptance criteria

| ID    | Criterion | Layer |
|-------|-----------|-------|
| AC-1  | A signed-in customer can write a review from the product details dialog: after typing a message in the review field and pressing **Submit**, the review appears in the dialog's **Reviews** list with that message and the customer's e-mail as its author. | UI |
| AC-2  | Writing a review through the API (`PUT /rest/products/{id}/reviews` with the customer's token) answers **HTTP 201** with `{"status":"success"}`. The review is then listed by `GET /rest/products/{id}/reviews` with the submitted message, the customer's e-mail as `author`, `likesCount` 0 and an empty `likedBy`. | API |
| AC-3  | `GET /rest/products/{id}/reviews` answers **HTTP 200** with the envelope and review fields described in api-contract.md, with the stated types. | API |
| AC-4  | Writing, liking and editing reviews require a signed-in customer: `PUT /rest/products/{id}/reviews`, `POST /rest/products/reviews` and `PATCH /rest/products/reviews` without a token are refused with **HTTP 401**, and nothing is stored or changed. | API |
| AC-5  | Only its author can edit a review: a `PATCH /rest/products/reviews` by another signed-in customer is refused with **HTTP 403**, and the review's message stays unchanged. | API |
| AC-6  | Reviews and likes record who made them, from the session and not from the request: a review's `author` is the e-mail of the signed-in customer who wrote it, even when the request names someone else, and each like adds the liking customer's e-mail to the review's `likedBy`. `likesCount` always equals the number of entries in `likedBy`. | API |
| AC-7  | A customer can like a review only once: a second like by the same customer is refused with **HTTP 403** and `{"error":"Not allowed"}`, and `likesCount` and `likedBy` stay as they were after the first like. | API |
| AC-8  | The like-once rule also holds when requests arrive at the same time: when one customer sends several likes for the same review simultaneously, exactly one is counted — `likesCount` rises by 1 and the customer's e-mail appears once in `likedBy`. | API |
| AC-9  | Invalid requests are refused: a like for a review id that does not exist answers **HTTP 404** with `{"error":"Not found"}`, and in the dialog the **Submit** button stays disabled while the review field is empty. | API + UI |
| AC-10 | A review message is at most 160 characters: the review field accepts 160 characters and a review of exactly 160 characters can be submitted; a 161st character is not accepted, and the field's counter shows `160/160`. | UI |
| AC-11 | The review form is accessible: the review field has an accessible name, and its accessible description includes the hint "Max. 160 characters"; the Submit button has an accessible name. | UI |
| AC-12 | A review keeps its history through its lifecycle: a review written by customer A, liked by customer B and then edited by A shows A's edited message, still names A as its author, and keeps B's like (`likesCount` 1, `likedBy` containing B's e-mail). | API |
| AC-13 | What the API stores is what the shop shows: a review written through the API appears in the dialog's Reviews list with its author and message, and after one like through the API the review shows **1** as its like count in the dialog. | API + UI |

## Out of scope
Deleting reviews; reviews on other products; the product's star rating; moderation tools; how "most liked" reviews
are chosen.
