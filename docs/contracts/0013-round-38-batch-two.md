# Contract 0013 — Round 38, second batch: walks carry their values; journey comments say HOW; channel rule refined

## Inputs
- Round 38, PB-1: the hardener walked a sign-up with `--var user=…`, then started the next walk `--from Pn`; its steps
  name `${var:user}`, but the values did not come along, so the walk had to repeat every `--var` (a tool gap).
- Round 38, PB-2: a shared journey's comment, written while hardening PB-1, said the bank's API "takes no credentials
  on this build". PB-2's test author reads the journeys before writing tests, so what the application does reached a
  held-out author.
- The review of contract 0012 (bff0689): a table of cases needn't run in both channels; an out-of-scope line or an
  answered gap can confine a refusal to a channel, as a rule or criterion can; which criteria a channel rule reaches.

## Outputs
- `walkVars` (probe/compose.ts): a walk's values are those of the walk it starts from (`--from Pn`), with its own
  `--var` over them. `inspect` and `mcp-probe` use it and record the values with the walk (`input.vars`) for the next
  one; `inspect`'s chain values (`--vars-from`) stay underneath. The commands' leading comments say so.
- `references/journeys.md`: a journey's comments say HOW, never what the application did or failed to do; what
  hardening observed goes in its log. `references/hardening.md`, observed deviations: the log only, never a journey's
  comments.
- `references/test-authoring.md`, rule 1: a rule naming channels reaches every criterion of the feature it names
  unless the requirement scopes it otherwise (when unsure, it reaches); a table of cases runs in the channel whose form
  the criterion gives (the API when it gives none), the other channel gets one test per kind of refusal, at the value
  just past the limit; an out-of-scope line or answered gap can confine a refusal, as a rule or criterion can.
- A `--var` without `name=` is refused (it was skipped silently before); `walkInput` puts the values in a walk's
  logged input, tested apart from the commands. A `--var` value is logged as given, so the commands' comments say a
  secret goes in as `${env:…}`; inspect's says a walk `--from Pn` needs its `--vars-from` again.

## Proof
- `tests/compose.test.ts`: a walk `--from Pn` starts with Pn's values, its own `--var` winning; none without `--from`.
- The project's proof steps (`agentctl verify --contract docs/contracts/0013-round-38-batch-two.md`).
- Round 38's next stories (PB-3, TOOLB-1/2) run with the updated skill.

## Done when
- The PB-1 tool gap no longer reproduces, and the references say the above, with no new command or flag.

## Bad result looks like
- A walk's values changing what an explicit `--var` says; a recorded value that is a secret (`${env:…}` stays a
  reference: only the flag's text is recorded); any other held-out rule changed.
