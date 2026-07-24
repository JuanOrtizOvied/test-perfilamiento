import type { ProgressPayload } from './submit-progress'

export interface RegisterSabbiTestQuestionParameters {
  payload: ProgressPayload
  successCallback?: () => void
}

export type RegisterSabbiTestQuestion = ({
  payload,
  successCallback,
}: RegisterSabbiTestQuestionParameters) => Promise<void>

interface UseRegisterSabbiTestQuestionReturn {
  loading: boolean
  errorMessage: string | null
  registerSabbiTestQuestion: RegisterSabbiTestQuestion
}

export type UseRegisterSabbiTestQuestion =
  () => UseRegisterSabbiTestQuestionReturn
