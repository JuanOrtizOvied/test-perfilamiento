import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  buildResultPayload,
  submitResult,
} from '@/features/profile-test/api/submitResult'
import type { BuildPayloadInput } from '@/core'
import { INITIAL_SCORES } from '@/features/profile-test/constants/scoring'
import { PROFILE_TEST_WEBHOOK_URL } from '@tests/msw/handlers'

const input: BuildPayloadInput = {
  answers: {
    Q0: 'Ana',
    Q0_ap: 'Pérez',
    Q01: 'ana@correo.com',
    Q02: '+51 999 999 999',
    Q1: 0, // "Generar ingresos..."
    Q6: [0, 1], // "Acciones en bolsa" + "Bonos o renta fija"
  },
  scores: {
    ...INITIAL_SCORES,
    experienceScore: 5,
    financialCapacityScore: 2,
    collaborationMarker: 1,
    trustScore: 3,
  },
  result: { archetype: 'A1', capacity: 'C1' },
}

describe('buildResultPayload', () => {
  const payload = buildResultPayload(input)

  it('maps contact fields verbatim', () => {
    expect(payload.nombre).toBe('Ana')
    expect(payload.apellido).toBe('Pérez')
    expect(payload.correo).toBe('ana@correo.com')
    expect(payload.telefono).toBe('+51 999 999 999')
  })

  it('resolves single answers to their option label', () => {
    expect(payload.objetivo_inversion).toBe(
      'Generar ingresos de tus inversiones para cubrir tus gastos',
    )
  })

  it('joins multi answers with " | "', () => {
    expect(payload.tipos_activos).toBe('Acciones en bolsa | Bonos o renta fija')
  })

  it('leaves unanswered questions empty', () => {
    expect(payload.horizonte_temporal).toBe('')
    expect(payload.postura_peru).toBe('')
  })

  it('expands archetype + capacity data', () => {
    expect(payload.arquetipo).toBe('A1')
    expect(payload.arquetipo_nombre).toBe('El Guardián')
    expect(payload.arquetipo_tier).toBe('Seguidores')
    expect(payload.fortaleza_1).toBe(
      'Tiene claras sus prioridades financieras.',
    )
    expect(payload.capacidad).toBe('C1')
    expect(payload.portafolio_texto).toContain(
      'Mercados Públicos - Fijo 34-44%',
    )
  })

  it('carries the scores, with CAP_score already adjusted', () => {
    expect(payload.E_score).toBe(5)
    // C8_gap = 0-1 = -1 (no penalty) and no debt: adjusted equals the raw 2.
    expect(payload.CAP_score).toBe(2)
    expect(payload.COLAB).toBe(1)
    expect(payload.CONF).toBe(3)
  })

  it('applies the income-need and debt penalties to CAP_score', () => {
    const adjusted = buildResultPayload({
      ...input,
      scores: { ...input.scores, monthlyIncomeNeedLevel: 2, debtLevel: 2 },
    })
    // C8_gap = 2-1 = 1 → -3; DEBT_gap = 2-1 = 1 → -6; 2-3-6 = -7.
    expect(adjusted.CAP_score).toBe(-7)
  })
})

describe('submitResult', () => {
  afterEach(() => vi.restoreAllMocks())

  const payload = buildResultPayload(input)

  it('skips the request when no webhook URL is configured', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResult(payload, '')
    expect(spy).not.toHaveBeenCalled()
  })

  it('skips the request for a TU_URL placeholder', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResult(payload, 'https://example.com/TU_URL')
    expect(spy).not.toHaveBeenCalled()
  })

  it('posts no-cors JSON to the configured webhook', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResult(payload, PROFILE_TEST_WEBHOOK_URL)
    expect(spy).toHaveBeenCalledWith(
      PROFILE_TEST_WEBHOOK_URL,
      expect.objectContaining({ method: 'POST', mode: 'no-cors' }),
    )
  })
})
