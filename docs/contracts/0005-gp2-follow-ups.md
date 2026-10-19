# Contract 0005 — GP2 review follow-ups

## Inputs
- The low findings of the GP2 reviews (d3b5f91):
  - Ordinary lines still warn: "The page should show your instructions for setup.", "Show your prompt card at the
    counter." (the `show …your prompt` branch) and "The evaluator must approve the expense within 2 days." (an
    application's evaluator role).
  - `wikiText` folds every whitespace run to one space, so tabs, no-break spaces and the evaluator's own double-spaced
    separators change.

## Outputs
- The ask-for-the-prompt pattern needs a verb of disclosure or override (print, reveal, repeat, leak, ignore,
  disregard) and "your system prompt" or "your instructions", or show/output and "your system prompt"; "evaluator" is
  no longer a subject that warns.
- `wikiText` folds only line breaks (CR, LF, form feed, vertical tab, U+0085, U+2028, U+2029) and the spaces and tabs
  around them; other whitespace is kept. A match starts only where a run of spaces begins, so it stays linear.

## Proof
- `tests/untrusted-content.test.ts`: the three lines above are in the ordinary list; an ask for the system prompt is
  still flagged (also "show your system prompt"); double spaces, a tab and a no-break space survive `wikiText`; 100k
  spaces or tab-space pairs without a break return in well under a second; every earlier case still holds.
- The project's proof steps (`agentctl verify --contract docs/contracts/0005-gp2-follow-ups.md`): exit 0.

## Done when
- The findings no longer reproduce.

## Bad result looks like
- A line the GP2 tests flag no longer flagged (other than the evaluator line, moved on purpose); a line break in text
  reaching Jira.
