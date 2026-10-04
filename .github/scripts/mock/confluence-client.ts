/**
 * File-backed simulator of Confluence Data Center. Each page holds the server's own REST answers, so a page exported
 * from a real Confluence (the same two GETs) can be dropped in, and switching to the real server is only jira.mode:
 *   <mockRoot>/confluence/<pageId>/content.json       GET /rest/api/content/<id>?expand=body.storage
 *   <mockRoot>/confluence/<pageId>/attachments.json   GET /rest/api/content/<id>/child/attachment
 *   <mockRoot>/confluence/<pageId>/files/<name>       the files, at the download links attachments.json names
 * A link opens a page by its id (…pageId=<id>, …/pages/<id>) or by space and title (…/display/<SPACE>/<Title>).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../config';
import { confluenceBase, pageIdOf, toWikiPage, type DcAttachments, type DcContent } from '../confluence';
import type { JiraAttachmentMeta, WikiPage, WikiReader } from '../jira-types';

const readJson = <T>(file: string, fallback: T): T => (fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as T) : fallback);

export class MockConfluenceClient implements WikiReader {
  readonly mode = 'mock' as const;
  private readonly root: string;

  constructor(mockRoot: string) {
    this.root = path.resolve(ROOT, mockRoot, 'confluence');
  }

  async getPage(url: string): Promise<WikiPage> {
    const display = url.match(/\/display\/([^/?#]+)\/([^/?#]+)/);
    const pages = fs.existsSync(this.root) ? fs.readdirSync(this.root) : [];
    const id = pageIdOf(url) ?? (display ? pages.find((p) => {
      const c = readJson<DcContent | undefined>(path.join(this.root, p, 'content.json'), undefined);
      return c?.space?.key === display[1] && c.title === decodeURIComponent(display[2].replace(/\+/g, ' '));
    }) : undefined);
    const file = id ? path.join(this.root, id, 'content.json') : '';
    if (!id || !fs.existsSync(file)) throw new Error(`[mock-confluence] no page for ${url} (${file || this.root}). 404 Page not found or you do not have permission to see it.`);
    return toWikiPage(readJson<DcContent>(file, { id, title: id }), readJson<DcAttachments>(path.join(this.root, id, 'attachments.json'), { results: [] }), confluenceBase(url), url);
  }

  /** The file behind a download link (…/download/attachments/<pageId>/<name>). */
  async downloadAttachment(page: WikiPage, att: JiraAttachmentMeta, destFile: string): Promise<void> {
    const src = path.join(this.root, page.id, 'files', decodeURIComponent(att.content.split('?')[0].split('/').pop() ?? att.filename));
    if (!fs.existsSync(src)) throw new Error(`[mock-confluence] file missing: ${src}`);
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.copyFileSync(src, destFile);
  }
}
