# Requirement contract — DEMO-707: Conduit — accounts, articles, comments, favourites and discovery

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:45

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context, user stories, AC-1…AC-19, test data rules |
| attachments/api-contract.md | endpoints, request envelopes, auth header, pagination bounds, error model |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | POST /api/users with a new username, email and password responds 201 with the user (username, email, token). | responds 201; the response user contains username, email and token | story.md#L31 |
| AC-2 | api | Registering an email or username that is already taken responds 422 with a field-level errors object naming the taken field(s). | taken email → 422 with a field-level errors object naming email; taken username → 422 with a field-level errors object naming username | story.md#L32 |
| AC-3 | api | POST /api/users/login with valid credentials responds 200 with a token; with a wrong password it responds 401 Unauthorized with an errors object. | valid credentials → 200 with a token; wrong password → 401 Unauthorized with an errors object | story.md#L33 |
| AC-4 | api | Endpoints that require authentication accept Authorization: Token <jwt> and respond 401 when the header is missing or the token is invalid. | a request with a valid Authorization: Token <jwt> header is accepted (GET /api/user → 200); Authorization header missing → 401; invalid token → 401 | story.md#L34 |
| AC-5 | api | An authenticated writer can create an article (title, description, body, tagList) → 201 with the article, including a slug, the author and the tags. | responds 201 with the article; the article includes a slug; the article includes the author; the article includes the tags that were sent | story.md#L38 |
| AC-6 | api | Titles need not be unique: a writer may publish a second article with the same title, which receives its own distinct slug (201). | second article with the same title → 201; the second article's slug differs from the first article's slug | story.md#L39 |
| AC-7 | api | A missing title, description or body is rejected with 422 and a field-level error. | missing title → 422 with a field-level error; missing description → 422 with a field-level error; missing body → 422 with a field-level error | story.md#L40 |
| AC-8 | api | Only the author may update or delete an article. Another signed-in user gets 403; the article is unchanged. | update by another signed-in user → 403; delete by another signed-in user → 403; the article is unchanged afterwards (still readable with its original fields) | story.md#L41 |
| AC-9 | api | The author can update an article (200, changed fields returned) and delete it (204); afterwards GET /api/articles/{slug} responds 404. | update by the author → 200 with the changed fields returned; delete by the author → 204; afterwards GET /api/articles/{slug} responds 404 | story.md#L42 |
| AC-10 | api | Any reader filtering the article list by an author (?author=<username>) gets that author's published articles, including ones published moments ago. | an anonymous reader filtering by the author gets that author's article published moments ago; another signed-in reader filtering by the author gets that author's article published moments ago; every article in the filtered list is by that author | story.md#L46 |
| AC-11 | api | The list supports pagination with limit (1–100) and offset. limit outside 1–100 is rejected with 422; values on the boundaries are accepted. | limit=0 → 422; limit=101 → 422; limit=1 is accepted (200) and returns at most one article; limit=100 is accepted (200); offset pages through the list (a later offset skips earlier articles) | story.md#L47 |
| AC-12 | api | After following an author, that author's articles appear in the reader's feed (GET /api/articles/feed). | after the reader follows the author, GET /api/articles/feed includes that author's articles | story.md#L48 |
| AC-13 | api | A signed-in reader can comment on any article (200, the comment is returned). An empty comment body is rejected with 422. | a signed-in reader comments on another author's article → 200 with the comment returned; empty comment body → 422 | story.md#L52 |
| AC-14 | api | Comments are public: every reader of the article — the article's author, other users and anonymous visitors — sees all its comments in GET /api/articles/{slug}/comments. | the article's author sees all its comments in GET /api/articles/{slug}/comments; another signed-in user sees all its comments; an anonymous visitor sees all its comments | story.md#L53 |
| AC-15 | api | Only a comment's author may delete it. Anyone else gets 403 and the comment remains. | delete by a user who is not the comment's author → 403; the comment remains in GET /api/articles/{slug}/comments; delete by the comment's author → 200 | story.md#L54 |
| AC-16 | api | Favouriting is idempotent: favouriting an article increases favoritesCount by one and sets favorited: true; favouriting it again (e.g. a double-click or retry) leaves the count unchanged; unfavouriting decreases it by one. | favourite → favoritesCount increases by one and favorited: true; favourite again → favoritesCount unchanged; unfavourite → favoritesCount decreases by one | story.md#L55 |
| AC-17 | ui | A registered user can sign in on the web app's Sign in page with email and password; afterwards the navigation shows their username and a "New Article" link. | after signing in, the navigation shows the user's username; after signing in, the navigation shows a "New Article" link | story.md#L59 |
| AC-18 | e2e | A signed-in writer can publish an article from the editor ("New Article"); the article page then shows the title and body, and the article is available from the API under its slug. | the article page shows the title that was entered; the article page shows the body that was entered; GET /api/articles/{slug} → 200 with that article | story.md#L60 |
| AC-19 | ui | An anonymous visitor sees "Sign in" and "Sign up" links in the navigation. | the navigation shows a "Sign in" link; the navigation shows a "Sign up" link | story.md#L61 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /api/users | none | 201 {"user": {…, "token"}} | attachments/api-contract.md#L8 |
| POST /api/users/login | none | 200 {"user": {…, "token"}} | attachments/api-contract.md#L9 |
| GET /api/user | required | 200 {"user": {…}} | attachments/api-contract.md#L10 |
| GET /api/articles | optional | 200 {"articles": [...], "articlesCount"} | attachments/api-contract.md#L11 |
| GET /api/articles/feed | required | 200 {"articles": [...], "articlesCount"} | attachments/api-contract.md#L12 |
| POST /api/articles | required | 201 {"article": {…}} | attachments/api-contract.md#L13 |
| GET /api/articles/{slug} | optional | 200 {"article": {…}} | attachments/api-contract.md#L14 |
| PUT /api/articles/{slug} | required | 200 {"article": {…}} (author only) | attachments/api-contract.md#L15 |
| DELETE /api/articles/{slug} | required | 204 (author only) | attachments/api-contract.md#L16 |
| POST /api/articles/{slug}/comments | required | 200 {"comment": {…}} | attachments/api-contract.md#L17 |
| GET /api/articles/{slug}/comments | optional | 200 {"comments": [...]} | attachments/api-contract.md#L18 |
| DELETE /api/articles/{slug}/comments/{id} | required | 200 (comment author only) | attachments/api-contract.md#L19 |
| POST /api/articles/{slug}/favorite | required | 200 {"article": {…, "favorited", "favoritesCount"}} | attachments/api-contract.md#L20 |
| DELETE /api/articles/{slug}/favorite | required | 200 {"article": {…}} | attachments/api-contract.md#L21 |
| POST /api/profiles/{username}/follow | required | 200 {"profile": {…, "following": true}} | attachments/api-contract.md#L22 |

## Rules and boundaries

- **R1** All published content is public: any reader, signed in or not, must be able to discover and read any author's articles and the comments on them. _(story.md#L19)_
- **R2** Article list query: limit 1–100 (default 20), offset ≥ 0. _(attachments/api-contract.md#L11)_
- **R3** JSON bodies use a top-level envelope named after the resource. _(attachments/api-contract.md#L3)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Validation / taken values | 422 | {"errors": {"<field>": ["<message>", …]}} | attachments/api-contract.md#L28 |
| E2 | Missing / invalid token; wrong login credentials | 401 | error body | attachments/api-contract.md#L29 |
| E3 | Authenticated but not permitted (not the owner) | 403 | error body | attachments/api-contract.md#L30 |
| E4 | Resource not found | 404 | error body | attachments/api-contract.md#L31 |

## Authentication

Authorization: Token <jwt> (JWT from register/login) — credentials: Tests register their own qa… users through POST /api/users and use the returned token _(attachments/api-contract.md#L4)_

## Test data

Tests create their own users through POST /api/users and their own articles through POST /api/articles (and comments/favourites/follows on them) — no pre-existing data is relied on.
- usernames must start with qa
- e-mails at example.com
- accounts cannot be deleted through the API; created users are left in place (uniquely named)
- Cleanup: Articles created by tests are deleted afterwards by their author (DELETE /api/articles/{slug}); users are left in place.

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | origins of the web app and the JSON API | mechanics | yes | * | story → attachments → config | found-in-config: web app https://conduit.bondaracademy.com; API https://conduit-api.bondaracademy.com |
| G2 | web app Sign in page: route, field labels and submit control | mechanics | yes | AC-17, AC-18 | story → attachments → aut | discovered-in-aut: route /login (nav link "Sign in"); fill placeholders "Email" and "Password"; click button "Sign in" |
| G3 | web app editor: how to open it, field labels, publish control, and how to learn the new article's slug | mechanics | yes | AC-18 | story → attachments → aut | discovered-in-aut: click link "New Article" (/editor); fill placeholders "Article Title", "What's this article about?", "Write your article (in markdown)", "Enter tags"; click "Publish Article"; read the slug from the resulting /article/<slug> URL |
| G4 | discovery by tag: the reader user story asks to "discover articles by author and tag" and GET /api/articles lists a tag query parameter, but no acceptance criterion covers it. Is discovery by tag part of this story's acceptance, and if so, what must filtering by a tag return? | oracle | no |  | story → attachments | open |
| G5 | web app page an anonymous visitor opens to see the navigation (route) | mechanics | yes | AC-19 | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19 | R1, context | public-content rule; underpins AC-10 and AC-14 |
| story.md#L23 | context | writer user story; realised by AC-5…AC-9, AC-18 |
| story.md#L24 | context, G4 | reader user story; realised by AC-10, AC-12…AC-16. Discovery by tag has no acceptance criterion: recorded as open oracle gap G4 |
| story.md#L25 | context | platform user story; realised by the error model and AC-16 (safe retries) |
| story.md#L31 | AC-1 |  |
| story.md#L32 | AC-2 |  |
| story.md#L33 | AC-3 |  |
| story.md#L34 | AC-4 |  |
| story.md#L38 | AC-5 |  |
| story.md#L39 | AC-6 |  |
| story.md#L40 | AC-7 |  |
| story.md#L41 | AC-8 |  |
| story.md#L42 | AC-9 |  |
| story.md#L46 | AC-10 |  |
| story.md#L47 | AC-11 |  |
| story.md#L48 | AC-12 |  |
| story.md#L52 | AC-13 |  |
| story.md#L53 | AC-14 |  |
| story.md#L54 | AC-15 |  |
| story.md#L55 | AC-16 |  |
| story.md#L59 | AC-17 |  |
| story.md#L60 | AC-18 |  |
| story.md#L61 | AC-19 |  |
| story.md#L65 | context | pointer to attachments/api-contract.md, captured as endpoints / error model |
| story.md#L69 | test-data |  |
| attachments/api-contract.md#L3 | R3, endpoint, G1 | envelope rule → endpoints[].envelope; API origin comes from config (G1) |
| attachments/api-contract.md#L4 | auth |  |
| attachments/api-contract.md#L6 | endpoint | table header |
| attachments/api-contract.md#L8-L10 | endpoint |  |
| attachments/api-contract.md#L11 | endpoint, R2, G4 | the tag query parameter has no acceptance criterion (G4) |
| attachments/api-contract.md#L12-L22 | endpoint |  |
| attachments/api-contract.md#L26 | error-model | table header |
| attachments/api-contract.md#L28-L31 | error-model |  |
