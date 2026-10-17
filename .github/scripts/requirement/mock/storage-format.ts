/**
 * Markdown → Confluence storage format (XHTML with ac:/ri: elements), for authoring mock Confluence pages the way
 * Confluence Data Center stores them: headings, paragraphs, lists (two-space nesting), tables, fenced code (a code
 * macro with its language), images on their own line written as !shot.png! (an ac:image of the page's file), and
 * **bold**, _em_, `code`, [text](url) inline.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(?<![\w*])_([^_]+)_(?![\w*])/g, '<em>$1</em>');
}

export function markdownToStorage(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { out.push(`<p>${para.map(inline).join('<br />')}</p>`); para = []; } };
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) { flush(); continue; }
    const fence = t.match(/^```([\w-]*)/);
    if (fence) {
      flush();
      const body: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i]);
      out.push(`<ac:structured-macro ac:name="code">${fence[1] ? `<ac:parameter ac:name="language">${fence[1]}</ac:parameter>` : ''}<ac:plain-text-body><![CDATA[${body.join('\n')}]]></ac:plain-text-body></ac:structured-macro>`);
      continue;
    }
    const img = t.match(/^!([^!|\s][^!|]*?)(?:\|[^!]*)?!$/);
    if (img) { flush(); out.push(`<p><ac:image><ri:attachment ri:filename="${esc(img[1])}" /></ac:image></p>`); continue; }
    const hd = t.match(/^(#{1,6})\s+(.*)$/);
    if (hd) { flush(); out.push(`<h${hd[1].length}>${inline(hd[2])}</h${hd[1].length}>`); continue; }
    if (t.startsWith('|')) {
      flush();
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].trim().startsWith('|'); i++) {
        const r = lines[i].trim();
        if (/^\|[\s:|-]+\|$/.test(r)) continue;
        rows.push(r.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|')));
      }
      i--;
      out.push(`<table><tbody>${rows.map((r, ri) => `<tr>${r.map((c) => (ri === 0 ? `<th>${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (/^([-*]|\d+\.)\s+/.test(t)) {
      flush();
      const items: { depth: number; ordered: boolean; text: string }[] = [];
      for (; i < lines.length; i++) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (!m) break;
        items.push({ depth: m[1].length >= 2 ? 1 : 0, ordered: /\d/.test(m[2]), text: m[3] });
      }
      i--;
      const tag = (o: boolean) => (o ? 'ol' : 'ul');
      let html = `<${tag(items[0].ordered)}>`;
      items.forEach((it, k) => {
        const next = items[k + 1];
        html += `<li>${inline(it.text)}`;
        if (next && next.depth > it.depth) html += `<${tag(next.ordered)}>`;
        else {
          html += '</li>';
          if (it.depth === 1 && (!next || next.depth === 0)) html += `</${tag(it.ordered)}></li>`;
        }
      });
      out.push(`${html}</${tag(items[0].ordered)}>`);
      continue;
    }
    para.push(t);
  }
  flush();
  return out.join('\n');
}
