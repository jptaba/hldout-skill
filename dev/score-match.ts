/**
 * How the scorecard pairs an answer key's expected defects with an evaluation's confirmed findings. A finding
 * matches a defect when they share a criterion and the finding's words hit the defect's keywords; the more keywords
 * it hits, the better the match.
 *   - Each defect takes its best finding; on a tie, one that isn't already another defect's best (two findings for
 *     what one key lists as two defects each get theirs, so the scorecard shows the finding that describes it).
 *   - A finding is real when it is a best (or tied-best) match of some defect, or hits two keywords of one: a single
 *     generic keyword ("transfer") on a shared criterion is not enough to clear a finding nothing else explains.
 *
 * A key numbers a story's criteria its own way and a contract its own, so a defect can be reported missed because the
 * numbers differ. Keywords alone can't settle that: they are generic, and without the criterion a defect would be
 * "found" by findings about something else. So a miss stays a miss, and `toCheck` names the finding a person should
 * read against it; the score never counts on it.
 */
export interface Matchable { criteria: string[]; words: string; about?: string }
export interface Expected { criteria: string[]; keywords: string[] }

const hits = (words: string, keywords: string[]) => keywords.filter((k) => words.toLowerCase().includes(k.toLowerCase())).length;
const shares = (a: string[], b: string[]) => a.some((c) => b.includes(c));

/** For each defect the index of its best finding (or -1), and the indexes of the findings no defect explains. */
export function matchDefects(defects: Expected[], findings: Matchable[]): { best: number[]; unmatched: number[] } {
  const score = (d: Expected, f: Matchable) => (shares(f.criteria, d.criteria) ? hits(f.words, d.keywords) : 0);
  const top = defects.map((d) => Math.max(0, ...findings.map((f) => score(d, f))));
  const tied = defects.map((d, di) => findings.map((_, i) => i).filter((i) => top[di] > 0 && score(d, findings[i]) === top[di]));
  // A defect's only best is its own whatever the key's order; ties then go to findings nothing has taken yet.
  const taken = new Set(tied.filter((t) => t.length === 1).map((t) => t[0]));
  const best = tied.map((t) => {
    if (t.length < 2) return t[0] ?? -1;
    const at = t.find((i) => !taken.has(i)) ?? t[0];
    taken.add(at);
    return at;
  });
  const real = (i: number) => defects.some((d, di) => {
    const s = score(d, findings[i]);
    return s > 0 && (s === top[di] || s >= 2);
  });
  const unmatched = findings.map((_, i) => i).filter((i) => !real(i));
  return { best, unmatched };
}

/** The keywords a text says, from a word's start ("date" not in "validated"), a keyword inside another counted once. */
function said(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  const found = keywords.map((k) => k.toLowerCase()).filter((k) => new RegExp(`(^|[^a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(lower));
  return found.filter((k) => !found.some((o) => o !== k && o.includes(k))).length;
}

/**
 * For a defect reported missed: the finding most about it, to read by hand, or -1. It takes a keyword in what the
 * finding is about (its title and its tests' titles); the keywords in its rationale only break a tie.
 */
export function toCheck(defect: Expected, findings: Matchable[]): number {
  let at = -1, top = 0;
  findings.forEach((f, i) => {
    const about = said(f.about ?? '', defect.keywords);
    const score = about ? about * 100 + said(f.words, defect.keywords) : 0;
    if (score > top) { top = score; at = i; }
  });
  return at;
}
