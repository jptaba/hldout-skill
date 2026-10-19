/**
 * dev/inflight.ts: which tool calls count as probing the application (held-out isolation before the freeze).
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { probes, splitCommands } from '../dev/inflight';

const S = '.github/scripts/probe/inspect.ts';

describe('inflight: a probe of the application', () => {
  it('counts the dispatcher\'s probe commands, a probe script that tsx or node runs, and the MCP browser tools', () => {
    for (const c of ['npm run heldout -- inspect --key ABC-1', "npm run heldout '--' api-probe GET products", `npx tsx ${S} --url /`,
      'npx tsx ".github/scripts/probe/mcp-probe.ts" --steps s.json', 'node --import tsx .github\\scripts\\probe\\api-probe.ts GET x',
      `cd p && env X=1 npx tsx ${S}`, `cd p\nnpx tsx ${S} --url /`, `npx -y tsx ${S}`, `npx --yes tsx ${S}`, `echo $(npx tsx ${S})`,
      `(npx tsx ${S})`, `time npx tsx ${S}`, `timeout 60 npx tsx ${S}`, `X="a b" npx tsx ${S}`, `node.exe --import tsx ${S}`,
      `./node_modules/.bin/tsx ${S}`, `pnpm tsx ${S}`, `npm exec tsx ${S}`, `bash -c "npx tsx ${S}"`, `tsx --watch ${S}`,
      'echo x | node --import tsx .github/scripts/probe/api-probe.ts GET y', `cd "/work/my dir" && npx tsx "${S}"`, `cd '/work/my dir' && npx tsx '${S}'`,
      `echo x | xargs npx tsx ${S}`, `nohup npx tsx ${S} &`, `sudo npx tsx ${S}`, `npx.cmd tsx ${S}`, `pwsh -Command "npx tsx ${S}"`,
      `powershell -c "npx tsx ${S}"`, `npx tsx ${S}>out.txt`, `npx tsx@4 ${S}`, `"/opt/node js/bin/node" --import tsx ${S}`,
      // Substitutions run inside double quotes; an escaped quote doesn't end them; commands that run commands.
      `echo "$(npx tsx ${S})"`, `git commit -m "$(npx tsx ${S})"`, `echo "\`npx tsx ${S}\`"`, `echo "a\\"b" ; npx tsx ${S}`,
      `find . -name x -exec npx tsx ${S} \\;`, `git bisect run npx tsx ${S}`,
      `git rebase -x "npx tsx ${S}" HEAD~2`, `git rebase --exec="npx tsx ${S}" main`, `git submodule foreach "npx tsx ${S}"`,
      // A here-string, a tab-indented <<- terminator and a comment with an apostrophe don't hide the next line.
      `cat <<< "x"\nnpx tsx ${S}`, `cat <<-EOF\n\tbody\n\tEOF\nnpx tsx ${S}`, `git status # what's staged\nnpx tsx ${S}`]) {
      assert.ok(probes(c), c);
    }
    assert.ok(probes(undefined, 'mcp__playwright__browser_navigate'));
  });

  it('does not count reading, searching or describing them', () => {
    for (const c of ['grep -n "heldout inspect" docs/x.md', `grep -n "node" ${S}`, 'cat .github/scripts/probe/api-probe.ts',
      `grep -n node ${S}`, 'rg tsx .github/scripts/probe/api-probe.ts', `echo node ${S}`, `git log -- ${S}`, `npx tsc --noEmit ${S}`,
      `git commit -m "Fix\n\nnpx tsx ${S} now waits"`, `grep -rn "node" ${S} | head`, `rg "scripts/probe|node" ${S}`,
      `git commit -F - <<'EOF'\nFix\n\nnpx tsx ${S} now waits\nEOF`, `grep -n "x\\"; npx tsx" ${S}`, `node build.js && vim ${S}`,
      'npm run heldout -- contract ABC-1', 'node -e "1"', `git status # then npx tsx ${S}`, `cat <<EOF\nEOFX npx tsx ${S}\nEOF`]) {
      assert.ok(!probes(c), c);
    }
    assert.ok(!probes(undefined, 'Read'));
  });

  it('splits a command where the shell does', () => {
    assert.deepEqual(splitCommands('a; b && c | d').map((p) => p.trim()).filter(Boolean), ['a', 'b', 'c', 'd']);
    assert.deepEqual(splitCommands('echo "x $(y) z"').map((p) => p.trim()), ['echo "x', 'y', 'z"']);
    assert.deepEqual(splitCommands("echo 'x $(y)'").map((p) => p.trim()), ["echo 'x $(y)'"]);
    assert.equal(splitCommands("cat <<'EOF'\na; b\nEOF\nnext").map((p) => p.trim()).at(-1), 'next');
  });

  it('stays fast on long and adversarial commands', () => {
    const t0 = Date.now();
    probes(`node ${Array.from({ length: 40 }, (_, i) => `--opt${i}`).join(' ')} x.ts`);
    probes(`node ${Array.from({ length: 40 }, (_, i) => `--opt${i} v${i}`).join(' ')}`);
    probes(`${'"$(`'.repeat(20_000)} npx tsx ${S}`);
    probes(`${'<<EOF\n'.repeat(5_000)}npx tsx ${S}`);
    probes(`${'<<-EOF\n\t\t'.repeat(5_000)}npx tsx ${S}`);
    probes(`${'<'.repeat(200_000)} npx tsx ${S}`);
    probes(`git ${'rebase '.repeat(40_000)}node ${S}`);
    assert.ok(Date.now() - t0 < 1000, `took ${Date.now() - t0} ms`);
  });
});
