import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  reducer,
  selectView,
  createInitialState,
} from '@/features/profile-test/hooks/profileTestReducer'
import { useProfileTest } from '@/features/profile-test/hooks/useProfileTest'
import type { TestState, TestAction } from '@/core'
import {
  saveProgress,
  loadProgress,
  STORAGE_KEY,
} from '@/features/profile-test/utils/savedProgress'
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import { submitResult } from '@/features/profile-test/api/submitResult'

vi.mock('@/features/profile-test/api/submitResult', async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import('@/features/profile-test/api/submitResult')
    >()
  return { ...original, submitResult: vi.fn() }
})

beforeEach(() => {
  localStorage.clear()
  vi.mocked(submitResult).mockClear()
})

/** Fold a sequence of actions over a starting state. */
function run(actions: TestAction[], start: TestState = createInitialState()) {
  return actions.reduce(reducer, start)
}

/** Start the test and complete the personal form with valid values. */
function filledPersonal(): TestState {
  return run([
    { type: 'START' },
    { type: 'SET_PERSONAL', field: 'name', value: 'Ana María' },
    { type: 'SET_PERSONAL', field: 'lastName', value: 'Pérez' },
    { type: 'SET_PERSONAL', field: 'email', value: 'ana@correo.com' },
    { type: 'SET_PERSONAL', field: 'phone', value: '999999999' },
  ])
}

describe('selectView', () => {
  it('reflects the state flags in the original precedence', () => {
    const base = createInitialState()
    expect(selectView(base)).toBe('welcome')
    expect(selectView({ ...base, welcome: false })).toBe('personal')
    expect(selectView({ ...base, welcome: false, idx: 3 })).toBe('question')
    expect(selectView({ ...base, welcome: false, interm: 4 })).toBe(
      'intermission',
    )
    expect(selectView({ ...base, welcome: false, result: true })).toBe('result')
    expect(
      selectView({ ...base, welcome: false, result: true, recom: true }),
    ).toBe('recommendations')
  })
})

describe('personal form', () => {
  it('validates fields in order and blocks advancing', () => {
    const state = reducer(run([{ type: 'START' }]), { type: 'NEXT' })
    expect(state.error).toMatchObject({ scope: 'field', field: 'name' })
    expect(state.idx).toBe(0)
  })

  it('commits trimmed values, derives the first name, and skips hidden Q01/Q02', () => {
    const state = reducer(filledPersonal(), { type: 'NEXT' })
    expect(state.idx).toBe(3) // Q1 (Q01/Q02 hidden are skipped)
    expect(state.resp['Q0']).toBe('Ana María')
    expect(state.firstName).toBe('Ana')
    expect(state.resp['Q02']).toBe('+51 999999999')
    expect(state.error).toBeNull()
  })
})

describe('scoring through picks', () => {
  it('reverses the previous option when the answer changes', () => {
    const atQ1 = reducer(filledPersonal(), { type: 'NEXT' }) // idx 3
    const pickGrowth = reducer(atQ1, { type: 'PICK_SINGLE', optionIndex: 1 }) // skipQ2
    expect(pickGrowth.skipQ2).toBe(true)
    expect(pickGrowth.scores.riskScore).toBe(2)
    expect(pickGrowth.scores.financialCapacityScore).toBe(10)

    const pickIncome = reducer(pickGrowth, {
      type: 'PICK_SINGLE',
      optionIndex: 0,
    })
    expect(pickIncome.skipQ2).toBe(false)
    expect(pickIncome.scores.riskScore).toBe(0)
    expect(pickIncome.scores.financialCapacityScore).toBe(0)
    expect(pickIncome.scores.flowPreferenceScore).toBe(3)
  })

  it('handles the multi exclusive option (Q6 "Ninguno")', () => {
    const atQ6: TestState = { ...createInitialState(), welcome: false, idx: 8 }
    const withTwo = run(
      [
        { type: 'PICK_MULTI', optionIndex: 0 },
        { type: 'PICK_MULTI', optionIndex: 6 }, // A10 alt
      ],
      atQ6,
    )
    expect(withTwo.resp['Q6']).toEqual([0, 6])
    expect(withTwo.scores.sophisticationMarker).toBe(1)

    const exclusive = reducer(withTwo, { type: 'PICK_MULTI', optionIndex: 9 }) // Ninguno
    expect(exclusive.resp['Q6']).toEqual([9])
    expect(exclusive.scores.experienceScore).toBe(0)
    expect(exclusive.scores.sophisticationMarker).toBe(0)
  })
})

describe('intermissions', () => {
  it('shows the "Objetivo" intermission after Q2 when not skipping', () => {
    const atQ1 = reducer(filledPersonal(), { type: 'NEXT' }) // idx 3
    const atQ2 = reducer(
      reducer(atQ1, { type: 'PICK_SINGLE', optionIndex: 0 }),
      {
        type: 'NEXT',
      },
    ) // idx 4
    expect(atQ2.idx).toBe(4)
    const withInterm = reducer(
      reducer(atQ2, { type: 'PICK_SINGLE', optionIndex: 0 }),
      {
        type: 'NEXT',
      },
    )
    expect(withInterm.interm).toBe(4)
    expect(selectView(withInterm)).toBe('intermission')
    const dismissed = reducer(withInterm, { type: 'DISMISS_INTERM' })
    expect(dismissed.interm).toBeNull()
    expect(dismissed.idx).toBe(5)
  })

  it('skips the "Objetivo" intermission entirely when Q2 is skipped (quirk)', () => {
    const atQ1 = reducer(filledPersonal(), { type: 'NEXT' }) // idx 3
    const afterGrowth = reducer(
      reducer(atQ1, { type: 'PICK_SINGLE', optionIndex: 1 }), // skipQ2
      { type: 'NEXT' },
    )
    expect(afterGrowth.idx).toBe(5) // straight to Q3, no interm
    expect(afterGrowth.interm).toBeNull()
  })
})

describe('reaching the result', () => {
  it('dismissing the final intermission (33) computes and stores the result', () => {
    const atLast: TestState = {
      ...createInitialState(),
      welcome: false,
      idx: 33,
    }
    const interm = reducer(
      reducer(atLast, { type: 'PICK_SINGLE', optionIndex: 0 }),
      {
        type: 'NEXT',
      },
    )
    expect(interm.interm).toBe(33)
    const result = reducer(interm, { type: 'DISMISS_INTERM' })
    expect(result.result).toBe(true)
    expect(result.lastArq).toBe('A1') // default scores → A1 / C1
    expect(result.lastCap).toBe('C1')
    expect(selectView(result)).toBe('result')
  })
})

describe('back navigation', () => {
  it('returns to welcome from the first question and clears views', () => {
    const atQ1 = reducer(filledPersonal(), { type: 'NEXT' }) // idx 3
    const backToPersonal = reducer(atQ1, { type: 'BACK' })
    expect(backToPersonal.idx).toBe(0)
    expect(selectView(backToPersonal)).toBe('personal')
    const backToWelcome = reducer(backToPersonal, { type: 'BACK' })
    expect(backToWelcome.welcome).toBe(true)
  })

  it('backs out of result and recommendations views', () => {
    const base: TestState = {
      ...createInitialState(),
      welcome: false,
      result: true,
      recom: true,
    }
    expect(reducer(base, { type: 'BACK' }).recom).toBe(false)
    expect(reducer({ ...base, recom: false }, { type: 'BACK' }).result).toBe(
      false,
    )
  })
})

describe('restart and recommendations', () => {
  it('RESTART returns to the initial state with a fresh sessionId', () => {
    const dirty = reducer(filledPersonal(), { type: 'NEXT' })
    const restarted = reducer(dirty, { type: 'RESTART' })
    expect(restarted).toEqual({
      ...createInitialState(),
      sessionId: restarted.sessionId,
    })
    expect(restarted.sessionId).not.toBe(dirty.sessionId)
  })

  it('SHOW_RECOMMENDATIONS flips the (untriggered) recommendations view', () => {
    const state = reducer(
      { ...createInitialState(), welcome: false, result: true },
      { type: 'SHOW_RECOMMENDATIONS' },
    )
    expect(state.recom).toBe(true)
    expect(selectView(state)).toBe('recommendations')
  })
})

describe('error handling', () => {
  it('sets an opts error when advancing a single question with no selection', () => {
    const atQ1 = reducer(filledPersonal(), { type: 'NEXT' })
    const errored = reducer(atQ1, { type: 'NEXT' })
    expect(errored.error).toMatchObject({
      scope: 'opts',
      message: 'Selecciona una opción para continuar',
    })
    expect(reducer(errored, { type: 'CLEAR_ERROR' }).error).toBeNull()
  })
})

describe('useProfileTest hook', () => {
  it('exposes derived view + progress and drives the flow', () => {
    const { result } = renderHook(() => useProfileTest())
    expect(result.current.view).toBe('welcome')

    act(() => result.current.actions.start())
    expect(result.current.view).toBe('personal')

    act(() => {
      result.current.actions.setPersonalField('name', 'Ana')
      result.current.actions.setPersonalField('lastName', 'Pérez')
      result.current.actions.setPersonalField('email', 'ana@correo.com')
      result.current.actions.setPersonalField('phone', '999999999')
    })
    act(() => result.current.actions.next())

    expect(result.current.view).toBe('question')
    expect(result.current.question.id).toBe('Q1')
    expect(result.current.progress).toEqual({
      current: 2,
      total: 32,
      percent: Math.round((2 / 32) * 100),
    })
  })
})

describe('saved progress (localStorage)', () => {
  /** Drive a fresh hook through the personal form into Q1. */
  function reachQ1(hook: {
    result: { current: ReturnType<typeof useProfileTest> }
  }) {
    act(() => hook.result.current.actions.start())
    act(() => {
      hook.result.current.actions.setPersonalField('name', 'Ana María')
      hook.result.current.actions.setPersonalField('lastName', 'Pérez')
      hook.result.current.actions.setPersonalField('email', 'ana@correo.com')
      hook.result.current.actions.setPersonalField('phone', '999999999')
    })
    act(() => hook.result.current.actions.next())
  }

  it('does not persist the pristine welcome, and offers no resume', () => {
    const hook = renderHook(() => useProfileTest())
    expect(hook.result.current.hasSavedProgress).toBe(false)
    hook.unmount()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('saves as the user advances and resumes on the next mount', () => {
    const first = renderHook(() => useProfileTest())
    reachQ1(first)
    first.unmount()

    const second = renderHook(() => useProfileTest())
    expect(second.result.current.view).toBe('welcome')
    expect(second.result.current.hasSavedProgress).toBe(true)

    act(() => second.result.current.actions.resume())
    expect(second.result.current.view).toBe('question')
    expect(second.result.current.question.id).toBe('Q1')
    expect(second.result.current.state.resp['Q0']).toBe('Ana María')
    expect(second.result.current.hasSavedProgress).toBe(false)
  })

  it('start() from the welcome discards the dormant save', () => {
    const first = renderHook(() => useProfileTest())
    reachQ1(first)
    first.unmount()

    const second = renderHook(() => useProfileTest())
    expect(second.result.current.hasSavedProgress).toBe(true)
    act(() => second.result.current.actions.start())
    expect(second.result.current.hasSavedProgress).toBe(false)
    expect(second.result.current.view).toBe('personal')
    expect(loadProgress()?.resp['Q0']).toBeUndefined()
  })

  it('restart clears the save entirely', () => {
    const hook = renderHook(() => useProfileTest())
    reachQ1(hook)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    act(() => hook.result.current.actions.restart())
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(hook.result.current.view).toBe('welcome')
  })

  it('resuming a finished run shows the result without re-sending the webhook', () => {
    const completed: TestState = {
      ...createInitialState(),
      welcome: false,
      result: true,
      lastArq: 'A1',
      lastCap: 'C1',
      resp: { Q0: 'Ana' },
    }
    saveProgress(completed)

    const hook = renderHook(() => useProfileTest())
    act(() => hook.result.current.actions.resume())
    expect(hook.result.current.view).toBe('result')
    expect(submitResult).not.toHaveBeenCalled()
  })

  it('finishing a resumed run submits once, and its save restores to the result', () => {
    const lastQuestion = QUESTIONS[33]
    const atLast: TestState = {
      ...createInitialState(),
      welcome: false,
      idx: 33,
      resp: { [lastQuestion.id]: 0 },
    }
    saveProgress(atLast)

    const first = renderHook(() => useProfileTest())
    act(() => first.result.current.actions.resume())
    act(() => first.result.current.actions.next())
    expect(first.result.current.view).toBe('intermission')
    act(() => first.result.current.actions.dismissIntermission())
    expect(first.result.current.view).toBe('result')
    expect(submitResult).toHaveBeenCalledTimes(1)
    first.unmount()

    const second = renderHook(() => useProfileTest())
    act(() => second.result.current.actions.resume())
    expect(second.result.current.view).toBe('result')
    expect(submitResult).toHaveBeenCalledTimes(1)
  })
})
