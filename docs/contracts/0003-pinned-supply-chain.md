# Contract 0003 — GP4, a pinned supply chain; GP3 review follow-ups

## Inputs
- `docs/governance-plan.md`, section "P4 · Pinned supply chain (G4)" (as amended by this change), and work package GP4.
- The low findings of the GP3 reviews (c0b15bb): the frontmatter ends at a line that merely starts with `---`; the
  byte-order mark is written as an invisible literal character; the unknown-key warning implies the tools were widened.

## Outputs
- `@playwright/mcp` pinned to one version (`PLAYWRIGHT_MCP`), used by `mcp-probe` and named in `.vscode/mcp.json`.
- `init`'s dev dependencies and this repository's `package.json` exact and equal; the lock file's root specs follow.
- `playwrightMcpSpecs()` (setup/mcp-config.ts) lists how an MCP file of either app names the Playwright MCP server
  (every word mentioning `playwright/mcp`, any runner, a one-string command, both sections), undefined for a file
  that isn't plain JSON; malformed entries are skipped, never a crash. `doctor` warns on each spec that isn't
  `PLAYWRIGHT_MCP`, and on a file it couldn't check.
- `core/roles.ts`: the frontmatter closes only at an exact `---` line, and a line starting with `---` inside it is a
  problem; the byte-order mark is `String.fromCharCode(0xfeff)`, in the test too; the unknown-key message says so.

## Proof
- `tests/supply-chain.test.ts`: the pin in the constant, the MCP file and no `@latest` literal in the scripts; init's
  versions equal the repository's, all exact; in both apps' formats, the pin passes and `@latest`, none, a range, an
  older pin, a tarball URL, a `--package=` spec, `yarn dlx`, a one-string command and a second section are reported;
  a non-Playwright server and malformed entries give nothing; JSON with comments is unchecked.
- `tests/agent-files.test.ts`: a `---x` line inside the frontmatter is reported as such, and the lines after it are
  still read; a byte-order mark is still no change.
- The project's proof steps (`agentctl verify --contract docs/contracts/0003-pinned-supply-chain.md`): exit 0.

## Done when
- No shipped file fetches the MCP server as `@latest`, and the tests above pass.

## Bad result looks like
- A different Playwright MCP version in two places, unwarned; an adopter's existing dependency overwritten by `init`
  (it only adds missing ones); the pinned server flagged; `doctor` stopped by a malformed MCP file.
