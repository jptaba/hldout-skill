# DEMO-707: Conduit — accounts, articles, comments, favourites and discovery

## Context

Conduit is our public writing platform (web app + JSON API; the contract follows the RealWorld specification — see `api-contract.md`). This story is the acceptance baseline for the platform's core: accounts, publishing, commenting, favouriting, following and discovering articles. **All published content is public**: any reader, signed in or not, must be able to discover and read any author's articles and the comments on them.

## User stories

- As a **writer**, I want to publish, edit and delete my articles, so that I control my content.
- As a **reader**, I want to discover articles by author and tag, read comments and favourite articles, so that I can follow what interests me.
- As the **platform**, I want predictable errors and safe retries, so that client apps behave consistently.

## Acceptance criteria

### Accounts & authentication (API)

- **AC-1**: `POST /api/users` with a new username, email and password responds **201** with the user (username, email, token).
- **AC-2**: Registering an email or username that is already taken responds **422** with a field-level `errors` object naming the taken field(s).
- **AC-3**: `POST /api/users/login` with valid credentials responds **200** with a token; with a wrong password it responds **401 Unauthorized** with an `errors` object.
- **AC-4**: Endpoints that require authentication accept `Authorization: Token <jwt>` and respond **401** when the header is missing or the token is invalid.

### Articles (API)

- **AC-5**: An authenticated writer can create an article (title, description, body, tagList) → **201** with the article, including a `slug`, the author and the tags.
- **AC-6**: Titles need not be unique: a writer may publish a second article with the same title, which receives its own distinct slug (**201**).
- **AC-7**: A missing title, description or body is rejected with **422** and a field-level error.
- **AC-8**: Only the author may update or delete an article. Another signed-in user gets **403**; the article is unchanged.
- **AC-9**: The author can update an article (**200**, changed fields returned) and delete it (**204**); afterwards `GET /api/articles/{slug}` responds **404**.

### Discovery (API)

- **AC-10**: Any reader filtering the article list by an author (`?author=<username>`) gets that author's published articles, including ones published moments ago.
- **AC-11**: The list supports pagination with `limit` (1–100) and `offset`. `limit` outside 1–100 is rejected with **422**; values on the boundaries are accepted.
- **AC-12**: After following an author, that author's articles appear in the reader's feed (`GET /api/articles/feed`).

### Comments & favourites (API)

- **AC-13**: A signed-in reader can comment on any article (**200**, the comment is returned). An empty comment body is rejected with **422**.
- **AC-14**: Comments are public: every reader of the article — the article's author, other users and anonymous visitors — sees all its comments in `GET /api/articles/{slug}/comments`.
- **AC-15**: Only a comment's author may delete it. Anyone else gets **403** and the comment remains.
- **AC-16**: Favouriting is idempotent: favouriting an article increases `favoritesCount` by one and sets `favorited: true`; favouriting it **again** (e.g. a double-click or retry) leaves the count unchanged; unfavouriting decreases it by one.

### Web app (UI)

- **AC-17**: A registered user can sign in on the web app's Sign in page with email and password; afterwards the navigation shows their username and a "New Article" link.
- **AC-18**: A signed-in writer can publish an article from the editor ("New Article"); the article page then shows the title and body, and the article is available from the API under its slug.
- **AC-19**: An anonymous visitor sees "Sign in" and "Sign up" links in the navigation.

## API contract

See `api-contract.md` (endpoints, envelopes, error format).

## Test data

Tests create their own users through `POST /api/users` (usernames must start with `qa`, e-mails at `example.com`). Accounts cannot be deleted through the API; created users are left in place (they are uniquely named and harmless). Articles created by tests should be deleted afterwards.
