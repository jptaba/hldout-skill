# Feature Specification: A secret in its encoded forms

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-04 | **Status**: Draft

**Input**: round 45, PB-2: `heldout trace KEY SCN-x --network` printed a sign-in's form body with the account's password form-encoded. A form encodes `!` as `%21`, and the run's scrub, the check for what is left and the trace's mask knew at most `encodeURIComponent`'s form, which keeps `!`. A generated password holds such symbols by design (`strongSecret`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A known secret is out in every form (Priority: P1)

**Independent Test**: unit tests of the scrub on text files and archives; `heldout trace` on a project with a trace holding the value.

**Acceptance Scenarios**:

1. **Given** a secret known to a run, in a form body (`%21`, `%40`, `+` for a space, either case of hex), an address or a JSON string, inside a text artifact, an attachment, a trace archive or the HTML report's archive, **Then** the run's scrub and `heldout scrub` take it out, and `heldout scrub --check` finds it while it is there.
2. **Given** the same value in a trace, **Then** `heldout trace` shows it in none of its forms, in an address, a body sent, an answer, a step or the console.
3. **Given** a form body or an address's query with a field that holds a secret by its name (`password=…`), its value unknown to the run, **Then** `heldout trace` hides it by that name, as it does in JSON; `author=…`, `passenger=…`, `remember_token=true` and the like stay readable as `redact` leaves them.
4. **Given** a secret in `api-probe`'s, `inspect`'s or the browser walk's report, **Then** the same forms are taken out there; `heldout precommit` and `doctor` refuse or report a file holding any of them, and `heldout map` an entry.
5. **Given** a file `heldout scrub --check` flags, **Then** `heldout scrub` clears it: the two read the same files.

## Requirements *(mandatory)*

- **FR-001**: US1.1 to 1.5 as stated, from one list of forms in `core/redact.ts`: as written; percent-encoded by an address, a form or a strict encoder, each with `+` for a space and in lower-case hex; escaped once or twice in JSON; as a table cell or HTML writes it. A form weaker than `scrubbable` isn't in the list, so none rewrites ordinary text.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for US1.1 to 1.3 and 1.5; US1.4 by reusing the same list.

## Assumptions

- Forms other than those listed can stay, such as a value base64-encoded by an application, percent-encoded twice or in mixed-case hex.
- `heldout scrub` and `heldout trace` know the `${env:…}` values and `--value`, not `${vault:…}` ones: a run knows those and scrubs its own artifacts, so what stays is a value in an older artifact (`--value` clears it).
- By its name, `trace` hides `name=value` text in addresses, bodies, steps and the console, up to what ends a field (a value it doesn't know that holds an unencoded quote, `&` or a space shows its rest; `;`, `?` or `#` only before another field); not a name in an address's path (`/password=x`), a multipart or XML body, a quote that never closes, nor a query encoded inside another value. A secret field's value may hide a readable field that follows without a separator it knows.
- A secret no run knows, under a harmless name, can't be told from text.
