/**
 * Snapshot del avance del test, el ÚNICO cuerpo que se envía: lo consumen tanto
 * el backend propio (`api/registerSabbiTestQuestionApi`) como el webhook
 * (`api/submitResult`), para que ambos reciban exactamente la misma estructura.
 *
 * Se registra un snapshot cada vez que cambia el contenido contestado (o sea,
 * por pregunta). Cada uno es autocontenido y va identificado por el `sessionId`
 * anónimo de la corrida: el backend hace upsert de una fila por corrida
 * (`INSERT ... ON CONFLICT (sessionId) DO UPDATE`), así que una petición fallida
 * la sana la siguiente respuesta y la fila siempre refleja el último estado.
 * Eso también permite capturar leads (los datos de contacto llegan con el primer
 * bloque contestado) y analítica de abandono sin exponer ningún GET público — el
 * retomar el test sigue siendo 100% localStorage.
 *
 * El cuerpo lleva el schema COMPLETO en todo momento: las 9 secciones con todas
 * sus preguntas, su catálogo de opciones y lo elegido. Las que aún no se
 * contestan viajan con `answer: []`, de modo que la forma no cambia entre
 * snapshots y el receptor no tiene que descubrir campos. La excepción es
 * `personal`: sus entradas son inputs de un formulario, no preguntas con
 * alternativas, así que van como `key` + `answer` en texto plano.
 *
 * Este módulo solo CONSTRUYE el snapshot. El envío vive en
 * `packages/http/register-sabbi-test-question` → `api/registerSabbiTestQuestionApi`
 * → `hooks/useRegisterSabbiTestQuestion` (backend propio) y en
 * `api/submitResult` (webhook).
 */
import { ARCHETYPES } from '@/features/profile-test/constants/archetypes'
import { CAPACITIES } from '@/features/profile-test/constants/capacities'
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import { PROGRESS_SCHEMA } from '@/features/profile-test/constants/progressSchema'
import {
  answerLabels,
  answerOptionIndexes,
  answerText,
} from '@/features/profile-test/utils/answerText'
import { answeredEntries } from '@/features/profile-test/utils/progressEntries'
import { applyCapacityAdjustments } from '@/features/profile-test/utils/scoring'
import {
  visibleTotal,
  visiblePosition,
} from '@/features/profile-test/utils/visibility'
import type {
  Answers,
  ProgressPayload,
  ProgressPersonalField,
  ProgressQuestion,
  ProgressResult,
  ProgressSection,
  ProgressSectionPayload,
  TestState,
} from '@/core'

/** Nombre de la opción en el payload: `opcion1`, `opcion2`, … (base 1). */
function optionKey(index: number): string {
  return `opcion${index + 1}`
}

/**
 * Índice de la opción que Q2 tiene por contestada cuando el objetivo la salta,
 * o `undefined` si Q2 sigue en el recorrido.
 *
 * Elegir "crecer a largo plazo" ES contestar el horizonte — por eso el test no
 * lo vuelve a preguntar (`skipQ2`) —, así que Q2 se serializa con esa opción y
 * viaja como cualquier otra respuesta. Se deriva de las respuestas, no del
 * `skipQ2` del estado, para que el payload sea coherente con lo que Q1 dice
 * AHORA: si el usuario vuelve atrás y cambia el objetivo, esto lo sigue.
 */
function skippedQ2Answer(answers: Answers): number | undefined {
  const [chosen] = answerOptionIndexes('Q1', answers)
  const option =
    chosen === undefined
      ? undefined
      : QUESTIONS.find((candidate) => candidate.id === 'Q1')?.opts?.[chosen]
  return option?.skipQ2 ? option.skipQ2Answer : undefined
}

/**
 * Serializa una pregunta con su catálogo de opciones completo y lo elegido.
 * `answer` lleva las etiquetas y `answerKeys` las claves equivalentes, para que
 * el receptor sepa qué opción fue sin comparar el texto entero.
 *
 * `answered` viene de la sección: mientras su `commitGate` no esté contestado,
 * la pregunta viaja con la respuesta vacía aunque el estado ya tenga un valor
 * (evita registrar datos de contacto a medio escribir).
 *
 * El par `levels`/`answerLevels` solo se agrega si alguna opción declara
 * `level` (hoy Q2): en las demás preguntas las claves ni siquiera aparecen.
 *
 * Q2 saltada no es un caso aparte en el payload: se serializa con la opción que
 * su objetivo dejó fijada, así que llega con label, clave y nivel como el resto.
 */
function buildQuestion(
  { id, key }: { id: string; key: string },
  answers: Answers,
  answered: boolean,
): ProgressQuestion {
  const question = QUESTIONS.find((candidate) => candidate.id === id)
  const options = question?.opts ?? []
  const opciones: Record<string, string> = {}
  const levels: Record<string, string> = {}
  options.forEach((option, index) => {
    opciones[optionKey(index)] = option.label
    if (option.level !== undefined) levels[optionKey(index)] = option.level
  })
  const hasLevels = Object.keys(levels).length > 0
  // Saltada: manda la opción implícita y no lo que hubiera guardado. Si contestó
  // Q2 y luego volvió atrás a cambiar el objetivo, esa respuesta ya no aplica.
  const implied = id === 'Q2' ? skippedQ2Answer(answers) : undefined
  const chosen =
    implied !== undefined
      ? [implied]
      : answered
        ? answerOptionIndexes(id, answers)
        : []

  return {
    id,
    key,
    // Los campos capturados dentro del formulario personal (p. ej. `Q0_ap`) no
    // tienen Question propia: se serializan como abiertos y su enunciado es la
    // clave, porque no hay texto de pregunta que mostrar.
    type: question?.tipo ?? 'personal',
    question: question?.texto ?? key,
    opciones,
    ...(hasLevels && { levels }),
    answer:
      implied !== undefined
        ? [options[implied].label]
        : answered
          ? answerLabels(id, answers)
          : [],
    answerKeys: chosen.map(optionKey),
    ...(hasLevels && {
      answerLevels: chosen
        .map((index) => options[index].level)
        .filter((level): level is string => level !== undefined),
    }),
  }
}

/**
 * Serializa un campo abierto del formulario personal: la clave y el texto que
 * el usuario escribió, sin enunciado ni opciones — no son preguntas con
 * alternativas, son inputs.
 */
function buildPersonalField(
  { id, key }: { id: string; key: string },
  answers: Answers,
  answered: boolean,
): ProgressPersonalField {
  return { key, answer: answered ? answerText(id, answers) : '' }
}

/** Una sección con todas sus preguntas, contestadas o no. */
function buildSection(
  section: ProgressSection,
  answers: Answers,
): ProgressSectionPayload {
  const answered =
    !section.commitGate || answerText(section.commitGate, answers) !== ''

  return {
    key: section.key,
    title: section.title,
    questions: section.questions.map((question) =>
      section.plainFields
        ? buildPersonalField(question, answers, answered)
        : buildQuestion(question, answers, answered),
    ),
  }
}

/** El schema completo en orden, con las respuestas que haya hasta ahora. */
export function buildSections(answers: Answers): ProgressSectionPayload[] {
  return PROGRESS_SCHEMA.map((section) => buildSection(section, answers))
}

/**
 * The milestone a snapshot represents: `'result'` once completed, otherwise the
 * key of the last answered question in schema order, or `''` before anything.
 */
export function progressMilestone(state: TestState): string {
  if (state.result) return 'result'
  return answeredEntries(state.resp).at(-1)?.questionKey ?? ''
}

/**
 * Bloque `result`: el perfil resuelto y los acumuladores de puntaje. El perfil
 * llega vacío (con la misma forma) mientras el test está en curso; los puntajes
 * viajan siempre, porque son el acumulador vivo de la corrida. Se construye por
 * llamada para que cada snapshot lleve su propio objeto y nadie mute el de los
 * demás.
 */
function buildProgressResult(state: TestState): ProgressResult {
  const archetype = state.lastArq ? ARCHETYPES[state.lastArq] : undefined
  const capacity = state.lastCap ? CAPACITIES[state.lastCap] : undefined
  const resolved = Boolean(state.result && archetype && capacity)

  return {
    archetype: {
      id: resolved ? (state.lastArq ?? '') : '',
      name: resolved ? (archetype?.name ?? '') : '',
      tier: resolved ? (archetype?.tier ?? '') : '',
      description: resolved ? (archetype?.description ?? '') : '',
      strengths: resolved ? [...(archetype?.strengths ?? [])] : [],
      blindSpots: resolved ? [...(archetype?.blindSpots ?? [])] : [],
      imageUrl: resolved ? (archetype?.imageUrl ?? '') : '',
    },
    capacity: {
      // `id` lleva el nombre del tramo, no `C1…C5` (decisión 2026-08-19).
      id: resolved ? (capacity?.level ?? '') : '',
      label: resolved ? (capacity?.label ?? '') : '',
      portfolio: resolved
        ? (capacity?.portfolio
            .map((slice) => `${slice.assetClass} ${slice.range}`)
            .join(' | ') ?? '')
        : '',
    },
    // Nombres verbatim del test original. `CAP_score` lleva el puntaje de
    // capacidad YA AJUSTADO (penalidades de necesidad de ingresos y deuda),
    // según el documento de contexto donde los ajustes modifican `CAP_score`
    // mismo (decisión 2026-07-22).
    scores: {
      E_score: state.scores.experienceScore,
      I_score: state.scores.involvementScore,
      R_score: state.scores.riskScore,
      F_score: state.scores.flowPreferenceScore,
      CAP_score: applyCapacityAdjustments(state.scores),
      COLAB: state.scores.collaborationMarker,
      CONF: state.scores.trustScore,
    },
  }
}

/** Build the self-contained per-question snapshot for the current state. */
export function buildProgressPayload(state: TestState): ProgressPayload {
  const total = visibleTotal(state.skipQ2)
  const current = state.result
    ? total
    : visiblePosition(state.idx, state.skipQ2)

  return {
    sessionId: state.sessionId,
    status: state.result ? 'completed' : 'in_progress',
    milestone: progressMilestone(state),
    updatedAt: new Date().toISOString(),
    progressPct: Math.round((current / total) * 100),
    sections: buildSections(state.resp),
    result: buildProgressResult(state),
  }
}

/** `true` si el snapshot ya lleva al menos una respuesta. */
export function hasAnswers(payload: ProgressPayload): boolean {
  return payload.sections.some((section) =>
    section.questions.some((question) => question.answer.length > 0),
  )
}
