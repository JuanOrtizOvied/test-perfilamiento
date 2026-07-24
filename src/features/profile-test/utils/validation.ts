/**
 * Imperative validation ported from the original `goNext` + `shakeField`/
 * `shakeOpts`. Pure functions returning the same messages the original showed;
 * the reducer decides how to surface them (shake + error text).
 *
 * Note the two distinct email criteria preserved from the original (quirk 6):
 * the personal form / Q01 use the regex below, while the email modal uses a
 * looser `includes('@')` check (see `useResultActions`).
 */
import type {
  FieldError,
  PersonalField,
  PersonalValues,
  Question,
  QuestionType,
} from '@/core'
import { validation } from '@/features/profile-test/constants/copy'

type AnswerResponse = number | readonly number[] | string | undefined

/** Strip anything that is not a digit or whitespace (original phone `oninput`). */
export function sanitizePhone(value: string): string {
  return value.replace(/[^0-9\s]/g, '')
}

/** Email regex used by the personal form and Q01, verbatim. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Personal-form rules in the original field order; the first failing rule wins.
 * Each rule reads the trimmed value, matching the original `.value.trim()`.
 */
const PERSONAL_RULES: readonly {
  field: PersonalField
  isValid: (values: PersonalValues) => boolean
  message: string
}[] = [
  {
    field: 'name',
    isValid: (values) => values.name.trim() !== '',
    message: validation.name,
  },
  {
    field: 'lastName',
    isValid: (values) => values.lastName.trim() !== '',
    message: validation.lastName,
  },
  {
    field: 'email',
    isValid: (values) => values.email.trim() !== '',
    message: validation.email,
  },
  {
    field: 'email',
    isValid: (values) => isValidEmail(values.email.trim()),
    message: validation.emailInvalid,
  },
  {
    field: 'phone',
    isValid: (values) => values.phone.trim() !== '',
    message: validation.phone,
  },
]

/**
 * Validate the personal-data form, returning the first failing field + message
 * (or null when valid).
 */
export function validatePersonal(values: PersonalValues): FieldError | null {
  const failed = PERSONAL_RULES.find((rule) => !rule.isValid(values))
  return failed ? { field: failed.field, message: failed.message } : null
}

/**
 * Validator per question type; a type absent from the table (e.g. `personal`)
 * needs no answer check and resolves to null. The `text`/`phone` entries are
 * dead routes in the real flow (Q01/Q02 are hidden) but are ported for fidelity.
 */
const ANSWER_VALIDATORS: Partial<
  Record<
    QuestionType,
    (question: Question, response: AnswerResponse) => string | null
  >
> = {
  single: (_question, response) =>
    response === undefined ? validation.selectOption : null,
  multi: (_question, response) =>
    (Array.isArray(response) ? response : []).length === 0
      ? validation.selectOption
      : null,
  text: (question, response) => {
    const value = typeof response === 'string' ? response.trim() : ''
    if (!value) return validation.requiredField
    if (question.id === 'Q01' && !isValidEmail(value))
      return validation.emailInvalid
    return null
  },
  phone: (_question, response) => {
    const value = typeof response === 'string' ? response.trim() : ''
    return value ? null : validation.phone
  },
}

/**
 * Validate a single/multi/text/phone answer, returning an error message or null.
 */
export function validateAnswer(
  question: Question,
  response: AnswerResponse,
): string | null {
  return ANSWER_VALIDATORS[question.tipo]?.(question, response) ?? null
}
