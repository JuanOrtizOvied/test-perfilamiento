import { describe, it, expect } from 'vitest'
import type { Answers, QuestionOption, ScoreState } from '@/core'
import { INITIAL_SCORES } from '@/features/profile-test/constants/scoring'
import {
  applyScore,
  removeScore,
  calculateIncomeNeedGap,
  getIncomeNeedCapacityAdjustment,
  calculateDebtGap,
  getDebtCapacityAdjustment,
  applyCapacityAdjustments,
  resolveCapacityTier,
  resolveCapacity,
  ARCHETYPE_RULES,
  isAutonomousProfile,
  resolveArchetype,
  resolveCombinationFit,
  deriveLevels,
  resolveInvestorProfile,
  resolveResult,
} from '@/features/profile-test/utils/scoring'

/** Build a full score state from a partial override. */
function scores(partial: Partial<ScoreState> = {}): ScoreState {
  return { ...INITIAL_SCORES, ...partial }
}

/**
 * Las cuatro respuestas que marcan autonomía: decide solo (Q7), no quiere
 * comunidad (Q12), no delegaría (Q30) y nunca delegó (Q31). Son la condición
 * de Estepario desde que la regla dejó de mirar puntajes.
 */
const AUTONOMOUS: Answers = { Q7: 2, Q12: 0, Q30: 0, Q31: 0 }

/** Sin respuestas no hay autonomía: el caso por defecto de todas las demás reglas. */
const NOT_AUTONOMOUS: Answers = {}

describe('INITIAL_SCORES', () => {
  it('starts investable wealth at 1 and everything else at 0 (verbatim S.sc)', () => {
    expect(INITIAL_SCORES).toEqual({
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
    })
  })
})

describe('applyScore', () => {
  it('accumulates experience/involvement/risk/flow/capacity/collaboration/trust/sophistication', () => {
    const next = applyScore(
      scores({ experienceScore: 2, sophisticationMarker: 1 }),
      { label: 'x', experiencePoints: 0.5, sophisticationPoints: 1 },
    )
    expect(next.experienceScore).toBe(2.5)
    expect(next.sophisticationMarker).toBe(2)
  })

  it('assigns the age marker and wealth/income/debt levels (latest value wins)', () => {
    const next = applyScore(
      scores({
        investableWealthLevel: 1,
        monthlyIncomeNeedLevel: 2,
        debtLevel: 4,
        age56PlusMarker: 0,
      }),
      {
        label: 'x',
        investableWealthLevel: 5,
        monthlyIncomeNeedLevel: 3,
        debtLevel: 1,
        age56PlusMarker: 1,
      },
    )
    expect(next.investableWealthLevel).toBe(5)
    expect(next.monthlyIncomeNeedLevel).toBe(3)
    expect(next.debtLevel).toBe(1)
    expect(next.age56PlusMarker).toBe(1)
  })

  it('quirk 2: a debtLevel:null option does not reset a prior debt level', () => {
    const option: QuestionOption = {
      label: 'No estás seguro/a',
      financialCapacityPoints: -3,
      debtLevel: null,
    }
    const next = applyScore(scores({ debtLevel: 3 }), option)
    expect(next.debtLevel).toBe(3)
    expect(next.financialCapacityScore).toBe(-3)
  })

  it('does not mutate the input scores', () => {
    const base = scores({ experienceScore: 1 })
    applyScore(base, { label: 'x', experiencePoints: 5 })
    expect(base.experienceScore).toBe(1)
  })
})

describe('removeScore', () => {
  it('reverses the accumulating fields', () => {
    const next = removeScore(
      scores({ experienceScore: 3, financialCapacityScore: 10 }),
      { label: 'x', experiencePoints: 1, financialCapacityPoints: 4 },
    )
    expect(next.experienceScore).toBe(2)
    expect(next.financialCapacityScore).toBe(6)
  })

  it('quirk 1: never touches the assigned markers/levels', () => {
    const option: QuestionOption = {
      label: 'x',
      age56PlusMarker: 1,
      investableWealthLevel: 5,
      monthlyIncomeNeedLevel: 3,
      debtLevel: 2,
      financialCapacityPoints: 5,
    }
    const next = removeScore(
      scores({
        age56PlusMarker: 1,
        investableWealthLevel: 5,
        monthlyIncomeNeedLevel: 3,
        debtLevel: 2,
        financialCapacityScore: 5,
      }),
      option,
    )
    expect(next.age56PlusMarker).toBe(1)
    expect(next.investableWealthLevel).toBe(5)
    expect(next.monthlyIncomeNeedLevel).toBe(3)
    expect(next.debtLevel).toBe(2)
    expect(next.financialCapacityScore).toBe(0)
  })
})

describe('capacity — income-need gap adjustment', () => {
  it('computes the gap as monthlyIncomeNeedLevel − investableWealthLevel', () => {
    expect(
      calculateIncomeNeedGap(
        scores({ monthlyIncomeNeedLevel: 3, investableWealthLevel: 1 }),
      ),
    ).toBe(2)
  })

  it.each([
    [-1, 0],
    [0, -1],
    [1, -3],
    [2, -5],
    [3, -8],
    [5, -8],
  ])('gap %d → %d', (gap, adjustment) => {
    expect(getIncomeNeedCapacityAdjustment(gap)).toBe(adjustment)
  })
})

describe('capacity — debt gap adjustment', () => {
  it('computes the gap as debtLevel − investableWealthLevel', () => {
    expect(
      calculateDebtGap(scores({ debtLevel: 3, investableWealthLevel: 1 })),
    ).toBe(2)
  })

  it('no debt applies no adjustment regardless of gap', () => {
    expect(getDebtCapacityAdjustment(0, -5)).toBe(0)
    expect(getDebtCapacityAdjustment(0, 5)).toBe(0)
  })

  it.each([
    [-2, 0],
    [-1, -2],
    [0, -4],
    [1, -6],
    [2, -10],
    [4, -10],
  ])('debt present, gap %d → %d', (gap, adjustment) => {
    expect(getDebtCapacityAdjustment(3, gap)).toBe(adjustment)
  })
})

describe('capacity — tiers', () => {
  it.each([
    [2, 'C1'],
    [3, 'C2'],
    [9, 'C2'],
    [10, 'C3'],
    [14, 'C3'],
    [15, 'C4'],
    [20, 'C4'],
    [21, 'C5'],
  ])('adjusted score %d → %s', (score, expected) => {
    expect(resolveCapacityTier(score)).toBe(expected)
  })
})

describe('resolveCapacity', () => {
  // With defaults (wealth=1, income=0, debt=0) no adjustment applies, so the raw
  // capacity passes through and the label range mismatch (quirk 3) still holds.
  it('passes the raw score through when no adjustments apply', () => {
    const resolved = resolveCapacity(scores({ financialCapacityScore: 10 }))
    expect(resolved).toEqual({
      id: 'C3',
      rawScore: 10,
      adjustedScore: 10,
      incomeNeedGap: -1,
      incomeNeedAdjustment: 0,
      debtGap: -1,
      debtAdjustment: 0,
    })
  })

  it('applies both the income-need and debt adjustments', () => {
    // wealth=1, income=2 → gap 1 → -3; debt=3 → gap 2 → -10; 30 - 13 = 17 → C4.
    const resolved = resolveCapacity(
      scores({
        financialCapacityScore: 30,
        investableWealthLevel: 1,
        monthlyIncomeNeedLevel: 2,
        debtLevel: 3,
      }),
    )
    expect(resolved.incomeNeedAdjustment).toBe(-3)
    expect(resolved.debtAdjustment).toBe(-10)
    expect(resolved.adjustedScore).toBe(17)
    expect(resolved.id).toBe('C4')
  })

  it('applyCapacityAdjustments returns the same adjusted score', () => {
    const scoreState = scores({
      financialCapacityScore: 30,
      investableWealthLevel: 1,
      monthlyIncomeNeedLevel: 2,
      debtLevel: 3,
    })
    expect(applyCapacityAdjustments(scoreState)).toBe(
      resolveCapacity(scoreState).adjustedScore,
    )
  })
})

describe('resolveArchetype — ordered rule table', () => {
  it('exposes the 13 rules in the frozen evaluation order', () => {
    expect(ARCHETYPE_RULES.map((rule) => rule.id)).toEqual([
      'A12P',
      'A12S',
      'A11',
      'A10',
      'A9',
      'A8',
      'A7',
      'A6',
      'A5',
      'A4',
      'A3',
      'A1',
      'A2',
    ])
  })

  it.each([
    // Estepario: la regla ya no mira I ni COLAB, solo la experiencia y las
    // cuatro respuestas de autonomía.
    ['A12P', scores({ experienceScore: 5 }), AUTONOMOUS],
    ['A12S', scores({ experienceScore: 8 }), AUTONOMOUS],
    [
      'A11',
      scores({
        experienceScore: 14,
        involvementScore: 17,
        collaborationMarker: 4,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A10',
      scores({
        experienceScore: 14,
        involvementScore: 14,
        riskScore: 21,
        collaborationMarker: 4,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A9',
      scores({
        experienceScore: 14,
        involvementScore: 10,
        riskScore: 16,
        collaborationMarker: 4,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A8',
      scores({
        experienceScore: 14,
        involvementScore: 10,
        riskScore: 10,
        collaborationMarker: 4,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A7',
      scores({
        experienceScore: 12,
        involvementScore: 10,
        flowPreferenceScore: 3,
        collaborationMarker: 4,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A6',
      scores({
        experienceScore: 12,
        involvementScore: 10,
        flowPreferenceScore: 0,
        collaborationMarker: 4,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A5',
      scores({
        experienceScore: 12,
        involvementScore: 9,
        collaborationMarker: 0,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A4',
      scores({
        experienceScore: 8,
        involvementScore: 10,
        riskScore: 16,
        collaborationMarker: 4,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A3',
      scores({
        experienceScore: 5,
        involvementScore: 10,
        collaborationMarker: 4,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A1',
      scores({
        experienceScore: 5,
        involvementScore: 5,
        flowPreferenceScore: 3,
        collaborationMarker: 0,
      }),
      NOT_AUTONOMOUS,
    ],
    [
      'A2',
      scores({
        experienceScore: 5,
        involvementScore: 5,
        flowPreferenceScore: 0,
        riskScore: 10,
        collaborationMarker: 0,
      }),
      NOT_AUTONOMOUS,
    ],
  ])('resolves %s', (expected, sc, answers) => {
    expect(resolveArchetype(sc, answers).id).toBe(expected)
  })

  it('A10 via the sophistication ≥ 3 branch (crypto/alts count)', () => {
    expect(
      resolveArchetype(
        scores({
          experienceScore: 14,
          involvementScore: 14,
          riskScore: 0,
          sophisticationMarker: 3,
          collaborationMarker: 4,
        }),
        NOT_AUTONOMOUS,
      ).id,
    ).toBe('A10')
  })

  it('A1 via the age 56+ branch (older investor)', () => {
    expect(
      resolveArchetype(
        scores({
          experienceScore: 5,
          involvementScore: 5,
          flowPreferenceScore: 0,
          riskScore: 10,
          age56PlusMarker: 1,
          collaborationMarker: 0,
        }),
        NOT_AUTONOMOUS,
      ).id,
    ).toBe('A1')
  })

  it('experience boundary splits A12P (≤7.5) from A12S (≥7.6) con las mismas respuestas', () => {
    expect(
      resolveArchetype(scores({ experienceScore: 7.5 }), AUTONOMOUS).id,
    ).toBe('A12P')
    expect(
      resolveArchetype(scores({ experienceScore: 7.6 }), AUTONOMOUS).id,
    ).toBe('A12S')
  })

  it('Estepario exige las cuatro respuestas: basta que falle una para no serlo', () => {
    const sc = scores({ experienceScore: 14, involvementScore: 14 })
    expect(resolveArchetype(sc, AUTONOMOUS).id).toBe('A12S')
    // Q7 delegando, Q12 con interés en comunidad, Q30 cómodo delegando y Q31
    // habiendo delegado antes: cada una por separado rompe la regla.
    for (const broken of [
      { ...AUTONOMOUS, Q7: 1 },
      { ...AUTONOMOUS, Q12: 2 },
      { ...AUTONOMOUS, Q30: 1 },
      { ...AUTONOMOUS, Q31: 4 },
    ]) {
      expect(resolveArchetype(sc, broken).id).not.toBe('A12S')
    }
  })

  it('flow-preference boundary splits A7 (≥3) from A6 (<3)', () => {
    const base = {
      experienceScore: 12,
      involvementScore: 10,
      collaborationMarker: 4,
    }
    expect(
      resolveArchetype(
        scores({ ...base, flowPreferenceScore: 3 }),
        NOT_AUTONOMOUS,
      ).id,
    ).toBe('A7')
    expect(
      resolveArchetype(
        scores({ ...base, flowPreferenceScore: 2 }),
        NOT_AUTONOMOUS,
      ).id,
    ).toBe('A6')
  })
})

describe('resolveArchetype — A2 rule vs technical fallback', () => {
  it('A2 is a direct rule match when experience ≤ 7.5 and involvement ≤ 9', () => {
    const resolved = resolveArchetype(
      scores({
        experienceScore: 5,
        involvementScore: 5,
        flowPreferenceScore: 0,
        riskScore: 10,
        collaborationMarker: 0,
      }),
      NOT_AUTONOMOUS,
    )
    expect(resolved).toEqual({
      id: 'A2',
      matchedRuleId: 'A2',
      isFallback: false,
    })
  })

  it('uncovered scores fall back to A2, flagged as a fallback (mid experience, low involvement)', () => {
    // experience 8 (>7.5, ≤11) with involvement 5 (≤9) matches no rule.
    const resolved = resolveArchetype(
      scores({ experienceScore: 8, involvementScore: 5 }),
      NOT_AUTONOMOUS,
    )
    expect(resolved).toEqual({
      id: 'A2',
      matchedRuleId: null,
      isFallback: true,
    })
  })

  it('uncovered scores fall back to A2 (high experience, low involvement)', () => {
    // experience 14 (≥13.6) with involvement 5 (≤9) matches no rule.
    const resolved = resolveArchetype(
      scores({ experienceScore: 14, involvementScore: 5 }),
      NOT_AUTONOMOUS,
    )
    expect(resolved).toEqual({
      id: 'A2',
      matchedRuleId: null,
      isFallback: true,
    })
  })
})

describe('isAutonomousProfile — las cuatro condiciones de Estepario', () => {
  it('acepta las dos opciones de Q12 que no quieren comunidad', () => {
    expect(isAutonomousProfile({ ...AUTONOMOUS, Q12: 0 })).toBe(true)
    expect(isAutonomousProfile({ ...AUTONOMOUS, Q12: 1 })).toBe(true)
    expect(isAutonomousProfile({ ...AUTONOMOUS, Q12: 2 })).toBe(false)
  })

  it('pide respuesta en las cuatro preguntas: sin contestar no alcanza', () => {
    expect(isAutonomousProfile({})).toBe(false)
    expect(isAutonomousProfile({ Q7: 2, Q30: 0, Q31: 0 })).toBe(false)
  })
})

describe('resolveArchetype — el hueco que dejó la regla nueva de Estepario', () => {
  // La regla vieja (I > 9 AND COLAB ≤ 3) atrapaba a todo el perfil autónomo y
  // poco colaborativo. La nueva es más angosta y nadie ocupa ese lugar: A3 pide
  // COLAB ≥ 4 y A1/A2 piden I ≤ 9. Estos casos fijan el comportamiento para
  // poder medirlo — no es un acierto del sistema, es un riesgo abierto (P1).
  it.each([
    ['baja experiencia', scores({ experienceScore: 5, involvementScore: 10 })],
    [
      'experiencia media sin apetito de riesgo',
      scores({ experienceScore: 8, involvementScore: 10, riskScore: 10 }),
    ],
    [
      'experiencia alta sin preferencia por flujos',
      scores({
        experienceScore: 12,
        involvementScore: 10,
        flowPreferenceScore: 0,
      }),
    ],
    [
      'experto con involucramiento máximo',
      scores({ experienceScore: 14, involvementScore: 17, riskScore: 10 }),
    ],
  ])(
    'un perfil poco colaborativo (%s) que no cumple las 4 respuestas cae al fallback',
    (_caso, sc) => {
      expect(resolveArchetype(sc, NOT_AUTONOMOUS)).toEqual({
        id: 'A2',
        matchedRuleId: null,
        isFallback: true,
      })
    },
  )
})

describe('deriveLevels', () => {
  it('maps raw scores to internal bands', () => {
    expect(
      deriveLevels(
        scores({
          experienceScore: 14,
          involvementScore: 18,
          riskScore: 21,
          trustScore: 12,
          collaborationMarker: 5,
          flowPreferenceScore: 4,
        }),
      ),
    ).toEqual({
      experience: 'experta',
      involvement: 'maximo',
      risk: 'moderado-arriesgado',
      trust: 'alta',
      collaboration: 'alta',
      flowPreference: 'alta',
    })
  })

  it('maps the initial scores to the lowest bands', () => {
    expect(deriveLevels(INITIAL_SCORES)).toEqual({
      experience: 'basica',
      involvement: 'bajo',
      risk: 'conservador',
      trust: 'baja',
      collaboration: 'baja',
      flowPreference: 'baja',
    })
  })

  it('risk bands: cinco tramos con los nombres de Capacidad (7/12/16/21)', () => {
    // Los umbrales de las REGLAS de arquetipo siguen en la escala vieja (9, 15,
    // 16, 20, 21) — el documento los dejó intactos a propósito. Estas bandas
    // son solo lectura, y por eso se desalinean en los bordes (P5).
    expect(deriveLevels(scores({ riskScore: 7 })).risk).toBe('conservador')
    expect(deriveLevels(scores({ riskScore: 8 })).risk).toBe(
      'conservador-moderado',
    )
    expect(deriveLevels(scores({ riskScore: 12 })).risk).toBe(
      'conservador-moderado',
    )
    expect(deriveLevels(scores({ riskScore: 13 })).risk).toBe('moderado')
    expect(deriveLevels(scores({ riskScore: 16 })).risk).toBe('moderado')
    expect(deriveLevels(scores({ riskScore: 17 })).risk).toBe(
      'moderado-arriesgado',
    )
    expect(deriveLevels(scores({ riskScore: 21 })).risk).toBe(
      'moderado-arriesgado',
    )
    expect(deriveLevels(scores({ riskScore: 22 })).risk).toBe('arriesgado')
  })

  it('trust band per the context document: alta is 11–14, muy-alta starts at 15', () => {
    expect(deriveLevels(scores({ trustScore: 14 })).trust).toBe('alta')
    expect(deriveLevels(scores({ trustScore: 15 })).trust).toBe('muy-alta')
  })

  it('collaboration bands per the context document: media=4, alta=5, maxima>=6', () => {
    expect(deriveLevels(scores({ collaborationMarker: 3 })).collaboration).toBe(
      'baja',
    )
    expect(deriveLevels(scores({ collaborationMarker: 4 })).collaboration).toBe(
      'media',
    )
    expect(deriveLevels(scores({ collaborationMarker: 5 })).collaboration).toBe(
      'alta',
    )
    expect(deriveLevels(scores({ collaborationMarker: 6 })).collaboration).toBe(
      'maxima',
    )
  })
})

describe('resolveInvestorProfile', () => {
  it('bundles archetype, capacity, and internal details', () => {
    // riskScore 10 keeps this out of A1 (which fires on riskScore ≤ 9).
    const profile = resolveInvestorProfile(
      scores({
        experienceScore: 5,
        involvementScore: 5,
        riskScore: 10,
        financialCapacityScore: 10,
      }),
      NOT_AUTONOMOUS,
    )
    expect(profile.archetype).toBe('A2')
    expect(profile.capacity).toBe('C3')
    expect(profile.archetypeDetails.isFallback).toBe(false)
    expect(profile.capacityDetails.id).toBe('C3')
    expect(profile.derivedLevels.experience).toBe('basica')
    expect(profile.scores.experienceScore).toBe(5)
    expect(profile.combinationFit).toBe('tipica')
  })

  it('resolveResult returns only the visible archetype + capacity ids', () => {
    expect(
      resolveResult(
        scores({ experienceScore: 5, involvementScore: 5, riskScore: 10 }),
        NOT_AUTONOMOUS,
      ),
    ).toEqual({
      archetype: 'A2',
      capacity: 'C1',
    })
  })
})

describe('resolveCombinationFit', () => {
  it('clasifica combinaciones según la matriz del documento', () => {
    expect(resolveCombinationFit('A1', 'C1')).toBe('tipica')
    expect(resolveCombinationFit('A1', 'C4')).toBe('atipica')
    expect(resolveCombinationFit('A4', 'C1')).toBe('restringida')
    expect(resolveCombinationFit('A10', 'C2')).toBe('restringida')
    expect(resolveCombinationFit('A10', 'C3')).toBe('atipica')
    expect(resolveCombinationFit('A10', 'C5')).toBe('tipica')
    expect(resolveCombinationFit('A12S', 'C2')).toBe('viable')
  })
})
