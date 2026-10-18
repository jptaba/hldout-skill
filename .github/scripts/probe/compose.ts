/**
 * The steps of a walk, put together from parts instead of a script: an earlier probe's steps (--from P7, or its first
 * k: --from P7:5), step files in order (--steps a.json --steps b.json), inline steps (--steps-json), single steps to
 * add (--then '<step>', repeatable) and, for the inspector, the profile's recorded UI sign-in of an existing account
 * (--sign-in <role or user name>) in front of them all.
 */
import fs from 'node:fs';
import { flagList, flagStr, type Flags } from '../core/cli';
import { readProbes } from '../core/probe-log';
import { evalPaths } from '../core/paths';
import type { AccountRecipe, HeldoutConfig } from '../core/profile';

type Step = Record<string, unknown>;

/** The recorded UI sign-in of an existing account, as inspector steps (the password stays a reference). */
export function signInSteps(recipe: AccountRecipe | undefined, who: string): Step[] {
  if (!recipe?.signIn) throw new Error('--sign-in: the profile has no UI sign-in recorded yet (heldout accounts --sign-in-json …)');
  const accounts = recipe.existing ?? [];
  const account = accounts.find((a) => a.role === who) ?? accounts.find((a) => a.username === who || a.username.includes(who));
  if (!account) throw new Error(`--sign-in ${who}: no existing account has that role or user name (${accounts.map((a) => a.role ?? a.username).join(', ') || 'none'})`);
  const fill = (v = '') => v.replace(/\$\{username\}/g, account.username).replace(/\$\{password\}/g, account.password);
  return [
    { do: 'goto', url: recipe.signIn.path },
    ...recipe.signIn.steps.map((s) => (s.fill ? { do: 'fill', target: s.fill, value: fill(s.value) } : { do: 'click', target: s.click })),
    ...(recipe.signIn.done ? [{ do: 'wait', target: recipe.signIn.done.split('|')[0].trim() }] : []),
  ];
}

/**
 * Every step source a probe was given, in order: sign-in, an earlier probe, step files, inline steps, --then.
 * `signInAs` is the inspector's --sign-in (an MCP walk signs in by starting --from an earlier walk that did).
 */
export function composeSteps(cfg: HeldoutConfig, flags: Flags, signInAs?: string): Step[] {
  const key = flagStr(flags, 'key');
  const from = flagStr(flags, 'from');
  const fromSteps = (): Step[] => {
    if (!from) return [];
    const [id, k] = from.split(':');
    if (!key) throw new Error('--from Pn names a probe of a story: give the story with --key');
    const probe = readProbes(evalPaths(cfg, key)).find((x) => x.id === id);
    const steps = (probe?.input as { steps?: Step[] } | undefined)?.steps;
    if (!probe || !steps) throw new Error(`${id} is not a walk in the probe log of ${key}`);
    return k ? steps.slice(0, Number(k)) : steps;
  };
  return [
    ...(signInAs ? signInSteps(cfg.aut.accounts, signInAs) : []),
    ...fromSteps(),
    ...flagList(flags, 'steps').flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')) as Step[]),
    ...(flagStr(flags, 'steps-json') ? JSON.parse(flagStr(flags, 'steps-json')!) as Step[] : []),
    ...flagList(flags, 'then').map((t) => JSON.parse(t) as Step),
  ];
}
