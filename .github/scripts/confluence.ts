/**
 * Confluence Data Center / Server pages a story links to from its description or acceptance criteria. They are part
 * of the requirement: a team often keeps the API definition (an OpenAPI/Swagger excerpt, a YAML block) or the business
 * rules on a page. Read with REST /rest/api/content on the link's own server (and context path), a personal access
 * token (CONFLUENCE_PAT, else JIRA_PAT) as a Bearer token. The body (storage format, XHTML) becomes Markdown, its
 * images named as [attachment: <file>].
 */
import fs from 'node:fs';
import path from 'node:path';
import type { JiraAttachmentMeta, WikiPage, WikiReader } from './jira-types';

/** Where a link names a page: …/spaces/<space>/pages/<id>, …pageId=<id>, …/display/<space>/<title>, or a …/x/<code> short link. */
const PAGE_LINK = /\/spaces\/[^/]+\/pages\/\d+|[?&]pageId=\d+|\/display\/[^/\s]+\/[^/\s]+|\/x\/[\w-]+/;

/** Every Confluence page link in a text (Markdown, Jira wiki markup [text|url], or a bare URL). */
export function confluenceLinks(text: string): string[] {
  const urls = [...text.matchAll(/https?:\/\/[^\s<>()[\]"'`|]+/g)].map((m) => m[0].replace(/[.,;:!?]+$/, ''));
  return [...new Set(urls.filter((u) => PAGE_LINK.test(u)))];
}

/** The page id a link names, if it names one (a title or a short link names none until it is looked up). */
export function pageIdOf(url: string): string | undefined {
  return url.match(/\/pages\/(\d+)/)?.[1] ?? url.match(/[?&]pageId=(\d+)/)?.[1];
}

/** The Confluence base a link lives under: its origin plus any context path before /display, /pages, /spaces or /x. */
export function confluenceBase(url: string): string {
  const u = new URL(url);
  const at = u.pathname.search(/\/(display|pages|spaces|x)\//);
  return `${u.origin}${at > 0 ? u.pathname.slice(0, at) : ''}`;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
const decode = (s: string) => s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e: string) => (e[0] === '#'
  ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e.toLowerCase()] ?? m));

/** Inline XHTML (marks, links, line breaks) to Markdown text. */
function inline(html: string): string {
  return decode(html
    .replace(/<br\s*\/?>/gi, '  \n')
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '_$2_')
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, ''));
}

/**
 * Confluence storage format (XHTML with ac:/ri: macros) to Markdown: headings, paragraphs, lists, tables, code and
 * noformat macros (kept verbatim with their language: an OpenAPI or YAML excerpt), images as [attachment: <file>], and
 * the text inside other macros (info, note, panel, expand).
 */
export function storageToMarkdown(xhtml: string): string {
  const held: string[] = [];
  const hold = (s: string) => `\u0000${held.push(s) - 1}\u0000`;
  let s = xhtml.replace(/\r\n/g, '\n');
  s = s.replace(/<ac:structured-macro\b[^>]*ac:name="(?:code|noformat)"[^>]*>([\s\S]*?)<\/ac:structured-macro>/g, (_, inner: string) => {
    const lang = inner.match(/<ac:parameter\b[^>]*ac:name="language"[^>]*>([^<]*)<\/ac:parameter>/)?.[1] ?? '';
    const body = inner.match(/<ac:plain-text-body>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/ac:plain-text-body>/)?.[1] ?? '';
    return hold(`\n\n\`\`\`${lang}\n${body.replace(/\n$/, '')}\n\`\`\`\n\n`);
  });
  s = s.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g, (_, body: string) => hold(`\n\n\`\`\`\n${decode(body.replace(/<[^>]+>/g, ''))}\n\`\`\`\n\n`));
  s = s.replace(/<ac:image\b[^>]*>([\s\S]*?)<\/ac:image>/g, (_, inner: string) =>
    `\n\n[attachment: ${decode(inner.match(/ri:filename="([^"]+)"/)?.[1] ?? inner.match(/ri:value="([^"]+)"/)?.[1] ?? 'image')}]\n\n`);
  s = s.replace(/<ac:link\b[^>]*>([\s\S]*?)<\/ac:link>/g, (_, inner: string) => {
    const text = inner.match(/<ac:(?:plain-text-)?link-body>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/ac:(?:plain-text-)?link-body>/)?.[1];
    return text ? inline(text) : decode(inner.match(/ri:(?:content-title|filename)="([^"]+)"/)?.[1] ?? '');
  });
  s = s.replace(/<ac:parameter\b[^>]*>[\s\S]*?<\/ac:parameter>/g, '').replace(/<\/?ac:[\w-]+\b[^>]*>/g, '\n').replace(/<\/?ri:[\w-]+\b[^>]*>/g, '');
  s = s.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/g, (_, t: string) => {
    const rows = [...t.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)]
      .map((r) => [...r[1].matchAll(/<t([hd])\b[^>]*>([\s\S]*?)<\/t\1>/g)].map((c) => inline(c[2]).replace(/\s*\n\s*/g, ' ').trim().replace(/\|/g, '\\|')));
    if (!rows.length) return '';
    const width = Math.max(...rows.map((r) => r.length));
    const line = (r: string[]) => `| ${Array.from({ length: width }, (_, i) => r[i] ?? '').join(' | ')} |`;
    return hold(`\n\n${[line(rows[0]), `|${' --- |'.repeat(width)}`, ...rows.slice(1).map(line)].join('\n')}\n\n`);
  });
  s = s.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g, (_, n: string, t: string) => `\n\n${'#'.repeat(Number(n))} ${inline(t).trim()}\n\n`);
  s = s.replace(/<p\b[^>]*>/g, '').replace(/<\/p>/g, '\n\n');
  // Lists, innermost first: an item's own lines are indented under its marker.
  for (let before = ''; before !== s;) {
    before = s;
    s = s.replace(/<(ul|ol)\b[^>]*>((?:(?!<(?:ul|ol)\b)[\s\S])*?)<\/\1>/g, (_, kind: string, inner: string) => {
      let n = 0;
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)]
        .map((m) => `${kind === 'ol' ? `${++n}.` : '-'} ${inline(m[1]).trim().replace(/\n\s*\n/g, '\n').replace(/\n/g, '\n  ')}`);
      return `\n\n${items.join('\n')}\n\n`;
    });
  }
  s = inline(s).replace(/\u0000(\d+)\u0000/g, (_, i: string) => held[Number(i)]);
  return s.split('\n').map((l) => l.replace(/\s+$/, (m) => (m === '  ' ? m : ''))).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Confluence Data Center's answer to GET /rest/api/content/<id>?expand=body.storage. */
export interface DcContent { id: string; title: string; space?: { key: string }; body?: { storage?: { value?: string } } }
/** Its answer to GET /rest/api/content/<id>/child/attachment: the files on the page (only the ones the body shows are fetched). */
export interface DcAttachments { results?: { id: string; title: string; metadata?: { mediaType?: string }; extensions?: { fileSize?: number; mediaType?: string }; _links: { download: string } }[] }

/** A page from those two answers: the body as Markdown, the files with their download URLs. */
export function toWikiPage(content: DcContent, files: DcAttachments, base: string, url: string): WikiPage {
  return {
    id: content.id, title: content.title, url,
    body: storageToMarkdown(content.body?.storage?.value ?? ''),
    attachments: (files.results ?? []).map((a) => ({ id: a.id, filename: a.title, mimeType: a.metadata?.mediaType ?? a.extensions?.mediaType ?? 'application/octet-stream',
      size: a.extensions?.fileSize ?? 0, content: `${base}${a._links.download}` })),
  };
}

export class ConfluenceDataCenterClient implements WikiReader {
  readonly mode = 'datacenter' as const;
  private readonly auth: string;

  constructor(token: string) {
    if (!token) throw new Error('Reading a linked Confluence page needs CONFLUENCE_PAT (or JIRA_PAT): a personal access token from your Confluence profile');
    this.auth = `Bearer ${token}`;
  }

  private async call(url: string, accept = 'application/json'): Promise<Response> {
    const res = await fetch(url, { headers: { Authorization: this.auth, Accept: accept }, redirect: 'follow' });
    if (!res.ok) throw new Error(`Confluence GET ${url} → ${res.status} ${res.statusText}: ${(await res.text()).slice(0, 300)}`);
    return res;
  }

  async getPage(url: string): Promise<WikiPage> {
    const base = confluenceBase(url);
    let content: DcContent | undefined;
    // A short link leads to the page once followed; a /display/<space>/<title> link is looked up by its title.
    const target = /\/x\/[\w-]+/.test(url) ? (await this.call(url, '*/*')).url : url;
    const id = pageIdOf(target);
    const display = target.match(/\/display\/([^/?#]+)\/([^/?#]+)/);
    if (id) content = (await (await this.call(`${base}/rest/api/content/${id}?expand=body.storage`)).json()) as DcContent;
    else if (display) {
      const title = decodeURIComponent(display[2].replace(/\+/g, ' '));
      content = ((await (await this.call(`${base}/rest/api/content?spaceKey=${encodeURIComponent(display[1])}&title=${encodeURIComponent(title)}&expand=body.storage`)).json()) as { results?: DcContent[] }).results?.[0];
    }
    if (!content) throw new Error(`${url} does not lead to a Confluence page`);
    const files = (await (await this.call(`${base}/rest/api/content/${content.id}/child/attachment?limit=200`)).json()) as DcAttachments;
    return toWikiPage(content, files, base, url);
  }

  async downloadAttachment(_page: WikiPage, att: JiraAttachmentMeta, destFile: string): Promise<void> {
    const res = await this.call(att.content, '*/*');
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.writeFileSync(destFile, Buffer.from(await res.arrayBuffer()));
  }
}
