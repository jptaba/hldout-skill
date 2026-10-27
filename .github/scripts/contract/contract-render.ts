/**
 * The requirement contract as markdown, for people: `heldout contract KEY` writes it to the scratch area, and
 * `heldout show KEY contract --md` prints it.
 */
import type { RequirementContract } from './contract-model';
import type { ContractReview } from './evidence';

export function renderContract(c: RequirementContract, review: ContractReview | undefined, reviewOk: boolean): string {
  const gapRow = (g: RequirementContract['gaps'][number]) =>
    `| ${g.id} | ${g.element} | ${g.kind} | ${g.required ? 'yes' : 'no'} | ${g.affects.join(', ')} | ${g.tried.map((t) => t.where).join(' → ')} | ${g.resolution}${g.value ? `: ${g.value}` : ''} |`;
  const esc = (s: string) => s.replace(/\|/g, '\\|');
  return [
    `# Requirement contract — ${c.key}: ${c.title}`, '',
    `_Built by the evaluator from the story (title, description, acceptance criteria), the images they show and the pages they link. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources${reviewOk ? '; an independent reviewer checked it' : ''}._`, '',
    `**Independent review:** ${review ? `${reviewOk ? '✅ all items supported' : '❌ open findings'} — ${review.reviewer}, ${review.reviewedAt.slice(0, 16)}` : '⚠️ not reviewed'}`, '',
    '## Sources read', '', '| Source | Contributes |', '| --- | --- |',
    ...c.sourcesRead.map((s) => `| ${s.file} | ${s.contributes ?? ''} |`), '',
    '## Acceptance criteria', '', '| AC | Layer | Criterion | Observable outcomes | Source |', '| --- | --- | --- | --- | --- |',
    ...c.acceptanceCriteria.map((a) => `| ${a.id} | ${a.layer} | ${esc(a.text)} | ${esc(a.outcomes.join('; '))} | ${a.source} |`), '',
    ...(c.endpoints.length ? ['## Endpoints', '', '| Endpoint | Auth | Success | Source |', '| --- | --- | --- | --- |',
      ...c.endpoints.map((e) => `| ${e.method} ${e.path} | ${e.auth ?? ''} | ${esc(e.success ?? '')} | ${e.source} |`), ''] : []),
    ...(c.rules.length ? ['## Rules and boundaries', '', ...c.rules.map((r) => `- **${r.id}** ${r.text} _(${r.source})_`), ''] : []),
    ...(c.errorModel.length ? ['## Error model', '', '| # | Case | Status | Body | Source |', '| --- | --- | --- | --- | --- |',
      ...c.errorModel.map((e) => `| ${e.id} | ${e.case} | ${e.status ?? ''} | ${esc(e.body ?? '')} | ${e.source} |`), ''] : []),
    ...(c.auth ? ['## Authentication', '', `${c.auth.mechanism}${c.auth.credentials ? ` — credentials: ${c.auth.credentials}` : ''} _(${c.auth.source})_`, ''] : []),
    ...(c.testData ? ['## Test data', '', c.testData.strategy, ...(c.testData.constraints ?? []).map((x) => `- ${x}`), ...(c.testData.cleanup ? [`- Cleanup: ${c.testData.cleanup}`] : []), ''] : []),
    '## Gaps', '', ...(c.gaps.length
      ? ['| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |', '| --- | --- | --- | --- | --- | --- | --- |', ...c.gaps.map(gapRow)]
      : ['_None: the requirement states every element the evaluation needs._']), '',
    ...(c.coverage?.length ? ['## Coverage ledger (every source line accounted for)', '', '| Lines | Captured as | Note |', '| --- | --- | --- |',
      ...c.coverage.map((e) => `| ${e.lines} | ${e.as} | ${esc(e.note ?? '')} |`), ''] : []),
  ].join('\n');
}
