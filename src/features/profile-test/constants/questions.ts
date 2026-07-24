/**
 * Test questions, ported from the original HTML `QS`. This is the single source
 * of truth and intentionally keeps question text together with the scoring
 * weights on each option and the flags (`skipQ2`, `exclusive`, `condicional`,
 * `hidden`). The weights and flags are DATA here; interpreting them (scoring in
 * `utils/scoring.ts`, conditional visibility in `utils/visibility.ts`) lives
 * outside this file.
 */

import type { Question } from '@/core'

export const QUESTIONS: readonly Question[] = [
  {
    id: 'Q0',
    bloque: 'Datos personales',
    tipo: 'personal',
    texto: 'Cuéntanos un poco sobre ti',
  },
  {
    id: 'Q01',
    bloque: 'Datos personales',
    tipo: 'text',
    texto: '¿Cuál es tu correo?',
    placeholder: 'correo@ejemplo.com',
    inputType: 'email',
    hidden: true,
  },
  {
    id: 'Q02',
    bloque: 'Datos personales',
    tipo: 'phone',
    texto: '¿Cuál es tu número de celular?',
    hidden: true,
  },
  {
    id: 'Q1',
    bloque: 'Objetivo de inversión',
    tipo: 'single',
    texto: '¿Qué te gustaría lograr principalmente con tus inversiones?',
    opts: [
      {
        label: 'Generar ingresos de tus inversiones para cubrir tus gastos',
        flowPreferencePoints: 3,
      },
      {
        label: 'Hacer crecer tu dinero a largo plazo',
        riskPoints: 2,
        financialCapacityPoints: 10,
        skipQ2: true,
      },
      { label: 'Planificar tus ahorros para jubilarte' },
      {
        label:
          'Prepararte para un objetivo específico (comprar un departamento, educación de tus hijos u otro proyecto importante)',
      },
    ],
  },
  {
    id: 'Q2',
    bloque: 'Objetivo de inversión',
    tipo: 'single',
    condicional: true,
    texto: '¿En cuánto tiempo esperas alcanzar ese objetivo?',
    opts: [
      { label: 'Menos de 2 años', financialCapacityPoints: 0 },
      { label: 'Entre 2 y 5 años', financialCapacityPoints: 2 },
      { label: 'Entre 5 y 8 años', financialCapacityPoints: 4 },
      { label: 'Entre 8 y 15 años', financialCapacityPoints: 6 },
      { label: 'Más de 15 años', financialCapacityPoints: 10 },
    ],
  },
  {
    id: 'Q3',
    bloque: 'Experiencia',
    tipo: 'single',
    texto: '¿Has trabajado en finanzas, inversiones o gestión de dinero?',
    opts: [
      { label: 'No', experiencePoints: 0 },
      { label: 'Sí, menos de 5 años', experiencePoints: 1 },
      { label: 'Sí, entre 5 y 10 años', experiencePoints: 2 },
      { label: 'Sí, más de 10 años', experiencePoints: 3 },
    ],
  },
  {
    id: 'Q4',
    bloque: 'Experiencia',
    tipo: 'single',
    texto: '¿Desde hace cuánto inviertes tu propio dinero?',
    opts: [
      { label: 'No has invertido antes', experiencePoints: 0 },
      { label: 'Menos de 2 años', experiencePoints: 1 },
      { label: 'Entre 2 y 5 años', experiencePoints: 2 },
      { label: 'Entre 5 y 10 años', experiencePoints: 3 },
      { label: 'Más de 10 años', experiencePoints: 5 },
    ],
  },
  {
    id: 'Q5',
    bloque: 'Experiencia',
    tipo: 'single',
    texto: '¿Cómo calificarías tu experiencia invirtiendo?',
    opts: [
      { label: 'Recién estás empezando', experiencePoints: 2.5 },
      {
        label: 'Tienes experiencia básica, conoces algunos productos',
        experiencePoints: 5,
      },
      {
        label:
          'Tienes amplia experiencia, ya has invertido en varios tipos de activos',
        experiencePoints: 7.5,
      },
      {
        label: 'Te consideras un experto/a en inversiones',
        experiencePoints: 10,
      },
    ],
  },
  {
    id: 'Q6',
    bloque: 'Experiencia',
    tipo: 'multi',
    texto:
      '¿En qué tipos de activos has invertido? Puedes elegir más de una opción.',
    opts: [
      { label: 'Acciones en bolsa', experiencePoints: 0.5 },
      { label: 'Bonos o renta fija', experiencePoints: 0.5 },
      { label: 'Fondos mutuos o ETFs', experiencePoints: 0.5 },
      { label: 'Fondos inmobiliarios, FIBRA o REITs', experiencePoints: 0.5 },
      { label: 'Inmuebles comprados para invertir', experiencePoints: 0.5 },
      { label: 'Notas estructuradas', experiencePoints: 0.5 },
      {
        label:
          'Alternativos: private equity, venture capital, hedge funds o crédito privado',
        experiencePoints: 0.5,
        sophisticationPoints: 1,
      },
      {
        label: 'Criptomonedas',
        experiencePoints: 0.5,
        sophisticationPoints: 1,
      },
      {
        label: 'Forex, monedas o derivados',
        experiencePoints: 0.5,
        sophisticationPoints: 1,
      },
      {
        label: 'Ninguno de los anteriores',
        experiencePoints: 0,
        exclusive: true,
      },
    ],
  },
  {
    id: 'Q7',
    bloque: 'Involucramiento',
    tipo: 'single',
    texto: 'Cuando evalúas una inversión, ¿cómo prefieres decidir?',
    opts: [
      {
        label: 'Prefieres que un experto te recomiende qué hacer',
        involvementPoints: 2,
      },
      {
        label: 'Te gusta recibir recomendaciones, pero decidir tú',
        involvementPoints: 4,
      },
      {
        label: 'Investigas por tu cuenta y luego decides',
        involvementPoints: 6,
      },
    ],
  },
  {
    id: 'Q8',
    bloque: 'Involucramiento',
    tipo: 'single',
    texto:
      'Si alguien de confianza te recomienda una inversión interesante, ¿qué harías?',
    opts: [
      {
        label: 'Probablemente invertirías si confías en quien te la recomienda',
        involvementPoints: 1,
        trustPoints: 4,
      },
      {
        label: 'Te interesaría, pero primero investigarías un poco',
        involvementPoints: 2,
        trustPoints: 3,
      },
      {
        label:
          'La revisarías a fondo y compararías alternativas antes de decidir',
        involvementPoints: 3,
        trustPoints: 2,
      },
      {
        label: 'No invertirías solo porque alguien te la recomienda',
        involvementPoints: 2,
        trustPoints: 1,
      },
    ],
  },
  {
    id: 'Q9',
    bloque: 'Involucramiento',
    tipo: 'single',
    texto: '¿Cuál describe mejor tu situación actual?',
    opts: [
      {
        label: 'Trabajas con poca flexibilidad de tiempo',
        involvementPoints: 0,
      },
      { label: 'Trabajas con cierta flexibilidad', involvementPoints: 0.5 },
      {
        label: 'Eres independiente, consultor/a o freelancer',
        involvementPoints: 1,
      },
      {
        label: 'Eres dueño/a, socio/a o accionista de una empresa',
        involvementPoints: 1,
      },
      {
        label: 'No trabajas actualmente o estás jubilado/a',
        involvementPoints: 0.5,
      },
    ],
  },
  {
    id: 'Q10',
    bloque: 'Involucramiento',
    tipo: 'single',
    texto: '¿Cuánto tiempo dedicas al mes a revisar tus inversiones?',
    opts: [
      { label: 'Menos de 1 hora al mes', involvementPoints: 1 },
      { label: 'Entre 1 y 4 horas al mes', involvementPoints: 2 },
      { label: 'Más de 4 horas al mes', involvementPoints: 3 },
    ],
  },
  {
    id: 'Q11',
    bloque: 'Involucramiento',
    tipo: 'single',
    texto: '¿Qué tipo de acompañamiento te serviría más?',
    opts: [
      {
        label: 'Recibir orientación y recomendaciones concretas',
        involvementPoints: 1,
        collaborationPoints: 1,
      },
      {
        label: 'Recibir oportunidades y apoyo para decidir',
        involvementPoints: 2,
        collaborationPoints: 2,
      },
      {
        label: 'Recibir información y análisis para decidir mejor',
        involvementPoints: 3,
        collaborationPoints: 2,
      },
      {
        label: 'Revisar oportunidades a tu ritmo, sin mucha interacción',
        involvementPoints: 3,
        collaborationPoints: 0,
      },
    ],
  },
  {
    id: 'Q12',
    bloque: 'Involucramiento',
    tipo: 'single',
    texto:
      '¿Qué tan valioso sería para ti aprender o contrastar ideas con otros inversionistas?',
    opts: [
      {
        label: 'No te interesa, prefieres invertir de forma privada',
        collaborationPoints: 0,
      },
      {
        label: 'Podrías leer contenido, pero no participarías activamente',
        collaborationPoints: 1,
      },
      {
        label: 'Te gustaría aprender de otros, aunque participarías poco',
        collaborationPoints: 2,
      },
      {
        label: 'Te gustaría contrastar ideas y hacer preguntas',
        collaborationPoints: 3,
      },
      {
        label: 'Te interesa aportar ideas y participar activamente',
        collaborationPoints: 4,
      },
    ],
  },
  {
    id: 'Q13',
    bloque: 'Riesgo',
    tipo: 'single',
    texto:
      'En comparación con otras personas, ¿cómo calificas tu disposición a asumir riesgos financieros?',
    opts: [
      { label: 'Extremadamente baja', riskPoints: 1 },
      { label: 'Muy baja', riskPoints: 2 },
      { label: 'Baja', riskPoints: 3 },
      { label: 'Media', riskPoints: 4 },
      { label: 'Alta', riskPoints: 5 },
      { label: 'Muy alta', riskPoints: 6 },
      { label: 'Extremadamente alta', riskPoints: 7 },
    ],
  },
  {
    id: 'Q14',
    bloque: 'Riesgo',
    tipo: 'single',
    texto:
      'Imagina que invertiste US$100,000 y el valor baja temporalmente. ¿Cuánto tendría que bajar para que te sientas incómodo?',
    opts: [
      { label: 'Cualquier caída te haría sentir incómodo/a', riskPoints: 1 },
      { label: 'Máximo 5%', riskPoints: 2 },
      { label: 'Máximo 10%', riskPoints: 3 },
      { label: 'Máximo 15%', riskPoints: 4 },
      { label: 'Máximo 20%', riskPoints: 5 },
      { label: 'Máximo 25%', riskPoints: 6 },
      { label: 'Máximo 30%', riskPoints: 7 },
    ],
  },
  {
    id: 'Q15',
    bloque: 'Riesgo',
    tipo: 'single',
    texto:
      'Actualmente, ¿cuánto riesgo estás dispuesto a asumir en tus inversiones?',
    opts: [
      { label: 'Muy bajo', riskPoints: 0 },
      { label: 'Bajo', riskPoints: 1 },
      { label: 'Medio', riskPoints: 3 },
      { label: 'Alto', riskPoints: 4 },
      { label: 'Muy alto', riskPoints: 5, sophisticationPoints: 1 },
    ],
  },
  {
    id: 'Q16',
    bloque: 'Riesgo',
    tipo: 'single',
    texto:
      'En los últimos 5 años, ¿cómo ha cambiado el nivel de riesgo que asumes en tus inversiones?',
    opts: [
      {
        label: 'Ahora buscas inversiones de menor riesgo que antes',
        riskPoints: 1,
      },
      { label: 'Has reducido un poco el nivel de riesgo', riskPoints: 2 },
      { label: 'Te mantienes más o menos igual', riskPoints: 3 },
      { label: 'Estás tomando un poco más de riesgo que antes', riskPoints: 4 },
      {
        label: 'Ahora buscas más potencial, aunque implique más riesgo',
        riskPoints: 5,
      },
    ],
  },
  {
    id: 'Q17',
    bloque: 'Flujos',
    tipo: 'single',
    texto:
      '¿Qué tan importante es para ti que tus inversiones generen ingresos recurrentes?',
    opts: [
      { label: 'No es importante para ti', flowPreferencePoints: 0 },
      {
        label: 'Te interesa, pero no es una prioridad',
        flowPreferencePoints: 1,
      },
      {
        label: 'Te gustaría que una parte de tu portafolio genere ingresos',
        flowPreferencePoints: 2,
      },
      {
        label: 'Es importante para complementar tus ingresos',
        flowPreferencePoints: 3,
      },
      {
        label:
          'Es muy importante; quieres que sea una fuente relevante de ingresos',
        flowPreferencePoints: 4,
      },
      {
        label: 'Es tu principal objetivo al invertir',
        flowPreferencePoints: 5,
      },
    ],
  },
  {
    id: 'Q18',
    bloque: 'Flujos',
    tipo: 'single',
    texto:
      '¿Cuánto necesitarías recibir aproximadamente al mes de tus inversiones?',
    opts: [
      {
        label: 'No necesitas ingresos mensuales de tus inversiones',
        monthlyIncomeNeedLevel: 0,
      },
      { label: 'Menos de US$500 al mes', monthlyIncomeNeedLevel: 1 },
      { label: 'Entre US$500 y US$1,000 al mes', monthlyIncomeNeedLevel: 2 },
      { label: 'Entre US$1,001 y US$2,000 al mes', monthlyIncomeNeedLevel: 3 },
      { label: 'Entre US$2,001 y US$5,000 al mes', monthlyIncomeNeedLevel: 4 },
      { label: 'Más de US$5,000 al mes', monthlyIncomeNeedLevel: 5 },
    ],
  },
  {
    id: 'Q19',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    texto: '¿Cuál es tu rango de edad?',
    opts: [
      { label: 'Menos de 30 años', financialCapacityPoints: 8 },
      { label: '30 a 34 años', financialCapacityPoints: 8 },
      { label: '35 a 45 años', financialCapacityPoints: 6 },
      { label: '46 a 55 años', financialCapacityPoints: 4 },
      { label: '56 a 65 años', financialCapacityPoints: 2, age56PlusMarker: 1 },
      {
        label: 'Más de 65 años',
        financialCapacityPoints: 0,
        age56PlusMarker: 1,
      },
    ],
  },
  {
    id: 'Q20',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    texto: '¿Cuántos hijos menores de 15 años dependen económicamente de ti?',
    opts: [
      { label: '0', financialCapacityPoints: 0 },
      { label: '1', financialCapacityPoints: -3 },
      { label: '2', financialCapacityPoints: -6 },
      { label: '3', financialCapacityPoints: -8 },
      { label: '4 o más', financialCapacityPoints: -10 },
    ],
  },
  {
    id: 'Q21',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    texto: '¿Cuántos hijos entre 15 y 24 años dependen económicamente de ti?',
    opts: [
      { label: '0', financialCapacityPoints: 0 },
      { label: '1', financialCapacityPoints: -1.5 },
      { label: '2', financialCapacityPoints: -3 },
      { label: '3', financialCapacityPoints: -4.5 },
      { label: '4 o más', financialCapacityPoints: -6 },
    ],
  },
  {
    id: 'Q22',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    texto: '¿Alguien más depende económicamente de ti?',
    opts: [
      { label: 'Nadie más', financialCapacityPoints: 0 },
      { label: 'Sí, 1 persona', financialCapacityPoints: -2 },
      { label: 'Sí, 2 personas', financialCapacityPoints: -4 },
      { label: 'Sí, 3 o más personas', financialCapacityPoints: -6 },
    ],
  },
  {
    id: 'Q23',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    texto:
      'Aparte de tus inversiones, ¿tienes otra fuente de ingresos recurrente?',
    opts: [
      {
        label: 'No tienes otra fuente de ingresos recurrente',
        financialCapacityPoints: -3,
      },
      { label: 'Sí, pero es variable', financialCapacityPoints: 0 },
      { label: 'Sí, es relativamente estable', financialCapacityPoints: 2 },
      { label: 'Sí, es alta y estable', financialCapacityPoints: 4 },
    ],
  },
  {
    id: 'Q24',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    texto: 'Aproximadamente, ¿cuánto podrías ahorrar o invertir cada mes?',
    opts: [
      { label: 'Actualmente no puedes ahorrar', financialCapacityPoints: 0 },
      { label: 'Menos de US$1,000', financialCapacityPoints: 1 },
      { label: 'Entre US$1,000 y US$2,000', financialCapacityPoints: 2 },
      { label: 'Entre US$2,000 y US$5,000', financialCapacityPoints: 4 },
      { label: 'Más de US$5,000', financialCapacityPoints: 6 },
    ],
  },
  {
    id: 'Q25',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    ayuda:
      'No consideres la hipoteca de tu vivienda principal si puedes pagarla cómodamente con tus ingresos actuales.',
    texto: '¿Cuál es el monto total de tus deudas financieras?',
    opts: [
      { label: 'No tienes deudas', debtLevel: 0 },
      { label: 'Menos de US$25,000', debtLevel: 1 },
      { label: 'Entre US$25,000 y US$50,000', debtLevel: 2 },
      { label: 'Entre US$50,000 y US$100,000', debtLevel: 3 },
      { label: 'Entre US$100,000 y US$250,000', debtLevel: 4 },
      { label: 'Más de US$250,000', debtLevel: 5 },
      {
        label: 'No estás seguro/a',
        financialCapacityPoints: -3,
        debtLevel: null,
      },
    ],
  },
  {
    id: 'Q26',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    texto: '¿Tienes propiedades a tu nombre de uso personal?',
    opts: [
      {
        label: 'No tienes propiedades de uso personal',
        financialCapacityPoints: 0,
      },
      { label: 'Sí, con valor menor a US$100,000', financialCapacityPoints: 0 },
      {
        label: 'Sí, entre US$100,000 y US$500,000',
        financialCapacityPoints: 1,
      },
      {
        label: 'Sí, entre US$500,000 y US$1 millón',
        financialCapacityPoints: 2,
      },
      {
        label: 'Sí, entre US$1 millón y US$2 millones',
        financialCapacityPoints: 3,
      },
      { label: 'Sí, más de US$2 millones', financialCapacityPoints: 5 },
    ],
  },
  {
    id: 'Q27',
    bloque: 'Capacidad financiera',
    tipo: 'single',
    texto:
      'Sin contar tu vivienda de uso personal, ¿cuánto dinero tienes invertido o disponible para invertir?',
    opts: [
      {
        label: 'Menos de US$200,000',
        financialCapacityPoints: 0,
        investableWealthLevel: 1,
      },
      {
        label: 'Entre US$200,000 y US$500,000',
        financialCapacityPoints: 2,
        investableWealthLevel: 2,
      },
      {
        label: 'Entre US$500,000 y US$1 millón',
        financialCapacityPoints: 5,
        investableWealthLevel: 3,
      },
      {
        label: 'Entre US$1 millón y US$5 millones',
        financialCapacityPoints: 9,
        investableWealthLevel: 4,
      },
      {
        label: 'Más de US$5 millones',
        financialCapacityPoints: 14,
        investableWealthLevel: 5,
      },
    ],
  },
  {
    id: 'Q28',
    bloque: 'Contexto Perú',
    tipo: 'single',
    texto: '¿Cuál es tu postura sobre invertir en Perú?',
    opts: [
      { label: 'No tienes problema con invertir en Perú' },
      { label: 'Invertirías en Perú solo si te da retornos más altos' },
      { label: 'Prefieres que represente máx. 20% de tus inversiones' },
      { label: 'Prefieres evitar inversiones en Perú' },
    ],
  },
  {
    id: 'Q29',
    bloque: 'Confianza',
    tipo: 'single',
    texto: '¿Cómo te enteraste de Sabbi?',
    opts: [
      {
        label: 'Un amigo, familiar o conocido te recomendó Sabbi',
        trustPoints: 5,
      },
      { label: 'Conoces a alguien que ya invierte con Sabbi', trustPoints: 5 },
      {
        label: 'Te invitaron a una presentación, evento o reunión de Sabbi',
        trustPoints: 4,
      },
      { label: 'Lo encontré por la web', trustPoints: 2 },
      { label: 'Vi contenido o publicidad en redes sociales', trustPoints: 1 },
      { label: 'Otro', trustPoints: 1 },
    ],
  },
  {
    id: 'Q30',
    bloque: 'Confianza',
    tipo: 'single',
    texto:
      '¿Qué tan cómodo(a) te sentirías de que un equipo especializado gestione parte de tus inversiones?',
    opts: [
      {
        label: 'No te sentirías cómodo/a, prefieres decidir directamente',
        trustPoints: 0,
        involvementPoints: 3,
      },
      {
        label:
          'Te costaría un poco, pero podrías evaluarlo si entendieras bien la estrategia',
        trustPoints: 2,
        involvementPoints: 2,
      },
      {
        label: 'Te sentirías cómodo/a, pero manteniendo cierto control',
        trustPoints: 3,
        involvementPoints: 2,
      },
      {
        label:
          'Te sentirías cómodo/a si el equipo tiene experiencia y track record',
        trustPoints: 4,
        involvementPoints: 1,
      },
      {
        label: 'Te sentirías muy cómodo/a; prefieres delegar en especialistas',
        trustPoints: 5,
        involvementPoints: 1,
      },
    ],
  },
  {
    id: 'Q31',
    bloque: 'Confianza',
    tipo: 'single',
    texto:
      '¿Alguna vez has dejado que alguien más gestione tu dinero o tus inversiones?',
    opts: [
      { label: 'No, nunca', trustPoints: 0 },
      {
        label: 'No, pero estarías dispuesto/a si confías en el equipo',
        trustPoints: 3,
      },
      { label: 'Sí, pero no tuviste una buena experiencia', trustPoints: 1 },
      { label: 'Sí, y tuviste una experiencia regular', trustPoints: 3 },
      { label: 'Sí, y tuviste una buena experiencia', trustPoints: 5 },
    ],
  },
]

/** Default dial code (Perú), pre-selected in the original. */
export const DEFAULT_COUNTRY_CODE = '+51'

/**
 * Country dial codes for the phone field. Converted verbatim from the original
 * `CC_OPTS` HTML `<option>` list into serializable data (a simple UI transform).
 * Labels keep the flag emoji + dial code exactly as in the source.
 */
export const COUNTRY_CODES: readonly { value: string; label: string }[] = [
  { value: '+51', label: '🇵🇪 +51' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+52', label: '🇲🇽 +52' },
  { value: '+57', label: '🇨🇴 +57' },
  { value: '+54', label: '🇦🇷 +54' },
  { value: '+56', label: '🇨🇱 +56' },
  { value: '+55', label: '🇧🇷 +55' },
  { value: '+593', label: '🇪🇨 +593' },
  { value: '+591', label: '🇧🇴 +591' },
  { value: '+595', label: '🇵🇾 +595' },
  { value: '+598', label: '🇺🇾 +598' },
  { value: '+58', label: '🇻🇪 +58' },
  { value: '+507', label: '🇵🇦 +507' },
  { value: '+506', label: '🇨🇷 +506' },
  { value: '+502', label: '🇬🇹 +502' },
  { value: '+504', label: '🇭🇳 +504' },
  { value: '+503', label: '🇸🇻 +503' },
  { value: '+505', label: '🇳🇮 +505' },
  { value: '+1', label: '🇩🇴 +1' },
  { value: '+53', label: '🇨🇺 +53' },
  { value: '+34', label: '🇪🇸 +34' },
  { value: '+44', label: '🇬🇧 +44' },
  { value: '+49', label: '🇩🇪 +49' },
  { value: '+33', label: '🇫🇷 +33' },
  { value: '+39', label: '🇮🇹 +39' },
  { value: '+351', label: '🇵🇹 +351' },
  { value: '+41', label: '🇨🇭 +41' },
  { value: '+31', label: '🇳🇱 +31' },
  { value: '+1', label: '🇨🇦 +1' },
  { value: '+61', label: '🇦🇺 +61' },
  { value: '+81', label: '🇯🇵 +81' },
  { value: '+86', label: '🇨🇳 +86' },
  { value: '+91', label: '🇮🇳 +91' },
  { value: '+65', label: '🇸🇬 +65' },
  { value: '+971', label: '🇦🇪 +971' },
  { value: '+972', label: '🇮🇱 +972' },
  { value: '+592', label: '🇬🇾 +592' },
  { value: '+597', label: '🇸🇷 +597' },
  { value: '+1868', label: '🇹🇹 +1868' },
  { value: '+1876', label: '🇯🇲 +1876' },
]
