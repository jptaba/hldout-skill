/**
 * Command-line plumbing shared by every command: arguments, flags, the process wrapper, and the paths Git Bash
 * rewrites.
 */

export type Flags = Record<string, string | boolean | string[]>;

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

/** The flags a command script reads (flags.x, flags['x'], flagStr/flagList(flags, 'x')): the dispatcher rejects others. */
export function knownFlags(src: string): Set<string> {
  return new Set([...src.matchAll(/flags\.([A-Za-z_]\w*)|flags\[['"]([a-z-]+)['"]\]|flag(?:Str|List)\(flags, ['"]([a-z-]+)['"]\)/g)].map((m) => m[1] ?? m[2] ?? m[3]));
}

/**
 * Git Bash (MSYS) rewrites arguments that start with "/" into Windows paths under the Git install:
 * "/" → "C:/Program Files/Git/", "/products" → "C:/Program Files/Git/products". Undo that when recognisable.
 */
export function unmangleMsysPath(value: string): string {
  // Path-list form: "api:/products" → "api;C:\Program Files\Git\products".
  const list = value.match(/^([A-Za-z]+);[A-Za-z]:[\\/](?:Program Files(?: \(x86\))?[\\/])?Git[\\/](.*)$/i);
  if (list) return `${list[1]}:/${list[2].replace(/\\/g, '/')}`;
  // A hash route ("#/login", "#!/login") is rewritten too: "#C:/Program Files/Git/login".
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
