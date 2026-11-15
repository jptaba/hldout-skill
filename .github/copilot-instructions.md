# Copilot instructions

Follow `AGENTS.md` at the repository root: the project's build, test and rules, and what never to do. The one
procedure is the `pr-packet` skill in `.agents/skills/`; security is `SECURITY.md`.

## Code review expectations
- Flag: weakened or deleted tests, new dependencies, secrets, and any break of a rule in `AGENTS.md`.
- Every finding cites a file and a line.
