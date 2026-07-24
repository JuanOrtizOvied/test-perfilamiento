import { describe, it, expect } from 'vitest'
import {
  progressMilestone,
  buildProgressPayload,
} from '@/features/profile-test/api/submitProgress'
import { createInitialState } from '@/features/profile-test/hooks/profileTestReducer'
import type { TestState } from '@/core'

/** Snapshot right after the personal form was committed. */
function personalDone(): TestState {
  return {
    ...createInitialState(),
    welcome: false,
    idx: 3,
    resp: {
      Q0: 'Ana María',
      Q0_ap: 'Pérez',
      Q01: 'ana@correo.com',
      Q02_cc: '+51',
      Q02_num: '999888777',
      Q02: '+51 999888777',
    },
    firstName: 'Ana',
  }
}

describe('progressMilestone', () => {
  it('is empty before anything is answered', () => {
    expect(progressMilestone(createInitialState())).toBe('')
  })

  it('is the last answered question key in schema order', () => {
    // Personal block fully answered → last personal key.
    expect(progressMilestone(personalDone())).toBe('phone')
    // A later single answer advances the milestone.
    expect(
      progressMilestone({
        ...personalDone(),
        resp: { ...personalDone().resp, Q1: 0 },
      }),
    ).toBe('investmentGoal')
  })

  it('prefers the result over everything', () => {
    expect(progressMilestone({ ...personalDone(), result: true })).toBe(
      'result',
    )
  })
})

describe('buildSections', () => {
  it('emits only started sections, English-keyed, skipping unanswered blocks', () => {
    const state: TestState = {
      ...personalDone(),
      resp: {
        ...personalDone().resp,
        Q1: 0, // objective answered
        Q6: [0, 1], // an experience multi answer
      },
    }
    const payload = buildProgressPayload(state)
    expect(payload.sections.personal).toEqual({
      name: 'Ana María',
      lastName: 'Pérez',
      email: 'ana@correo.com',
      phone: '+51 999888777',
    })
    expect(payload.sections.objective).toEqual({
      investmentGoal:
        'Generar ingresos de tus inversiones para cubrir tus gastos',
    })
    // Q6 answered but Q3–Q5 not → only the answered key shows up.
    expect(payload.sections.experience).toEqual({
      assetTypes: 'Acciones en bolsa | Bonos o renta fija',
    })
    // Nothing answered in later blocks → they are absent entirely.
    expect(payload.sections.risk).toBeUndefined()
    expect(payload.sections.trust).toBeUndefined()
  })

  it('omits an empty multi-select answer', () => {
    const state: TestState = {
      ...personalDone(),
      resp: { ...personalDone().resp, Q6: [] },
    }
    const payload = buildProgressPayload(state)
    expect(payload.sections.experience).toBeUndefined()
  })
})

describe('buildProgressPayload', () => {
  it('builds an in-progress snapshot keyed by the session id, with an empty result', () => {
    const state = personalDone()
    const payload = buildProgressPayload(state)
    expect(payload.sessionId).toBe(state.sessionId)
    expect(payload.status).toBe('in_progress')
    expect(payload.milestone).toBe('phone')
    expect(payload.sections.personal.name).toBe('Ana María')
    expect(payload.sections.personal.email).toBe('ana@correo.com')
    expect(payload.sections.personal.phone).toBe('+51 999888777')
    expect(payload.sections.objective).toBeUndefined() // not answered yet
    // Siempre presente y con la misma forma, aunque el perfil aún no exista.
    expect(payload.result).toEqual({
      archetype: { id: '', name: '', tier: '' },
      capacity: { id: '', label: '' },
    })
    expect(payload.progressPct).toBeGreaterThan(0)
    expect(payload.progressPct).toBeLessThan(100)
  })

  it('marks the result snapshot completed at 100% with the detailed profile', () => {
    const state: TestState = {
      ...personalDone(),
      result: true,
      lastArq: 'A3',
      lastCap: 'C3',
    }
    const payload = buildProgressPayload(state)
    expect(payload.status).toBe('completed')
    expect(payload.progressPct).toBe(100)
    expect(payload.result).toEqual({
      archetype: {
        id: 'A3',
        name: 'El Aprendiz Activo',
        tier: 'Colaboradores',
      },
      capacity: { id: 'C3', label: 'Capacidad 3' },
    })
  })
})
