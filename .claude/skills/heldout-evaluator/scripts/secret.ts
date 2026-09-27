/**
 * Put a secret into .env without it appearing on screen, in the shell history or in the conversation.
 *
 *   heldout secret NAME --generate [--force]   a strong random value (for accounts the tests create themselves)
 *
 * The value mixes upper and lower case, digits and a symbol, and is long enough that run artifacts can be scrubbed of it.
 * An existing value is kept unless --force. For a value someone gives you (an existing account), edit .env yourself.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, flagStr, main, parseArgs } from './lib/config';
import { strongSecret } from './lib/redact';

main(() => {
  const { _, flags } = parseArgs();
  const name = _[0];
  if (!name || !/^[A-Z][A-Z0-9_]*$/.test(name)) throw new Error('Usage: heldout secret NAME --generate   (NAME in capitals, e.g. APP_USER_PASSWORD)');
  if (!flags.generate) throw new Error(`Add --generate for a strong random value. For a value someone gave you, add ${name}=… to .env yourself (never paste it into a chat).`);
  const file = path.join(ROOT, '.env');
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const line = new RegExp(`^${name}=(.*)$`, 'm');
  const current = text.match(line)?.[1]?.trim();
  if (current && !flags.force) { console.log(`• ${name} is already set in .env — kept (--force replaces it)`); return; }
  const value = strongSecret(Number(flagStr(flags, 'length') ?? 20));
  const next = line.test(text) ? text.replace(line, `${name}=${value}`) : `${text}${text && !text.endsWith('\n') ? '\n' : ''}${name}=${value}\n`;
  fs.writeFileSync(file, next);
  console.log(`✔ ${name} set in .env (${value.length} random characters; not shown). Accounts created with it are the tests' own, so nothing else needs it.`);
});
