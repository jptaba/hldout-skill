# Contract 0008 — GM4: developer tools in dev/, answer keys pinned

## Inputs
- `docs/governance-plan.md`, work package GM4 and gaps G8 and G9: developer code sits in `demo/` with the demo's data;
  the answer keys must not change after a round has used them, and nothing enforces that.

## Outputs
- `dev/round.ts`, `dev/inflight.ts`, `dev/score.ts` (moved from `demo/`, content unchanged but for their own names);
  `demo/` keeps the stories, answer keys, scorecard and `RUNNING-LOCALLY.md`, and holds no code.
- `dev/answer-keys.ts`: each key's SHA-256 (of its text with LF line endings) in `demo/answer-keys/HASHES`; `--pin`
  writes the pins, no argument checks them. `dev/score.ts` refuses to score when a key doesn't match its pin, and
  each story's section of the scorecard names its key's hash.
- `tests/answer-keys.test.ts`: every key matches its pin; an edited, an unpinned and a removed key are each caught;
  CRLF is no change. `tests/agent-kit.test.ts`: no file in `dev/` or `demo/` is shipped, and `demo/` holds no code.
- Every reference to the moved tools updated (AGENTS.md, README, `demo/RUNNING-LOCALLY.md`, the round auditor in
  both apps, the plans' present-tense sections, `tsconfig.json`, `tests/inflight.test.ts`); `.agents/config.json`
  puts `dev/answer-keys.ts`, `dev/score.ts` and `tests/answer-keys.test.ts` in the guardrail tier with the keys.

## Proof
- The tests above; the project's proof steps (`agentctl verify --contract
  docs/contracts/0008-gm4-dev-folder-and-pinned-keys.md`): exit 0.

## Done when
- `git ls-files demo | grep '\.ts$'` prints nothing, and `npx tsx dev/answer-keys.ts` passes.

## Bad result looks like
- An answer key's content changed; a maintainer file shipped by `init`/`update`; a reference to `demo/*.ts` left in a
  present-tense instruction.
