# Contract 0009 — GM4 review follow-ups

## Inputs
- The low findings of the GM4 reviews (efadaaa):
  - The root `tsconfig.json`, which `init`/`update` copy to every adopter, names the maintainer-only `dev/**/*.ts`; a
    project with its own `dev/` would have it pulled into its typecheck.
  - The kit test that keeps files in the guardrail tier doesn't name the answer keys' pin tooling.
  - `dev/score.ts` looks a key's pin up by its `key` field, not by the file it was read from.
  - Two lines in `HASHES` for one key are accepted silently.
  - AGENTS.md doesn't say who enforces the ADR for a key change.

## Outputs
- The root `tsconfig.json` names no maintainer folder; `tests/tsconfig.json` (maintainer-only) typechecks `dev/`.
- `tests/agent-kit.test.ts` keeps a key, `HASHES`, `dev/answer-keys.ts`, `dev/score.ts` and
  `tests/answer-keys.test.ts` in the guardrail tier.
- `dev/score.ts` takes each key's pin by its file; `pinProblems` reports a key pinned more than once.
- AGENTS.md: the proof catches a missing pin, the reviewers check for the ADR.

## Proof
- The tests above; `npm run typecheck` still covers `dev/` (through `tests/tsconfig.json`); the project's proof steps
  (`agentctl verify --contract docs/contracts/0009-gm4-follow-ups.md`): exit 0.

## Done when
- The findings no longer reproduce.

## Bad result looks like
- A file in `dev/` no longer typechecked; an answer key's content or pin changed.
