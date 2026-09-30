# Example: app knowledge built by three stories on Toolshop

This branch is an **example project**, not part of the skill. It has no history in common with `master`, so it can't be
merged into the skill by accident. It shows what a team's project looks like after onboarding the held-out evaluator
and evaluating three stories, one after another, on the same application: the public demo shop
[Practice Software Testing (Toolshop)](https://practicesoftwaretesting.com), in round 22 of the skill's test rounds
(2026-09-29).

The skill itself is not included. To run anything here, install it as the skill's README describes (`init` from a
clone of the skill), then `npm run heldout -- status`.

## What to look at

| Path | What it shows |
| --- | --- |
| [aut-knowledge/practicesoftwaretesting/facts/](aut-knowledge/practicesoftwaretesting/facts/) | The app knowledge: one file per write, never edited. Three from `doctor --learn` (pages, the API calls they make, the OpenAPI document) and one harvest per story (what that story's passing tests proved) |
| `evaluations/TOOL-1/` | Catalogue search, sorting and filtering. Verdict **FAIL**: pages hold 9 products, not 12 (AC-6). AC-7 (an empty search returns all products) is an open question the application contradicts |
| `evaluations/TOOL-2/` | Registration, sign-in and lockout. Verdict **FAIL**: the account locks after three failed sign-ins, not five (AC-6) |
| `evaluations/TOOL-3/` | Guest cart. Verdict **FAIL**: requests for a missing cart answer 404 with different messages (AC-8). AC-7 and AC-8 conflict for an already-deleted cart: an open question for the owner |
| `evaluations/<KEY>/verdict.md` | Each verdict's "App knowledge" row: what was consulted after the freeze, and what was recorded for later stories |
| `evaluations/<KEY>/hardening/knowledge-*.json` | What each story was shown, what it recorded while hardening, and what its harvest kept |
| `mock-jira/` | The stories as the file-based mock Jira holds them, with the published verdict comments |

To see the knowledge as it stands, with the skill installed:

```bash
npm run heldout -- knowledge --aut practicesoftwaretesting          # every entry, best value first
npm run heldout -- knowledge --aut practicesoftwaretesting --log    # what was learned, when, from which story
```

## How the knowledge grew

| Story | Knowledge available at the freeze | Kept by the harvest |
| --- | --- | --- |
| TOOL-1 | 92 entries seen by `doctor --learn` | 19 |
| TOOL-2 | 107 entries, 18 proven by TOOL-1 | 11, including the first seed recipe (a customer) |
| TOOL-3 | 114 entries, 29 proven | 22: product and checkout locators, a cart seed recipe |

Verdicts, knowledge and runs are as the skill produced them during the round. The skill improved during and after the
round (for example, which entries a story is shown), so a run with the current skill shows fewer, better-chosen
entries. The Playwright HTML reports and traces are not included (they stay local), and no secret is in these files:
test passwords are `${env:…}` references and were scanned for before publishing.

Live-app side effects while these ran: the demo regenerated its catalogue mid-run (product and category ids changed),
answered 429 to a burst of parallel tests, and keeps the `hldout-…@example.com` test customers TOOL-2 created (the
application does not let a customer delete itself).
