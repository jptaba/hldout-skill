# Next steps

The redesign and its progress are in [optimization-plan.md](optimization-plan.md). This file lists what is open
beside it. Finished work, and the history of the test rounds up to round 47, is in git history.

| What | Why it matters |
| --- | --- |
| `api-probe --pick` on a single record | It reads the record's first list field instead of the record |
| A `request` step in an `inspect` walk can't carry a token kept in browser storage | Needs an application that keeps one, to prove it on |
| `seed.shared(() => seed.account())` loses the password | An account's `toJSON` keeps only its id and user name, so the run folder's copy can't sign in after a worker restart, and `reviveAccounts` doesn't recognise it |
| A navigation's redirect hop to a blocked host isn't stopped | Left from a review of the application survey |
| Array fields in contracts | A field that holds a list can't be stated today; the checks file of the plan's phase 2 must be able to |
| A reading assumed in the contract and contradicted by the application | Whether such a gap may let a defect be confirmed is open; the plan's discrepancy record (6.5) is where it lands |
| A wizard for connecting Jira Data Center | Onboarding asks for the settings one by one |
| A live Jira Data Center rendering of what the skill posts | Never seen on a real server |
| The opt-in pre-commit hook through POSIX sh, and a live Vault | Git for Windows' sh is proven |
| Whether GitHub Copilot reports each subagent's cost (Claude Code does) | `note --usage`; part of the owner's Copilot checklist in the plan's phase 0 |

## Decided

- A verdict whose open questions block no criterion stays PASS; the first line and the summary posted to the story
  count them. A question a criterion can't be judged without makes it PASS WITH WARNINGS.
