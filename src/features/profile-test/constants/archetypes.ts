/**
 * Investor archetypes (A1–A11, A12P, A12S). Text copied verbatim from the
 * original HTML `ARQ`. Images are treated as data, not inline SVG:
 *
 * - `imageUrl` is the hero image, served remotely from S3 as
 *   `${HERO_IMAGE_BASE_URL}/<id>.png` (one URL per archetype id).
 * - `imageAlt` is the accessible label (the archetype name).
 *
 * ResultCard hides the hero image slot when `imageUrl` is empty or fails to load
 * (replicating the original `onerror` fallback as conditional rendering).
 */

import type { Archetype } from '@/core'

/** Remote hero images: `${HERO_IMAGE_BASE_URL}/<id>.png` per archetype id. */
const HERO_IMAGE_BASE_URL =
  'https://sabbi-media.s3.us-east-1.amazonaws.com/arquetipos'

const ARCHETYPE_TEXT: Record<string, Omit<Archetype, 'imageUrl'>> = {
  A1: {
    id: 'A1',
    name: 'El Guardián',
    tier: 'Seguidores',
    description:
      'Protege lo construido, busca estabilidad y valora los flujos predecibles. Prefiere avanzar con claridad antes que asumir movimientos innecesarios. Se siente más cómodo cuando entiende dónde está su dinero y qué puede esperar de él.',
    strengths: [
      'Tiene claras sus prioridades financieras.',
      'Valora la transparencia y la tranquilidad.',
    ],
    blindSpots: [
      'Su cautela puede frenar el crecimiento del patrimonio.',
      'Puede demorar en abrirse a nuevas alternativas.',
    ],
    imageAlt: 'El Guardián',
  },
  A2: {
    id: 'A2',
    name: 'El Iniciador',
    tier: 'Seguidores',
    description:
      'Está dando sus primeros pasos, busca guía clara y quiere aprender sin sentirse abrumado. Necesita una experiencia que le ordene el camino y le dé confianza para avanzar.',
    strengths: [
      'Tiene disposición genuina para aprender.',
      'Reconoce lo que aún no domina y busca apoyo.',
    ],
    blindSpots: [
      'Puede entusiasmarse rápido con tendencias pasajeras.',
      'Su capital inicial puede limitar la diversificación.',
    ],
    imageAlt: 'El Iniciador',
  },
  A3: {
    id: 'A3',
    name: 'El Aprendiz Activo',
    tier: 'Colaboradores',
    description:
      'Quiere entender la lógica detrás de las decisiones y desarrollar criterio propio participando. No busca solo recibir respuestas, también quiere comprender cómo pensar mejor.',
    strengths: [
      'Hace preguntas que enriquecen la conversación.',
      'Quiere aprender de forma activa, no solo recibir respuestas.',
    ],
    blindSpots: [
      'Puede sentir que saber más ya equivale a tener experiencia.',
      'A veces quiere avanzar más rápido de lo que su recorrido permite.',
    ],
    imageAlt: 'El Aprendiz Activo',
  },
  A4: {
    id: 'A4',
    name: 'El Explorador Audaz',
    tier: 'Colaboradores',
    description:
      'Tiene apetito por oportunidades de mayor riesgo y busca canalizarlo con más disciplina. Le atraen las ideas con potencial, pero necesita estructura para no moverse solo por impulso.',
    strengths: [
      'Se anima a explorar nuevas oportunidades.',
      'Aprende a partir de la experiencia real.',
    ],
    blindSpots: [
      'Puede confundir valentía con especulación.',
      'Las modas de mercado pueden empujarlo a moverse de más.',
    ],
    imageAlt: 'El Explorador Audaz',
  },
  A5: {
    id: 'A5',
    name: 'El Estratega Delegador',
    tier: 'Seguidores',
    description:
      'Tiene experiencia y criterio, pero elige delegar porque prioriza su tiempo y espera estándares altos. No necesita estar encima de cada decisión para sentirse tranquilo.',
    strengths: [
      'Entiende bien su costo de oportunidad.',
      'Reconoce la calidad cuando la ve.',
    ],
    blindSpots: [
      'Es exigente y nota rápido cualquier señal de mediocridad.',
      'Tolera mal procesos lentos o poco claros.',
    ],
    imageAlt: 'El Estratega Delegador',
  },
  A6: {
    id: 'A6',
    name: 'El Constructor Disciplinado',
    tier: 'Colaboradores',
    description:
      'Ha construido experiencia con constancia y cree en avanzar con disciplina, no con apuro. Participa porque le interesa seguir afinando su criterio y contrastarlo con otros.',
    strengths: [
      'Ha construido experiencia con paciencia.',
      'Aporta valor de forma natural.',
    ],
    blindSpots: [
      'A veces puede quedarse demasiado en lo que ya conoce.',
      'Puede infravalorar cambios bruscos de ciclo.',
    ],
    imageAlt: 'El Constructor Disciplinado',
  },
  A7: {
    id: 'A7',
    name: 'El Cosechador de Renta',
    tier: 'Colaboradores',
    description:
      'Está en una etapa donde prioriza flujos, previsibilidad y utilidad concreta del portafolio. Mira sus inversiones como una fuente de soporte y estabilidad, no solo como crecimiento.',
    strengths: [
      'Tiene claro para qué necesita su portafolio.',
      'Suele evaluar con cuidado el riesgo de pago.',
    ],
    blindSpots: [
      'Puede quedarse corto en exposición a crecimiento.',
      'A veces persigue renta sin mirar todo el contexto.',
    ],
    imageAlt: 'El Cosechador de Renta',
  },
  A8: {
    id: 'A8',
    name: 'El Custodio Familiar',
    tier: 'Líderes',
    description:
      'Tiene muchos años de experiencia, ha vivido distintos ciclos y busca solidez con criterio. No se deja impresionar fácilmente y valora la consistencia por encima del entusiasmo.',
    strengths: [
      'Tiene criterio templado por la experiencia.',
      'Detecta bien la diferencia entre calidad y apariencia.',
    ],
    blindSpots: [
      'Puede asumir que el pasado siempre se repetirá.',
      'A veces tarda en adoptar nuevos marcos o herramientas.',
    ],
    imageAlt: 'El Custodio Familiar',
  },
  A9: {
    id: 'A9',
    name: 'El Visionario Global',
    tier: 'Líderes',
    description:
      'Lee el entorno, entiende los ciclos y busca moverse con inteligencia dentro de un portafolio diversificado. No necesita apuestas extremas para encontrar valor.',
    strengths: [
      'Tiene mirada macro y capacidad de lectura de contexto.',
      'Eleva el nivel de los debates con análisis valioso.',
    ],
    blindSpots: [
      'Puede complejizar decisiones que podrían ser más simples.',
      'Si ajusta demasiado seguido, puede desordenar el portafolio.',
    ],
    imageAlt: 'El Visionario Global',
  },
  A10: {
    id: 'A10',
    name: 'El Cazador de Alpha',
    tier: 'Líderes',
    description:
      'Busca retornos asimétricos y está dispuesto a asumir riesgos altos cuando la tesis lo justifica. No se mueve por intuición sola, sino por convicción bien trabajada.',
    strengths: [
      'Tiene convicción para ejecutar ideas exigentes.',
      'Analiza a fondo antes de tomar posiciones relevantes.',
    ],
    blindSpots: [
      'Puede defender demasiado una tesis equivocada.',
      'La búsqueda de retorno puede llevarlo a forzar oportunidades.',
    ],
    imageAlt: 'El Cazador de Alpha',
  },
  A11: {
    id: 'A11',
    name: 'El Arquitecto Líder',
    tier: 'Líderes',
    description:
      'Tiene autonomía, experiencia y una mirada propia sobre cómo invertir y construir criterio. No solo participa, también ayuda a elevar el nivel de la comunidad con sus ideas.',
    strengths: [
      'Aporta análisis con profundidad y generosidad.',
      'Su liderazgo se da de manera natural.',
    ],
    blindSpots: [
      'Su voz puede influir demasiado si no se equilibra el debate.',
      'A veces confía demasiado en su propio marco mental.',
    ],
    imageAlt: 'El Arquitecto Líder',
  },
  A12P: {
    id: 'A12P',
    name: 'El Estepario Principiante',
    tier: 'Esteparios',
    description:
      'Está construyendo su camino como inversionista paso a paso, tomando sus propias decisiones sin delegarlas ni compartirlas. Prefiere aprender en silencio y avanzar con claridad antes de abrirse a otros.',
    strengths: [
      'Toma decisiones propias con autonomía desde el inicio.',
      'Aprende a su ritmo sin dejarse llevar por el ruido externo.',
    ],
    blindSpots: [
      'Puede tardar más en desarrollar criterio al no contrastarlo.',
      'Corre el riesgo de sobreestimar su criterio antes de tener suficiente recorrido.',
    ],
    imageAlt: 'El Estepario Principiante',
  },
  A12S: {
    id: 'A12S',
    name: 'El Estepario Sabio',
    tier: 'Esteparios',
    description:
      'Tiene criterio consolidado y opera con plena autonomía. No necesita validación externa ni comunidad para tomar decisiones con convicción.',
    strengths: [
      'Ha desarrollado criterio propio sólido a lo largo del tiempo.',
      'Opera con convicción sin necesitar validación externa.',
    ],
    blindSpots: [
      'Puede quedar expuesto a ángulos ciegos por no contrastar su visión.',
      'Tiende a confiar demasiado en sus propios marcos mentales.',
    ],
    imageAlt: 'El Estepario Sabio',
  },
} as const

export const ARCHETYPES: Record<string, Archetype> = Object.fromEntries(
  Object.entries(ARCHETYPE_TEXT).map(([id, archetype]) => [
    id,
    { ...archetype, imageUrl: `${HERO_IMAGE_BASE_URL}/${id}.png` },
  ]),
)
