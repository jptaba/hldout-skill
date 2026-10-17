/**
 * Setup — another application profile in a project that is set up already.
 *
 *   heldout add-aut <profile> --base-url … [--api-base-url …] [--name …] [--test-id-attr …] [--healthcheck …]
 *
 * The new profile gets a journeys folder of its own (journeys-<profile>/): journeys are one application's. One visit
 * of the start page fills in what the flags don't give (name, test-id attribute, API host, blockHosts, overlays).
 */
import fs from 'node:fs';
import path from 'node:path';
import { flagStr, type Args, type CommandSpec } from '../core/cli';
import { ROOT } from '../core/files';
import { discover, profileFrom, say } from './profile-setup';

export const spec: CommandSpec = {
  name: 'add-aut', group: 'Setup', usage: '<id> --base-url <url> [--api-base-url <url>]',
  about: 'add another application profile',
  flags: ['api-base-url', 'base-url', 'healthcheck', 'name', 'test-id-attr'],
};

export async function run({ _, flags }: Args): Promise<void> {
  const id = _[0];
  if (!id) throw new Error('Usage: heldout add-aut <profile-id> --base-url <url> [--api-base-url <url>]');
  const configFile = path.join(ROOT, 'heldout.config.json');
  if (!fs.existsSync(configFile)) throw new Error('heldout.config.json not found — run "heldout init" first.');
  if (!flagStr(flags, 'base-url')) throw new Error('--base-url is required with add-aut');
  const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  if (cfg.auts[id]) throw new Error(`AUT profile "${id}" already exists`);
  // Journeys are one application's: the new one gets a folder of its own.
  cfg.auts[id] = { ...profileFrom(flags), journeysDir: `journeys-${id}` };
  fs.writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
  fs.mkdirSync(path.join(ROOT, `journeys-${id}`, 'fixtures'), { recursive: true });
  say('✔', `added AUT profile "${id}", its journeys in journeys-${id}/. Stories bind to it with: heldout fetch KEY --aut ${id}`);
  await discover(configFile, id, flags);
}
