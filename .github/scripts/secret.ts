/**
 * Put a secret into .env (git-ignored) without it appearing on screen, in the shell history or in a conversation.
 *
 *   heldout secret NAME --generate [--force]   a strong random value, for accounts the tests create themselves
 *   heldout secret NAME --ask [--force]        type an existing account's password at a hidden prompt (run it in a
 *                                              terminal of your own, in the project folder)
 *
 * An existing value is kept unless --force. In CI, set NAME as a masked CI/CD variable instead: real environment
 * variables win over .env. For HashiCorp Vault, reference the secret as ${vault:path#field} instead (see heldout accounts).
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { ROOT, flagStr, main, parseArgs } from './lib/config';
import { safeToScrub, strongSecret } from './lib/redact';

/** Read a line without echoing it (a TTY only). */
function hiddenPrompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = (rl as unknown as { _writeToOutput: (s: string) => void });
    write._writeToOutput = (s: string) => { if (s.startsWith(question)) process.stdout.write(question); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

main(async () => {
  const { _, flags } = parseArgs();
  const name = _[0];
  if (!name || !/^[A-Z][A-Z0-9_]*$/.test(name)) throw new Error('Usage: heldout secret NAME --generate | --ask   (NAME in capitals, e.g. APP_USER_PASSWORD)');
  if (!flags.generate && !flags.ask) throw new Error(`Add --generate for a strong random value (accounts the tests create), or --ask to type an existing account's password at a hidden prompt.`);
  const file = path.join(ROOT, '.env');
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const line = new RegExp(`^${name}=(.*)$`, 'm');
  const current = text.match(line)?.[1]?.trim();
  if (current && !flags.force) { console.log(`• ${name} is already set in .env — kept (--force replaces it)`); return; }
  let value: string;
  if (flags.ask) {
    if (!process.stdin.isTTY) throw new Error(`--ask needs your own terminal (the value must not pass through a conversation). Open a terminal in the project folder and run:  npm run heldout -- secret ${name} --ask`);
    value = (await hiddenPrompt(`${name} (input hidden): `)).trim();
    if (!value) throw new Error('nothing entered — .env unchanged');
  } else value = strongSecret(Number(flagStr(flags, 'length') ?? 20));
  const next = line.test(text) ? text.replace(line, `${name}=${value}`) : `${text}${text && !text.endsWith('\n') ? '\n' : ''}${name}=${value}\n`;
  fs.writeFileSync(file, next);
  console.log(`✔ ${name} set in .env (${value.length} characters; not shown).${flags.generate ? ' Accounts created with it are the tests\' own, so nothing else needs it.' : ''}`);
  if (!safeToScrub(value)) console.log('  ⚠ it is a plain word or very short: run artifacts can\'t be scrubbed of it reliably — a stronger test password is safer');
});
