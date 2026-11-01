# Test accounts: set up once per application

Most stories need a signed-in user. How tests get one is written once, in the AUT profile
(`heldout.config.json` → `auts.<id>.accounts`), and `seed.account()` / `signIn()` use it in every story on that
application. How a test uses them: [data-and-journeys.md](data-and-journeys.md) §4a. Pick the way that fits the
application and your permissions:

| The application… | Accounts | Set up |
| --- | --- | --- |
| lets tests create and delete users | created per test, deleted afterwards | saved while hardening the first story: `heldout accounts --key KEY --from-chain <probe chain>` |
| lets tests create users, but not delete them | created per test, kept (tagged `hldout-…` by name) | the same, from a chain without a DELETE step |
| makes users only on its sign-up page (no API for it) | created per test in a browser of their own, kept | `heldout accounts --sign-up-json … --sign-up-path … --lookup …` (below) |
| can't create users, or you may not | **existing** accounts someone already made | `heldout accounts --add-existing …`, once per account |

**Existing accounts.** The user name may be literal. A password is always a reference, because the config file is
committed:

```bash
# password in .env (git-ignored) or a CI variable
npm run heldout -- accounts --aut <profile> --add-existing --username qa.user1@example.com --password-env APP_PASSWORD_1
npm run heldout -- secret APP_PASSWORD_1 --ask          # the user types it at a hidden prompt, in their own terminal

# both in HashiCorp Vault (VAULT_ADDR in .env; `vault login` once, or VAULT_TOKEN, or AppRole)
npm run heldout -- accounts --aut <profile> --add-existing --username-vault secret/qa/app#user1 --password-vault secret/qa/app#password1
```

Add as many as the suite needs. Each parallel worker gets its own share, so no two tests use the same account at
the same time, and `heldout run` never starts more workers than there are accounts. A test that calls `seed.account()`
twice (a second user) gets the next account of its share: record that with `heldout accounts --aut <profile> --per-test 2`,
and runs start half as many workers. Existing accounts are never deleted, and data a test adds
to them stays unless something removes it. When the application has a call that restores an account (empty its
cart, clear its collection), save it once as the recipe's `reset`: it runs, with the account's token, when a test
takes the account (so a crashed earlier run leaves nothing behind) and again after the test (the seed ledger shows it).
Without one, undo what the test added with `seed.track(…)`.

```bash
npm run heldout -- accounts --aut <profile> --reset 'DELETE /api/cart?userId=${id}'
```

**Kinds of users (roles).** When stories need different kinds of users (an administrator, a customer, a second
customer), give each existing account its role; a test asks for the kind a step needs:

```bash
npm run heldout -- accounts --aut <profile> --add-existing --username admin@example.com --password-env ADMIN_PASSWORD --role admin
npm run heldout -- accounts --aut <profile> --add-existing --username customer1@example.com --password-env CUSTOMER1_PASSWORD --role customer
npm run heldout -- accounts --aut <profile> --add-existing --username customer2@example.com --password-env CUSTOMER2_PASSWORD --role customer
```

A role works next to accounts the tests create: `seed.account()` without a role still creates one, and
`seed.account('admin', { role: 'admin' })` takes an existing administrator. Each worker gets its own share of every
role, so `heldout run` starts no more workers than the scarcest role has accounts (one administrator: one worker).
An account that only acts on other records (an administrator who manages the catalogue or answers customers) can be
marked as shared, and then serves every worker and sets no limit: add `--shared` to its `--add-existing` line. Use it
only when the tests never change the account itself and the application keeps earlier sign-ins valid when the account
signs in again (two tokens of the same account both work: check with a probe chain of two sign-ins and a call with
the first token). A story of forty tests that all need the one administrator then runs on several workers.
When the profile's accounts have roles, the lint warns about a `seed.account()` that names none.

**Signing in.** `token` signs an account in over the API (`token` is where the answer carries it; `id`, optionally,
where it carries the account id). When the sign-in answer has no id, `lookup` is a call made after signing in (a
"who am I", with the auth header) whose `id` is where its answer carries it; in a probe chain, a step saving `id`
after the step saving `token` becomes the lookup. `signIn` is the UI sign-in. Both come from what hardening already probed: an
`api-probe --chain` whose sign-in step saves `token` (`heldout accounts --from-chain`), and the `inspect` steps of the
login form (`--sign-in-json … --sign-in-path /login --sign-in-done url:/profile`).

```json
"accounts": {
  "existing": [
    { "username": "qa.user1@example.com", "password": "${env:APP_PASSWORD_1}" },
    { "username": "${vault:secret/qa/app#user2}", "password": "${vault:secret/qa/app#password2}" }
  ],
  "token":  { "method": "POST", "path": "/api/login", "body": { "userName": "${username}", "password": "${password}" }, "token": "token", "id": "userId" },
  "authHeader": "Authorization: Bearer ${token}",
  "signIn": { "path": "/login", "steps": [
    { "fill": "getByLabel('User name')", "value": "${username}" },
    { "fill": "getByLabel('Password')", "value": "${password}" },
    { "click": "getByRole('button', { name: 'Sign in' })" } ], "done": "url:/profile" }
}
```

`done` is how the sign-in is known to have worked: an address (`url:/profile`) or a locator that becomes visible. When
kinds of users land in different places, name the alternatives with ` | ` between them (`"url:/account | url:/admin"`).

For accounts the tests create, the recipe instead has `password` (a reference), an optional `username` template
(`${uid}` is unique), `create` (`id` is where the answer carries the new account's id) and, if the application
allows it, `delete`: from a chain, the DELETE on the account whose `expect` is a 2xx (a DELETE step without one
only probes whether the application allows it, and makes no `delete`). Strings may use `${username}`, `${password}`, `${id}`, `${token}`, `${uid}`, `${env:NAME}` and
`${vault:path#field}`.

When the sign-up page is the only way to make an account, save the form (the `heldout inspect` steps that fill it:
`${var:…}` becomes the new user name, a secret reference the password) and how to read the new account's id:

```bash
npm run heldout -- accounts --aut <profile> --sign-up-path register --sign-up-done "getByText('Your account was created')" \
  --password-env APP_USER_PASSWORD --sign-up-json '<inspect steps>' \
  --lookup 'GET api/login/${username}/${password}' --lookup-id id
npm run heldout -- accounts --aut <profile> --check --create     # makes one account on the page, reads its id, signs in
```

`seed.account()` then fills the sign-up page in a short-lived browser of its own before the test, so the test's page
starts signed out and `signIn(page, me)` works as usual.

Some applications need a value before an account can be made or signed in: a CSRF token, or a valid security-question
id for the sign-up form. List those calls in `before`; each `save`s values from its answer for the calls after it. A
chain step before the create or sign-in step whose saved value those steps use becomes a `before` call automatically
(`heldout accounts --from-chain`). A value that is exactly `"${name}"` keeps its JSON type, so a saved number is sent as
a number.

```json
"before": [{ "method": "GET", "path": "/api/questions", "save": { "qid": "data.0.id" } }],
"create": { "method": "POST", "path": "/api/users", "id": "data.id",
            "body": { "email": "${username}", "password": "${password}", "securityQuestion": { "id": "${qid}" } } }
```

`heldout accounts --check` and `heldout doctor` check the recipe live. They sign each existing account in, or
create → sign in → delete. With no `delete`, nothing is created unless `--check --create`. `heldout run` reads
Vault once before the tests, hands the values to the test process in memory only, and scrubs every account secret
from the run artifacts.

A created account's cleanup reuses its token and takes a fresh one only when the delete answers 401 or 403. A cleanup
that returns an HTTP error answer is recorded as failed, and `heldout run` lists it as data left behind.
