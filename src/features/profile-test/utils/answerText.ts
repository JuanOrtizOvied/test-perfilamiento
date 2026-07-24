/**
 * Display text for a stored answer, ported from the original `getResp`. Single
 * answers resolve to their option label, multi answers join labels with " | ",
 * and text/phone/personal answers pass through as strings.
 *
 * Shared by the frozen result payload (`api/submitResult.ts`) and the progress
 * snapshots (`api/submitProgress.ts`), so both read answers identically.
 */
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import type { AnswerValue, Answers, Question, QuestionType } from '@/core'

/** Raw string passthrough shared by the text/phone/personal question types. */
function rawStringAnswer(value: AnswerValue): string {
  return typeof value === 'string' ? value : ''
}

/** Resolver per question type; single/multi map option indices to labels. */
const ANSWER_TEXT_BY_TYPE: Record<
  QuestionType,
  (value: AnswerValue, question: Question) => string
> = {
  text: rawStringAnswer,
  phone: rawStringAnswer,
  personal: rawStringAnswer,
  single: (value, question) =>
    typeof value === 'number' ? (question.opts?.[value]?.label ?? '') : '',
  multi: (value, question) =>
    Array.isArray(value)
      ? value
          .map((optionIndex) => question.opts?.[optionIndex]?.label ?? '')
          .filter(Boolean)
          .join(' | ')
      : '',
}

export function answerText(questionId: string, answers: Answers): string {
  const question = QUESTIONS.find((candidate) => candidate.id === questionId)
  const value = answers[questionId]

  // Fields captured inside the personal form (e.g. Q0_ap) have no standalone
  // Question entry; return their raw string.
  if (!question) return rawStringAnswer(value)

  if (value === undefined || value === null) return ''
  return ANSWER_TEXT_BY_TYPE[question.tipo](value, question)
}
