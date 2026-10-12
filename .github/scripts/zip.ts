/**
 * Reading and rewriting a small zip archive (a Playwright trace), with nothing but Node: enough to take a secret out
 * of the files inside it. Stored and deflated entries only; an archive in the zip64 format is left as it is.
 */
import zlib from 'node:zlib';

export interface ZipEntry { name: string; data: Buffer }

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** The archive's entries, unpacked; undefined when it isn't a plain zip this reader handles (zip64, encrypted, another method). */
export function readZip(buf: Buffer): ZipEntry[] | undefined {
  // The end record is the last thing in the file, after an optional comment (at most 65535 bytes).
  let end = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) if (buf.readUInt32LE(i) === 0x06054b50) { end = i; break; }
  if (end < 0) return undefined;
  const count = buf.readUInt16LE(end + 10); let at = buf.readUInt32LE(end + 16);
  if (count === 0xffff || at === 0xffffffff) return undefined;
  const entries: ZipEntry[] = [];
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(at) !== 0x02014b50) return undefined;
    const flags = buf.readUInt16LE(at + 8); const method = buf.readUInt16LE(at + 10); const packed = buf.readUInt32LE(at + 20);
    const nameLen = buf.readUInt16LE(at + 28); const extraLen = buf.readUInt16LE(at + 30); const commentLen = buf.readUInt16LE(at + 32);
    const local = buf.readUInt32LE(at + 42);
    if (flags & 1 || (method !== 0 && method !== 8) || packed === 0xffffffff || local === 0xffffffff) return undefined;
    const name = buf.subarray(at + 46, at + 46 + nameLen).toString('utf8');
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + packed);
    entries.push({ name, data: method === 8 ? zlib.inflateRawSync(raw) : Buffer.from(raw) });
    at += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/** A zip archive of the entries, each deflated. */
export function writeZip(entries: ZipEntry[]): Buffer {
  const parts: Buffer[] = []; const central: Buffer[] = []; let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8'); const packed = zlib.deflateRawSync(e.data); const crc = crc32(e.data);
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x0800, 6); head.writeUInt16LE(8, 8);
    head.writeUInt32LE(crc, 14); head.writeUInt32LE(packed.length, 18); head.writeUInt32LE(e.data.length, 22); head.writeUInt16LE(name.length, 26);
    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0); dir.writeUInt16LE(20, 4); dir.writeUInt16LE(20, 6); dir.writeUInt16LE(0x0800, 8); dir.writeUInt16LE(8, 10);
    dir.writeUInt32LE(crc, 16); dir.writeUInt32LE(packed.length, 20); dir.writeUInt32LE(e.data.length, 24); dir.writeUInt16LE(name.length, 28);
    dir.writeUInt32LE(offset, 42);
    parts.push(head, name, packed); central.push(dir, name);
    offset += 30 + name.length + packed.length;
  }
  const dirSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dirSize, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, ...central, end]);
}

/** Every occurrence of `find` in `buf` replaced, byte for byte (the files of an archive are not all text). */
function replaceBytes(buf: Buffer, find: Buffer, put: Buffer): Buffer {
  if (!find.length || buf.indexOf(find) < 0) return buf;
  const out: Buffer[] = []; let from = 0;
  for (let i = buf.indexOf(find); i >= 0; i = buf.indexOf(find, from)) { out.push(buf.subarray(from, i), put); from = i + find.length; }
  out.push(buf.subarray(from));
  return Buffer.concat(out);
}

/**
 * The archive with every secret value taken out of the files inside it (as it is written, URL-encoded and inside
 * JSON), and how many files held one. `changed` 0 means the archive needs no rewrite; undefined, that it could not
 * be read (the caller then decides what to do with it).
 */
export function scrubZip(buf: Buffer, secrets: string[], mask = '***redacted***'): { zip: Buffer; changed: number } | undefined {
  const entries = readZip(buf);
  if (!entries) return undefined;
  const forms = [...new Set(secrets.flatMap((s) => [s, encodeURIComponent(s), JSON.stringify(s).slice(1, -1)]))].filter(Boolean).sort((a, b) => b.length - a.length).map((s) => Buffer.from(s, 'utf8'));
  const put = Buffer.from(mask, 'utf8'); let changed = 0;
  const clean = entries.map((e) => {
    const data = forms.reduce((d, f) => replaceBytes(d, f, put), e.data);
    if (data !== e.data) changed++;
    return { name: e.name, data };
  });
  return { zip: changed ? writeZip(clean) : buf, changed };
}
