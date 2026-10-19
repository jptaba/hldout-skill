# Contract 0011 — Round 38 fixes: stray words refused; `confirm` never changes what code means

## Inputs
- Round 38, TOOL-5: the triager passed `--evidence P19 P20 … P30` unquoted, as its agent file's example suggested;
  the command kept P19 and dropped the other words without a word, so only one probe report was kept.
- The review of ca8a688 (`heldout confirm`): three rare inputs where removing a mark changed what code means — a code
  line holding only a multiplication operator before a line comment was deleted; an emptied block comment spanning
  lines between code on both sides joined two statements; a regular expression right after `if (…)` was read as a
  division.

## Outputs
- `CommandSpec.words` (core/cli.ts): the most words a command reads besides its flags, 1 when not given; `show` 3,
  `trace` and `api-probe` 2, and 0 for the commands that read none (init, update, doctor, accounts, inspect,
  mcp-probe, precommit). The dispatcher refuses more, saying a value with spaces goes in quotes. A test checks that
  every command declares exactly as many words as it reads (`_[n]`, a destructured `_`), and that none reads them in a
  way the check can't count.
- The triager's agent file shows `--evidence "P7 P8: …"` as one quoted value.
- `confirm`: a line left holding only `*` goes only when every `*` left on it lies inside a comment's own span; an
  emptied block comment spanning lines between code on both sides stays (empty); the `)` of an if/while/for/with (or
  `for await`) condition lets a `/` open a regular expression, and a keyword used as a property (`x.if(…)`) is none.

## Proof
- `tests/dispatcher.test.ts`: the declared words cover what each command reads; `note KEY --remark two words` is
  refused with the reason. `tests/confirm.test.ts`: the three inputs above keep their meaning.
- The project's proof steps (`agentctl verify --contract docs/contracts/0011-round-38-fixes.md`).

## Done when
- The findings no longer reproduce.

## Bad result looks like
- A command that took its words before now refused; any code changed by `confirm`.
