import type { TestState } from './test-state'

export type PersistedState = Omit<TestState, 'error'>

export interface PersistedEnvelope {
  version: number
  savedAt: number
  state: PersistedState
}
