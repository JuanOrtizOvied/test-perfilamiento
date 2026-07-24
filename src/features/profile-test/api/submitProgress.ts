/**
 * Progressive per-question snapshots for the user's own backend, so the DB can
 * capture leads (contact data arrives with the first answered block) and
 * drop-off analytics without exposing any public GET — resuming stays 100%
 * on localStorage.
 *
 * A snapshot is registered each time the answered content changes (i.e. per
 * question). Each one is self-contained and keyed by the run's anonymous
 * `sessionId`: the backend upserts one row per run
 * (`INSERT ... ON CONFLICT (sessionId) DO UPDATE`), so a failed request is
 * healed by the next answer and the row always reflects the latest state.
 * Unlike the frozen result payload, this shape is NOT frozen — the endpoint
 * belongs to us.
 *
 * Este módulo solo CONSTRUYE el snapshot. El envío vive en la cadena
 * `packages/http/register-sabbi-test-question` → `api/registerSabbiTestQuestionApi`
 * → `hooks/useRegisterSabbiTestQuestion`, que dispara la página.
 */
import { ARCHETYPES } from '@/features/profile-test/constants/archetypes'
import { CAPACITIES } from '@/features/profile-test/constants/capacities'
import { answeredEntries } from '@/features/profile-test/utils/progressEntries'
import {
  visibleTotal,
  visiblePosition,
} from '@/features/profile-test/utils/visibility'
import type {
  Answers,
  ProgressPayload,
  ProgressResult,
  TestState,
} from '@/core'

/** Answered questions grouped by section, in schema order. */
export function buildSections(
  answers: Answers,
): Record<string, Record<string, string>> {
  const sections: Record<string, Record<string, string>> = {}
  for (const { sectionKey, questionKey, text } of answeredEntries(answers)) {
    sections[sectionKey] ??= {}
    sections[sectionKey][questionKey] = text
  }
  return sections
}

/**
 * The milestone a snapshot represents: `'result'` once completed, otherwise the
 * key of the last answered question in schema order, or `''` before anything.
 */
export function progressMilestone(state: TestState): string {
  if (state.result) return 'result'
  return answeredEntries(state.resp).at(-1)?.questionKey ?? ''
}

/**
 * Bloque `result`: lleno al resolverse el perfil, vacío (con la misma forma)
 * mientras el test está en curso, para que el backend reciba la misma estructura
 * en toda etapa. Se construye por llamada para que cada snapshot lleve su propio
 * objeto y nadie mute el de los demás.
 */
function buildProgressResult(state: TestState): ProgressResult {
  if (state.result && state.lastArq && state.lastCap) {
    const archetype = ARCHETYPES[state.lastArq]
    const capacity = CAPACITIES[state.lastCap]
    return {
      archetype: {
        id: state.lastArq,
        name: archetype?.name ?? '',
        tier: archetype?.tier ?? '',
      },
      capacity: { id: state.lastCap, label: capacity?.label ?? '' },
    }
  }
  return {
    archetype: { id: '', name: '', tier: '' },
    capacity: { id: '', label: '' },
  }
}

/** Build the self-contained per-question snapshot for the current state. */
export function buildProgressPayload(state: TestState): ProgressPayload {
  const total = visibleTotal(state.skipQ2)
  const current = state.result
    ? total
    : visiblePosition(state.idx, state.skipQ2)

  return {
    sessionId: state.sessionId,
    status: state.result ? 'completed' : 'in_progress',
    milestone: progressMilestone(state),
    updatedAt: new Date().toISOString(),
    progressPct: Math.round((current / total) * 100),
    sections: buildSections(state.resp),
    result: buildProgressResult(state),
  }
}
