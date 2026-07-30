import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileTestPage } from '@/features/profile-test/pages/ProfileTestPage'
import { saveProgress } from '@/features/profile-test/utils/savedProgress'
import { createInitialState } from '@/features/profile-test/hooks/profileTestReducer'
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import { welcome, nav } from '@/features/profile-test/constants/copy'
import type { ProgressPayload, TestState } from '@/core'

/**
 * El registro de respuestas se dispara desde la página, así que las garantías
 * de cadencia (una vez por pregunta, nada al navegar) se prueban aquí. Se
 * intercepta la capa api: así se ejercita el efecto real de la página y el hook
 * `useRegisterSabbiTestQuestion` completo, sin tocar la red.
 */
const registerApi = vi.hoisted(() => vi.fn())

vi.mock('@/features/profile-test/api/registerSabbiTestQuestionApi', () => ({
  default: registerApi,
}))

beforeEach(() => {
  localStorage.clear()
  registerApi.mockReset()
  registerApi.mockResolvedValue({ ok: true, status: 200, data: undefined })
})

/** Payloads registrados hasta ahora, en orden. */
function payloads(): ProgressPayload[] {
  return registerApi.mock.calls.map((call) => call[0] as ProgressPayload)
}

/**
 * Respuesta de una pregunta dentro del snapshot, buscándola por sección. Las
 * preguntas con opciones la traen como lista; los campos del bloque personal,
 * como texto.
 */
function answerOf(
  payload: ProgressPayload,
  sectionKey: string,
  questionKey: string,
): string | string[] {
  const section = payload.sections.find(
    (candidate) => candidate.key === sectionKey,
  )
  return (
    section?.questions.find((question) => question.key === questionKey)
      ?.answer ?? []
  )
}

describe('ProfileTestPage — registro de respuestas', () => {
  it('registra una vez al confirmar el bloque personal (captura del lead)', async () => {
    const user = userEvent.setup()
    render(<ProfileTestPage />)

    await user.click(screen.getByRole('button', { name: welcome.cta }))
    expect(registerApi).not.toHaveBeenCalled() // nada contestado todavía

    await user.type(screen.getByPlaceholderText('Tu nombre'), 'Ana María')
    await user.type(screen.getByPlaceholderText('Tu apellido'), 'Pérez')
    await user.type(
      screen.getByPlaceholderText('correo@ejemplo.com'),
      'ana@correo.com',
    )
    await user.type(screen.getByPlaceholderText('999 999 999'), '999888777')
    // Escribir no registra: el bloque personal espera al commitGate (Q02).
    expect(registerApi).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: nav.next }))

    expect(registerApi).toHaveBeenCalledTimes(1)
    const [payload] = payloads()
    expect(payload).toMatchObject({ milestone: 'phone', status: 'in_progress' })
    expect(answerOf(payload, 'personal', 'name')).toBe('Ana María')
    expect(answerOf(payload, 'personal', 'email')).toBe('ana@correo.com')
  })

  it('la selección múltiple se retiene hasta Continuar; el intermedio no re-registra', async () => {
    const user = userEvent.setup()
    // Retomado a media corrida: personal confirmado + Q3–Q5, parado en Q6
    // (índice 8, multi, y además dispara el intermedio de ese índice).
    const resumed: TestState = {
      ...createInitialState(),
      welcome: false,
      idx: 8,
      resp: {
        Q0: 'Ana',
        Q01: 'a@b.com',
        Q02: '+51 999888777',
        Q3: 0,
        Q4: 0,
        Q5: 0,
      },
    }
    saveProgress(resumed)

    render(<ProfileTestPage />)
    await user.click(screen.getByRole('button', { name: welcome.resumeCta }))

    // Retoma parado en Q6, que es multi: nada se registra mientras siga ahí, ni
    // siquiera el contenido restaurado.
    expect(registerApi).not.toHaveBeenCalled()

    // Sus opciones se exponen como checkbox, no como button. Marcar y desmarcar
    // tampoco registra.
    await user.click(
      screen.getByRole('checkbox', { name: QUESTIONS[8].opts![0].label }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: QUESTIONS[8].opts![1].label }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: QUESTIONS[8].opts![1].label }),
    ) // desmarca
    expect(registerApi).not.toHaveBeenCalled()

    // Continuar cierra la pregunta (el índice 8 abre intermedio) y ahí se
    // registra la selección completa, de una sola vez.
    await user.click(screen.getByRole('button', { name: nav.next }))
    expect(registerApi).toHaveBeenCalledTimes(1)
    const answered = payloads()[0]
    expect(answered.sessionId).toBe(resumed.sessionId)
    expect(answerOf(answered, 'experience', 'assetTypes')).toEqual([
      QUESTIONS[8].opts![0].label,
    ])

    // Salir del intermedio no cambia el contenido: no vuelve a registrar.
    await user.click(screen.getByRole('button', { name: nav.next }))
    expect(registerApi).toHaveBeenCalledTimes(1)
  })

  it('llegar al resultado registra el snapshot completed', async () => {
    const user = userEvent.setup()
    const lastQuestion = QUESTIONS[33] // Q31, última pregunta
    const atLastIntermission: TestState = {
      ...createInitialState(),
      welcome: false,
      idx: 33,
      interm: 33,
      resp: { Q02: '+51 999888777', [lastQuestion.id]: 0 },
    }
    saveProgress(atLastIntermission)

    render(<ProfileTestPage />)
    await user.click(screen.getByRole('button', { name: welcome.resumeCta }))
    expect(registerApi).toHaveBeenCalledTimes(1)
    expect(payloads()[0].status).toBe('in_progress')

    await user.click(
      screen.getByRole('button', { name: 'Conocer mi Perfil Sabbi' }),
    )

    expect(registerApi).toHaveBeenCalledTimes(2)
    expect(payloads()[1]).toMatchObject({
      milestone: 'result',
      status: 'completed',
      sessionId: atLastIntermission.sessionId,
    })
  })
})
