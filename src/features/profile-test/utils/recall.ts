/**
 * Builds the dynamic "recall" intro shown at the top of each intermission,
 * ported from the original `INTERMS[*].build`. Returns typed segments (plain
 * text, answer chips, and one emphasized word) that the page renders above the
 * static intermission body. Verbatim connector copy lives in
 * `constants/intermissions.ts` (`recallCopy`).
 *
 * Intermissions after indices 4, 8, 14, 20 and 29 have a recall; index 33 does
 * not (its body is fully static). Missing source answers collapse to `null`,
 * matching the original empty-string result (nothing rendered).
 */
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import { recallCopy } from '@/features/profile-test/constants/intermissions'
import type { Answers, RecallSegment } from '@/core'

/** Option label for a single-answer question id, or null if unanswered. */
function optionText(questionId: string, answers: Answers): string | null {
  const question = QUESTIONS.find((candidate) => candidate.id === questionId)
  const index = answers[questionId]
  if (!question || typeof index !== 'number') return null
  return question.opts?.[index]?.label ?? null
}

/** The intermissions that surface one answer chip between fixed lead/tail copy. */
function singleChipRecall(
  questionId: string,
  answers: Answers,
  copy: { lead: string; tail: string },
): RecallSegment[] | null {
  const label = optionText(questionId, answers)
  if (!label) return null
  return [
    { text: copy.lead },
    { text: label.toLowerCase(), chip: true },
    { text: copy.tail },
  ]
}

/** Objective (Q1) plus an optional horizon (Q2, dropped when skipped). */
function buildObjectiveRecall(
  answers: Answers,
  skipQ2: boolean,
): RecallSegment[] {
  const objective = optionText('Q1', answers)
  const horizon = skipQ2 ? null : optionText('Q2', answers)
  const segments: RecallSegment[] = [{ text: recallCopy.after4.lead }]
  if (objective)
    segments.push({ text: ' ' }, { text: objective.toLowerCase(), chip: true })
  if (horizon)
    segments.push(
      { text: recallCopy.after4.horizon },
      { text: horizon.toLowerCase(), chip: true },
    )
  segments.push({ text: recallCopy.after4.tail })
  return segments
}

/** Risk (Q15) and, when the answer is present, the cash-flow need (Q18). */
function buildRiskFlowRecall(answers: Answers): RecallSegment[] | null {
  const risk = optionText('Q15', answers)
  if (!risk) return null
  const flow = optionText('Q18', answers)
  if (flow) {
    const connector = recallCopy.after20.both
    return [
      { text: connector.lead },
      { text: risk.toLowerCase(), chip: true },
      { text: connector.mid },
      { text: flow.toLowerCase(), chip: true },
      { text: connector.tailBefore },
      { text: connector.em, emphasis: 'em' },
      { text: connector.tailAfter },
    ]
  }
  const connector = recallCopy.after20.riskOnly
  return [
    { text: connector.lead },
    { text: risk.toLowerCase(), chip: true },
    { text: connector.tailBefore },
    { text: connector.em, emphasis: 'em' },
    { text: connector.tailAfter },
  ]
}

export function buildRecall(
  afterIndex: number,
  answers: Answers,
  skipQ2: boolean,
): RecallSegment[] | null {
  switch (afterIndex) {
    case 4:
      return buildObjectiveRecall(answers, skipQ2)
    case 8:
      return singleChipRecall('Q5', answers, recallCopy.after8)
    case 14:
      return singleChipRecall('Q11', answers, recallCopy.after14)
    case 20:
      return buildRiskFlowRecall(answers)
    case 29:
      return singleChipRecall('Q27', answers, recallCopy.after29)
    default:
      return null
  }
}
