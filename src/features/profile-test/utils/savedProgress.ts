/**
 * Local persistence of the test progress, so a returning visitor can resume
 * where they left off. This is a user-requested addition — the original HTML
 * had no persistence at all.
 *
 * A versioned envelope wraps a `TestState` snapshot minus the transient
 * `error`. `loadProgress` discards anything malformed, from another schema
 * version or older than the TTL. Every storage touch is guarded: with storage
 * unavailable (Safari private mode, full quota) the test simply runs without
 * persistence.
 */
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import { INTERMISSIONS } from '@/features/profile-test/constants/intermissions'
import { INITIAL_SCORES } from '@/features/profile-test/constants/scoring'
import type {
  AnswerValue,
  PersistedEnvelope,
  PersistedState,
  TestState,
} from '@/core'

export const STORAGE_KEY = 'sabbi-profile-test/progress'

/** Bump when `TestState`'s persisted shape or the question set changes. */
const SCHEMA_VERSION = 2 // v2: TestState gained `sessionId`

/** Saves older than this are considered stale and discarded. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 días

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isAnswerValue(value: unknown): value is AnswerValue {
  if (typeof value === 'number' || typeof value === 'string') return true
  return (
    Array.isArray(value) &&
    value.every((element) => typeof element === 'number')
  )
}

/**
 * One structural guard per persisted field. The table doubles as the list of
 * fields to persist (`toPersisted`), so adding a `TestState` field forces a
 * decision here in both directions.
 */
const FIELD_GUARDS: Record<keyof PersistedState, (value: unknown) => boolean> =
  {
    sessionId: (value) => typeof value === 'string' && value.length > 0,
    idx: (value) =>
      Number.isInteger(value) &&
      (value as number) >= 0 &&
      (value as number) < QUESTIONS.length,
    interm: (value) =>
      value === null ||
      INTERMISSIONS.some((intermission) => intermission.afterIndex === value),
    result: (value) => typeof value === 'boolean',
    recom: (value) => typeof value === 'boolean',
    welcome: (value) => typeof value === 'boolean',
    resp: (value) =>
      isRecord(value) && Object.values(value).every(isAnswerValue),
    scores: (value) =>
      isRecord(value) &&
      Object.keys(INITIAL_SCORES).every(
        (key) => typeof value[key] === 'number',
      ),
    firstName: (value) => typeof value === 'string',
    skipQ2: (value) => typeof value === 'boolean',
    lastArq: (value) => value === null || typeof value === 'string',
    lastCap: (value) => value === null || typeof value === 'string',
  }

const PERSISTED_FIELDS = Object.keys(FIELD_GUARDS) as (keyof PersistedState)[]

function toPersisted(state: TestState): PersistedState {
  return Object.fromEntries(
    PERSISTED_FIELDS.map((field) => [field, state[field]]),
  ) as PersistedState
}

function isValidState(value: unknown): value is PersistedState {
  return (
    isRecord(value) &&
    PERSISTED_FIELDS.every((field) => FIELD_GUARDS[field](value[field]))
  )
}

export function saveProgress(state: TestState): void {
  const envelope: PersistedEnvelope = {
    version: SCHEMA_VERSION,
    savedAt: Date.now(),
    state: toPersisted(state),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // Storage unavailable: keep the test working without persistence.
  }
}

export function loadProgress(): TestState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const envelope = JSON.parse(raw) as Partial<PersistedEnvelope>
    if (envelope.version !== SCHEMA_VERSION) return null
    if (
      typeof envelope.savedAt !== 'number' ||
      Date.now() - envelope.savedAt > MAX_AGE_MS
    )
      return null
    if (!isValidState(envelope.state)) return null
    return { ...envelope.state, error: null }
  } catch {
    return null
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
