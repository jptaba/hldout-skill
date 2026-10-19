# Contract 0004 — GP4 review follow-ups

## Inputs
- The low findings of the GP4 reviews (4eca6f3):
  - `playwrightMcpSpecs()` counts any word containing `playwright/mcp`, so a pinned server given
    `--config ./playwright/mcp.json` gets a false warning.
  - `doctor` reports "Playwright MCP configured" for an MCP file it can't parse, even when the file names no
    Playwright server.
  - P4 doesn't say the pin is about the version, not the registry it comes from.

## Outputs
- A word counts as the server when it names `@playwright/mcp`, or is a URL or `.tgz` naming `playwright/mcp`; a path
  that merely contains the words doesn't.
- For a file it can't parse, `doctor` says "configured" only when the text names `playwright/mcp`.
- P4's residual names the registry (arguments, environment, `.npmrc`).

## Proof
- `tests/supply-chain.test.ts`: the pin with `--config ./playwright/mcp.json` passes; a `file:` tarball is reported.
- The project's proof steps (`agentctl verify --contract docs/contracts/0004-gp4-follow-ups.md`): exit 0.

## Done when
- The two findings no longer reproduce.

## Bad result looks like
- A form the GP4 tests report (`@latest`, a range, an older pin, a URL, `--package=`, `yarn dlx`) no longer reported.
