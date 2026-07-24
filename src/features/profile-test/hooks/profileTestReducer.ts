/**
 * The Test Perfil Sabbi state machine, ported from the original mutable `S`
 * object + `render()` dispatcher into a `useReducer`. Every original interaction
 * (`startTest`, `pickSingle`, `pickMulti`, `goNext`, `advance`, `goBack`,
 * `dismissInterm`, `empezarDeNuevo`, `verRecomendaciones`) maps to an action, and
 * the reducer applies the same transitions — quirks included:
 *
 *  - The "Objetivo" intermission (after index 4) is skipped entirely when Q2 is
 *    skipped, because the flow never lands on index 4 to trigger it.
 *  - `verRecomendaciones` and the email modal have NO trigger wired (matching the
 *    orphaned `.btn-recom`), but the transitions exist.
 *  - Back is never disabled; from the first question it returns to the welcome.
 *
 * Puro: sin React ni efectos. El envío del resultado y la persistencia viven en
 * `hooks/useProfileTest.ts`.
 */
import {
  QUESTIONS,
  DEFAULT_COUNTRY_CODE,
} from '@/features/profile-test/constants/questions'
import { INTERMISSIONS } from '@/features/profile-test/constants/intermissions'
import { INITIAL_SCORES } from '@/features/profile-test/constants/scoring'
import { PERSONAL_KEY } from '@/features/profile-test/constants/personalKeys'
import {
  applyScore,
  removeScore,
  resolveInvestorProfile,
} from '@/features/profile-test/utils/scoring'
import { nextIndex, prevIndex } from '@/features/profile-test/utils/visibility'
import {
  validatePersonal,
  validateAnswer,
  sanitizePhone,
} from '@/features/profile-test/utils/validation'
import type {
  AnswerValue,
  Answers,
  PersonalField,
  Question,
  ScoreState,
  TestAction,
  TestError,
  TestState,
  TestView,
} from '@/core'

const INTERMISSION_AFTER = new Set(
  INTERMISSIONS.map((intermission) => intermission.afterIndex),
)

/** Anonymous id linking one run's progress snapshots (upsert key in the DB). */
function newTestSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createInitialState(): TestState {
  return {
    sessionId: newTestSessionId(),
    idx: 0,
    interm: null,
    result: false,
    recom: false,
    welcome: true,
    resp: {},
    scores: { ...INITIAL_SCORES },
    firstName: '',
    skipQ2: false,
    lastArq: null,
    lastCap: null,
    error: null,
  }
}

function asString(value: AnswerValue | undefined): string {
  return typeof value === 'string' ? value : ''
}

function makeError(
  state: TestState,
  scope: TestError['scope'],
  message: string,
  field?: PersonalField,
): TestState {
  return {
    ...state,
    error: { scope, field, message, nonce: (state.error?.nonce ?? 0) + 1 },
  }
}

/** Move to the result, computing + storing the archetype/capacity. */
function toResult(state: TestState): TestState {
  const { archetype, capacity } = resolveInvestorProfile(state.scores)
  return { ...state, result: true, lastArq: archetype, lastCap: capacity }
}

/** Advance to the next visible question, or to the result if none remain. */
function advance(state: TestState): TestState {
  const next = nextIndex(state.idx, state.skipQ2)
  if (next >= QUESTIONS.length) return toResult(state)
  return { ...state, idx: next, error: null }
}

/** After a valid answer: show the intermission for this index, else advance. */
function proceed(state: TestState): TestState {
  if (INTERMISSION_AFTER.has(state.idx))
    return { ...state, interm: state.idx, error: null }
  return advance(state)
}

function handleNext(state: TestState): TestState {
  const question = QUESTIONS[state.idx]

  if (question.tipo === 'personal') {
    const values = {
      name: asString(state.resp['Q0']),
      lastName: asString(state.resp['Q0_ap']),
      email: asString(state.resp['Q01']),
      phone: asString(state.resp['Q02_num']),
    }
    const validationError = validatePersonal(values)
    if (validationError)
      return makeError(
        state,
        'field',
        validationError.message,
        validationError.field,
      )

    const countryCode = asString(state.resp['Q02_cc']) || DEFAULT_COUNTRY_CODE
    const phone = values.phone.trim()
    const resp: Answers = {
      ...state.resp,
      Q0: values.name.trim(),
      Q0_ap: values.lastName.trim(),
      Q01: values.email.trim(),
      Q02_cc: countryCode,
      Q02_num: phone,
      Q02: `${countryCode} ${phone}`,
    }
    const firstName = values.name.trim().split(' ')[0]
    return proceed({ ...state, resp, firstName, error: null })
  }

  if (question.tipo === 'text' || question.tipo === 'phone') {
    // Dead routes (Q01/Q02 are hidden), ported for fidelity.
    const message = validateAnswer(question, state.resp[question.id])
    if (message) return makeError(state, 'field', message)
    return proceed({ ...state, error: null })
  }

  // single / multi
  const message = validateAnswer(question, state.resp[question.id])
  if (message) return makeError(state, 'opts', message)
  return proceed({ ...state, error: null })
}

/**
 * Selección única: revierte el score de la opción previa (si la había) y suma la
 * nueva. Q1 además controla `skipQ2` (el objetivo "crecer a largo plazo" salta el
 * horizonte).
 */
function applySingleSelect(
  question: Question,
  prev: AnswerValue | undefined,
  scores: ScoreState,
  skipQ2: boolean,
  optionIndex: number,
): { scores: ScoreState; skipQ2: boolean } {
  const options = question.opts!
  let nextScores = scores
  let nextSkipQ2 = skipQ2
  if (typeof prev === 'number' && options[prev]) {
    nextScores = removeScore(nextScores, options[prev])
    if (question.id === 'Q1') nextSkipQ2 = false
  }
  const option = options[optionIndex]
  nextScores = applyScore(nextScores, option)
  if (question.id === 'Q1' && option.skipQ2) nextSkipQ2 = true
  return { scores: nextScores, skipQ2: nextSkipQ2 }
}

/**
 * Selección múltiple. Una opción exclusiva ("Ninguno de los anteriores") limpia
 * el resto; elegir una opción regular quita antes cualquier exclusiva marcada.
 * Los scores siguen cada add/remove.
 */
function applyMultiSelect(
  question: Question,
  current: AnswerValue | undefined,
  scores: ScoreState,
  optionIndex: number,
): { selected: number[]; scores: ScoreState } {
  const options = question.opts!
  const option = options[optionIndex]
  const selected = Array.isArray(current) ? [...current] : []

  if (option.exclusive) {
    const withoutRest = selected.reduce(
      (runningScores, selectedIndex) =>
        removeScore(runningScores, options[selectedIndex]),
      scores,
    )
    return selected.includes(optionIndex)
      ? { selected: [], scores: withoutRest }
      : { selected: [optionIndex], scores: applyScore(withoutRest, option) }
  }

  let nextSelected = selected
  let nextScores = scores
  const exclusiveIndex = options.findIndex((candidate) => candidate.exclusive)
  if (exclusiveIndex >= 0 && nextSelected.includes(exclusiveIndex)) {
    nextScores = removeScore(nextScores, options[exclusiveIndex])
    nextSelected = nextSelected.filter((index) => index !== exclusiveIndex)
  }
  return nextSelected.includes(optionIndex)
    ? {
        selected: nextSelected.filter((index) => index !== optionIndex),
        scores: removeScore(nextScores, option),
      }
    : {
        selected: [...nextSelected, optionIndex],
        scores: applyScore(nextScores, option),
      }
}

/**
 * Qué hace "Atrás" según el estado, en orden de prioridad (primera regla que
 * matchea gana). Sin match, retrocede a la pregunta visible anterior.
 */
const BACK_TRANSITIONS: readonly {
  when: (state: TestState) => boolean
  patch: Partial<TestState>
}[] = [
  { when: (state) => state.recom, patch: { recom: false } },
  { when: (state) => state.result, patch: { result: false } },
  { when: (state) => state.interm !== null, patch: { interm: null } },
  { when: (state) => state.idx === 0, patch: { welcome: true } },
]

export function reducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'START':
      return { ...state, welcome: false, error: null }

    case 'PICK_SINGLE': {
      const question = QUESTIONS[state.idx]
      if (!question.opts) return state
      const { scores, skipQ2 } = applySingleSelect(
        question,
        state.resp[question.id],
        state.scores,
        state.skipQ2,
        action.optionIndex,
      )
      return {
        ...state,
        resp: { ...state.resp, [question.id]: action.optionIndex },
        scores,
        skipQ2,
        error: null,
      }
    }

    case 'PICK_MULTI': {
      const question = QUESTIONS[state.idx]
      if (!question.opts) return state
      const { selected, scores } = applyMultiSelect(
        question,
        state.resp[question.id],
        state.scores,
        action.optionIndex,
      )
      return {
        ...state,
        resp: { ...state.resp, [question.id]: selected },
        scores,
        error: null,
      }
    }

    case 'SET_PERSONAL': {
      const key = PERSONAL_KEY[action.field]
      const value =
        action.field === 'phone' ? sanitizePhone(action.value) : action.value
      const next: TestState = {
        ...state,
        resp: { ...state.resp, [key]: value },
      }
      if (action.field === 'name') next.firstName = value.trim().split(' ')[0]
      return next
    }

    case 'SET_TEXT': {
      const question = QUESTIONS[state.idx]
      const value =
        question.tipo === 'phone' ? sanitizePhone(action.value) : action.value
      return { ...state, resp: { ...state.resp, [question.id]: value } }
    }

    case 'NEXT':
      return handleNext(state)

    case 'DISMISS_INTERM': {
      const was = state.interm
      if (was === 33) return toResult({ ...state, interm: null })
      return advance({ ...state, interm: null })
    }

    case 'BACK': {
      const matched = BACK_TRANSITIONS.find((rule) => rule.when(state))
      const patch = matched
        ? matched.patch
        : { idx: prevIndex(state.idx, state.skipQ2) }
      return { ...state, ...patch, error: null }
    }

    case 'RESTART':
      return createInitialState()

    case 'RESUME':
      return action.saved

    case 'SHOW_RECOMMENDATIONS':
      return { ...state, recom: true, error: null }

    case 'CLEAR_ERROR':
      return state.error ? { ...state, error: null } : state

    default:
      return state
  }
}

/** Vista activa según el estado, en orden de prioridad. */
const VIEW_RULES: readonly {
  when: (state: TestState) => boolean
  view: TestView
}[] = [
  { when: (state) => state.welcome, view: 'welcome' },
  { when: (state) => state.recom, view: 'recommendations' },
  { when: (state) => state.result, view: 'result' },
  { when: (state) => state.interm !== null, view: 'intermission' },
]

export function selectView(state: TestState): TestView {
  const matched = VIEW_RULES.find((rule) => rule.when(state))
  if (matched) return matched.view
  return QUESTIONS[state.idx].tipo === 'personal' ? 'personal' : 'question'
}
