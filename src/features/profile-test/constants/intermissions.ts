/**
 * Intermission screens shown between question blocks. From the original HTML
 * `INTERMS` (keyed by the question index they fire after).
 *
 * Each original screen opened with a dynamic "recall" sentence built from the
 * user's previous answers, followed by a fully-static continuation. Only the
 * static content lives here; the dynamic intros are assembled by
 * `utils/recall.ts` from `recallCopy` (below) and rendered through the
 * IntermissionCard `recall` slot. The inline comments record what each intro
 * says, for reference.
 */

import type { Intermission } from '@/core'

/**
 * Static connector copy for the dynamic "recall" intros, keyed by the question
 * index the intermission fires after. The answer chips are woven in by
 * `utils/recall.ts`; only the fixed text lives here. Verbatim from the original
 * `INTERMS[*].build`. Index 33 has no recall (its body is fully static).
 */
export const recallCopy = {
  // Sin chip de horizonte: la pantalla se queda con el objetivo. Q2 es
  // saltable, así que el horizonte no siempre venía de una respuesta real.
  after4: {
    lead: 'Buscas',
    tail: ' y eso nos ayuda a entender qué tipo de estrategia podría hacer más sentido para ti.',
  },
  after8: { lead: 'Nos contaste que ', tail: '.' },
  after14: { lead: 'Tomamos nota: para ti sería más útil ', tail: '.' },
  after20: {
    both: {
      lead: 'Ya sabemos que estás dispuesto/a a asumir un nivel de riesgo ',
      // El verbo de Q18 vive en su propia etiqueta ("Necesitas entre…"), por eso
      // el conector es solo " y ".
      mid: ' en tus inversiones y ',
      tailBefore:
        ' de tus inversiones. Esto nos ayuda a determinar cuánto riesgo ',
      em: 'quieres',
      tailAfter: ' tomar.',
    },
    riskOnly: {
      lead: 'Ya sabemos que estás dispuesto/a a asumir un nivel de riesgo ',
      tailBefore:
        ' en tus inversiones. Esto nos ayuda a determinar cuánto riesgo ',
      em: 'quieres',
      tailAfter: ' tomar.',
    },
  },
  after29: {
    lead: 'Nos indicaste que, además de tu vivienda personal, tienes ',
    tail: ' invertido o disponible para invertir.',
  },
} as const

export const INTERMISSIONS: readonly Intermission[] = [
  {
    // Recall intro (built by utils/recall.ts):
    //   "Buscas <chip>{objetivo}</chip> y eso nos ayuda a entender qué tipo de
    //    estrategia podría hacer más sentido para ti."
    afterIndex: 4,
    badge: 'Objetivo',
    phase: 1,
    title: 'Ya tenemos claro tu punto de partida',
    appendsName: true,
    body: [
      [
        {
          text: 'Ahora queremos conocer un poco más sobre tu experiencia invirtiendo. No hay respuestas buenas o malas: mientras más honestas sean tus respuestas, más preciso será tu perfil.',
        },
      ],
    ],
  },
  {
    // Recall intro (built by utils/recall.ts): "Nos contaste que <chip>{experiencia}</chip>."
    afterIndex: 8,
    badge: 'Experiencia',
    phase: 2,
    title: 'Tu experiencia también habla de cómo inviertes',
    body: [
      [
        {
          text: 'Ahora pasaremos a entender cómo prefieres tomar decisiones: si valoras más delegar, revisar por tu cuenta, recibir análisis o contrastar ideas con otros inversionistas.',
        },
      ],
    ],
  },
  {
    // Recall intro (built by utils/recall.ts):
    //   "Tomamos nota: para ti sería más útil <chip>{acompañamiento}</chip>."
    afterIndex: 14,
    badge: 'Involucramiento',
    phase: 3,
    title: 'Vamos bien',
    appendsName: true,
    body: [
      [
        {
          text: 'Ahora viene una parte clave del perfil: entender tu relación con el riesgo. Esto nos ayuda a diferenciar entre perfiles más conservadores, moderados o audaces.',
        },
      ],
    ],
  },
  {
    // Recall intro (built by utils/recall.ts):
    //   "Ya sabemos que estás dispuesto/a a asumir un nivel de riesgo <chip>{riesgo}</chip>
    //    en tus inversiones y <chip>{flujo}</chip> de tus inversiones. Esto nos ayuda a
    //    determinar cuánto riesgo <em>quieres</em> tomar."
    afterIndex: 20,
    badge: 'Flujos',
    phase: 4,
    title: 'Última parte: capacidad financiera',
    body: [
      [
        {
          text: 'Ahora haremos algunas preguntas sobre tu situación financiera actual. Esta sección nos ayuda a calcular tu capacidad de riesgo, es decir, el riesgo que ',
        },
        { text: 'puedes', emphasis: 'em' },
        { text: ' tomar de acuerdo a tu situación.' },
      ],
    ],
  },
  {
    // Recall intro (built by utils/recall.ts):
    //   "Nos indicaste que, además de tu vivienda personal, tienes <chip>{patrimonio}</chip>
    //    invertido o disponible para invertir."
    afterIndex: 29,
    badge: 'Capacidad',
    phase: 4,
    title: 'Entramos a la última sección',
    body: [
      [
        {
          text: 'Con eso ya podemos estimar tu nivel de capacidad. Para cerrar, queremos entender tu postura frente a ciertas inversiones y tu nivel de confianza al invertir acompañado(a).',
        },
      ],
    ],
  },
  {
    afterIndex: 33,
    badge: 'Casi listo',
    phase: 5,
    title: 'Estamos calculando tu Perfil Sabbi',
    appendsName: true,
    body: [
      [{ text: 'Con tus respuestas, calcularemos dos cosas:' }],
      [
        { text: 'Tu arquetipo de inversionista', emphasis: 'strong' },
        {
          text: ', que refleja cómo decides, qué experiencia tienes y cómo te relacionas con el riesgo.',
        },
      ],
      [
        { text: 'Tu nivel de capacidad', emphasis: 'strong' },
        {
          text: ', expresado del C1 al C5, que ayuda a entender qué tan alineada está tu situación financiera con tus objetivos de inversión.',
        },
      ],
    ],
    cta: 'Conocer mi Perfil Sabbi',
  },
] as const
