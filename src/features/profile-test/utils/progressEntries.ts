import { answerText } from '@/features/profile-test/utils/answerText'
import { PROGRESS_SCHEMA } from '@/features/profile-test/constants/progressSchema'
import type { Answers } from '@/core'

type AnsweredEntry = { sectionKey: string; questionKey: string; text: string }

/**
 * Un solo recorrido de `PROGRESS_SCHEMA`: las preguntas contestadas en orden de
 * schema. Salta las secciones cuyo `commitGate` aún no tiene respuesta y las
 * respuestas vacías (texto `''` — incluye multiselección vacía). Las preguntas
 * no alcanzadas nunca aparecen.
 */
export function answeredEntries(answers: Answers): AnsweredEntry[] {
  return PROGRESS_SCHEMA.filter(
    (section) =>
      !section.commitGate || answerText(section.commitGate, answers) !== '',
  ).flatMap((section) =>
    section.questions
      .map((question) => ({
        sectionKey: section.key,
        questionKey: question.key,
        text: answerText(question.id, answers),
      }))
      .filter((entry) => entry.text !== ''),
  )
}
