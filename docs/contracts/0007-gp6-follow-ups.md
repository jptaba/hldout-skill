# Contract 0007 — GP6 review follow-ups

## Inputs
- The low findings of the GP6 reviews (13b2096):
  - When Vault is late, `heldout precommit` ends the process at once, which can cut short the refusal list written
    through buffered stdout/stderr on a pipe.
  - A Vault failure that throws (rather than returning its problems) is reported as "heldout.config.json not read".
  - The 5-second Vault wait has no test.

## Outputs
- `precommit` writes its report synchronously, so the whole report is out before the process ends.
- The config and Vault are caught apart: a Vault failure is reported as "Vault values not checked: …", and the
  output folder read from the config is kept.
- A test against a local server that accepts and never answers: the check ends within about 5 seconds, says Vault
  didn't answer, and still refuses a staged `.env` value with its full report.

## Proof
- `tests/precommit.test.ts` with the new case; the existing ones unchanged.
- The project's proof steps (`agentctl verify --contract docs/contracts/0007-gp6-follow-ups.md`): exit 0.

## Done when
- The findings no longer reproduce.

## Bad result looks like
- A secret value printed; a commit allowed that the GP6 tests refuse; the hook waiting for Vault past 5 seconds.
