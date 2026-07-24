import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  saveProgress,
  loadProgress,
  clearProgress,
  STORAGE_KEY,
} from '@/features/profile-test/utils/savedProgress'
import { createInitialState } from '@/features/profile-test/hooks/profileTestReducer'
import type { TestState } from '@/core'

/** A mid-test snapshot worth persisting. */
function midTestState(): TestState {
  return {
    ...createInitialState(),
    welcome: false,
    idx: 5,
    resp: { Q0: 'Ana', Q1: 1, Q6: [0, 2] },
    firstName: 'Ana',
    skipQ2: true,
  }
}

interface StoredEnvelope {
  version: number
  savedAt: number
  state: Record<string, unknown>
}

/** Read, mutate and rewrite the stored envelope (tamper tests). */
function tamper(mutate: (envelope: StoredEnvelope) => void) {
  const envelope = JSON.parse(
    localStorage.getItem(STORAGE_KEY)!,
  ) as StoredEnvelope
  mutate(envelope)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('saveProgress / loadProgress round trip', () => {
  it('returns null when nothing is stored', () => {
    expect(loadProgress()).toBeNull()
  })

  it('restores the saved state with a null error', () => {
    const state = midTestState()
    saveProgress(state)
    expect(loadProgress()).toEqual({ ...state, error: null })
  })

  it('never persists the transient error', () => {
    saveProgress({
      ...midTestState(),
      error: { scope: 'opts', message: 'x', nonce: 3 },
    })
    expect(loadProgress()?.error).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain('nonce')
  })

  it('clearProgress removes the save', () => {
    saveProgress(midTestState())
    clearProgress()
    expect(loadProgress()).toBeNull()
  })
})

describe('stale or malformed saves are discarded', () => {
  it.each([
    ['corrupt JSON', () => localStorage.setItem(STORAGE_KEY, '{oops')],
    [
      'another schema version',
      () => tamper((envelope) => (envelope.version = 999)),
    ],
    [
      'a v1 envelope (before sessionId existed)',
      () =>
        tamper((envelope) => {
          envelope.version = 1
          delete envelope.state.sessionId
        }),
    ],
    [
      'empty sessionId',
      () => tamper((envelope) => (envelope.state.sessionId = '')),
    ],
    [
      'older than the TTL',
      () =>
        tamper(
          (envelope) =>
            (envelope.savedAt = Date.now() - 31 * 24 * 60 * 60 * 1000),
        ),
    ],
    [
      'idx out of range',
      () => tamper((envelope) => (envelope.state.idx = 999)),
    ],
    [
      'interm not an intermission index',
      () => tamper((envelope) => (envelope.state.interm = 7)),
    ],
    [
      'missing score key',
      () =>
        tamper((envelope) => {
          delete (envelope.state.scores as Record<string, unknown>)
            .experienceScore
        }),
    ],
    [
      'answer with an invalid value',
      () =>
        tamper((envelope) => (envelope.state.resp = { Q1: { nested: true } })),
    ],
    [
      'state missing entirely',
      () =>
        tamper(
          (envelope) => delete (envelope as Partial<StoredEnvelope>).state,
        ),
    ],
  ])('%s → null', (_label, corrupt) => {
    saveProgress(midTestState())
    corrupt()
    expect(loadProgress()).toBeNull()
  })
})

describe('unavailable storage never throws', () => {
  it('saveProgress swallows setItem failures (private mode / quota)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveProgress(midTestState())).not.toThrow()
  })

  it('loadProgress returns null when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(loadProgress()).toBeNull()
  })

  it('clearProgress swallows removeItem failures', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => clearProgress()).not.toThrow()
  })
})
