# Contract 0014 — The scorecard pairs each expected defect with its best finding

## Inputs
- Round 38, PB-2: the evaluation confirmed 9 findings for the key's 11 defects, all of them real, and `dev/score.ts`
  reported 3 false positives (precision 79%). Each defect took the first confirmed finding that shared a criterion
  and hit one keyword, so the key's AC-3 defects (negative, zero, fraction of a cent, no message) all went to the
  first AC-3 finding, and the findings that described them better were left over as "not in the answer key".

## Outputs
- `dev/score-match.ts` (`matchDefects`): each defect takes the finding, sharing a criterion, that hits most of its
  keywords; on a tie, one that isn't already another defect's best. A finding is real when it is a best or tied-best
  match of some defect, or hits two keywords of one; one generic keyword on a shared criterion doesn't clear it.
  `dev/score.ts` uses it, and its precision line counts findings (confirmed less false positives, over confirmed),
  not matched defects.
- The guardrail tier's pattern covers `dev/score*.ts`, so the matching sits with what it scores.

## Proof
- `tests/answer-keys.test.ts`: the best match wins over the first, and a tie goes to a finding not yet taken; a
  finding that is no best but hits two keywords is real, one hitting a single generic keyword is not; a shared
  criterion and a keyword hit are both still required.
- PB-2 of Round 38 scores 11/11 with no false positives; TOOL-1's score is unchanged.
- The project's proof steps (`agentctl verify --contract docs/contracts/0014-scorecard-matching.md`).

## Done when
- A real finding is no longer counted false because another finding took its defect.

## Bad result looks like
- A finding counted real without sharing a criterion and a keyword with some defect; an answer key changed.
