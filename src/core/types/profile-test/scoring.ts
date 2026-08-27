import type { Answers } from './answers'

export interface ArchetypeScores {
  experienceScore: number
  involvementScore: number
  riskScore: number
  flowPreferenceScore: number
  collaborationMarker: number
  sophisticationMarker: number
  age56PlusMarker: number
}

export interface CapacityScores {
  financialCapacityScore: number
  investableWealthLevel: number
  monthlyIncomeNeedLevel: number
  debtLevel: number
}

export interface InternalSignals {
  trustScore: number
}

export type ScoreState = ArchetypeScores & CapacityScores & InternalSignals

export type Scores = ScoreState

export type CapacityId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5'

export interface ResolvedCapacity {
  id: CapacityId
  rawScore: number
  adjustedScore: number
  incomeNeedGap: number
  incomeNeedAdjustment: number
  debtGap: number
  debtAdjustment: number
}

export type ArchetypeId =
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6'
  | 'A7'
  | 'A8'
  | 'A9'
  | 'A10'
  | 'A11'
  | 'A12P'
  | 'A12S'

export interface ArchetypeRule {
  id: ArchetypeId
  description: string
  /**
   * Las reglas leen puntajes; las de Estepario leen además respuestas puntuales
   * (Q7, Q12, Q30, Q31), porque el documento las define por opción elegida y no
   * por tramo de score.
   */
  matches: (scores: ArchetypeScores, answers: Answers) => boolean
}

export interface ResolvedArchetype {
  id: ArchetypeId
  matchedRuleId: ArchetypeId | null
  isFallback: boolean
}

export type ExperienceLevel = 'basica' | 'media' | 'alta' | 'experta'
export type InvolvementLevel = 'bajo' | 'medio' | 'alto' | 'maximo'
/**
 * Cinco tramos, con los mismos nombres que usa Capacidad (en pantalla se
 * escriben con «&», p. ej. «Conservador & Moderado»). Estos valores son claves
 * internas; reemplazan la escala de cuatro (`dinamico`/`audaz`).
 */
export type RiskLevel =
  | 'conservador'
  | 'conservador-moderado'
  | 'moderado'
  | 'moderado-arriesgado'
  | 'arriesgado'
export type TrustLevel = 'baja' | 'media' | 'alta' | 'muy-alta'
export type CollaborationLevel = 'baja' | 'media' | 'alta' | 'maxima'
export type FlowPreferenceLevel = 'baja' | 'alta'

export interface DerivedLevels {
  experience: ExperienceLevel
  involvement: InvolvementLevel
  risk: RiskLevel
  trust: TrustLevel
  collaboration: CollaborationLevel
  flowPreference: FlowPreferenceLevel
}

export type CombinationFit = 'tipica' | 'viable' | 'atipica' | 'restringida'

export interface InvestorProfileResult {
  archetype: ArchetypeId
  capacity: CapacityId
  scores: ScoreState
  archetypeDetails: ResolvedArchetype
  capacityDetails: ResolvedCapacity
  derivedLevels: DerivedLevels
  combinationFit: CombinationFit
}

export interface ResolvedResult {
  archetype: string
  capacity: string
}
