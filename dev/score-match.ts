/**
 * How the scorecard pairs an answer key's expected defects with an evaluation's confirmed findings. A finding
 * matches a defect when they share a criterion and the finding's words hit the defect's keywords; the more keywords
 * it hits, the better the match.
 *   - Each defect takes its best finding; on a tie, one that isn't already another defect's best (two findings for
 *     what one key lists as two defects each get theirs, so the scorecard shows the finding that describes it).
 *   - A finding is real when it is a best (or tied-best) match of some defect, or hits two keywords of one: a single
 *     generic keyword ("transfer") on a shared criterion is not enough to clear a finding nothing else explains.
 */
export interface Matchable { criteria: string[]; words: string }
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
