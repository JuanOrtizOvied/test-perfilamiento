import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  submitResult,
  submitResultToExcel,
  submitResultToZapier,
} from '@/features/profile-test/api/submitResult'
import { buildProgressPayload } from '@/features/profile-test/api/submitProgress'
import { createInitialState } from '@/features/profile-test/hooks/profileTestReducer'
import { ARCHETYPES } from '@/features/profile-test/constants/archetypes'
import {
  PROFILE_TEST_WEBHOOK_URL,
  PROFILE_TEST_EXCEL_WEBHOOK_URL,
  PROFILE_TEST_ZAPIER_WEBHOOK_URL,
} from '@tests/msw/handlers'
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
    // El tramo viaja por nombre en `id`, no como `C1`.
    expect(body.result.capacity.id).toBe('Conservador')
    expect(body.result.scores).toMatchObject({
      E_score: 5,
      CAP_score: 2,
      COLAB: 1,
      CONF: 3,
    })
  })
})

/**
 * El webhook de Excel es el mismo envío contra otra URL: mismas guardas, mismo
 * cuerpo, mismo `Content-Type`. Lo único que cambia es el destino, porque del
 * otro lado el procedimiento (volcar las preguntas a una hoja) es distinto.
 */
describe('submitResultToExcel', () => {
  afterEach(() => vi.restoreAllMocks())

  it('skips the request when no webhook URL is configured', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResultToExcel(payload, '')
    expect(spy).not.toHaveBeenCalled()
  })

  it('skips the request for a TU_URL placeholder', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResultToExcel(payload, 'https://example.com/TU_URL')
    expect(spy).not.toHaveBeenCalled()
  })

  it('posts the same body as the result webhook, to its own URL', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResult(payload, PROFILE_TEST_WEBHOOK_URL)
    submitResultToExcel(payload, PROFILE_TEST_EXCEL_WEBHOOK_URL)

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1][0]).toBe(PROFILE_TEST_EXCEL_WEBHOOK_URL)
    expect(spy.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    expect(spy.mock.calls[1][1]!.body).toBe(spy.mock.calls[0][1]!.body)
  })
})

/**
 * El webhook de Zapier NO recibe el snapshot: manda una fila plana cuyas claves
 * son las columnas de la tabla del Zap, con los datos personales ya extraídos
 * del bloque `personal` y el resultado aplanado. Mismas guardas de URL.
 */
describe('submitResultToZapier', () => {
  afterEach(() => vi.restoreAllMocks())

  it('skips the request when no webhook URL is configured', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResultToZapier(payload, '')
    expect(spy).not.toHaveBeenCalled()
  })

  it('skips the request for a TU_URL placeholder', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResultToZapier(payload, 'https://example.com/TU_URL')
    expect(spy).not.toHaveBeenCalled()
  })

  it('posts the flat row with the Zap table column names', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    submitResultToZapier(payload, PROFILE_TEST_ZAPIER_WEBHOOK_URL)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBe(PROFILE_TEST_ZAPIER_WEBHOOK_URL)
    expect(spy.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const row = JSON.parse(spy.mock.calls[0][1]!.body as string) as Record<
      string,
      string
    >
    const guardian = ARCHETYPES.A1
    expect(row).toEqual({
      Nombre: 'Ana Pérez',
      Correo: 'ana@correo.com',
      Arquetipo: 'El Guardián',
      Tier: 'Seguidores',
      Capacidad: 'Conservador',
      'Descripción corta': guardian.description,
      'Fortaleza 1': guardian.strengths[0],
      'Fortaleza 2': guardian.strengths[1],
      'Punto ciego 1': guardian.blindSpots[0],
      'Punto ciego 2': guardian.blindSpots[1],
    })
  })
})
