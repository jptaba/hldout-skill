# ADR 0001 — Record architecture decisions

- Status: accepted
- Date: 2026-10-18

## Context
Agent-driven changes move fast and leave their rationale in chat transcripts. A commit's trailers say what was proven
and who reviewed it, not why a direction was chosen.

## Decision
Significant decisions are short ADRs in `docs/adr/`, numbered `NNNN-short-title.md`: a new guardrail or a change of
tier, a new dependency, a change to an answer key, a change to how the evaluator decides or what it keeps.

## Format
Status / Date / Context / Decision / Consequences. One page at most.

## Consequences
- The rationale outlives the session that produced it.
- A reviewer checks a change against the decision that allowed it.
