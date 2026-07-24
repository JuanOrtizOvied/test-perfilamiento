import type { Answers } from './answers'
import type { Intermission } from './intermissions'
import type { Question } from './questions'
import type { RecallSegment } from './recall'
import type { ScoreState } from './scoring'
import type { PersonalField } from './validation'

export type TestView =
  | 'welcome'
  | 'personal'
  | 'question'
  | 'intermission'
  | 'result'
  | 'recommendations'

export interface TestError {
  scope: 'field' | 'opts'
  field?: PersonalField
  message: string
  nonce: number
}

export interface TestState {
  sessionId: string
  idx: number
  interm: number | null
  result: boolean
  recom: boolean
  welcome: boolean
  resp: Answers
  scores: ScoreState
  firstName: string
  skipQ2: boolean
  lastArq: string | null
  lastCap: string | null
  error: TestError | null
}

export type TestAction =
  | { type: 'START' }
  | { type: 'PICK_SINGLE'; optionIndex: number }
  | { type: 'PICK_MULTI'; optionIndex: number }
  | {
      type: 'SET_PERSONAL'
      field: PersonalField | 'countryCode'
      value: string
    }
  | { type: 'SET_TEXT'; value: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'DISMISS_INTERM' }
  | { type: 'RESTART' }
  | { type: 'RESUME'; saved: TestState }
  | { type: 'SHOW_RECOMMENDATIONS' }
  | { type: 'CLEAR_ERROR' }

export interface ProgressInfo {
  current: number
  total: number
  percent: number
}

export interface UseProfileTest {
  state: TestState
  view: TestView
  question: Question
  progress: ProgressInfo | null
  intermission: Intermission | null
  recall: RecallSegment[] | null
  hasSavedProgress: boolean
  actions: {
    start: () => void
    resume: () => void
    pickSingle: (optionIndex: number) => void
    pickMulti: (optionIndex: number) => void
    setPersonalField: (
      field: PersonalField | 'countryCode',
      value: string,
    ) => void
    setTextField: (value: string) => void
    next: () => void
    back: () => void
    dismissIntermission: () => void
    restart: () => void
    showRecommendations: () => void
  }
}
