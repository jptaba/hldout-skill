# Evidence pack — DEMO-707

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DEMO-707
  L3   | summary: "Conduit — accounts, articles, comments, favourites and discovery"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DEMO-707
  L10  | fetchedAt: 2026-09-26T18:57:17.221Z
  L11  | ---
  L12  | 
  L13  | # DEMO-707: Conduit — accounts, articles, comments, favourites and discovery
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Context
  L18  | 
● L19  | Conduit is our public writing platform (web app + JSON API; the contract follows the RealWorld specification — see `api-contract.md`). This story is the acceptance baseline for the platform's core: accounts, publishing, commenting, favouriting, following and discovering articles. **All published content is public**: any reader, signed in or not, must be able to discover and read any author's articles and the comments on them.
  L20  | 
  L21  | ## User stories
  L22  | 
● L23  | - As a **writer**, I want to publish, edit and delete my articles, so that I control my content.
● L24  | - As a **reader**, I want to discover articles by author and tag, read comments and favourite articles, so that I can follow what interests me.
● L25  | - As the **platform**, I want predictable errors and safe retries, so that client apps behave consistently.
  L26  | 
  L27  | ## Acceptance criteria
  L28  | 
  L29  | ### Accounts & authentication (API)
  L30  | 
● L31  | - **AC-1**: `POST /api/users` with a new username, email and password responds **201** with the user (username, email, token).
● L32  | - **AC-2**: Registering an email or username that is already taken responds **422** with a field-level `errors` object naming the taken field(s).
● L33  | - **AC-3**: `POST /api/users/login` with valid credentials responds **200** with a token; with a wrong password it responds **401 Unauthorized** with an `errors` object.
● L34  | - **AC-4**: Endpoints that require authentication accept `Authorization: Token <jwt>` and respond **401** when the header is missing or the token is invalid.
  L35  | 
  L36  | ### Articles (API)
  L37  | 
● L38  | - **AC-5**: An authenticated writer can create an article (title, description, body, tagList) → **201** with the article, including a `slug`, the author and the tags.
● L39  | - **AC-6**: Titles need not be unique: a writer may publish a second article with the same title, which receives its own distinct slug (**201**).
● L40  | - **AC-7**: A missing title, description or body is rejected with **422** and a field-level error.
● L41  | - **AC-8**: Only the author may update or delete an article. Another signed-in user gets **403**; the article is unchanged.
● L42  | - **AC-9**: The author can update an article (**200**, changed fields returned) and delete it (**204**); afterwards `GET /api/articles/{slug}` responds **404**.
  L43  | 
  L44  | ### Discovery (API)
  L45  | 
● L46  | - **AC-10**: Any reader filtering the article list by an author (`?author=<username>`) gets that author's published articles, including ones published moments ago.
● L47  | - **AC-11**: The list supports pagination with `limit` (1–100) and `offset`. `limit` outside 1–100 is rejected with **422**; values on the boundaries are accepted.
● L48  | - **AC-12**: After following an author, that author's articles appear in the reader's feed (`GET /api/articles/feed`).
  L49  | 
  L50  | ### Comments & favourites (API)
  L51  | 
● L52  | - **AC-13**: A signed-in reader can comment on any article (**200**, the comment is returned). An empty comment body is rejected with **422**.
● L53  | - **AC-14**: Comments are public: every reader of the article — the article's author, other users and anonymous visitors — sees all its comments in `GET /api/articles/{slug}/comments`.
● L54  | - **AC-15**: Only a comment's author may delete it. Anyone else gets **403** and the comment remains.
● L55  | - **AC-16**: Favouriting is idempotent: favouriting an article increases `favoritesCount` by one and sets `favorited: true`; favouriting it **again** (e.g. a double-click or retry) leaves the count unchanged; unfavouriting decreases it by one.
  L56  | 
  L57  | ### Web app (UI)
  L58  | 
● L59  | - **AC-17**: A registered user can sign in on the web app's Sign in page with email and password; afterwards the navigation shows their username and a "New Article" link.
● L60  | - **AC-18**: A signed-in writer can publish an article from the editor ("New Article"); the article page then shows the title and body, and the article is available from the API under its slug.
● L61  | - **AC-19**: An anonymous visitor sees "Sign in" and "Sign up" links in the navigation.
  L62  | 
  L63  | ## API contract
  L64  | 
● L65  | See `api-contract.md` (endpoints, envelopes, error format).
  L66  | 
  L67  | ## Test data
  L68  | 
● L69  | Tests create their own users through `POST /api/users` (usernames must start with `qa`, e-mails at `example.com`). Accounts cannot be deleted through the API; created users are left in place (they are uniquely named and harmless). Articles created by tests should be deleted afterwards.
  L70  | 
  L71  | ## Attachments
  L72  | 
  L73  | | File | MIME | Bytes | How to read | Local path |
  L74  | | --- | --- | --- | --- | --- |
  L75  | | api-contract.md | text/markdown | 2155 | text — read directly | attachments/api-contract.md |
  L76  | 
```

## attachments/api-contract.md

```text
  L1   | # Conduit API contract (RealWorld, v2 profile)
  L2   | 
● L3   | Base: the environment's API origin. JSON bodies use a **top-level envelope** named after the resource.
● L4   | Authentication: `Authorization: Token <jwt>` (JWT from register/login).
  L5   | 
● L6   | | Method | Path | Auth | Request envelope | Success |
  L7   | | --- | --- | --- | --- | --- |
● L8   | | POST | /api/users | – | `{"user": {"username", "email", "password"}}` | 201 `{"user": {…, "token"}}` |
● L9   | | POST | /api/users/login | – | `{"user": {"email", "password"}}` | 200 `{"user": {…, "token"}}` |
● L10  | | GET | /api/user | required | – | 200 `{"user": {…}}` |
● L11  | | GET | /api/articles | optional | query: `author`, `tag`, `favorited`, `limit` (1–100, default 20), `offset` (≥ 0) | 200 `{"articles": [...], "articlesCount"}` |
● L12  | | GET | /api/articles/feed | required | query: `limit`, `offset` | 200 `{"articles": [...], "articlesCount"}` |
● L13  | | POST | /api/articles | required | `{"article": {"title", "description", "body", "tagList"}}` | 201 `{"article": {…}}` |
● L14  | | GET | /api/articles/{slug} | optional | – | 200 `{"article": {…}}` |
● L15  | | PUT | /api/articles/{slug} | required (author) | `{"article": {…changed fields}}` | 200 `{"article": {…}}` |
● L16  | | DELETE | /api/articles/{slug} | required (author) | – | 204 |
● L17  | | POST | /api/articles/{slug}/comments | required | `{"comment": {"body"}}` | 200 `{"comment": {…}}` |
● L18  | | GET | /api/articles/{slug}/comments | optional | – | 200 `{"comments": [...]}` |
● L19  | | DELETE | /api/articles/{slug}/comments/{id} | required (comment author) | – | 200 |
● L20  | | POST | /api/articles/{slug}/favorite | required | – | 200 `{"article": {…, "favorited", "favoritesCount"}}` |
● L21  | | DELETE | /api/articles/{slug}/favorite | required | – | 200 `{"article": {…}}` |
● L22  | | POST | /api/profiles/{username}/follow | required | – | 200 `{"profile": {…, "following": true}}` |
  L23  | 
  L24  | ## Errors
  L25  | 
● L26  | | Case | Status | Body |
  L27  | | --- | --- | --- |
● L28  | | Validation / taken values | 422 | `{"errors": {"<field>": ["<message>", …]}}` |
● L29  | | Missing / invalid token; wrong login credentials | 401 | error body |
● L30  | | Authenticated but not permitted (not the owner) | 403 | error body |
● L31  | | Resource not found | 404 | error body |
  L32  | 
```
