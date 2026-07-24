import type { PersonalField } from './validation'

export interface PersonalFormValues {
  name: string
  lastName: string
  email: string
  countryCode: string
  phone: string
}

export interface PersonalFormError {
  field?: PersonalField
  message: string
  nonce: number
}

export interface QuestionCardError {
  scope: 'field' | 'opts'
  message: string
  nonce: number
}
