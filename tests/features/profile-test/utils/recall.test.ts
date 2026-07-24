import { describe, it, expect } from 'vitest'
import { buildRecall } from '@/features/profile-test/utils/recall'

/** Flatten segments to text, wrapping chip labels in [] to assert structure. */
function render(segments: ReturnType<typeof buildRecall>): string {
  if (!segments) return ''
  return segments
    .map((segment) => (segment.chip ? `[${segment.text}]` : segment.text))
    .join('')
}

describe('buildRecall', () => {
  it('after index 4: objective + horizon chips', () => {
    const out = buildRecall(4, { Q1: 0, Q2: 1 }, false)
    expect(render(out)).toBe(
      'Buscas [generar ingresos de tus inversiones para cubrir tus gastos]' +
        ' y tu horizonte es [entre 2 y 5 años]' +
        '. Eso nos ayuda a entender qué tipo de estrategia podría hacer más sentido para ti.',
    )
  })

  it('after index 4: skipQ2 drops the horizon chip', () => {
    const out = buildRecall(4, { Q1: 1 }, true)
    expect(render(out)).toBe(
      'Buscas [hacer crecer tu dinero a largo plazo]' +
        '. Eso nos ayuda a entender qué tipo de estrategia podría hacer más sentido para ti.',
    )
  })

  it('after index 8: null when Q5 is unanswered', () => {
    expect(buildRecall(8, {}, false)).toBeNull()
  })

  it('after index 8: experience chip', () => {
    expect(render(buildRecall(8, { Q5: 0 }, false))).toBe(
      'Nos contaste que [recién estás empezando].',
    )
  })

  it('after index 20: both risk and flow', () => {
    const out = buildRecall(20, { Q15: 0, Q18: 0 }, false)
    expect(render(out)).toBe(
      'Estás dispuesto/a a asumir un nivel de riesgo [muy bajo]' +
        ' y necesitas recibir [no necesitas ingresos mensuales de tus inversiones]' +
        ' de tus inversiones. Esto nos ayuda a determinar cuánto riesgo quieres tomar.',
    )
  })

  it('after index 20: risk only (Q18 unanswered)', () => {
    const out = buildRecall(20, { Q15: 0 }, false)
    expect(render(out)).toBe(
      'Estás dispuesto/a a asumir un nivel de riesgo [muy bajo]' +
        ' en tus inversiones. Esto nos ayuda a determinar cuánto riesgo quieres tomar.',
    )
  })

  it('after index 20: null when neither is answered', () => {
    expect(buildRecall(20, {}, false)).toBeNull()
  })

  it('index 33 has no recall', () => {
    expect(buildRecall(33, { Q1: 0 }, false)).toBeNull()
  })
})
