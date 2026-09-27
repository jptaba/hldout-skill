/**
 * The AUT profile's accounts recipe (how to create, sign in and delete a test user): write it from what hardening
 * already probed, and check it live. seed.account() and signIn() use it in every story on that application.
 *
 *   heldout accounts --key KEY --from-chain hardening/chain.json        the api-probe chain that made an account
 *       [--sign-in-steps signin.json | --sign-in-json '<inspect steps>'] --sign-in-path /login --sign-in-done "url:/profile"
 *   heldout accounts [--key KEY | --aut <profile>] --check              create → token → delete, live
 *
 * In the chain, save the new account's id as "id" and the token as "token"; the body value holding ${uid} becomes
 * the user name and the ${env:NAME} one the password. Paths are relative to the evaluation folder or the project.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, evalPaths, flagStr, loadConfig, main, parseArgs, rel } from './lib/config';
import { checkAccountRecipe, recipeFromChain } from './lib/accounts';

main(async () => {
  const { flags } = parseArgs();
  const key = flagStr(flags, 'key');
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  const base = key ? evalPaths(cfg, key).base : ROOT;
  const find = (f: string) => [path.resolve(base, f), path.resolve(ROOT, f)].find((x) => fs.existsSync(x)) ?? (() => { throw new Error(`${f} not found`); })();
  const configFile = path.join(ROOT, 'heldout.config.json');

  const chainFile = flagStr(flags, 'from-chain');
  if (chainFile) {
    const signInSteps = flagStr(flags, 'sign-in-steps') ? JSON.parse(fs.readFileSync(find(flagStr(flags, 'sign-in-steps')!), 'utf8'))
      : flagStr(flags, 'sign-in-json') ? JSON.parse(flagStr(flags, 'sign-in-json')!) : undefined;
    if (signInSteps && !flagStr(flags, 'sign-in-path')) throw new Error('--sign-in-path is required with sign-in steps (the page the sign-in starts on, e.g. /login)');
    const recipe = recipeFromChain(JSON.parse(fs.readFileSync(find(chainFile), 'utf8')),
      signInSteps ? { path: flagStr(flags, 'sign-in-path')!, steps: signInSteps, done: flagStr(flags, 'sign-in-done') } : undefined);
    const raw = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    raw.auts[cfg.autId].accounts = { ...(raw.auts[cfg.autId].accounts ?? {}), ...recipe };
    fs.writeFileSync(configFile, `${JSON.stringify(raw, null, 2)}\n`);
    cfg.aut.accounts = raw.auts[cfg.autId].accounts;
    console.log(`✔ auts.${cfg.autId}.accounts written to ${rel(configFile)} (create${recipe.token ? ' → token' : ''}${recipe.delete ? ' → delete' : ''}${recipe.signIn ? ' + UI sign-in' : ''})`);
  }

  const recipe = cfg.aut.accounts;
  if (!recipe) throw new Error(`auts.${cfg.autId} has no accounts recipe yet — write it with --from-chain (see references/data-and-journeys.md §4a)`);
  if (!chainFile && !flags.check) { console.log(JSON.stringify(recipe, null, 2)); return; }
  const steps = await checkAccountRecipe(recipe, cfg.aut.apiBaseURL ?? cfg.aut.baseURL);
  for (const s of steps) console.log(`  ${s.ok ? '✔' : '✖'} ${s.step} → ${s.detail}`);
  if (steps.some((s) => !s.ok)) { process.exitCode = 1; return; }
  console.log(`✔ the recipe works. In tests: const me = await seed.account();${recipe.signIn ? ' await signIn(page, me);' : ''} (${recipe.signIn ? 'UI sign-in checked when a test first uses it' : 'add --sign-in-* for the UI sign-in'})`);
});
