/**
 * Test accounts for an AUT profile: how tests get them, and a live check. seed.account() and signIn() use it in every
 * story on that application.
 *
 * Accounts that already exist (someone made them; the tests never create or delete them):
 *   heldout accounts --aut <profile> --add-existing --username qa.user1@example.com --password-env APP_PASSWORD_1
 *   heldout accounts --aut <profile> --add-existing --username-vault secret/qa/app#user1 --password-vault secret/qa/app#password1
 *       [--id <account id>]   secrets stay where they are: .env / the environment (--…-env NAME) or Vault (--…-vault path#field)
 *
 * Accounts the tests create (with or without a way to delete them), from the api-probe chain hardening already ran:
 *   heldout accounts --key KEY --from-chain hardening/chain.json
 *       [--sign-in-steps signin.json | --sign-in-json '<inspect steps>'] --sign-in-path /login --sign-in-done "url:/profile"
 *   A chain that only signs in (a step saving "token") as an existing account adds that account to the list instead.
 *
 *   heldout accounts --aut <profile> --per-test 2      tests use up to 2 existing accounts at once (fewer parallel workers)
 *   heldout accounts [--key KEY | --aut <profile>] --check [--create]   sign each existing account in, or create → token →
 *       delete; with no delete in the recipe nothing is created unless --create
 *   heldout accounts [--key KEY | --aut <profile>]                      show the recipe
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, evalPaths, flagStr, loadConfig, main, parseArgs, unmangleMsysPath, type AccountRecipe, type ExistingAccount } from './lib/config';
import { checkAccountRecipe, recipeFromChain } from './lib/accounts';
import { loadVaultSecrets } from './lib/secrets';

/** A value given as literal, as an environment variable name, or as a Vault path#field. */
function reference(name: string, literal: string | undefined, envName: string | undefined, vault: string | undefined, allowLiteral: boolean): string | undefined {
  const given = [literal, envName, vault].filter((x) => x !== undefined).length;
  if (given > 1) throw new Error(`give the ${name} one way: --${name}, --${name}-env NAME or --${name}-vault path#field`);
  if (envName) { if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(envName)) throw new Error(`--${name}-env takes a variable name, e.g. APP_PASSWORD_1`); return `\${env:${envName}}`; }
  if (vault) { if (!/^[^#\s]+#[^#\s]+$/.test(vault)) throw new Error(`--${name}-vault takes path#field, e.g. secret/qa/app#${name}`); return `\${vault:${vault}}`; }
  if (literal !== undefined && !allowLiteral) throw new Error(`a ${name} is never written into heldout.config.json (it is committed): keep it in .env (--${name}-env NAME) or Vault (--${name}-vault path#field)`);
  return literal;
}

main(async () => {
  const { flags } = parseArgs();
  const key = flagStr(flags, 'key');
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const base = key ? evalPaths(cfg, key).base : ROOT;
  const find = (f: string) => [path.resolve(base, f), path.resolve(ROOT, f)].find((x) => fs.existsSync(x)) ?? (() => { throw new Error(`${f} not found`); })();
  const configFile = path.join(ROOT, 'heldout.config.json');
  const save = (recipe: AccountRecipe) => {
    const raw = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    raw.auts[cfg.autId].accounts = recipe;
    fs.writeFileSync(configFile, `${JSON.stringify(raw, null, 2)}\n`);
    cfg.aut.accounts = recipe;
  };
  const merge = (list: ExistingAccount[], add: ExistingAccount[]) => [...list.filter((a) => !add.some((b) => b.username === a.username)), ...add];
  let changed = false;

  const chainFile = flagStr(flags, 'from-chain');
  if (chainFile) {
    const signInSteps = flagStr(flags, 'sign-in-steps') ? JSON.parse(fs.readFileSync(find(flagStr(flags, 'sign-in-steps')!), 'utf8'))
      : flagStr(flags, 'sign-in-json') ? JSON.parse(flagStr(flags, 'sign-in-json')!) : undefined;
    if (signInSteps && !flagStr(flags, 'sign-in-path')) throw new Error('--sign-in-path is required with sign-in steps (the page the sign-in starts on, e.g. /login)');
    const found = recipeFromChain(JSON.parse(fs.readFileSync(find(chainFile), 'utf8')),
      signInSteps ? { path: unmangleMsysPath(flagStr(flags, 'sign-in-path')!), steps: signInSteps, done: flagStr(flags, 'sign-in-done') } : undefined);
    const before = cfg.aut.accounts ?? {};
    save({ ...before, ...found, ...(found.existing ? { existing: merge(before.existing ?? [], found.existing) } : {}) });
    console.log(`✔ auts.${cfg.autId}.accounts: ${found.create ? `tests create accounts${found.delete ? ' and delete them' : ' (no delete: they stay, tagged by name)'}` : `existing account ${found.existing![0].username} added`}${found.token ? ', sign-in over the API' : ''}${found.signIn ? ', UI sign-in' : ''}`);
    changed = true;
  }

  const perTest = flagStr(flags, 'per-test');
  if (perTest) {
    const n = Number(perTest);
    if (!Number.isInteger(n) || n < 1) throw new Error('--per-test takes a whole number: the most accounts one test uses at once');
    save({ ...(cfg.aut.accounts ?? {}), perTest: n });
    const size = cfg.aut.accounts?.existing?.length ?? 0;
    console.log(`✔ tests use up to ${n} account(s) at once: runs use at most ${Math.max(1, Math.floor(size / n))} parallel worker(s) with the ${size} existing account(s)`);
    changed = true;
  }

  if (flags['add-existing']) {
    const username = reference('username', flagStr(flags, 'username'), flagStr(flags, 'username-env'), flagStr(flags, 'username-vault'), true);
    const password = reference('password', flagStr(flags, 'password'), flagStr(flags, 'password-env'), flagStr(flags, 'password-vault'), false);
    if (!username || !password) throw new Error('--add-existing needs a user name (--username, --username-env or --username-vault) and a password (--password-env or --password-vault)');
    const id = flagStr(flags, 'id');
    const before = cfg.aut.accounts ?? {};
    save({ ...before, existing: merge(before.existing ?? [], [{ username, password, ...(id ? { id } : {}) }]) });
    console.log(`✔ existing account ${username} added to auts.${cfg.autId}.accounts (${(cfg.aut.accounts?.existing ?? []).length} in all)${before.create ? ' — note: the recipe also creates accounts, which takes precedence; remove "create" to use the existing ones' : ''}`);
    changed = true;
  }

  const recipe = cfg.aut.accounts;
  if (!recipe) throw new Error(`auts.${cfg.autId} has no accounts yet — add existing ones (--add-existing) or save how tests create them (--from-chain); see references/data-and-journeys.md §4a`);
  if (!changed && !flags.check) { console.log(JSON.stringify(recipe, null, 2)); return; }

  const problems = await loadVaultSecrets([recipe]);
  for (const p of problems) console.log(`  ✖ ${p}`);
  const unset = [...new Set([...JSON.stringify(recipe).matchAll(/\$\{env:(\w+)\}/g)].map((m) => m[1]))].filter((n) => process.env[n] === undefined);
  if (unset.length) console.log(`  ✖ not set yet: ${unset.join(', ')} — add ${unset.map((n) => `${n}=…`).join(' ')} to .env (git-ignored), or set them in the environment (CI variables)`);
  if (problems.length || unset.length) { process.exitCode = 1; return; }
  const steps = await checkAccountRecipe(recipe, cfg.aut.apiBaseURL ?? cfg.aut.baseURL, { createUndeletable: Boolean(flags.create) });
  for (const s of steps) console.log(`  ${s.ok ? '✔' : '✖'} ${s.step} → ${s.detail}`);
  if (steps.some((s) => !s.ok)) { process.exitCode = 1; return; }
  const pool = recipe.create ? undefined : Math.max(1, Math.floor((recipe.existing?.length ?? 0) / Math.max(1, recipe.perTest ?? 1)));
  console.log(`✔ accounts ready${pool ? ` (${recipe.existing?.length} existing${(recipe.perTest ?? 1) > 1 ? `, ${recipe.perTest} per test` : ''}; runs use at most ${pool} parallel worker${pool > 1 ? 's' : ''})` : ''}. In tests: const me = await seed.account();${recipe.signIn ? ' await signIn(page, me);' : ''}`);
  if (!recipe.token && !recipe.signIn) console.log(`  next: save how to sign in — the api-probe chain of the sign-in call (heldout accounts --from-chain …), and/or the UI steps (--sign-in-json …)`);
});
