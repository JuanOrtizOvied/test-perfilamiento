import { describe, it, expect } from 'vitest'
import { QUESTIONS } from '@/features/profile-test/constants/questions'
import {
  sanitizePhone,
  isValidEmail,
  validatePersonal,
  validateAnswer,
} from '@/features/profile-test/utils/validation'
import type { PersonalValues } from '@/core'

const validPersonal: PersonalValues = {
  name: 'Ana',
  lastName: 'Pérez',
  email: 'ana@correo.com',
  phone: '999 999 999',
}

describe('sanitizePhone', () => {
  it('keeps digits and whitespace, drops everything else', () => {
    expect(sanitizePhone('99a9 9b9')).toBe('999 99')
    expect(sanitizePhone('+51 (999) 999')).toBe('51 999 999')
  })
})

describe('isValidEmail', () => {
  it.each([
    ['ana@correo.com', true],
    ['a@b.co', true],
    ['ana@correo', false],
    ['anacorreo.com', false],
    ['ana @correo.com', false],
    ['', false],
  ])('%s → %s', (value, expected) => {
    expect(isValidEmail(value)).toBe(expected)
  })
})

describe('validatePersonal', () => {
  it('returns null for a fully valid form', () => {
    expect(validatePersonal(validPersonal)).toBeNull()
  })

  it('checks fields in order: name, lastName, email, invalid email, phone', () => {
    expect(validatePersonal({ ...validPersonal, name: ' ' })).toEqual({
      field: 'name',
      message: 'Ingresa tu nombre',
    })
    expect(validatePersonal({ ...validPersonal, lastName: '' })).toEqual({
      field: 'lastName',
      message: 'Ingresa tu apellido',
    })
    expect(validatePersonal({ ...validPersonal, email: '' })).toEqual({
      field: 'email',
      message: 'Ingresa tu correo',
    })
    expect(validatePersonal({ ...validPersonal, email: 'nope' })).toEqual({
      field: 'email',
      message: 'Ingresa un correo válido (ej: nombre@correo.com)',
    })
    expect(validatePersonal({ ...validPersonal, phone: '  ' })).toEqual({
      field: 'phone',
      message: 'Ingresa tu número de celular',
    })
  })
})

describe('validateAnswer', () => {
  const single = QUESTIONS.find((question) => question.id === 'Q1')!
  const multi = QUESTIONS.find((question) => question.id === 'Q6')!
  const emailText = QUESTIONS.find((question) => question.id === 'Q01')!
  const phone = QUESTIONS.find((question) => question.id === 'Q02')!

  it('requires a selection for single questions', () => {
    expect(validateAnswer(single, undefined)).toBe(
      'Selecciona una opción para continuar',
    )
    expect(validateAnswer(single, 0)).toBeNull()
  })

  it('requires at least one selection for multi questions', () => {
    expect(validateAnswer(multi, [])).toBe(
      'Selecciona una opción para continuar',
    )
    expect(validateAnswer(multi, [1])).toBeNull()
  })

  it('validates the dead text/phone routes for fidelity', () => {
    expect(validateAnswer(emailText, '')).toBe('Este campo es obligatorio')
    expect(validateAnswer(emailText, 'nope')).toBe(
      'Ingresa un correo válido (ej: nombre@correo.com)',
    )
    expect(validateAnswer(emailText, 'ana@correo.com')).toBeNull()
    expect(validateAnswer(phone, '')).toBe('Ingresa tu número de celular')
    expect(validateAnswer(phone, '999')).toBeNull()
  })
})
