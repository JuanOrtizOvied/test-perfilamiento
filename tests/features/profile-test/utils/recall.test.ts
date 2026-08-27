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
  it('after index 4: objective chip only — el horizonte ya no se recuerda', () => {
    const out = buildRecall(4, { Q1: 0, Q2: 1 })
    expect(render(out)).toBe(
      'Buscas [generar ingresos de tus inversiones para cubrir tus gastos]' +
        ' y eso nos ayuda a entender qué tipo de estrategia podría hacer más sentido para ti.',
    )
  })

  it('after index 4: da igual si Q2 se saltó, la frase es la misma', () => {
    expect(render(buildRecall(4, { Q1: 1, Q2: 4 }))).toBe(
      render(buildRecall(4, { Q1: 1 })),
    )
  })

  it('after index 8: null when Q5 is unanswered', () => {
    expect(buildRecall(8, {})).toBeNull()
  })

  it('after index 8: experience chip', () => {
    expect(render(buildRecall(8, { Q5: 0 }))).toBe(
      'Nos contaste que [recién estás empezando].',
    )
  })

  it('after index 14: support chip', () => {
    expect(render(buildRecall(14, { Q11: 0 }))).toBe(
      'Tomamos nota: para ti sería más útil [recibir orientación y recomendaciones concretas].',
    )
  })

  it('after index 20: both risk and flow', () => {
    const out = buildRecall(20, { Q15: 0, Q18: 0 })
    expect(render(out)).toBe(
      'Ya sabemos que estás dispuesto/a a asumir un nivel de riesgo [muy bajo]' +
        ' en tus inversiones y [no necesitas ingresos mensuales]' +
        ' de tus inversiones. Esto nos ayuda a determinar cuánto riesgo quieres tomar.',
    )
  })

  it('after index 20: el chip de riesgo usa recallLabel, no la etiqueta larga', () => {
    // La opción de Q15 se muestra como "Muy alto — tu situación actual te
    // permite…"; dentro de la frase solo cabe el nivel.
    expect(render(buildRecall(20, { Q15: 4 }))).toContain('[muy alto]')
  })

  it('after index 20: risk only (Q18 unanswered)', () => {
    const out = buildRecall(20, { Q15: 0 })
    expect(render(out)).toBe(
      'Ya sabemos que estás dispuesto/a a asumir un nivel de riesgo [muy bajo]' +
        ' en tus inversiones. Esto nos ayuda a determinar cuánto riesgo quieres tomar.',
    )
  })

  it('after index 20: null when neither is answered', () => {
    expect(buildRecall(20, {})).toBeNull()
  })

  it('index 33 has no recall', () => {
    expect(buildRecall(33, { Q1: 0 })).toBeNull()
  })
})
