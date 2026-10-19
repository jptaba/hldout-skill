# Contract 0006 — GP5 review follow-ups

## Inputs
- The low findings of the GP5 reviews (fd74e2f):
  - `stats --aut <profile>` without a KEY lists every profile's stories, so the flag looks like a filter but isn't.
  - A line in a story's probe log that is valid JSON but not an object (`null`) stops `stats` for every story.
  - No test for a key found through the profile it is bound to; the README row lacks `--aut`; a refactor-plan line
    names the removed `demo/round.ts stats` without saying what replaced it.

## Outputs
- `--aut` keeps only that profile's stories, with or without a KEY.
- `readProbes` (core/probe-log.ts) keeps only JSON-object lines, as `readHistory` does.
- Tests: a key in two profiles without `--aut` asks which; a key in one non-default profile is found; `--aut` alone
  filters; a probe log with `null` and `[2]` lines still reads. README and refactor-plan wording updated.

## Proof
- `tests/stats.test.ts` with the cases above.
- The project's proof steps (`agentctl verify --contract docs/contracts/0006-gp5-follow-ups.md`): exit 0.

## Done when
- The findings no longer reproduce.

## Bad result looks like
- Any GP5 behaviour the existing tests pin changed; a probe that was counted before no longer counted.
