/**
 * Scoring engine for the Test Perfil Sabbi. Ported bug-for-bug from the original
 * HTML `addSc`/`subSc`/`calcResult`, then refactored into named domain concepts:
 * a readable score state, an isolated capacity module, an ordered archetype rule
 * table, and derived internal levels. The externally visible result is unchanged
 * (archetype id + capacity id); everything else is internal structure.
 *
 * Preserved quirks (see feature README, do NOT "fix" here):
 *  - `removeScore` never subtracts the assigned markers/levels (age56PlusMarker,
 *    investableWealthLevel, monthlyIncomeNeedLevel, debtLevel), so those can go
 *    stale when a previous answer is changed on the way back.
 *  - A `debtLevel: null` option ("No estás seguro/a") does not reset a prior debtLevel,
 *    because the `!= null` guard skips it.
 *
 * The option-weight → score-state correspondence is declared once in the
 * `ACCUMULATING_SIGNALS` / `ASSIGNED_SIGNALS` tables (`constants/scoring.ts`);
 * `applyScore` and `removeScore` only iterate those tables.
 */
import {
  ACCUMULATING_SIGNALS,
  ASSIGNED_SIGNALS,
} from '@/features/profile-test/constants/scoring'
import { COMBINATION_MATRIX } from '@/features/profile-test/constants/combinations'
import type {
  ArchetypeId,
  ArchetypeRule,
  ArchetypeScores,
  CapacityId,
  CapacityScores,
  CollaborationLevel,
  CombinationFit,
  DerivedLevels,
  ExperienceLevel,
  FlowPreferenceLevel,
  InvestorProfileResult,
  InvolvementLevel,
  QuestionOption,
  ResolvedArchetype,
  ResolvedCapacity,
  ResolvedResult,
  RiskLevel,
  ScoreState,
  TrustLevel,
} from '@/core'

// ── Applying answers ────────────────────────────────────────────────────────

/**
 * Add an option's weights to the running scores: accumulating signals sum,
 * assigned signals overwrite. A missing or `null` field is skipped (`!= null`),
 * so `debtLevel: null` leaves the debt level untouched (quirk 2).
 */
export function applyScore(
  scores: ScoreState,
  option: QuestionOption,
): ScoreState {
  const next = { ...scores }
  for (const [pointsKey, scoreKey] of ACCUMULATING_SIGNALS) {
    const points = option[pointsKey]
    if (points != null) next[scoreKey] += points
  }
  for (const key of ASSIGNED_SIGNALS) {
    const value = option[key]
    if (value != null) next[key] = value
  }
  return next
}

/**
 * Subtract an option's weights. Only the accumulating signals are reversed; the
 * assigned markers/levels are intentionally left alone (quirk 1).
 */
export function removeScore(
  scores: ScoreState,
  option: QuestionOption,
): ScoreState {
  const next = { ...scores }
  for (const [pointsKey, scoreKey] of ACCUMULATING_SIGNALS) {
    const points = option[pointsKey]
    if (points != null) next[scoreKey] -= points
  }
  return next
}

// ── Capacity ────────────────────────────────────────────────────────────────

export function calculateIncomeNeedGap(scores: CapacityScores): number {
  return scores.monthlyIncomeNeedLevel - scores.investableWealthLevel
}

/**
 * Capacity penalty for needing monthly income relative to invested wealth.
 * Verbatim from the original `c8g` branch (a gap ≤ -1 applies no penalty).
 */
export function getIncomeNeedCapacityAdjustment(gap: number): number {
  if (gap <= -1) return 0
  if (gap === 0) return -1
  if (gap === 1) return -3
  if (gap === 2) return -5
  return -8 // gap >= 3
}

export function calculateDebtGap(scores: CapacityScores): number {
  return scores.debtLevel - scores.investableWealthLevel
}

/**
 * Capacity penalty for debt relative to invested wealth. Verbatim from the
 * original `DEBT > 0` branch: no debt applies no penalty, and a gap ≤ -2 within
 * the debt branch also applies none.
 */
export function getDebtCapacityAdjustment(
  debtLevel: number,
  gap: number,
): number {
  if (debtLevel === 0) return 0
  if (gap <= -2) return 0
  if (gap === -1) return -2
  if (gap === 0) return -4
  if (gap === 1) return -6
  return -10 // gap >= 2
}

export function applyCapacityAdjustments(scores: CapacityScores): number {
  const incomeNeedAdjustment = getIncomeNeedCapacityAdjustment(
    calculateIncomeNeedGap(scores),
  )
  const debtAdjustment = getDebtCapacityAdjustment(
    scores.debtLevel,
    calculateDebtGap(scores),
  )
  return scores.financialCapacityScore + incomeNeedAdjustment + debtAdjustment
}

// ── Threshold bands ─────────────────────────────────────────────────────────
//
// Shared ordered ladder for the capacity tier and the derived levels below: the
// first band whose upper bound the score falls under wins, otherwise `above`.
// `inclusive` keeps the original mix of `<=` and `<` bounds intact (capacity 3,
// involvement 13.1/17 and trust 15 were strict `<`), so the bands stay
// bug-for-bug.

type ScoreBand<Level> = {
  readonly max: number
  readonly inclusive: boolean
  readonly level: Level
}

function resolveBand<Level>(
  score: number,
  bands: readonly ScoreBand<Level>[],
  above: Level,
): Level {
  const band = bands.find((candidate) =>
    candidate.inclusive ? score <= candidate.max : score < candidate.max,
  )
  return band ? band.level : above
}

const CAPACITY_TIER_BANDS: readonly ScoreBand<CapacityId>[] = [
  { max: 3, inclusive: false, level: 'C1' },
  { max: 9, inclusive: true, level: 'C2' },
  { max: 14, inclusive: true, level: 'C3' },
  { max: 20, inclusive: true, level: 'C4' },
]

/** Bucket an adjusted capacity score into a tier (verbatim thresholds). */
export function resolveCapacityTier(adjustedScore: number): CapacityId {
  return resolveBand(adjustedScore, CAPACITY_TIER_BANDS, 'C5')
}

export function resolveCapacity(scores: CapacityScores): ResolvedCapacity {
  const rawScore = scores.financialCapacityScore
  const incomeNeedGap = calculateIncomeNeedGap(scores)
  const incomeNeedAdjustment = getIncomeNeedCapacityAdjustment(incomeNeedGap)
  const debtGap = calculateDebtGap(scores)
  const debtAdjustment = getDebtCapacityAdjustment(scores.debtLevel, debtGap)
  const adjustedScore = rawScore + incomeNeedAdjustment + debtAdjustment
  return {
    id: resolveCapacityTier(adjustedScore),
    rawScore,
    adjustedScore,
    incomeNeedGap,
    incomeNeedAdjustment,
    debtGap,
    debtAdjustment,
  }
}

// ── Archetype ───────────────────────────────────────────────────────────────

/**
 * Archetype rules in strict evaluation order — first match wins, exactly like
 * the original `calcResult` if/else chain. `A2` is intentionally the last rule
 * and is now strict (`experienceScore ≤ 7.5 && involvementScore ≤ 9`); any score
 * combination that matches no rule falls to A2 through the technical fallback in
 * `resolveArchetype`, flagged internally so it is distinguishable from a direct
 * A2 rule match.
 */
export const ARCHETYPE_RULES: readonly ArchetypeRule[] = [
  {
    id: 'A12P',
    description: 'Estepario Principiante',
    matches: (scores) =>
      scores.experienceScore <= 7.5 &&
      scores.involvementScore > 9 &&
      scores.collaborationMarker <= 3,
  },
  {
    id: 'A12S',
    description: 'Estepario Sabio',
    matches: (scores) =>
      scores.experienceScore >= 7.6 &&
      scores.involvementScore > 9 &&
      scores.collaborationMarker <= 3,
  },
  {
    id: 'A11',
    description: 'Arquitecto Líder',
    matches: (scores) =>
      scores.experienceScore >= 13.6 &&
      scores.involvementScore >= 17 &&
      scores.collaborationMarker >= 4,
  },
  {
    id: 'A10',
    description: 'Cazador de Alpha',
    matches: (scores) =>
      scores.experienceScore >= 13.6 &&
      scores.involvementScore >= 13.1 &&
      (scores.riskScore >= 21 || scores.sophisticationMarker >= 3),
  },
  {
    id: 'A9',
    description: 'Visionario Global',
    matches: (scores) =>
      scores.experienceScore >= 13.6 &&
      scores.involvementScore >= 9.1 &&
      scores.involvementScore < 17 &&
      scores.riskScore >= 16 &&
      scores.riskScore <= 20,
  },
  {
    id: 'A8',
    description: 'El Custodio Familiar',
    matches: (scores) =>
      scores.experienceScore >= 13.6 &&
      scores.involvementScore >= 9.1 &&
      scores.involvementScore < 17 &&
      scores.riskScore <= 15,
  },
  {
    id: 'A7',
    description: 'Cosechador de Renta',
    matches: (scores) =>
      scores.experienceScore >= 11.1 &&
      scores.experienceScore <= 13.5 &&
      scores.involvementScore > 9 &&
      scores.flowPreferenceScore >= 3,
  },
  {
    id: 'A6',
    description: 'Constructor Disciplinado',
    matches: (scores) =>
      scores.experienceScore >= 11.1 &&
      scores.experienceScore <= 13.5 &&
      scores.involvementScore > 9 &&
      scores.flowPreferenceScore < 3 &&
      scores.collaborationMarker >= 4,
  },
  {
    id: 'A5',
    description: 'Estratega Delegador',
    matches: (scores) =>
      scores.experienceScore >= 11.1 &&
      scores.experienceScore <= 13.5 &&
      scores.involvementScore <= 9,
  },
  {
    id: 'A4',
    description: 'Explorador Audaz',
    matches: (scores) =>
      scores.experienceScore >= 7.6 &&
      scores.experienceScore <= 11 &&
      scores.involvementScore > 9 &&
      scores.riskScore >= 16,
  },
  {
    id: 'A3',
    description: 'Aprendiz Activo',
    matches: (scores) =>
      scores.experienceScore <= 7.5 &&
      scores.involvementScore > 9 &&
      scores.collaborationMarker >= 4,
  },
  {
    id: 'A1',
    description: 'Guardián',
    matches: (scores) =>
      scores.experienceScore <= 7.5 &&
      scores.involvementScore <= 9 &&
      (scores.flowPreferenceScore >= 3 ||
        scores.riskScore <= 9 ||
        scores.age56PlusMarker >= 1),
  },
  {
    id: 'A2',
    description: 'Iniciador',
    matches: (scores) =>
      scores.experienceScore <= 7.5 && scores.involvementScore <= 9,
  },
]

/**
 * Archetype id used when no rule matches. Kept as `A2` for external
 * compatibility (the original chain ended in `else A2`), but the fallback is
 * flagged so callers can tell it apart from a direct A2 rule match.
 */
export const FALLBACK_ARCHETYPE_ID: ArchetypeId = 'A2'

export function resolveArchetype(scores: ArchetypeScores): ResolvedArchetype {
  const matchedRule = ARCHETYPE_RULES.find((rule) => rule.matches(scores))
  if (matchedRule)
    return {
      id: matchedRule.id,
      matchedRuleId: matchedRule.id,
      isFallback: false,
    }
  return { id: FALLBACK_ARCHETYPE_ID, matchedRuleId: null, isFallback: true }
}

// ── Combinación arquetipo × capacidad ───────────────────────────────────────

/**
 * Encaje de la combinación arquetipo × capacidad según la matriz del documento
 * (típica / viable / atípica / restringida). Uso interno: no altera el
 * resultado visible.
 */
export function resolveCombinationFit(
  archetype: ArchetypeId,
  capacity: CapacityId,
): CombinationFit {
  return COMBINATION_MATRIX[archetype][capacity]
}

// ── Derived internal levels ─────────────────────────────────────────────────
//
// Bands over the raw scores, exposed for internal use only (they are not part
// of the visible result). Where the archetype rules imply breakpoints
// (experience 7.5/11/13.5, involvement 9/13.1/17, risk 9/15/20) the bands reuse
// them; trust and collaboration follow the scoring tables of the context
// document (`context-profile/sistema-perfil-sabbi.md`).

const EXPERIENCE_BANDS: readonly ScoreBand<ExperienceLevel>[] = [
  { max: 7.5, inclusive: true, level: 'basica' },
  { max: 11, inclusive: true, level: 'media' },
  { max: 13.5, inclusive: true, level: 'alta' },
]

export function deriveExperienceLevel(
  experienceScore: number,
): ExperienceLevel {
  return resolveBand(experienceScore, EXPERIENCE_BANDS, 'experta')
}

const INVOLVEMENT_BANDS: readonly ScoreBand<InvolvementLevel>[] = [
  { max: 9, inclusive: true, level: 'bajo' },
  { max: 13.1, inclusive: false, level: 'medio' },
  { max: 17, inclusive: false, level: 'alto' },
]

export function deriveInvolvementLevel(
  involvementScore: number,
): InvolvementLevel {
  return resolveBand(involvementScore, INVOLVEMENT_BANDS, 'maximo')
}

const RISK_BANDS: readonly ScoreBand<RiskLevel>[] = [
  { max: 9, inclusive: true, level: 'conservador' },
  { max: 15, inclusive: true, level: 'moderado' },
  { max: 20, inclusive: true, level: 'dinamico' },
]

export function deriveRiskLevel(riskScore: number): RiskLevel {
  return resolveBand(riskScore, RISK_BANDS, 'audaz')
}

const TRUST_BANDS: readonly ScoreBand<TrustLevel>[] = [
  { max: 5, inclusive: true, level: 'baja' },
  { max: 10, inclusive: true, level: 'media' },
  { max: 15, inclusive: false, level: 'alta' },
]

export function deriveTrustLevel(trustScore: number): TrustLevel {
  return resolveBand(trustScore, TRUST_BANDS, 'muy-alta')
}

const COLLABORATION_BANDS: readonly ScoreBand<CollaborationLevel>[] = [
  { max: 3, inclusive: true, level: 'baja' },
  { max: 4, inclusive: true, level: 'media' },
  { max: 5, inclusive: true, level: 'alta' },
]

export function deriveCollaborationLevel(
  collaborationMarker: number,
): CollaborationLevel {
  return resolveBand(collaborationMarker, COLLABORATION_BANDS, 'maxima')
}

export function deriveFlowPreferenceLevel(
  flowPreferenceScore: number,
): FlowPreferenceLevel {
  return flowPreferenceScore >= 3 ? 'alta' : 'baja'
}

export function deriveLevels(scores: ScoreState): DerivedLevels {
  return {
    experience: deriveExperienceLevel(scores.experienceScore),
    involvement: deriveInvolvementLevel(scores.involvementScore),
    risk: deriveRiskLevel(scores.riskScore),
    trust: deriveTrustLevel(scores.trustScore),
    collaboration: deriveCollaborationLevel(scores.collaborationMarker),
    flowPreference: deriveFlowPreferenceLevel(scores.flowPreferenceScore),
  }
}

// ── Final profile resolution ────────────────────────────────────────────────

/**
 * Resolve the full investor profile from the final scores. This is the single
 * entry point the flow calls; it hides the capacity and archetype rules behind
 * one domain function.
 */
export function resolveInvestorProfile(
  scores: ScoreState,
): InvestorProfileResult {
  const archetypeDetails = resolveArchetype(scores)
  const capacityDetails = resolveCapacity(scores)
  return {
    archetype: archetypeDetails.id,
    capacity: capacityDetails.id,
    scores,
    archetypeDetails,
    capacityDetails,
    derivedLevels: deriveLevels(scores),
    combinationFit: resolveCombinationFit(
      archetypeDetails.id,
      capacityDetails.id,
    ),
  }
}

/**
 * Convenience façade returning only the visible archetype + capacity ids
 * (port of `calcResult`'s return). Delegates to `resolveInvestorProfile`.
 */
export function resolveResult(scores: ScoreState): ResolvedResult {
  const profile = resolveInvestorProfile(scores)
  return { archetype: profile.archetype, capacity: profile.capacity }
}
