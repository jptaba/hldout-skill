---
name: pr-packet
description: Commit and push a change with a short account of what was and was not checked. Use when a change is done and its typecheck and tests pass.
---

# Commit and push

1. `npm run typecheck` and `npm run test:skill` pass on the tree you are about to commit.
2. Commit: a subject that says what changed, then a body only if the subject can't carry it. Name what was not
   checked when it matters (for example, no round was run).
3. Push. For a pull request, the body is the same account.

Do not invent claims: every line traces to a command's output.
