# ADR 0003 — Every agent on Opus; independence from separate contexts

- Status: accepted
- Date: 2026-10-18

## Context
The contract reviewer and the code reviewer ran on Sonnet, so that their reviews were independent of the work they
judged in model as well as in context, and the guardrail tier required approving reviews from two models. The owner
asked for every agent to run on Opus, with Sonnet only for basic work (an agent that just runs a command).

## Decision
- Every agent, product and maintainer alike, lists Claude Opus first in Copilot and `opus` in its Claude Code bridge.
  Sonnet stays only as a fallback in Copilot's list, for when Opus is unavailable. None of the current agents does
  basic work, so none runs on Sonnet by default.
- Independence comes from separate contexts: each review runs in a fresh one, never sees the author's reasoning, and
  records its own name. The guardrail tier needs two independent reviews (`"reviews": 2, "models": 1`).
- The gate holds every change to the stricter of the config it commits and the config before it (tiers, the gate and
  its approvers, the secret scan's skip list and the size limit), so this change, which relaxes the tier, passed the old
  rule first: two reviews on two models, Opus and Sonnet.

## Consequences
- One model family judges everything: a blind spot shared by author and reviewer is no longer caught by a second
  model. Separate contexts, citations to file and line, and tree-bound proof remain.
- A tier can still require several models (`"models": 2`); a project that wants model diversity sets it back.
