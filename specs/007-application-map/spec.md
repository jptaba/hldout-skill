# Feature Specification: A map of how an application works

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-03 | **Status**: Draft

**Input**: journeys keep what a later story can call, but not what a hardener or triager learned about how the application
behaves (an answer's shape, which call a page makes, a wait a page needs). Each new agent starts without it. Kept per
application and domain, each entry citing the probe that proved it, and read only after the freeze. Measured before
building: a second story's hardener takes about 8.5% of its peak from probes (`docs/next-steps.md`), so this is built to
give agents that knowledge first; what it saves is reported, not promised.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A later story starts from what earlier ones proved (Priority: P1)

**Independent Test**: unit tests of the command; a round of two stories of one application from scratch.

**Acceptance Scenarios**:

1. **Given** a frozen story, **When** a hardener or triager adds a mechanic for a domain citing a probe of this story,
   **Then** it is kept for the application with its story, probe and date, and the probe's report is kept in the record.
2. **Given** a later frozen story of that application, **When** an agent reads a domain, **Then** it sees that domain's
   entries only, said to be data and a starting point.
3. **Given** a story not frozen, **When** anyone uses the command in any form, **Then** it is refused and the history
   says so.
4. **Given** text with no probe cited, an unknown probe, a secret value, an instruction to an agent, a run's record id, a
   judgement of the application (a defect, what it should do) or more than 400 characters, **Then** nothing is written.
5. **Given** a probe that contradicts an entry, **When** it is marked stale citing that probe, **Then** reading no longer
   shows it and the file still holds it, with what contradicted it.
6. **Given** a triage decision of any category that names a map entry and no probe, or any other evidence (a confirmed
   guess, a resolved gap) that names an entry and neither a probe nor a run of this story, **Then** it is refused.
7. **Given** another application of the project, **Then** its map is not this one's.

## Requirements *(mandatory)*

- **FR-001**: `heldout map KEY` lists the domains; `--domain D` reads one; `--add "…" --evidence Pn` adds; `--stale <id>
  --evidence Pn` marks stale. Kept per application outside the journeys and the story's record, committed like them;
  two branches adding to one domain merge cleanly. A flag left empty is refused, never read as something else.
- **FR-002**: The hardener and the triager read the domains they work on, add what a later story would otherwise
  discover again and no journey holds, and mark what they contradict. An entry never proves anything for this story: a
  guess confirmed, a gap resolved or a decision still rests on this story's probe or run.
- **FR-003**: The contract extractor, contract reviewer and test author are told never to read the map, and their agent
  files name no way to; the command refuses before the freeze. A file tool can't be stopped: a round checks it.
- **FR-004**: The map holds mechanics only, never a defect or a judgement. A held-out rule: guardrail tier.

## Success Criteria *(mandatory)*

- **SC-001**: In a round from scratch of PB-2 then PB-1, the first story's agents add entries, each citing a probe, and
  the second story's hardener reads them.
- **SC-002**: No agent before the freeze reads the map (transcripts), and read by hand no entry states a defect, an
  expected value from a requirement or a run's record id; verdicts stay as keyed.
- **SC-003**: The report states, against round 41, PB-1's hardening and triage probes (12 and 8) and its hardener's peak
  (141k), and what reading and adding cost. No target: the figures decide whether the map stays.
- **SC-004**: Typecheck and the suite pass.

## Assumptions

- The obvious judgement words are refused; what an application accepts or refuses, stated plainly, can't be told from a
  mechanic by a check, so the agents' rule and the round's reading cover it.
- The freeze is checked per story, as for probes: naming another frozen story gets past it, so the round's transcripts
  look for `map` with any key. An entry is checked against the vault values its story and profile reference; one no
  file references can't be told from text.
- A round from scratch starts with an empty map. Entries name no environment's records, so another environment of the
  application can use them; an entry that no longer holds is found by the run and marked stale.
