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

/**
 * The recorded UI sign-in as inspector steps (the password stays a reference): of an existing account, by role or user
 * name; or of an account the tests or a probe created, by its user name, with the password the recipe gives them all.
 */
export function signInSteps(recipe: AccountRecipe | undefined, who: string): Step[] {
  if (!recipe?.signIn) throw new Error('--sign-in: the profile has no UI sign-in recorded yet (heldout accounts --sign-in-json …)');
  const accounts = recipe.existing ?? [];
  const account = accounts.find((a) => a.role === who) ?? accounts.find((a) => a.username === who || a.username.includes(who))
    ?? (recipe.password ? { username: who, password: recipe.password } : undefined);
  if (!account) throw new Error(`--sign-in ${who}: no existing account has that role or user name (${accounts.map((a) => a.role ?? a.username).join(', ') || 'none'}), and the profile gives no password for the accounts the tests create`);
  const fill = (v = '') => v.replace(/\$\{username\}/g, account.username).replace(/\$\{password\}/g, account.password);
  return [
    { do: 'goto', url: recipe.signIn.path },
    ...recipe.signIn.steps.map((s) => (s.fill ? { do: 'fill', target: s.fill, value: fill(s.value) } : { do: 'click', target: s.click })),
    // Every alternative of "done" (an administrator lands elsewhere than a customer): the inspector waits for any.
    ...(recipe.signIn.done ? [{ do: 'wait', target: recipe.signIn.done.split('|').map((x) => x.trim()).join(' | ') }] : []),
  ];
}

/**
 * The `--var` values a walk is given, with those of the earlier walk it starts from (--from Pn) underneath: its steps
 * name them (`${var:name}`), so they come along with the steps. Recorded with the walk for the next one to inherit.
 */
export function walkVars(cfg: HeldoutConfig, flags: Flags): Record<string, string> {
  const from = flagStr(flags, 'from')?.split(':')[0];
  const key = flagStr(flags, 'key');
  const inherited = from && key ? ((readProbes(evalPaths(cfg, key)).find((x) => x.id === from)?.input as { vars?: Record<string, string> } | undefined)?.vars ?? {}) : {};
  const given = Object.fromEntries(flagList(flags, 'var').map((v) => {
    const i = v.indexOf('=');
    if (i < 1) throw new Error(`--var ${v}: give it as name=value`);
    return [v.slice(0, i), v.slice(i + 1)] as const;
  }));
  return { ...inherited, ...given };
}

/** A walk's logged input with its values, for a later walk --from it; none recorded when it had none. */
export function walkInput<T extends object>(input: T, vars: Record<string, string>): T & { vars?: Record<string, string> } {
  return { ...input, ...(Object.keys(vars).length ? { vars } : {}) };
}

/**
 * Every step source a probe was given, in order: sign-in, an earlier probe, step files, inline steps, --then.
 * `signInAs` is the inspector's --sign-in (an MCP walk signs in by starting --from an earlier walk that did), and `url`
 * its --url.
 */
export function composeSteps(cfg: HeldoutConfig, flags: Flags, signInAs?: string, url?: string): Step[] {
  const key = flagStr(flags, 'key');
  const from = flagStr(flags, 'from');
  const fromSteps = (): Step[] => {
    if (!from) return [];
    const [id, k] = from.split(':');
    if (!key) throw new Error('--from Pn names a probe of a story: give the story with --key');
    const probe = readProbes(evalPaths(cfg, key)).find((x) => x.id === id);
    const input = probe?.input as { steps?: Step[]; url?: string } | undefined;
    if (probe && probe.input === undefined) throw new Error(`${id} was trimmed to its digest when the story's record was tidied for the verdict (nothing cited it): walk again`);
    if (!probe || !input?.steps) throw new Error(`${id} is not a walk in the probe log of ${key}`);
    // The walk as it ran: from the page it started on (its --url), then its steps (k counts these, as its report numbers them).
    return [...(input.url ? [{ do: 'goto', url: input.url }] : []), ...(k ? input.steps.slice(0, Number(k)) : input.steps)];
  };
  // Signed in first, then on to the page the walk is about (the inspector's --url), which a sign-in would leave behind.
  return [
    ...(signInAs ? [...signInSteps(cfg.aut.accounts, signInAs), ...(url ? [{ do: 'goto', url }] : [])] : []),
    ...fromSteps(),
    ...flagList(flags, 'steps').flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')) as Step[]),
    ...(flagStr(flags, 'steps-json') ? JSON.parse(flagStr(flags, 'steps-json')!) as Step[] : []),
    ...flagList(flags, 'then').map((t) => JSON.parse(t) as Step),
  ];
}
