/**
 * Hook orquestador del test: cablea el reducer (máquina de estados en
 * `profileTestReducer`) con los efectos de lado — envío del resultado y
 * persistencia en localStorage (esta última una adición sobre el original) —, el
 * auto-advance estilo Typeform, y expone `state` + `actions` a la página.
 *
 * El registro de respuestas en el backend NO vive aquí: la página lo dispara con
 * `useRegisterSabbiTestQuestion` observando este estado.
 */
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import { INTERMISSIONS } from '@/features/profile-test/constants/intermissions'
import {
  visibleTotal,
  visiblePosition,
} from '@/features/profile-test/utils/visibility'
import { buildRecall } from '@/features/profile-test/utils/recall'
import {
  loadProgress,
  saveProgress,
  clearProgress,
} from '@/features/profile-test/utils/savedProgress'
import {
  buildResultPayload,
  submitResult,
} from '@/features/profile-test/api/submitResult'
import {
  reducer,
  createInitialState,
  selectView,
} from '@/features/profile-test/hooks/profileTestReducer'
import type { ProgressInfo, TestState, UseProfileTest } from '@/core'

/** Delay before a single-select answer auto-advances (Typeform-style confirm). */
const AUTO_ADVANCE_MS = 280

export function useProfileTest(): UseProfileTest {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  // Read once per mount; consumed (set to null) when the user starts or resumes.
  const [savedRun, setSavedRun] = useState<TestState | null>(loadProgress)
  const submittedRef = useRef(false)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Submit the result once, on the transition into the result view. Covers both
  // original call sites (dismissInterm(33) and the final advance).
  useEffect(() => {
    if (state.result && !submittedRef.current) {
      submittedRef.current = true
      if (state.lastArq && state.lastCap) {
        submitResult(
          buildResultPayload({
            answers: state.resp,
            scores: state.scores,
            result: { archetype: state.lastArq, capacity: state.lastCap },
          }),
        )
      }
    }
    if (!state.result) submittedRef.current = false
  }, [state.result, state.resp, state.scores, state.lastArq, state.lastCap])

  // Persist every meaningful change so a returning visitor can resume. The
  // pristine welcome (nothing answered) is not worth saving — skipping it also
  // avoids re-saving right after a restart cleared the storage.
  useEffect(() => {
    const pristine = state.welcome && Object.keys(state.resp).length === 0
    if (!pristine) saveProgress(state)
  }, [state])

  // Auto-clear the transient error, like the original ~2.5s timeout.
  useEffect(() => {
    if (!state.error) return
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 2500)
    return () => clearTimeout(timer)
  }, [state.error])

  // Cancel any pending single-select auto-advance on unmount.
  useEffect(
    () => () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    },
    [],
  )

  const view = selectView(state)
  const question = QUESTIONS[state.idx]

  const progress = useMemo<ProgressInfo | null>(() => {
    if (view !== 'question') return null
    const total = visibleTotal(state.skipQ2)
    const current = visiblePosition(state.idx, state.skipQ2)
    return { current, total, percent: Math.round((current / total) * 100) }
  }, [view, state.idx, state.skipQ2])

  const intermission =
    state.interm !== null
      ? (INTERMISSIONS.find(
          (candidate) => candidate.afterIndex === state.interm,
        ) ?? null)
      : null

  const recall = useMemo(
    () =>
      state.interm !== null
        ? buildRecall(state.interm, state.resp, state.skipQ2)
        : null,
    [state.interm, state.resp, state.skipQ2],
  )

  const actions = useMemo<UseProfileTest['actions']>(
    () => ({
      start: () => {
        // Starting from the welcome is always a fresh run: drop any dormant save.
        clearProgress()
        setSavedRun(null)
        dispatch({ type: 'START' })
      },
      resume: () => {
        if (!savedRun) return
        // A snapshot saved on the result view was already submitted when it was
        // reached — restoring it must not re-send the webhook.
        submittedRef.current = savedRun.result
        dispatch({ type: 'RESUME', saved: savedRun })
        setSavedRun(null)
      },
      pickSingle: (optionIndex) => {
        dispatch({ type: 'PICK_SINGLE', optionIndex })
        // Typeform-style: briefly show the selection, then advance automatically.
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
        advanceTimerRef.current = setTimeout(
          () => dispatch({ type: 'NEXT' }),
          AUTO_ADVANCE_MS,
        )
      },
      pickMulti: (optionIndex) => dispatch({ type: 'PICK_MULTI', optionIndex }),
      setPersonalField: (field, value) =>
        dispatch({ type: 'SET_PERSONAL', field, value }),
      setTextField: (value) => dispatch({ type: 'SET_TEXT', value }),
      next: () => dispatch({ type: 'NEXT' }),
      back: () => {
        // Drop any pending auto-advance so going back doesn't jump forward.
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
        dispatch({ type: 'BACK' })
      },
      dismissIntermission: () => dispatch({ type: 'DISMISS_INTERM' }),
      restart: () => {
        clearProgress()
        setSavedRun(null)
        dispatch({ type: 'RESTART' })
      },
      showRecommendations: () => dispatch({ type: 'SHOW_RECOMMENDATIONS' }),
    }),
    [savedRun],
  )

  return {
    state,
    view,
    question,
    progress,
    intermission,
    recall,
    hasSavedProgress: savedRun !== null,
    actions,
  }
}
