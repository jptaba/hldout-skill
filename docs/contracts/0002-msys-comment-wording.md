# Contract 0002 — No install path in the MSYS comment

## Inputs
- A review of 589a033 noted that the comment on `unmangleMsysPath` (`.github/scripts/core/cli.ts`) spells out
  `C:/Program Files/Git/…`, which reads as a machine path, against the project rule "no machine paths".

## Outputs
- The comment names the Git install folder as `<git>` instead of a drive path. The code (the regexes that recognise
  the rewritten forms) is unchanged.

## Proof
- `git diff` touches comment lines only; the project's proof steps (`agentctl verify --contract
  docs/contracts/0002-msys-comment-wording.md`): exit 0.

## Done when
- `grep -n "C:/Program Files\|C:\\\\Program Files" .github/scripts/core/cli.ts` finds no comment line.

## Bad result looks like
- Any change to the code of `unmangleMsysPath`, or another file touched.
