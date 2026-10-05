/**
 * The verdict comment is assembled with a tiny Atlassian Document Format builder, then written as Jira wiki markup,
 * which Jira Data Center / Server takes for comments.
 */
import type { AdfNode } from './jira-types';

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

// ---- ADF → Jira wiki markup -----------------------------------------------

export function adfToWiki(node: AdfNode): string {
  const inl = (n: AdfNode): string => {
    if (n.type === 'hardBreak') return '\\\\\n';
    if (n.type !== 'text') return (n.content ?? []).map(inl).join('');
    let t = n.text ?? '';
    for (const m of n.marks ?? []) {
      if (m.type === 'strong') t = `*${t}*`;
      else if (m.type === 'em') t = `_${t}_`;
      else if (m.type === 'code') t = `{{${t}}}`;
      else if (m.type === 'link') t = `[${t}|${String(m.attrs?.href ?? '')}]`;
    }
    return t;
  };
  const blk = (n: AdfNode, depth = 1): string => {
    const kids = () => (n.content ?? []).map((c) => blk(c, depth)).join('');
    switch (n.type) {
      case 'doc': return kids().replace(/\n{3,}/g, '\n\n').trim();
      case 'paragraph': return `${(n.content ?? []).map(inl).join('')}\n\n`;
      case 'heading': return `h${Number(n.attrs?.level ?? 2)}. ${(n.content ?? []).map(inl).join('')}\n\n`;
      case 'bulletList':
      case 'orderedList': return `${(n.content ?? []).map((li) => (li.content ?? []).map((c) => (c.type === 'bulletList' || c.type === 'orderedList'
        ? blk(c, depth + 1).trimEnd() : `${(n.type === 'orderedList' ? '#' : '*').repeat(depth)} ${blk(c, depth).trim()}`)).join('\n')).join('\n')}\n\n`;
      case 'table': return `${(n.content ?? []).map((r) => {
        const head = r.content?.[0]?.type === 'tableHeader';
        const cells = (r.content ?? []).map((cell) => (cell.content ?? []).map((c) => blk(c, depth).trim()).join(' ').replace(/\|/g, '\\|'));
        return head ? `||${cells.join('||')}||` : `|${cells.join('|')}|`;
      }).join('\n')}\n\n`;
      case 'panel': return `{panel:title=${String(n.attrs?.panelType ?? 'note').toUpperCase()}}\n${kids().trim()}\n{panel}\n\n`;
      case 'codeBlock': return `{code${n.attrs?.language ? `:${String(n.attrs.language)}` : ''}}\n${(n.content ?? []).map(inl).join('')}\n{code}\n\n`;
      case 'rule': return '----\n\n';
      default: return n.content ? kids() : inl(n);
    }
  };
  return blk(node);
}
