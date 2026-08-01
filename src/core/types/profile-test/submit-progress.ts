import type { QuestionType } from './questions'

/** Entrada del schema: qué preguntas componen una sección y bajo qué clave. */
export interface ProgressSection {
  key: string
  title: string
  commitGate?: string
  /**
   * Serializa las entradas como campo abierto (`key` + `answer` en texto), sin
   * enunciado ni opciones. Es el caso de los datos personales: son inputs de un
   * formulario, no preguntas con alternativas.
   */
  plainFields?: boolean
  questions: readonly { id: string; key: string }[]
}

/**
 * Una pregunta serializada: su enunciado, el catálogo completo de opciones
 * (`opcion1`, `opcion2`, …) y lo elegido. `answer` y `answerKeys` son siempre
 * listas — una entrada en las de selección única, varias en las múltiples,
 * ninguna mientras no se conteste.
 *
 * `levels`/`answerLevels` son el par opcional: viajan SOLO en las preguntas
 * cuyas opciones declaran `level` (hoy únicamente Q2, el horizonte temporal).
 * En las demás los campos se omiten, así que la forma del resto no cambia.
 */
export interface ProgressQuestion {
  id: string
  key: string
  type: QuestionType
  question: string
  opciones: Record<string, string>
  /** Nivel de cada opción, bajo las mismas claves que `opciones`. */
  levels?: Record<string, string>
  answer: string[]
  answerKeys: string[]
  /** Nivel de lo elegido, alineado con `answer`/`answerKeys`. */
  answerLevels?: string[]
}

/**
 * Campo abierto del formulario personal: solo la clave y lo que el usuario
 * escribió. No lleva enunciado ni opciones porque no las tiene.
 */
export interface ProgressPersonalField {
  key: string
  answer: string
}

export type ProgressSectionQuestion = ProgressQuestion | ProgressPersonalField

export interface ProgressSectionPayload {
  key: string
  title: string
  questions: ProgressSectionQuestion[]
}

/** Acumuladores de puntaje, con los nombres verbatim del test original. */
export interface ProgressScores {
  E_score: number
  I_score: number
  R_score: number
  F_score: number
  CAP_score: number
  COLAB: number
  CONF: number
}

export interface ProgressResult {
  archetype: {
    id: string
    name: string
    tier: string
    description: string
    strengths: string[]
    blindSpots: string[]
    /** Hero del arquetipo en S3, la misma que muestra `ResultCard`. */
    imageUrl: string
  }
  capacity: { id: string; label: string; portfolio: string }
  scores: ProgressScores
}

export interface ProgressPayload {
  sessionId: string
  status: 'in_progress' | 'completed'
  milestone: string
  updatedAt: string
  progressPct: number
  sections: ProgressSectionPayload[]
  result: ProgressResult
}
