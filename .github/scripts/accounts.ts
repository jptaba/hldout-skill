/**
 * Test accounts for an AUT profile: how tests get them, and a live check. seed.account() and signIn() use it in every
 * story on that application.
 *
 * Accounts that already exist (someone made them; the tests never create or delete them):
 *   heldout accounts --aut <profile> --add-existing --username qa.user1@example.com --password-env APP_PASSWORD_1
 *   heldout accounts --aut <profile> --add-existing --username-vault secret/qa/app#user1 --password-vault secret/qa/app#password1
 *       [--id <account id>]   secrets stay where they are: .env / the environment (--…-env NAME) or Vault (--…-vault path#field)
 *   heldout accounts --aut <profile> --reset "DELETE /api/cart?user=${id}"   tests change them: the call that restores one,
 *       run when a test takes the account and again after it
 *
 * Accounts the tests create (with or without a way to delete them), from the api-probe chain hardening already ran:
 *   heldout accounts --key KEY --from-chain hardening/chain.json
 *       [--sign-in-steps signin.json | --sign-in-json '<inspect steps>'] --sign-in-path /login --sign-in-done "url:/profile"
 *   A chain that only signs in (a step saving "token") as an existing account adds that account to the list instead.
 *   heldout accounts --aut <profile> --sign-in-json '<inspect steps>' --sign-in-path /login --sign-in-done "url:/home"   the UI sign-in alone
 *
 * Accounts that only the application's sign-up page can make (no API for it): the form, found with heldout inspect, and
 * how to read the new account's id:
 *   heldout accounts --aut <profile> --sign-up-json '<inspect steps>' --sign-up-path register.htm --sign-up-done "<locator>"
 *       --password-env APP_USER_PASSWORD [--username 'hldout-${uid}'] [--lookup "GET services/login/${username}/${password}" --lookup-id id]
 *   In the steps, ${var:…} is the new user name and ${env:…} / ${vault:…} the password.
 *
 *   heldout accounts --aut <profile> --no-delete      the application doesn't let tests delete accounts: keep them (tagged)
 *   heldout accounts --aut <profile> --per-test 2      tests use up to 2 existing accounts at once (fewer parallel workers)
 *   heldout accounts [--key KEY | --aut <profile>] --check [--create]   sign each existing account in, or create → token →
 *       delete; with no delete in the recipe nothing is created unless --create
 *   heldout accounts [--key KEY | --aut <profile>]                      show the recipe
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, createsAccounts, dataPrefix, evalPaths, flagStr, loadConfig, main, parseArgs, unmangleMsysPath, type AccountRecipe, type ExistingAccount } from './config';
import { checkAccountRecipe, recipeFromChain, signInFromSteps } from './accounts-recipe';
import { loadVaultSecrets } from './secrets';

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
  /** Set when this command only added an existing account: only that one is checked. */
  let added: ExistingAccount | undefined;

  const chainFile = flagStr(flags, 'from-chain');
  const signInSteps = flagStr(flags, 'sign-in-steps') ? JSON.parse(fs.readFileSync(find(flagStr(flags, 'sign-in-steps')!), 'utf8'))
    : flagStr(flags, 'sign-in-json') ? JSON.parse(flagStr(flags, 'sign-in-json')!) : undefined;
  if (signInSteps && !flagStr(flags, 'sign-in-path')) throw new Error('--sign-in-path is required with sign-in steps (the page the sign-in starts on, e.g. /login)');
  // The UI sign-in on its own, once the API part is saved.
  if (signInSteps && !chainFile) {
    if (!cfg.aut.accounts) throw new Error('save how tests get accounts first (--add-existing or --from-chain), then the UI sign-in');
    const signIn = signInFromSteps({ path: unmangleMsysPath(flagStr(flags, 'sign-in-path')!), steps: signInSteps, done: flagStr(flags, 'sign-in-done') }, cfg.aut.accounts.existing);
    save({ ...cfg.aut.accounts, signIn });
    console.log(`✔ UI sign-in saved for auts.${cfg.autId}.accounts (${signIn.steps.length} step(s), starting at ${signIn.path})`);
    changed = true;
  }
  if (chainFile) {
    const found = recipeFromChain(JSON.parse(fs.readFileSync(find(chainFile), 'utf8')),
      signInSteps ? { path: unmangleMsysPath(flagStr(flags, 'sign-in-path')!), steps: signInSteps, done: flagStr(flags, 'sign-in-done') } : undefined);
    const before = cfg.aut.accounts ?? {};
    // A chain that creates accounts describes their whole life: a delete saved earlier goes when this chain has none.
    const kept: AccountRecipe = { ...before };
    if (found.create && !found.delete) delete kept.delete;
    save({ ...kept, ...found, ...(found.existing ? { existing: merge(before.existing ?? [], found.existing) } : {}) });
    console.log(`✔ auts.${cfg.autId}.accounts: ${found.create ? `tests create accounts${found.delete ? ' and delete them' : ' (no delete: they stay, tagged by name)'}` : `existing account ${found.existing![0].username} ${(before.existing ?? []).some((a) => a.username === found.existing![0].username) ? '(already in the list)' : 'added'}`}${found.token ? ', sign-in over the API' : ''}${found.signIn ? ', UI sign-in' : ''}`);
    changed = true;
  }

  // The sign-up page, for applications with no API to make accounts.
  const signUpSteps = flagStr(flags, 'sign-up-steps') ? JSON.parse(fs.readFileSync(find(flagStr(flags, 'sign-up-steps')!), 'utf8'))
    : flagStr(flags, 'sign-up-json') ? JSON.parse(flagStr(flags, 'sign-up-json')!) : undefined;
  if (signUpSteps) {
    if (!flagStr(flags, 'sign-up-path')) throw new Error('--sign-up-path is required with sign-up steps (the page the form is on, e.g. register.htm)');
    const password = reference('password', undefined, flagStr(flags, 'password-env'), flagStr(flags, 'password-vault'), false) ?? cfg.aut.accounts?.password;
    if (!password) throw new Error('give the password the new accounts get: --password-env NAME (then: npm run heldout -- secret NAME --generate) or --password-vault path#field');
    const signUp = signInFromSteps({ path: unmangleMsysPath(flagStr(flags, 'sign-up-path')!), steps: signUpSteps, done: flagStr(flags, 'sign-up-done') });
    const { create: _api, existing: _existing, ...rest } = cfg.aut.accounts ?? {};
    void _api; void _existing;
    save({ ...rest, password, username: flagStr(flags, 'username') ?? rest.username ?? `${dataPrefix(cfg.aut)}-\${uid}`, signUp });
    console.log(`✔ auts.${cfg.autId}.accounts: tests make their accounts on the sign-up page ${signUp.path} (${signUp.steps.length} step(s))${cfg.aut.accounts?.delete ? '' : ', and keep them (no delete)'}`);
    changed = true;
  }
  const lookup = flagStr(flags, 'lookup');
  if (lookup) {
    const m = lookup.match(/^\s*([A-Za-z]+)\s+(\S+)\s*$/);
    if (!m || !flagStr(flags, 'lookup-id')) throw new Error('--lookup "METHOD path" with --lookup-id <dotted path of the id in the answer>, e.g. --lookup "GET services/bank/login/${username}/${password}" --lookup-id id');
    if (!cfg.aut.accounts) throw new Error('save how tests get accounts first, then the id lookup');
    save({ ...cfg.aut.accounts, lookup: { method: m[1].toUpperCase(), path: `/${unmangleMsysPath(m[2]).replace(/^\/+/, '')}`, id: flagStr(flags, 'lookup-id')! } });
    console.log(`✔ the new account's id: ${m[1].toUpperCase()} ${m[2]} → ${flagStr(flags, 'lookup-id')}`);
    changed = true;
  }

  const resetCall = flagStr(flags, 'reset');
  if (resetCall) {
    const m = resetCall.match(/^\s*([A-Za-z]+)\s+(\S+)\s*$/);
    if (!m) throw new Error('--reset "METHOD path", the call that restores an existing account (with its token), e.g. --reset "DELETE /BookStore/v1/Books?UserId=${id}"');
    if (!cfg.aut.accounts?.existing?.length) throw new Error('--reset applies to existing accounts (add them first with --add-existing)');
    save({ ...cfg.aut.accounts, reset: { method: m[1].toUpperCase(), path: `/${unmangleMsysPath(m[2]).replace(/^\/+/, '')}` } });
    console.log(`✔ existing accounts are reset with ${m[1].toUpperCase()} ${m[2]} when a test takes one and again after it`);
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

  if (flags['no-delete']) {
    if (!createsAccounts(cfg.aut.accounts)) throw new Error('--no-delete applies to accounts the tests create');
    const { delete: removed, ...rest } = cfg.aut.accounts!;
    save(rest);
    console.log(`✔ accounts the tests create are kept (no delete${removed ? `; removed ${removed.method} ${removed.path}` : ''}): they are named ${rest.username ?? `${dataPrefix(cfg.aut)}-\${uid}`} so they can be found later`);
    changed = true;
  }

  if (flags['add-existing']) {
    const username = reference('username', flagStr(flags, 'username'), flagStr(flags, 'username-env'), flagStr(flags, 'username-vault'), true);
    const password = reference('password', flagStr(flags, 'password'), flagStr(flags, 'password-env'), flagStr(flags, 'password-vault'), false);
    if (!username || !password) throw new Error('--add-existing needs a user name (--username, --username-env or --username-vault) and a password (--password-env or --password-vault)');
    const id = flagStr(flags, 'id');
    const before = cfg.aut.accounts ?? {};
    added = { username, password, ...(id ? { id } : {}) };
    save({ ...before, existing: merge(before.existing ?? [], [added]) });
    console.log(`✔ existing account ${username} ${(before.existing ?? []).some((a) => a.username === username) ? 'updated in' : 'added to'} auts.${cfg.autId}.accounts (${(cfg.aut.accounts?.existing ?? []).length} in all)${before.create ? ' — note: the recipe also creates accounts, which takes precedence; remove "create" to use the existing ones' : ''}`);
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
  const onlyAdded = added && !flags.check && [chainFile, signInSteps, signUpSteps, lookup, resetCall, perTest, flags['no-delete']].every((x) => !x);
  const steps = await checkAccountRecipe(onlyAdded ? { ...recipe, existing: [added!] } : recipe, cfg.aut.apiBaseURL ?? cfg.aut.baseURL, { createUndeletable: Boolean(flags.create), profile: cfg.autId, dataPrefix: dataPrefix(cfg.aut), ui: { baseURL: cfg.aut.baseURL, blockHosts: cfg.aut.blockHosts, testIdAttribute: cfg.aut.testIdAttribute, overlays: cfg.aut.overlays } });
  for (const s of steps) console.log(`  ${s.ok ? '✔' : '✖'} ${s.step} → ${s.detail}`);
  if (steps.some((s) => !s.ok)) { process.exitCode = 1; return; }
  const pool = createsAccounts(recipe) ? undefined : Math.max(1, Math.floor((recipe.existing?.length ?? 0) / Math.max(1, recipe.perTest ?? 1)));
  console.log(`✔ accounts ready${pool ? ` (${recipe.existing?.length} existing${(recipe.perTest ?? 1) > 1 ? `, ${recipe.perTest} per test` : ''}; runs use at most ${pool} parallel worker${pool > 1 ? 's' : ''})` : ''}. In tests: const me = await seed.account();${recipe.signIn ? ' await signIn(page, me);' : ''}`);
  if (recipe.token || recipe.signIn) console.log(`  in the spec: import { ${recipe.signIn ? 'signIn, ' : ''}type Account } from '<…>/heldout-support/fixtures' — seed.account() and me.headers need nothing else`);
  if (!recipe.token && !recipe.signIn) console.log(`  next: save how to sign in — the api-probe chain of the sign-in call (heldout accounts --from-chain …), and/or the UI steps (--sign-in-json …)`);
});
