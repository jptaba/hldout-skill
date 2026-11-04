# Feature Specification: No saved secret in a report

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-04 | **Status**: Draft

**Input**: the review of `specs/013-say-what-was-left-out` found a chain's report can show a value its log doesn't keep: `redact` knows fewer field names than the check on saved values, and a later step's path or body shows a saved value filled in. A cited probe's report is kept in the story's record, which a project commits. The owner decided to fix it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A report holds no saved secret (Priority: P1)

**Independent Test**: chains against a local server, reading the report and the log; unit tests of `redact` and the scrub.

**Acceptance Scenarios**:

1. **Given** a field named `jwt`, `auth`, `oauth`, `sessid`, `pwd`, `bearer`, `credentials` or an access or private key, in an answer or read by its path (`show`, `expectBody`, `--pick`), **Then** `redact` hides it; `author`, `authority`, `authenticated`, `authorized`, `authType`, `assessment`, `credentialType`, `passenger`, `keyword`, a bare `key` and any boolean stay readable.
2. **Given** a chain that saved a secret (by the name it's saved under, its field, or its shape), every value it had under that name, in each of a parallel step's answers and among a list's or an object's values, **Then** that value is out of the report, the digest and the log, in the forms an address, a form body, a JSON string, HTML or a header give it, before anything is clipped; and a saved value holding it isn't kept, which the report says. Replacing leaves an answer JSON, so `redact` still reads it, and no ordinary text is rewritten by a form of a value.
3. **Given** the same from `inspect --save`, **Then** it is out of the report, the digest and the log, except as the Assumptions say.
4. **Given** a saved value the wide check leaves out of the log but that isn't a secret by those tests (`author` = `Jane Doe`, `issueKey` = `ABC-123`), **Then** it stays in the report: replacing it would rewrite the evidence.
5. **Given** a secret too short or plain to replace, **Then** it stays, and the report and the digest name it, not its value. What was taken out is named too, so a reader knows why a `***redacted***` is there.

## Requirements *(mandatory)*

- **FR-001**: US1.1 to 1.5 as stated. A value is replaced if `safeToScrub` allows it or it has 16 characters or more.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for each; `inspect`'s path by a source check, as a live walk needs a browser.

## Assumptions

- `inspect` learns a value only at the end of its walk, after its report's lines were clipped (between 60 and 300 characters, 20,000 for `--html`, or `--body-limit`): a value cut there can leave its first part, in page text, a locator's text or a call's answer. It knows only the last answer of a call. A chain's step before the one that saved a value has the same limit, at its 300.
- A secret under a harmless name from a harmless field, of no token's shape, can't be told from text, here or in the log. Under a name only the wide check knows, a value under 16 characters, with a space, without both a letter and a digit, or that is a UUID or an address, stays in the report and out of the log; the report says it isn't kept, not that it is still there. A date stays in the report under any name. An ordinary value of a token's shape under such a name is replaced, and the report says so.
- `show: ['x|jwt']` decodes what it is given and hides the signature: a saved secret was replaced first, so it shows as replaced; the claims of an unsaved token are shown, as they are asked for.
- Forms other than those `formsOf` lists can stay, such as a value hex-encoded twice.
