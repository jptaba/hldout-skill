---
name: contract
description: Write the contract of one change before implementing it — inputs, outputs, the proof, done-when and what a bad result looks like — from .agents/templates/contract.md. Use when a change has no plan section or finding that already states all of that.
---

# Contract

1. Copy `.agents/templates/contract.md` to `docs/contracts/NNNN-<short-name>.md` (the next free number).
2. Fill each heading from what was asked, nothing more. Short: one screen.
   - **Inputs / Outputs:** what the change takes and gives, with concrete examples.
   - **Proof:** the tests that will prove it (name them), plus the project's proof steps.
   - **Done when:** the observable end state.
   - **Bad result looks like:** the failures a reviewer must look for, including behaviour the contract does not name.
3. A plan section that already says all of this is the contract: point `--contract` at it instead
   (`docs/<plan>.md#<heading or table row>`).

The contract is hashed into the evidence: changing it after the review makes the packet stale.
