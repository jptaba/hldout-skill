/**
 * Reproduction helpers for the verdict: a reviewer must be able to replay every finding without
 * this tooling (curl for API exchanges) and with it (single-test re-run command).
 */
import type { ApiExchange } from './classify';

const shq = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
const REDACTED = '***redacted***';

/** curl command for one logged (already redacted) exchange; redacted values become <placeholders>. */
export function curlFor(x: ApiExchange): string {
  const parts = [`curl -i -X ${x.request.method} ${shq(x.request.url)}`];
  for (const [k, v] of Object.entries(x.request.headers ?? {})) {
    if (/^accept$/i.test(k)) continue;
    const placeholder = k.toLowerCase() === 'cookie' ? '<session cookie, e.g. the token returned by the login call>' : `<your ${k} value>`;
    parts.push(`-H ${shq(`${k}: ${v === REDACTED ? placeholder : v}`)}`);
  }
  const contentType = Object.entries(x.request.headers ?? {}).find(([k]) => /^content-type$/i.test(k))?.[1] ?? '';
  if (x.request.body && typeof x.request.body === 'object' && /x-www-form-urlencoded/.test(contentType)) {
    const fields = Object.entries(x.request.body as Record<string, unknown>).map(([k, v]) => `${encodeURIComponent(k)}=${v === REDACTED ? '<secret from test-data.json / .env>' : encodeURIComponent(String(v))}`);
    parts.push(`--data ${shq(fields.join('&'))}`);
  } else if (x.request.body !== undefined && x.request.body !== null) {
    const body = typeof x.request.body === 'string' ? x.request.body
      : JSON.stringify(x.request.body).split(`"${REDACTED}"`).join('"<secret from test-data.json / .env>"');
    parts.push(`--data ${shq(body)}`);
  }
  return parts.join(' \\\n  ');
}

/** Short one-line summary of an exchange: "POST /api/message → 200". */
export function exchangeLine(x: ApiExchange): string {
  let pathname = x.request.url;
  try { pathname = new URL(x.request.url).pathname; } catch { /* keep */ }
  return `${x.request.method} ${pathname} → ${x.response.status}`;
}

/** Command that re-runs exactly one held-out test against the story's AUT profile. */
export function rerunCommand(key: string, testId: string): string {
  return `npm run heldout -- run ${key} --label repro --grep "${testId.replace(/\./g, '\\.')}:"`;
}
