/**
 * Tablas de datos del motor de puntaje: el estado inicial y la correspondencia
 * peso-de-opción → campo-de-score. `utils/scoring.ts` solo las itera; las reglas
 * de arquetipo viven allá porque llevan predicados, no data.
 */
import type { QuestionOption, ScoreState } from '@/core'

/** Initial score state, verbatim from the original `S.sc` (note wealth = 1). */
export const INITIAL_SCORES: ScoreState = {
  experienceScore: 0,
  involvementScore: 0,
  riskScore: 0,
  flowPreferenceScore: 0,
  financialCapacityScore: 0,
  collaborationMarker: 0,
  trustScore: 0,
  sophisticationMarker: 0,
  age56PlusMarker: 0,
  investableWealthLevel: 1,
  monthlyIncomeNeedLevel: 0,
  debtLevel: 0,
}

/** Option weight → score-state field, for the signals that accumulate. */
export const ACCUMULATING_SIGNALS = [
  ['experiencePoints', 'experienceScore'],
  ['involvementPoints', 'involvementScore'],
  ['riskPoints', 'riskScore'],
  ['flowPreferencePoints', 'flowPreferenceScore'],
  ['financialCapacityPoints', 'financialCapacityScore'],
  ['collaborationPoints', 'collaborationMarker'],
  ['trustPoints', 'trustScore'],
  ['sophisticationPoints', 'sophisticationMarker'],
] as const satisfies ReadonlyArray<
  readonly [keyof QuestionOption, keyof ScoreState]
>

/**
 * Signals assigned directly (latest value wins); same field name on option and
 * state. Never reversed by `removeScore` (quirk 1).
 */
export const ASSIGNED_SIGNALS = [
  'age56PlusMarker',
  'investableWealthLevel',
  'monthlyIncomeNeedLevel',
  'debtLevel',
] as const satisfies ReadonlyArray<keyof QuestionOption & keyof ScoreState>
