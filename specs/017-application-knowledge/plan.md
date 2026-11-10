# Plan: What the application is, and what is known of its business

**Spec**: [spec.md](spec.md). Guardrail tier: two reviews. No new dependency.

## The store

`application-map/<profile>/app.yml`: a comment header, `schema: 1`, `overview:` and `rules:`, one entry per line in
YAML flow style (a JSON object, which is YAML), so `.gitattributes` merges it by union like the domain map
(`application-map/**/app.yml merge=union`): two branches that add to it keep both sides' lines and no command is
needed. Reading keeps one entry per id (the stale copy wins); a line that doesn't parse is refused on the next write,
for a person to mend. Ids come from the text (`O` + 6 hex for the overview, `B` + 6 hex for a rule), as map entries do.

- Overview entry: `id, part (purpose | area | user | sign-in | api | term), text, at, stale?`
- Rule entry: `id, kind (required | observed), text, domain?, story, source (contract items or probes), at, stale?`

## Commands (`heldout map`, `probe/map.ts`; store in `probe/app-knowledge.ts`, survey in `probe/survey.ts`)

| Form | Before a freeze | |
| --- | --- | --- |
| `map --survey [--aut id]` | no key | prints what a person sees before signing in; writes nothing |
| `map [KEY] --overview [--aut id]` | allowed | the overview, headed as context, never evidence |
| `map --about <part> --add "…" [--aut id]` | no key | onboarding writes the overview |
| `map KEY --about <part> --add "…" --evidence Pn` | refused | a hardener or triager adds what it learned (removed by `specs/018-lean-skill-one-writer`: refused after a freeze too) |
| `map KEY --rules [--domain d]` | refused | the rules, required or observed |
| `map KEY --rule "…" [--domain d] --evidence Pn` | refused | an observed rule |
| `map KEY --harvest` | refused | the contract's rules and owner-answered gaps; `advance` runs it after the journeys |
| `map KEY --stale <id> --evidence …` | refused | a map entry, an overview entry or a rule; a rule also by a contract item of this story |

Checks: the overview refuses a figure not glued to a word or a path (`10`, `24h`; `v1`, `/api/v2` pass), quoted text,
rule words, the map's judgement words, record ids, secrets, instructions, more than 300 characters. An observed rule
refuses judgements (defect, should, wrong…) but may say what the application accepts or refuses. A required rule is
the requirement's own text: only secrets, instructions and length (600) are checked; what is left out is said.

## Held-out rule

- `citeProbes` and `decisionRestsOnTheMap` treat `O…` and `B…` ids as map entries: never evidence alone.
- `checkContract` reports `rests-on-overview` when a contract names the overview (an `O…` id, `application-map/`,
  `heldout map`).
- Agent files: the contract's agents and the test author name `heldout map KEY --overview` and nothing else of the map;
  the hardener and the triager the rules (the overview's `--about` with a story was removed by
  `specs/018-lean-skill-one-writer`). `tests/agent-files.test.ts` checks both.
- Constitution I ("works from the reviewed contract only and never sees the application") still holds: the contract
  stays the only source of WHAT; the overview, like the journeys, is no view of the application's behaviour.

## Flow

`phases.ts` gains `knowledge` after `journeys` (done when `rules-harvested` names the verdict's final run); `advance`
runs `map KEY --harvest` there. `status` says when the profile has no overview. SKILL.md's setup adds the survey and
the overview after `doctor`.
