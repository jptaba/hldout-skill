---
name: pr-packet
description: Pass the gate and commit (or open a pull request) with evidence, not claims — the change restated in your own words, what was not checked, and the proof and reviews the ledger holds for the staged tree. Use after the reviews approved a proven change.
---

# PR packet and the gate

1. `node .agents/scripts/agentctl.mjs status` must end "ready to commit". If not, it says what is missing.
2. Write the commit message:
   - A subject that says what changed, then a body only if the subject can't carry it.
   - Last, the trailer block. You write one trailer:
     - `.agents/config.json` `"gate": "agent"` → `Gate: <the change restated in your own words, and what was not
       checked>`. At least a sentence; never a copy of the reviewer's text or of the subject.
     - `"gate": "human"` → nothing: a person named in the config's `approvers` adds `Approved-by: <them>` after
       reading the packet. An agent never writes that trailer.
   - The hook adds the rest from the ledger: `Tier`, `Contract`, `Proof`, one `Review` per reviewer and model. Never
     write or edit those by hand: CI checks each against the commit's own tree and contract.
3. Commit. A refusal lists what the tier still needs; supply it, never bypass the hooks.
4. For a pull request, the body is `.agents/runs/packet.md` with the reviewer's "could not check" list and the Gate
   restatement filled in.

Do not invent claims or restate from memory: every line traces to the packet, a review, or an output.
