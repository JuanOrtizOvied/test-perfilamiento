/**
 * Lectura de una respuesta guardada, en las tres formas que consumen los
 * payloads: los índices de opción elegidos, sus etiquetas, y el texto plano
 * (etiquetas unidas por " | ", como el `getResp` original).
 *
 * Las preguntas con opciones guardan índices — un número en las de selección
 * única, una lista en las múltiples —; las abiertas (nombre, correo, celular,
 * y los campos del formulario personal sin Question propia como `Q0_ap`)
 * guardan el string tal cual.
 */
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import type { AnswerValue, Answers, QuestionOption } from '@/core'

/** Passthrough de los tipos abiertos: cualquier otra cosa no es una respuesta. */
function rawStringAnswer(value: AnswerValue | undefined): string {
  return typeof value === 'string' ? value : ''
}

/** Índices elegidos, descartando los que no existan en el catálogo. */
function selectedIndexes(
  options: readonly QuestionOption[],
  value: AnswerValue | undefined,
): number[] {
  const indexes =
    typeof value === 'number' ? [value] : Array.isArray(value) ? [...value] : []
  return indexes.filter((index) => options[index] !== undefined)
}

function questionOptions(
  questionId: string,
): readonly QuestionOption[] | undefined {
  return QUESTIONS.find((candidate) => candidate.id === questionId)?.opts
}

/**
 * Índices (base 0) de las opciones elegidas. Vacío en las preguntas abiertas y
 * en las que aún no se contestan.
 */
export function answerOptionIndexes(
  questionId: string,
  answers: Answers,
): number[] {
  const options = questionOptions(questionId)
  return options ? selectedIndexes(options, answers[questionId]) : []
}

/**
 * Etiquetas elegidas: una en las de selección única, varias en las múltiples, y
 * el texto tal cual en las abiertas. Vacío si no hay respuesta.
 */
export function answerLabels(questionId: string, answers: Answers): string[] {
  const options = questionOptions(questionId)
  if (!options) {
    const text = rawStringAnswer(answers[questionId])
    return text ? [text] : []
  }
  return selectedIndexes(options, answers[questionId]).map(
    (index) => options[index].label,
  )
}

/** Texto plano de la respuesta (port de `getResp`). */
export function answerText(questionId: string, answers: Answers): string {
  return answerLabels(questionId, answers).join(' | ')
}
