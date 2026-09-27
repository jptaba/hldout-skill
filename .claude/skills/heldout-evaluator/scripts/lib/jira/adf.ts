/** Atlassian Document Format helpers: ADF → Markdown (reading stories) and a tiny ADF builder (writing comments). */
import type { AdfNode } from './types';

export function adfToMarkdown(node: AdfNode | string | null | undefined): string {
  if (node == null) return '';
  if (typeof node === 'string') return node; // Jira Server / API v2 returns wiki text
  return block(node, 0).replace(/\n{3,}/g, '\n\n').trim();
}

function children(node: AdfNode, depth: number, sep = ''): string {
  return (node.content ?? []).map((c) => block(c, depth)).join(sep);
}

function inline(node: AdfNode): string {
  switch (node.type) {
    case 'text': {
      // Markdown emphasis must not start/end with whitespace: keep it outside the markers.
      const [, lead, core, trail] = (node.text ?? '').match(/^(\s*)([\s\S]*?)(\s*)$/) ?? ['', '', node.text ?? '', ''];
      if (!core) return node.text ?? '';
      let t = core;
      for (const m of node.marks ?? []) {
        if (m.type === 'strong') t = `**${t}**`;
        else if (m.type === 'em') t = `_${t}_`;
        else if (m.type === 'code') t = `\`${t}\``;
        else if (m.type === 'strike') t = `~~${t}~~`;
        else if (m.type === 'link') t = `[${t}](${String(m.attrs?.href ?? '')})`;
      }
      return `${lead}${t}${trail}`;
    }
    case 'hardBreak': return '  \n';
    case 'mention': return `@${String(node.attrs?.text ?? node.attrs?.id ?? 'user')}`;
    case 'emoji': return String(node.attrs?.text ?? node.attrs?.shortName ?? '');
    case 'inlineCard': return `<${String(node.attrs?.url ?? '')}>`;
    case 'status': return `[${String(node.attrs?.text ?? '')}]`;
    case 'date': return new Date(Number(node.attrs?.timestamp ?? 0)).toISOString().slice(0, 10);
    default: return (node.content ?? []).map(inline).join('');
  }
}

function block(node: AdfNode, depth: number): string {
  const indent = '  '.repeat(depth);
  switch (node.type) {
    case 'doc': return children(node, depth);
    case 'paragraph': return `${(node.content ?? []).map(inline).join('')}\n\n`;
    case 'heading': return `${'#'.repeat(Number(node.attrs?.level ?? 2))} ${(node.content ?? []).map(inline).join('')}\n\n`;
    case 'bulletList':
    case 'orderedList': {
      const items = (node.content ?? []).map((li, i) => {
        const marker = node.type === 'orderedList' ? `${i + 1}.` : '-';
        const [first, ...rest] = li.content ?? [];
        const head = first ? block(first, depth + 1).trim() : '';
        const tail = rest.map((c) => block(c, depth + 1)).join('').trimEnd();
        return `${indent}${marker} ${head}${tail ? `\n${tail}` : ''}`;
      });
      return `${items.join('\n')}\n\n`;
    }
    case 'listItem': return children(node, depth);
    case 'codeBlock': return `\`\`\`${String(node.attrs?.language ?? '')}\n${(node.content ?? []).map(inline).join('')}\n\`\`\`\n\n`;
    case 'blockquote': return children(node, depth).split('\n').map((l) => (l ? `> ${l}` : l)).join('\n');
    case 'rule': return '---\n\n';
    case 'panel': return `> **${String(node.attrs?.panelType ?? 'note').toUpperCase()}:** ${children(node, depth).trim()}\n\n`;
    case 'table': {
      const rows = (node.content ?? []).map((r) =>
        (r.content ?? []).map((cell) => children(cell, 0).replace(/\n+/g, ' ').trim().replace(/\|/g, '\\|')));
      if (!rows.length) return '';
      const width = Math.max(...rows.map((r) => r.length));
      const line = (r: string[]) => `| ${Array.from({ length: width }, (_, i) => r[i] ?? '').join(' | ')} |`;
      return `${[line(rows[0]), `|${' --- |'.repeat(width)}`, ...rows.slice(1).map(line)].join('\n')}\n\n`;
    }
    case 'mediaSingle':
    case 'mediaGroup': return `${(node.content ?? []).map((m) => `[attachment: ${String(m.attrs?.alt ?? m.attrs?.id ?? 'media')}]`).join(' ')}\n\n`;
    case 'expand': return `**${String(node.attrs?.title ?? 'Details')}**\n\n${children(node, depth)}`;
    default: return node.content ? children(node, depth) : inline(node);
  }
}

// ---- builder -------------------------------------------------------------

type Mark = 'strong' | 'em' | 'code';
export const txt = (text: string, ...marks: Mark[]): AdfNode =>
  ({ type: 'text', text, ...(marks.length ? { marks: marks.map((type) => ({ type })) } : {}) });
export const link = (text: string, href: string): AdfNode =>
  ({ type: 'text', text, marks: [{ type: 'link', attrs: { href } }] });
export const p = (...content: (AdfNode | string)[]): AdfNode =>
  ({ type: 'paragraph', content: content.map((c) => (typeof c === 'string' ? txt(c) : c)) });
export const h = (level: number, text: string): AdfNode => ({ type: 'heading', attrs: { level }, content: [txt(text)] });
export const ul = (items: AdfNode[][]): AdfNode =>
  ({ type: 'bulletList', content: items.map((inl) => ({ type: 'listItem', content: [{ type: 'paragraph', content: inl }] })) });
export const panel = (panelType: 'info' | 'success' | 'warning' | 'error' | 'note', ...content: AdfNode[]): AdfNode =>
  ({ type: 'panel', attrs: { panelType }, content });
export const table = (header: string[], rows: string[][]): AdfNode => ({
  type: 'table',
  content: [
    { type: 'tableRow', content: header.map((c) => ({ type: 'tableHeader', content: [p(txt(c, 'strong'))] })) },
    ...rows.map((r) => ({ type: 'tableRow', content: r.map((c) => ({ type: 'tableCell', content: [p(c)] })) })),
  ],
});
export const doc = (...content: AdfNode[]): AdfNode => ({ type: 'doc', version: 1, content });

// ---- Markdown → ADF (for authoring mock stories / bug descriptions) -------------------------------

/** Inline markdown: **bold**, _em_ / *em*, `code`, [text](url). */
export function inlineMd(text: string): AdfNode[] {
  const out: AdfNode[] = [];
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|(?<![\w*])[_*]([^_*]+)[_*](?![\w*]))/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(txt(text.slice(last, m.index)));
    if (m[2]) out.push(txt(m[2], 'strong'));
    else if (m[3]) out.push(txt(m[3], 'code'));
    else if (m[4]) out.push(link(m[4], m[5]));
    else if (m[6]) out.push(txt(m[6], 'em'));
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(txt(text.slice(last)));
  return out.length ? out : [txt(text)];
}

/** Block markdown subset: headings, paragraphs, bullet/ordered lists (2-space nesting), tables, code fences, quotes, rules. */
export function markdownToAdf(md: string): AdfNode {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: AdfNode[] = [];
  let para: string[] = [];
  // Lines of one paragraph keep their line breaks as ADF hardBreak nodes, as the Jira editor does (Gherkin steps, addresses…).
  const flush = () => { if (para.length) { blocks.push({ type: 'paragraph', content: para.flatMap((l, i) => (i ? [{ type: 'hardBreak' } as AdfNode, ...inlineMd(l)] : inlineMd(l))) }); para = []; } };
  const listItem = (s: string): AdfNode => ({ type: 'listItem', content: [{ type: 'paragraph', content: inlineMd(s) }] });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { flush(); continue; }
    const fence = t.match(/^```(\w*)/);
    if (fence) {
      flush();
      const body: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i]);
      blocks.push({ type: 'codeBlock', attrs: fence[1] ? { language: fence[1] } : {}, content: [{ type: 'text', text: body.join('\n') }] });
      continue;
    }
    const hd = t.match(/^(#{1,6})\s+(.*)$/);
    if (hd) { flush(); blocks.push({ type: 'heading', attrs: { level: hd[1].length }, content: inlineMd(hd[2]) }); continue; }
    if (/^(-{3,}|\*{3,})$/.test(t)) { flush(); blocks.push({ type: 'rule' }); continue; }
    if (t.startsWith('|')) {
      flush();
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].trim().startsWith('|'); i++) {
        const r = lines[i].trim();
        if (/^\|[\s:|-]+\|$/.test(r)) continue;
        rows.push(r.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|')));
      }
      i--;
      blocks.push({
        type: 'table',
        content: rows.map((r, ri) => ({ type: 'tableRow', content: r.map((c) => ({ type: ri === 0 ? 'tableHeader' : 'tableCell', content: [{ type: 'paragraph', content: inlineMd(c) }] })) })),
      });
      continue;
    }
    const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      flush();
      const ordered = /\d/.test(li[2]);
      const list: AdfNode = { type: ordered ? 'orderedList' : 'bulletList', content: [] };
      for (; i < lines.length; i++) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (!m) { if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && list.content!.length) { // continuation line
          const p = list.content!.at(-1)!.content![0]; p.content!.push(txt(' '), ...inlineMd(lines[i].trim())); continue; }
          break; }
        if (m[1].length >= 2 && list.content!.length) { // nested one level
          const parent = list.content!.at(-1)!;
          let sub = parent.content!.find((c) => c.type === 'bulletList' || c.type === 'orderedList');
          if (!sub) { sub = { type: /\d/.test(m[2]) ? 'orderedList' : 'bulletList', content: [] }; parent.content!.push(sub); }
          sub.content!.push(listItem(m[3]));
        } else list.content!.push(listItem(m[3]));
      }
      i--;
      blocks.push(list);
      continue;
    }
    if (t.startsWith('>')) { flush(); blocks.push({ type: 'blockquote', content: [{ type: 'paragraph', content: inlineMd(t.replace(/^>\s?/, '')) }] }); continue; }
    para.push(t);
  }
  flush();
  return doc(...blocks);
}
