import { describe, it, expect } from 'vitest'
import {
  progressMilestone,
  buildProgressPayload,
  hasAnswers,
} from '@/features/profile-test/api/submitProgress'
import { createInitialState } from '@/features/profile-test/hooks/profileTestReducer'
import { PROGRESS_SCHEMA } from '@/features/profile-test/constants/progressSchema'
import type {
  ProgressPayload,
  ProgressQuestion,
  ProgressSectionQuestion,
  TestState,
} from '@/core'

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

function fieldOf(
  payload: ProgressPayload,
  sectionKey: string,
  questionKey: string,
): ProgressSectionQuestion {
  const section = payload.sections.find(
    (candidate) => candidate.key === sectionKey,
  )
  const question = section?.questions.find(
    (candidate) => candidate.key === questionKey,
  )
  if (!question) throw new Error(`${sectionKey}.${questionKey} no está`)
  return question
}

/** Igual, pero estrechado a una pregunta con opciones. */
function questionOf(
  payload: ProgressPayload,
  sectionKey: string,
  questionKey: string,
): ProgressQuestion {
  const found = fieldOf(payload, sectionKey, questionKey)
  if (!('opciones' in found))
    throw new Error(`${sectionKey}.${questionKey} es un campo abierto`)
  return found
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
  const state: TestState = {
    ...personalDone(),
    resp: {
      ...personalDone().resp,
      Q1: 1, // objective answered
      Q6: [0, 2], // an experience multi answer
    },
  }
  const payload = buildProgressPayload(state)

  it('emits the whole schema in order, every snapshot', () => {
    expect(payload.sections.map((section) => section.key)).toEqual(
      PROGRESS_SCHEMA.map((section) => section.key),
    )
    expect(payload.sections.map((section) => section.questions.length)).toEqual(
      PROGRESS_SCHEMA.map((section) => section.questions.length),
    )
  })

  it('carries the enunciado y el catálogo completo de opciones', () => {
    const goal = questionOf(payload, 'objective', 'investmentGoal')
    expect(goal.id).toBe('Q1')
    expect(goal.type).toBe('single')
    expect(goal.question).toBe(
      '¿Qué te gustaría lograr principalmente con tus inversiones?',
    )
    expect(goal.opciones).toEqual({
      opcion1: 'Generar ingresos de tus inversiones para cubrir tus gastos',
      opcion2: 'Hacer crecer tu dinero a largo plazo',
      opcion3: 'Planificar tus ahorros para jubilarte',
      opcion4:
        'Prepararte para un objetivo específico (comprar un departamento, educación de tus hijos u otro proyecto importante)',
    })
  })

  it('answers a single question with one label and its option key', () => {
    const goal = questionOf(payload, 'objective', 'investmentGoal')
    expect(goal.answer).toEqual(['Hacer crecer tu dinero a largo plazo'])
    expect(goal.answerKeys).toEqual(['opcion2'])
  })

  it('answers a multi question with every option chosen', () => {
    const assets = questionOf(payload, 'experience', 'assetTypes')
    expect(assets.type).toBe('multi')
    expect(assets.answer).toEqual(['Acciones en bolsa', 'Fondos mutuos o ETFs'])
    expect(assets.answerKeys).toEqual(['opcion1', 'opcion3'])
  })

  it('serializes the personal block as plain fields: solo clave y texto', () => {
    expect(payload.sections[0]).toEqual({
      key: 'personal',
      title: 'Datos personales',
      questions: [
        { key: 'name', answer: 'Ana María' },
        { key: 'lastName', answer: 'Pérez' },
        { key: 'email', answer: 'ana@correo.com' },
        { key: 'phone', answer: '+51 999888777' },
      ],
    })
  })

  it('leaves unanswered questions with an empty answer, options included', () => {
    const peru = questionOf(payload, 'peruContext', 'peruStance')
    expect(peru.answer).toEqual([])
    expect(peru.answerKeys).toEqual([])
    expect(Object.keys(peru.opciones)).toHaveLength(4)
  })

  it('empties an empty multi-select answer', () => {
    const emptied = buildProgressPayload({
      ...personalDone(),
      resp: { ...personalDone().resp, Q6: [] },
    })
    expect(questionOf(emptied, 'experience', 'assetTypes').answer).toEqual([])
  })

  it('holds the personal block back until its commitGate is answered', () => {
    // Nombre y correo escritos, celular (Q02) todavía no: nada del bloque sale.
    const typing = buildProgressPayload({
      ...createInitialState(),
      resp: { Q0: 'Ana María', Q01: 'ana@correo.com' },
    })
    expect(fieldOf(typing, 'personal', 'name').answer).toBe('')
    expect(fieldOf(typing, 'personal', 'email').answer).toBe('')
    expect(hasAnswers(typing)).toBe(false)
  })
})

describe('buildProgressPayload', () => {
  it('builds an in-progress snapshot keyed by the session id, with an empty profile', () => {
    const state = personalDone()
    const payload = buildProgressPayload(state)
    expect(payload.sessionId).toBe(state.sessionId)
    expect(payload.status).toBe('in_progress')
    expect(payload.milestone).toBe('phone')
    expect(fieldOf(payload, 'personal', 'name').answer).toBe('Ana María')
    expect(fieldOf(payload, 'personal', 'phone').answer).toBe('+51 999888777')
    expect(hasAnswers(payload)).toBe(true)
    // Perfil vacío con la misma forma; los puntajes viajan siempre.
    expect(payload.result.archetype).toEqual({
      id: '',
      name: '',
      tier: '',
      description: '',
      strengths: [],
      blindSpots: [],
    })
    expect(payload.result.capacity).toEqual({
      id: '',
      label: '',
      portfolio: '',
    })
    expect(payload.result.scores).toMatchObject({ E_score: 0, CAP_score: 0 })
    expect(payload.progressPct).toBeGreaterThan(0)
    expect(payload.progressPct).toBeLessThan(100)
  })

  it('marks the result snapshot completed at 100% with the detailed profile', () => {
    const state: TestState = {
      ...personalDone(),
      result: true,
      lastArq: 'A3',
      lastCap: 'C3',
      scores: {
        ...createInitialState().scores,
        experienceScore: 5,
        financialCapacityScore: 2,
        collaborationMarker: 1,
        trustScore: 3,
      },
    }
    const payload = buildProgressPayload(state)
    expect(payload.status).toBe('completed')
    expect(payload.progressPct).toBe(100)
    expect(payload.result.archetype).toMatchObject({
      id: 'A3',
      name: 'El Aprendiz Activo',
      tier: 'Colaboradores',
    })
    expect(payload.result.archetype.strengths).toHaveLength(2)
    expect(payload.result.capacity.id).toBe('C3')
    expect(payload.result.capacity.label).toBe('Capacidad 3')
    expect(payload.result.capacity.portfolio).toContain('%')
    // CAP_score va ya ajustado: C8_gap = 0-1 = -1 (sin penalidad) y sin deuda.
    expect(payload.result.scores).toMatchObject({
      E_score: 5,
      CAP_score: 2,
      COLAB: 1,
      CONF: 3,
    })
  })

  it('applies the income-need and debt penalties to CAP_score', () => {
    const payload = buildProgressPayload({
      ...personalDone(),
      result: true,
      lastArq: 'A3',
      lastCap: 'C3',
      scores: {
        ...createInitialState().scores,
        financialCapacityScore: 2,
        monthlyIncomeNeedLevel: 2,
        debtLevel: 2,
      },
    })
    // C8_gap = 2-1 = 1 → -3; DEBT_gap = 2-1 = 1 → -6; 2-3-6 = -7.
    expect(payload.result.scores.CAP_score).toBe(-7)
  })
})
