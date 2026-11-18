/**
 * What is known of the application (application-map/<profile>/knowledge.jsonl, probe/knowledge.ts): read by any agent
 * in any phase, written only when something is new, corrected only when found wrong.
 *
 *   heldout map --survey [--aut id]                               what a person sees before signing in (writes nothing)
 *   heldout map [KEY] [--domain cart] [--aut id]                  what is known: all of it (a large store: its domains), or a domain's
 *   heldout map [KEY] [--domain cart] [--kind how] --add "…" [--evidence P7]
 *                                                                 something new; with a story, cite its probe (not for --kind about)
 *   heldout map [KEY] --fix K1a2b3c --add "…" [--evidence P9]     an entry found wrong, said as it holds
 *   heldout map [KEY] --remove K1a2b3c [--evidence P9]            an entry of which nothing holds
 *
 * Kinds: about (what the application is: purpose, areas, users, words; the default), how (how it is operated), seen
 * (what it was seen to do), data (accounts, preconditions, clean-up). Domains are the journeys' (cart, user-accounts),
 * or app for the whole application.
 */
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { assertIssueKey, loadConfig } from '../core/config';
import type { HeldoutConfig } from '../core/profile';
import { loadVaultSecrets } from '../core/secrets';
import { addKnowledge, correctKnowledge, HEADER, KINDS, knowledgeIndex, readKnowledge, renderKnowledge, secretSources } from './knowledge';
import { renderSurvey, surveyApp } from './survey';

export const spec: CommandSpec = {
  name: 'map', group: 'Hardening',
  usage: '--survey | [KEY] [--domain d] | [KEY] [--domain d] [--kind about|how|seen|data] --add "…" [--evidence Pn] | [KEY] --fix <id> --add "…" [--evidence Pn] | [KEY] --remove <id> [--evidence Pn]',
  about: 'what is known of the application (any agent, any phase): read it, add what is new, correct what is wrong',
  flags: ['add', 'aut', 'domain', 'evidence', 'fix', 'kind', 'remove', 'survey'],
};

/** Above this many entries, a read without a domain lists the domains instead of printing every entry. */
const ALL_AT_ONCE = 40;

/** The survey's material, and what the store holds already: the survey itself writes nothing. */
export async function survey(cfg: HeldoutConfig, deps: Parameters<typeof surveyApp>[1] = {}): Promise<string> {
  const known = readKnowledge(cfg).filter((e) => e.kind === 'about').length;
  const text = renderSurvey(await surveyApp({ baseURL: cfg.aut.baseURL, apiBaseURL: cfg.aut.apiBaseURL, blockHosts: cfg.aut.blockHosts }, deps), cfg.aut.name ?? cfg.autId);
  return known ? `${text}\n\n• ${known} entr${known === 1 ? 'y says' : 'ies say'} what the application is already (npm run heldout -- map): add what is missing, one entry each.` : text;
}

export async function run({ _, flags }: Args): Promise<void> {
  const key = _[0] === undefined ? undefined : assertIssueKey(_[0]);
  const cfg = loadConfig({ key, aut: flagStr(flags, 'aut') });
  for (const name of ['add', 'fix', 'remove', 'domain', 'kind', 'evidence']) if (Array.isArray(flags[name])) throw new Error(`--${name} once per call. Nothing was written.`);
  const domain = flagStr(flags, 'domain'); const add = flagStr(flags, 'add'); const kind = flagStr(flags, 'kind');
  const fix = flagStr(flags, 'fix'); const remove = flagStr(flags, 'remove'); const evidence = flagStr(flags, 'evidence');
  // By presence, not value: a flag left empty must not turn a write into a read that looks like it worked.
  const asked = { survey: flags.survey !== undefined, fix: flags.fix !== undefined, remove: flags.remove !== undefined, add: flags.add !== undefined && flags.fix === undefined };
  const actions = Object.keys(asked).filter((a) => asked[a as keyof typeof asked]);
  if (actions.length > 1) throw new Error(`--${actions.join(' or --')}, one at a time. Nothing was written.`);
  const action = actions[0];
  if ('domain' in flags && !domain) throw new Error('--domain needs a domain: `heldout map` lists them. Nothing was written.');
  if ('kind' in flags && action !== 'add') throw new Error(`--kind goes with --add (one of ${KINDS.join(', ')}). Nothing was written.`);
  if ('evidence' in flags && !['add', 'fix', 'remove'].includes(action ?? '')) throw new Error('--evidence goes with --add, --fix or --remove. Nothing was written.');
  if ('domain' in flags && ['survey', 'fix', 'remove'].includes(action ?? '')) throw new Error(`--domain doesn't go with --${action}: an entry keeps its domain. Nothing was written.`);

  if (action === 'survey') {
    if (key) throw new Error('--survey takes no story: it is for setting the profile up (--aut <profile>).');
    console.log(await survey(cfg));
    return;
  }
  if (action) {
    // An entry is checked against the vault's values too: one it can't read, it can't check against.
    const problems = await loadVaultSecrets(secretSources(cfg, key));
    if (problems.length) throw new Error(`Can't check the entry against the project's secrets: ${problems.join('; ')}. Nothing was written.`);
  }
  if (action === 'add') {
    if (!add) throw new Error('--add needs what is known, in quotes. Nothing was written.');
    const e = addKnowledge(cfg, key, { domain, kind, text: add, evidence });
    console.log(`✔ ${e.id} in ${e.domain} (${e.kind})`);
    return;
  }
  if (action === 'fix' || action === 'remove') {
    const id = (fix ?? remove)!;
    if (!id) throw new Error(`--${action} needs an entry's id (K1a2b3c). Nothing was written.`);
    if (action === 'fix' && !add) throw new Error('--fix needs --add "<what holds>", in quotes. Nothing was written.');
    const e = correctKnowledge(cfg, key, id, { text: action === 'fix' ? add : undefined, evidence });
    console.log(e ? `✔ ${id} is now ${e.id}: ${e.text}` : `✔ ${id} removed`);
    return;
  }
  const entries = readKnowledge(cfg, domain);
  if (!entries.length) { console.log(`Nothing is known of ${domain ? `${domain} in ` : ''}${cfg.aut.name ?? cfg.autId} yet.${key ? '' : ' At setup: npm run heldout -- map --survey, then map --add "…"'}`); return; }
  if (domain || entries.length <= ALL_AT_ONCE) { console.log(renderKnowledge(entries)); return; }
  console.log(`${HEADER}\n\n${knowledgeIndex(cfg).map((d) => `${d.domain} (${d.entries})`).join('\n')}\n\nRead one: heldout map${key ? ` ${key}` : ''} --domain <domain> (what concerns the whole application, domain app, comes with each)`);
}
