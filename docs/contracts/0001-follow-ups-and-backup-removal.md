# Contract 0001 — Review follow-ups, and the stray backup archive removed

## Inputs
- The low findings of the reviews of 4ce324c (ADR 0003 change):
  - `demo/inflight.ts`: the probe-script pattern matches a search of the script (`grep -n node …/probe/inspect.ts`) and
    can backtrack exponentially on a command with many flags.
  - `agentctl scanSettings`: when only one config sets a skip list, the other side counts as empty instead of the
    default, so the lock-file default is lost.
  - `agentctl` secret scan: a single-quoted `'${NAME}'` is exempt while the comment says single quotes keep a value as
    written. Decision: `${…}` stays a placeholder in any quoting (it is the reference syntax of `${env:NAME}` and
    `${{ secrets.X }}`, written in single quotes in ordinary source); the comment is narrowed to say so.
- `hldout-skill.bk` at the repository root: a 3 MB zip of an old copy of the skill folder (added 2026-09-30), which
  the owner asked to remove.

## Outputs
- `probes()` counts a command when some part of it names a probe script and tsx or node in some form, and that part
  is not a read or a search (`grep`, `rg`, `cat`, `git`, `echo`, `tsc` …; `git bisect run`, `git rebase -x`/`--exec`,
  `git submodule foreach` and git aliases still count). Parts: split outside quotes at newlines, `;`, `&`, `|`, `(`,
  `)`; a command substitution (`$(…)`, a backtick) is a part of its own, inside double quotes too; single-quoted and escaped characters are text; a heredoc's
  body stays with the command that opened it (a `<<-` terminator may follow tabs; `<<<` is a here-string, not a
  heredoc); a `#` comment runs to the end of its line. A heuristic for an offline tally (the gate's enforcement is
  `requireFrozen`), so it errs toward counting: every wrapper counts when the script is named on the wrapped command
  (`find -exec`, `xargs`, `bash -c`, `sudo` …). Known over-count: a runner used on another file in the same part.
  Known under-counts, on purpose: the script's name reaching the runner from another part (`cat …/inspect.ts | npx
  tsx`, `echo …/inspect.ts | xargs npx tsx`, `npx tsx $(echo …/inspect.ts)`). Linear.
- `scanSettings` treats an unset skip list as the default list before keeping the globs both configs have.
- `'$NAME'` in single quotes is a literal; unquoted and double-quoted `$NAME` stay references; `${…}` is a placeholder
  in any quoting, as the code comment now says.
- `hldout-skill.bk` is gone from the tree (history keeps it), and so is its `.gitattributes` entry.

## Proof
- `tests/inflight.test.ts`: searches and reads of a probe script not counted (`grep`, `rg`, `echo`, `git log`, `tsc`,
  a commit message given inline or as a heredoc, an escaped quote inside a search pattern); runs counted in every form
  the reviews listed (multi-line, `npx -y`, `$(…)` and backticks also inside double quotes, subshells, `time`,
  `timeout`, quoted `VAR=`, `node.exe`, `./node_modules/.bin/tsx`, `pnpm`, `npm exec`, `bash -c`, `--watch`, pipes,
  `find -exec`, `git bisect run`, `git rebase -x`/`--exec`, `git submodule foreach`, a quoted runner path with a
  space, a run on the line after a here-string, a tab-indented `<<-` terminator or a comment with an apostrophe);
  `splitCommands` cases; long and adversarial commands (40 options, 20 000 nested openers, 5 000 heredocs and `<<-`
  heredocs, 200 000 `<`, 40 000 `rebase`) return in well under a second.
- `tests/agent-kit.test.ts`: `scanSettings` with neither, one and both skip lists set; `'${env:NAME_2}'` single-quoted
  is not a hit.
- The project's proof steps (`agentctl verify --contract docs/contracts/0001-follow-ups-and-backup-removal.md`): exit 0.

## Done when
- The findings above no longer reproduce, and `git ls-files hldout-skill.bk` prints nothing.

## Bad result looks like
- A real probe (a probe script run by tsx or node) no longer counted.
- The scan skipping more than both configs allow.
- Any other file removed, or behaviour this contract does not name.
