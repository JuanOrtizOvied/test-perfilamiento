import { describe, it, expect } from 'vitest'
import { answerText } from '@/features/profile-test/utils/answerText'
import type { Answers } from '@/core'

describe('answerText', () => {
  it('resolves a single answer to its option label', () => {
    const answers: Answers = { Q1: 0 }
    expect(answerText('Q1', answers)).toBe(
      'Generar ingresos de tus inversiones para cubrir tus gastos',
    )
  })

  it('joins a multi answer with " | "', () => {
    const answers: Answers = { Q6: [0, 1] }
    expect(answerText('Q6', answers)).toBe(
      'Acciones en bolsa | Bonos o renta fija',
    )
  })

  it('passes text/phone answers through as strings', () => {
    expect(answerText('Q01', { Q01: 'ana@correo.com' })).toBe('ana@correo.com')
    expect(answerText('Q02', { Q02: '+51 999888777' })).toBe('+51 999888777')
  })

  it('returns the raw string for fields with no Question entry (Q0_ap)', () => {
    expect(answerText('Q0_ap', { Q0_ap: 'Pérez' })).toBe('Pérez')
  })

  it('returns empty string for unanswered or empty-multi questions', () => {
    expect(answerText('Q1', {})).toBe('')
    expect(answerText('Q6', { Q6: [] })).toBe('')
    expect(answerText('Q0_ap', {})).toBe('')
  })
})
