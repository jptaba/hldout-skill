/**
 * Command-line plumbing shared by every command: arguments, flags, the process wrapper, and the paths Git Bash
 * rewrites.
 */

export type Flags = Record<string, string | boolean | string[]>;

/** What a command is given: its positional arguments, its flags, and the arguments as typed (after the command name). */
export interface Args { _: string[]; flags: Flags; argv: string[] }

/**
 * What the dispatcher knows of a command without running it. Its usage in full is the leading comment of its module,
 * which `heldout <command> --help` prints.
 */
export interface CommandSpec {
  /** As typed after `heldout`. */
  name: string;
  group: 'Setup' | 'Requirement' | 'Tests' | 'Hardening' | 'Run' | 'Report';
  /** One line for `heldout help`. */
  about: string;
  /** The arguments, in short, for `heldout help`. */
  usage: string;
  /** Every flag the command reads (without the dashes). The dispatcher rejects any other. */
  flags: readonly string[];
}

/** A command module: its spec, and what it does. Importing it runs nothing. */
export interface CommandModule { spec: CommandSpec; run(args: Args): Promise<void> | void }

/** Tiny argv parser: positionals + `--flag value` / `--flag=value` / `--flag`. Repeated flags become arrays. */
export function parseArgs(argv = process.argv.slice(2)): { _: string[]; flags: Flags } {
  const _: string[] = [];
  const flags: Flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { _.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq === -1 ? a.slice(2) : a.slice(2, eq);
    let value: string | boolean;
    if (eq !== -1) value = a.slice(eq + 1);
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) value = argv[++i];
    else value = true;
    const prev = flags[name];
    flags[name] = prev === undefined ? value : ([] as string[]).concat(prev as string | string[], String(value));
  }
  return { _, flags };
}

export const flagStr = (f: Flags, name: string): string | undefined => {
  const v = f[name];
  return typeof v === 'string' ? v : Array.isArray(v) ? v.at(-1) : undefined;
};

export const flagList = (f: Flags, name: string): string[] =>
  f[name] === undefined || f[name] === true ? [] : ([] as string[]).concat(f[name] as string | string[]);

export function main(fn: () => Promise<void> | void): void {
  // Piping into `head` etc. closes stdout early — exit quietly instead of crashing with EPIPE.
  for (const stream of [process.stdout, process.stderr]) {
    stream.on('error', (e: NodeJS.ErrnoException) => { if (e.code === 'EPIPE') process.exit(process.exitCode ?? 0); else throw e; });
  }
  Promise.resolve()
    .then(fn)
    .catch((err: unknown) => {
      console.error(`\n✖ ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    });
}

/**
 * Git Bash (MSYS) rewrites arguments that start with "/" into Windows paths under the Git install folder
 * (written <git> here): "/" → "<git>/", "/products" → "<git>/products". Undo that when recognisable.
 */
export function unmangleMsysPath(value: string): string {
  // Path-list form: "api:/products" → "api;<git>\products".
  const list = value.match(/^([A-Za-z]+);[A-Za-z]:[\\/](?:Program Files(?: \(x86\))?[\\/])?Git[\\/](.*)$/i);
  if (list) return `${list[1]}:/${list[2].replace(/\\/g, '/')}`;
  // A hash route ("#/login", "#!/login") is rewritten too: "#<git>/login".
  const m = value.match(/^(#!?)?[A-Za-z]:[\\/](?:Program Files(?: \(x86\))?[\\/])?Git[\\/](.*)$/i) ?? value.match(/^(#!?)?[A-Za-z]:[\\/](?:msys64|msys2)[\\/](.*)$/i);
  return m ? `${m[1] ?? ''}/${m[2].replace(/\\/g, '/')}` : value;
}

/** Resolve a path against an origin ("", "/", "cart", "/app/cart" or a full URL). */
export function resolveUrl(base: string, rawTarget = ''): string {
  const target = unmangleMsysPath(rawTarget);
  if (/^[A-Za-z]:[\\/]/.test(target)) {
    throw new Error(`"${target}" looks like a Windows path — Git Bash rewrote a "/…" argument. Drop the leading slash (e.g. cart.html) or set MSYS_NO_PATHCONV=1.`);
  }
  if (/^https?:\/\//.test(target)) return target;
  return new URL(target.replace(/^\/+/, ''), base.endsWith('/') ? base : `${base}/`).toString();
}
