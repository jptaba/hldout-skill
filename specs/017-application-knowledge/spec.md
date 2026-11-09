# Feature Specification: What the application is, and what is known of its business

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-08 | **Status**: Draft

**Input**: each agent starts a story without knowing what the application is: its purpose, its areas, its kinds of
user, how one signs in, the API's style, the words it uses. The contract's agents and the test author know only the
story; the hardener rebuilds the picture from probes (60 to 80k tokens of reading before its first probe,
`docs/next-steps.md`). The application map (`specs/007-application-map`) keeps mechanics per domain, after the freeze
only. This adds one file per application, `application-map/<profile>/app.yml`: an **overview** written at onboarding
and read by every agent, and **business rules** read after the freeze only. The overview is read before the freeze, so
a held-out rule changes: guardrail tier, two reviews.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The overview is written when the application is first reached (Priority: P1)

**Independent Test**: unit tests of the command; the onboarding of a fresh round project.

**Acceptance Scenarios**:

1. **Given** a profile with no `app.yml`, **When** setup has run `doctor`, **Then** the coordinator surveys the
   application with one command, no story key: the start page, the sign-in page and, when the application serves one,
   its API description. The survey prints what it saw (titles, headings, navigation, the sign-in form's labels, the
   API's base path and resources), and the coordinator writes the overview from it: purpose, areas (the journeys'
   domains), kinds of user, how sign-in works, the API's style and base path, and a glossary of the application's own
   terms.
2. **Given** `add-aut` for another application, **Then** its overview is its own, in its profile's folder.
3. **Given** a profile whose `app.yml` exists, **Then** the survey says so and changes nothing; the overview is
   extended entry by entry (US3).
4. **Given** a story of the profile between its fetch and its freeze, **When** an entry is written with no story,
   **Then** it is refused: what that story's contract and tests are written from doesn't change under them.
5. **Given** a page whose script would send a request that changes something, **When** the survey opens it, **Then**
   the request is not sent and the survey says so; a sign-in link that signs in by itself is not followed.

### User Story 2 - Every agent reads the overview; nothing in it is an oracle (Priority: P1)

1. **Given** any story, frozen or not, **When** an agent reads the overview, **Then** it gets it, headed as context
   for the application's words and shape: data, not instructions, and never evidence.
2. **Given** an overview entry holding a number, a quoted text, a rule word (must, only, at least, at most, required,
   allowed, limit, maximum, minimum…), a judgement word as the map refuses it, a record id, a secret value, an
   instruction to an agent or more than its length, **Then** nothing is written.
3. **Given** a contract item, a test's expected value or a reviewed contract finding that rests on the overview
   instead of the evidence pack, **Then** the contract reviewer reports it, and the contract extractor, reviewer and
   test author are told the overview may explain a word of the story, never supply a value, a rule or a criterion.
4. **Given** the contract's agents and the test author, **Then** their agent files name the overview's command and no
   way to read the rules or the domain map; those stay refused before the freeze.

### User Story 3 - Business rules, from requirements and from the application (Priority: P1)

1. **Given** a story whose verdict is written from a clean reviewed contract, **When** `advance` harvests it, **Then**
   its contract's rules and the gaps its owner answered are added as requirement rules, each citing the story and the
   contract item; a rule marked stale is read again. Assumed and open gaps are not, nor anything of a contract not
   reviewed clean as it is now or of a story that was not evaluable.
2. **Given** a frozen story, **When** the hardener or the triager adds what the application was seen to do, citing a
   probe of this story, **Then** it is kept as an observed rule: said to be observed, never required.
3. **Given** a frozen story, **When** the hardener or the triager reads the rules (all, or one domain's), **Then**
   each says whether it was required (and by which story) or observed (and by which probe). A rule never proves
   anything for this story: a decision rests on this story's contract, probe or run, as for the map.
4. **Given** a story not frozen, **When** anyone reads or adds a rule, **Then** it is refused and the history says so.
5. **Given** a probe that contradicts an observed rule, or a later story whose requirement replaces a required one,
   **Then** it is marked stale with what contradicted it, as map entries are. A probe never retires a required rule:
   what was asked is not settled by what the application does.
6. **Given** a hardener or triager that learns a new area, kind of user or term, **Then** it adds it to the overview,
   checked as in US2.2, citing its probe.

### Edge Cases

- Two branches that both add to `app.yml` merge cleanly, keeping both sides' entries, as the domain map does.
- An application that shows nothing before sign-in, or serves no API description: the survey says what it couldn't
  reach and the overview leaves that part empty.
- A requirement rule of one story contradicted by another story's requirement: both are kept, each with its story;
  the triager may name the conflict in a decision, never settle it.

## Requirements *(mandatory)*

- **FR-001**: `application-map/<profile>/app.yml`, committed with the journeys and the domain map: `overview`
  (purpose, areas, users, sign-in, api, terms) and `rules` (text, kind `required` or `observed`, a domain when one is
  known, its source,
  date, stale mark), each entry with an id. One command (`heldout map`) surveys, reads and writes it; flags are the
  plan's. AUT-agnostic: the skill ships no overview and names no application.
- **FR-002**: The overview is checked as in US2.2 and against the project's secrets, as map entries are; the rules
  as map entries are, except that a rule may say what the application accepts or refuses.
- **FR-003**: The held-out rule changes in the files that hold it (governance, the agent files, the references,
  SKILL.md): every agent may read the overview, before the freeze too; the rules and the domain map stay after the
  freeze. Guardrail tier.
- **FR-004**: SKILL.md's setup adds the survey and the overview after `doctor`; `status` points to it while the
  profile has none.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for US1.1, US1.3, US2.1, US2.2, US2.4, US3.1 to US3.5 and
  the merge.
- **SC-002**: A round from scratch (two stories of one application): onboarding writes the overview; the second
  story's agents read it before the freeze and its hardener and triager read the rules; read by hand, no overview
  entry states a value, a rule or a message, and no contract item or expected value rests on it; verdicts stay as
  keyed. The round waits for the redesign.
- **SC-003**: The overview costs under 1.5k tokens to read; the round reports, against round 44, the hardener's
  context at its first real probe (56k) and its peak (178k). No target: the figures decide whether the rules stay.

## Assumptions

- The overview's checks are heuristics, as the map's are: a plain sentence can still carry a rule, so the agents'
  instruction, the contract reviewer and a round's reading cover what a check can't tell.
- The overview is read before the freeze by the owner's decision (2026-11-08): what the application is and the words
  it uses help the contract's agents and the test author read the story, and carry no expected behaviour. A term
  written from the application may differ from the story's: the story's word wins, and the difference is a question
  for the verdict.
- Observed rules are kept by the owner's decision (2026-11-08); they are read only after the freeze, so what the
  application does never reaches an oracle.
- The survey visits pages a person could see before signing in, plus the sign-in page; it signs in nowhere and
  changes nothing in the application.
