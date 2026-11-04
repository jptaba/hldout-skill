# Probing the application

For the hardener and the triager: what `heldout inspect` shows and can do, and how to build on a probe instead of
writing a script.

## Compose probes instead of writing scripts

Every question a script would answer has an option:

| You need | Use |
|---|---|
| A walk as a signed-in user | `inspect --sign-in <role or user name>`: the profile's recorded UI sign-in of an existing account, in front of your steps |
| An earlier walk again, or its start | `inspect` / `mcp-probe --from P4` (its steps) or `--from P4:5` (its first 5), then `--then '<step>'` (repeatable) or `--steps <file>` (repeatable, in order) |
| An earlier chain with one value changed | `api-probe --chain P7 --set 2.json.country=AT --set 2.expect=422` (step number, dotted field, a JSON or text value) |
| The ids an earlier chain or walk made, in a later chain or walk (to check or clean them up) | `api-probe --chain cleanup.json --vars-from P7` (`${name}`), `inspect --vars-from P7` or `mcp-probe --vars-from P7` (`${var:name}`): what P7 saved. A walk saves with `inspect --save qid="POST /messages:id"` (a field of the answer the page got) |
| Every page of a list | `api-probe GET products --pages page` (stops at an empty page or `last_page`) or `--pages page=1..5` |
| Some items of a list, or how many | `--where 'category.name~^Hand'` (repeatable), `--pick price` (repeatable), `--count` |
| A text of exact length, or the time | `${text:256}` (starts with the profile's data prefix), `${now}`: in a path, a body or a chain value |

A question no option answers is a tool gap: say so with `heldout note KEY --tool-gap "<what you needed>"`, and work
around it as narrowly as you can.

## What the inspector shows and does

`heldout inspect` suggests, in order: role and name, label, placeholder, test id, a stable id, then the field's `name`
attribute. An id that looks generated (a UUID, a long number) changes on every page load: it is offered last, flagged. Read-only
text with a stable id (a detail page's fields, a total, a message) is listed in a table of its own. The report also lists
the API calls the page made on the app's site (method, path, status and the answer's shape, types only): how the UI
does what it does, e.g. which call returns the signed-in user's id when the documented sign-in call doesn't. And it
lists what the page keeps in `localStorage` and `sessionStorage` (a guest's cart id, a flag): where a UI journey finds
or sets the page's state, without a script of your own.

`heldout inspect` steps wait for an address with `{ "do": "wait", "target": "url:/search" }`, the same form as an accounts
recipe's `done`. Hash routes work as `--url "#/login"`, also under Git Bash.

A journey that submits what a page doesn't offer (a value missing from a list, another user's record) is proven with
the inspector before any run: `{ "do": "force", "target": "<the control>", "value": "2" }` gives a control the value,
`{ "do": "rewrite", "url": "<part of the address>", "value": "field=value" }` changes those fields of the page's next
request, and the report lists the requests it rewrote. `{ "do": "request", "url": "POST <path>", "value": "<JSON>" }`
makes a call in the middle of a walk (a record another user changes while the page is open). A step that changes
the address says where it landed ("now at /overview"). A `request` step carries the page's cookies: for an
application that keeps its token in the browser's storage, the call is sent without it (use `api-probe` with a
sign-in for those).

Under Git Bash, pass paths without a leading `/` (`--url cart`, `api/room`): MSYS rewrites `/…` arguments into Windows
paths. A regex with a backslash doesn't survive `--then` there: put the step in a `--steps` file, with the backslash
doubled, as the file is JSON.
