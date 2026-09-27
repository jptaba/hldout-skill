// Live confirmation for SCN-007 (AC-7): does the JWT issued by GenerateToken contain the password?
// Black-box: creates a throwaway account, decodes the token, reports WHERE the password occurs (never prints it),
// then deletes the account. Usage: npx tsx evaluations/DQ-1/hardening/confirm-ac7.ts
import { loadEnv } from '../../../.claude/skills/heldout-evaluator/scripts/lib/config';
loadEnv();
const base = 'https://demoqa.com';
const pw = process.env.DQ_USER_PASSWORD;
if (!pw) throw new Error('DQ_USER_PASSWORD not set');
const userName = `qa-dq1-confirm-${Date.now().toString(36)}`;
const post = async (path: string, body: unknown, headers: Record<string, string> = {}) => {
  const r = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, json: await r.json().catch(() => null) };
};
const out = [`# AC-7 live confirmation — ${new Date().toISOString()}`, '', `- account: \`${userName}\` (created and deleted by this script)`];
const c = await post('/Account/v1/User', { userName, password: pw });
out.push(`- P1 POST /Account/v1/User → ${c.status}`);
const t = await post('/Account/v1/GenerateToken', { userName, password: pw });
out.push(`- P2 POST /Account/v1/GenerateToken → ${t.status}, status "${t.json?.status}"`);
const token = t.json?.token ?? '';
const parts = token.split('.');
out.push(`- token has ${parts.length} dot-separated part(s)`);
const names = ['header', 'payload', 'signature'];
parts.forEach((p: string, i: number) => {
  const dec: string = Buffer.from(p, 'base64url').toString('latin1');
  let keys = '';
  if (i < 2) {
    try {
      const obj = JSON.parse(dec);
      keys = ` · claims: ${Object.keys(obj).map((k: string) => `${k}${obj[k] === pw ? ' (= the password)' : ''}`).join(', ')}`;
    } catch { keys = ' · (not JSON)'; }
  }
  out.push(`- ${names[i] ?? `part ${i + 1}`}: contains the password: **${dec.includes(pw) ? 'YES' : 'no'}**${keys}`);
});
out.push(`- raw token string contains the password: ${token.includes(pw) ? 'YES' : 'no'}`);
const d = await fetch(`${base}/Account/v1/User/${c.json?.userID}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
out.push(`- cleanup DELETE /Account/v1/User/{UUID} → ${d.status}`);
console.log(out.join('\n'));
