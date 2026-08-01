export type QuestionType = 'personal' | 'text' | 'phone' | 'single' | 'multi'

export interface QuestionOption {
  label: string
  /**
   * Etiqueta cualitativa de la opción (p. ej. el horizonte de Q2: `'Corto
   * Plazo'`). Solo la llevan las preguntas donde el receptor necesita el
   * tramo además del texto; el resto la omite y no viaja en el payload.
   */
  level?: string
  experiencePoints?: number
  involvementPoints?: number
  riskPoints?: number
  flowPreferencePoints?: number
  financialCapacityPoints?: number
  collaborationPoints?: number
  trustPoints?: number
  sophisticationPoints?: number
  age56PlusMarker?: number
  investableWealthLevel?: number
  monthlyIncomeNeedLevel?: number
  debtLevel?: number | null
  skipQ2?: boolean
  /**
   * Índice de la opción de Q2 que esta opción deja contestada al saltarla. Solo
   * tiene sentido junto a `skipQ2`: elegir el objetivo YA fija el horizonte, por
   * eso el test no lo vuelve a preguntar. El payload serializa Q2 con esa opción
   * —label, clave y nivel—, igual que cualquier otra respuesta.
   */
  skipQ2Answer?: number
  exclusive?: boolean
}

export interface Question {
  id: string
  bloque: string
  tipo: QuestionType
  texto: string
  placeholder?: string
  inputType?: string
  ayuda?: string
  hidden?: boolean
  condicional?: boolean
  opts?: readonly QuestionOption[]
}
