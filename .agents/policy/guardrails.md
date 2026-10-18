# Guardrails

Each guardrail: what it stops, where it is enforced, how strong that is, and what it costs. The hooks run locally;
CI runs the proof again and audits every commit a push or pull request brings.

| Guardrail | Effect | Enforced by | Strength | Cost |
| --- | --- | --- | --- | --- |
| A secret in a staged file: token shapes, private keys, bearer tokens, credentials in URLs, a credential assigned a literal (`password: …`, `DB_PASSWORD=…`), long high-entropy strings; UTF-8, or UTF-16 with a byte-order mark | Block | `verify` (a proof step) and pre-commit; CI scans every pushed commit's own files, merges included | checked | < 0.5 s |
| A file over `maxFileBytes` | Block | pre-commit; CI, per commit | checked | < 0.1 s |
| A file that can't be read for the scan | Error, never "clean" | `scan-secrets`, the audit | checked | none |
| A commit to a protected branch (`"branchPolicy": "no-direct-commits"`) | Block | pre-commit | checked | < 0.1 s |
| A change classed under a weaker tier: a docs file next to code, a rename out of a guarded path, tiers that don't nest | Impossible | each requirement is taken at its most demanding across the change's files; renames count both paths | checked | none |
| A staged tree without a passing proof | Block | pre-commit (ledger, by tree hash) | checked | < 0.1 s |
| A proof of something other than what is staged | Refused | `verify` refuses unstaged or untracked files, and fails if a step rewrote the tree | checked | none |
| A contract changed after it was proven, or unreadable | Block | commit-msg recomputes the section's hash from the version being committed | checked | < 0.1 s |
| Too few approving reviews, or too few models | Block | commit-msg (ledger, by tree hash) | checked | < 0.1 s |
| A review that requested changes | Blocks that tree for good: asking again can't overturn it, only a changed tree can (a BLOCKED review lapses once a proof is recorded after it) | commit-msg (ledger) | checked | none |
| An approval without a passing proof for the same tree | Refused | `agentctl review` | checked | none |
| A review of one tree used for another | Impossible | reviews are recorded by tree hash; restaging needs new reviews | checked | none |
| A pushed commit whose trailers are missing, malformed, or for another tree or contract version | Fails CI | `agentctl ci --audit`: each commit's `Proof` and `Review` trailers must name its own tree, its `Contract` hash its own version of the section | checked | CI time |
| A pushed commit made with `--no-verify` and hand-written trailers that are consistent with it | Not detected by the audit | the final tree's proof runs again in CI; the trailers themselves are declarations | declared | — |
| The reviewer edits code | Prevented | the `code-reviewer` agent has no Write or Edit tool; its shell is read-only by instruction | tools + policy | none |
| The author approves its own change | Policy, audited | reviews run in another context; reviewer and model are declared in the ledger and the trailers, not authenticated | declared | review time |
| No restatement by the gatekeeper (`"gate": "agent"`), or no listed person's approval (`"gate": "human"`) | Block | commit-msg (`Gate:` / `Approved-by:` naming exactly one of `approvers`); CI | declared | none |
| Hooks not installed | Warned | `verify` and `status` say so; CI audits whatever arrives | checked | none |
| A damaged ledger line (it could have been a veto) | Block | `review` and the hooks refuse until it is repaired; `status` warns | checked | none |
| An unreviewed third-party skill | Policy | `SECURITY.md` | policy | one-time |

**Strength:** *checked* means a tool verifies it from the content (hashes, trees, files); *declared* means a party
states it (who reviewed, on which model, who approved, or a whole trailer set written by hand) and the trail records
it for an audit; *policy* means it rests on the rules agents follow.

**Known limits:** an amend is tiered against `HEAD` locally (its real parent in the audit). A merge whose sides touched
different files is not gated (the commits it brings are). A merge with files of its own, that is files differing from
every parent, is gated by those files' tier, like any change, locally and in the audit: a conflict resolution, an edit
made in the merge, and also a file both sides changed that git combined without a conflict (a combination neither
side's proof or review saw). So merging a branch that touched the same files as yours needs `verify` and its reviews.

**The secret scan is a heuristic.** It catches the common shapes of keys, tokens and credentials; it can't prove a file
holds none. The repository host's own secret scanning and push protection (`SECURITY.md`) are the backstop. A host's squash or rebase merge makes a tree nobody proved, so it
fails the audit: under `"no-direct-commits"`, merge with a merge commit. Binary content is not scanned, and the scan
names the files it skipped (UTF-16 without a byte-order mark reads as binary).

## Install the hooks
`node .agents/scripts/agentctl.mjs install-hooks` (`git config core.hooksPath .githooks`) — once per clone.

## Speed budget
Hooks: well under a second. `verify`: the proof steps' own time, run once per change, before the commit rather than
inside it. A review: one read-only agent run of a minute or two, which can overlap the next change.
