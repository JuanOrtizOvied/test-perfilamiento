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

  it('posts once, no-cors, to the configured webhook', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResult(payload, PROFILE_TEST_WEBHOOK_URL)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      PROFILE_TEST_WEBHOOK_URL,
      expect.objectContaining({ method: 'POST', mode: 'no-cors' }),
    )
  })

  /**
   * El cuerpo va form-encoded a propósito: en `no-cors` el navegador descarta
   * cualquier header fuera de la lista segura de CORS, así que un
   * `Content-Type: application/json` no llegaría nunca y el receptor vería el
   * cuerpo como `text/plain`. Form-urlencoded sí sobrevive y además no dispara
   * preflight, que es lo que mantiene el envío en una sola petición.
   */
  it('form-encodes the payload, so no header outside the CORS safelist is needed', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResult(payload, PROFILE_TEST_WEBHOOK_URL)

    const init = spy.mock.calls[0][1]!
    expect(init.headers).toBeUndefined()
    expect(init.body).toBeInstanceOf(URLSearchParams)

    const body = init.body as URLSearchParams
    expect(body.get('nombre')).toBe('Ana')
    expect(body.get('correo')).toBe('ana@correo.com')
    expect(body.get('arquetipo_nombre')).toBe('El Guardián')
    expect(body.get('tipos_activos')).toBe(
      'Acciones en bolsa | Bonos o renta fija',
    )
    // Los numéricos viajan como texto, como en cualquier form-encoding.
    expect(body.get('E_score')).toBe('5')
    expect(body.get('CAP_score')).toBe('2')
    // Todos los campos del payload llegan, ninguno se pierde.
    expect([...body.keys()]).toHaveLength(Object.keys(payload).length)
  })
})
