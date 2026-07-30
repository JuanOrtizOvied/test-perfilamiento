import { describe, it, expect, vi, afterEach } from 'vitest'
import { submitResult } from '@/features/profile-test/api/submitResult'
import { buildProgressPayload } from '@/features/profile-test/api/submitProgress'
import { createInitialState } from '@/features/profile-test/hooks/profileTestReducer'
import { PROFILE_TEST_WEBHOOK_URL } from '@tests/msw/handlers'
import type { ProgressPayload, TestState } from '@/core'

const finished: TestState = {
  ...createInitialState(),
  welcome: false,
  result: true,
  lastArq: 'A1',
  lastCap: 'C1',
  resp: {
    Q0: 'Ana',
    Q0_ap: 'Pérez',
    Q01: 'ana@correo.com',
    Q02: '+51 999 999 999',
    Q1: 0, // "Generar ingresos..."
    Q6: [0, 1], // "Acciones en bolsa" + "Bonos o renta fija"
  },
  scores: {
    ...createInitialState().scores,
    experienceScore: 5,
    financialCapacityScore: 2,
    collaborationMarker: 1,
    trustScore: 3,
  },
}

const payload = buildProgressPayload(finished)

describe('submitResult', () => {
  afterEach(() => vi.restoreAllMocks())

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

  it('posts the payload once, as JSON, to the configured webhook', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResult(payload, PROFILE_TEST_WEBHOOK_URL)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      PROFILE_TEST_WEBHOOK_URL,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  /**
   * El webhook recibe exactamente el mismo cuerpo que el backend propio: el
   * snapshot por secciones, ya en `completed`. Es una petición CORS de verdad
   * (el `Content-Type: application/json` está fuera de la lista segura), así que
   * el receptor tiene que responder los headers `Access-Control-Allow-*`.
   */
  it('sends the sectioned snapshot verbatim in the body', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResult(payload, PROFILE_TEST_WEBHOOK_URL)

    const body = JSON.parse(
      spy.mock.calls[0][1]!.body as string,
    ) as ProgressPayload

    expect(body.status).toBe('completed')
    expect(body.sections).toHaveLength(9)

    // El bloque personal va como campo abierto: clave y texto, nada más.
    expect(body.sections[0]).toEqual({
      key: 'personal',
      title: 'Datos personales',
      questions: [
        { key: 'name', answer: 'Ana' },
        { key: 'lastName', answer: 'Pérez' },
        { key: 'email', answer: 'ana@correo.com' },
        { key: 'phone', answer: '+51 999 999 999' },
      ],
    })

    const assets = body.sections
      .flatMap((section) => section.questions)
      .find((question) => question.key === 'assetTypes')
    if (!assets || !('opciones' in assets)) throw new Error('falta assetTypes')
    expect(assets.answer).toEqual(['Acciones en bolsa', 'Bonos o renta fija'])
    expect(assets.answerKeys).toEqual(['opcion1', 'opcion2'])
    expect(Object.keys(assets.opciones)).toHaveLength(10)

    expect(body.result.archetype.name).toBe('El Guardián')
    expect(body.result.capacity.portfolio).toContain(
      'Mercados Públicos - Fijo 34-44%',
    )
    expect(body.result.scores).toMatchObject({
      E_score: 5,
      CAP_score: 2,
      COLAB: 1,
      CONF: 3,
    })
  })
})
