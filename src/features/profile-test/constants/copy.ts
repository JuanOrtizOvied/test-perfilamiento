/**
 * Static UI copy for the Test Perfil Sabbi, extracted verbatim from the original
 * HTML. Dynamic pieces (interpolating the user's name / answers) are assembled
 * by the hooks/utils and the page.
 */

export const header = {
  subtitle: 'Test Perfil Sabbi',
} as const

export const progress = {
  stepLabel: (current: number, total: number) =>
    `Pregunta ${current} de ${total}`,
} as const

export const welcome = {
  title: 'Descubre tu Perfil Sabbi',
  paragraphs: [
    'Este test nos ayudará a entender cómo inviertes, qué tipo de acompañamiento te hace más sentido y qué portafolio te recomendamos de acuerdo a tu nivel de capacidad, alineado a tu situación actual.',
    'Al final recibirás tu arquetipo de inversionista y tu nivel de capacidad.',
  ],
  cta: 'Comenzar',
  // Resume-from-localStorage CTAs — new copy, not in the original HTML.
  resumeCta: 'Continuar donde lo dejaste',
  startFreshCta: 'Empezar desde cero',
} as const

export const nav = {
  back: '← Atrás',
  next: 'Continuar →',
} as const

export const multiSelectHint = 'Selecciona todas las que apliquen'

/** Imperative-validation messages, verbatim from the original `goNext`/shake helpers. */
export const validation = {
  name: 'Ingresa tu nombre',
  lastName: 'Ingresa tu apellido',
  email: 'Ingresa tu correo',
  emailInvalid: 'Ingresa un correo válido (ej: nombre@correo.com)',
  phone: 'Ingresa tu número de celular',
  requiredField: 'Este campo es obligatorio',
  selectOption: 'Selecciona una opción para continuar',
} as const

/** Default CTA for intermission screens (overridden by the last one). */
export const intermissionDefaultCta = 'Continuar →'

export const personalForm = {
  nameLabel: 'Nombre',
  namePlaceholder: 'Tu nombre',
  lastNameLabel: 'Apellido',
  lastNamePlaceholder: 'Tu apellido',
  emailLabel: 'Correo electrónico',
  emailPlaceholder: 'correo@ejemplo.com',
  phoneLabel: 'Celular',
  phonePlaceholder: '999 999 999',
} as const

export const result = {
  strengthsHeading: 'Fortalezas',
  blindSpotsHeading: 'Puntos ciegos',
} as const

/** Tooltips for the result action bar buttons. */
export const actionBar = {
  restart: 'Empezar de nuevo',
  members: 'Ver miembros como yo',
  download: 'Descargar imagen',
  scheduleCall: 'Agendar llamada con asesor',
  share: 'Compartir',
} as const

/** Transient messages shown under the result (share / download feedback). */
export const messages = {
  generatingImage: 'Generando imagen...',
  downloadError: 'No se pudo generar. Intenta desde Chrome.',
  linkCopied: '¡Enlace copiado al portapapeles!',
  copyThisText: (text: string) => `Copia este texto: ${text}`,
} as const

export const emailModal = {
  title: 'Enviar resultado por correo',
  description:
    'Te enviaremos un resumen de tu Perfil Sabbi. Confirma o edita el correo.',
  placeholder: 'correo@ejemplo.com',
  cancel: 'Cancelar',
  send: 'Enviar →',
} as const

/** Recommendations view copy. `archetypeName` is interpolated at render. */
export const recommendations = {
  /** CTA on the result view that opens this panel (the original `.btn-recom`). */
  cta: 'Ver servicios recomendados',
  title: 'Servicios recomendados para ti',
  subtitle: (archetypeName: string) =>
    `Basado en tu perfil como ${archetypeName}, estos son los servicios Sabbi que mejor se alinean con tu etapa y objetivos.`,
  back: '← Volver a mi resultado',
  /** Shown when no service matches the tier. `email` is rendered as bold text. */
  noServices: {
    lead: 'En este momento Sabbi no tiene un producto diseñado para tu perfil, pero lo tenemos en mente.',
    tail: 'Si quieres estar al tanto cuando lancemos algo para ti, escríbenos a',
  },
} as const

/**
 * Share / mailto templates. Content only; `useResultActions` wires them to
 * `navigator.share` / `mailto:`.
 */
export const share = {
  text: (archetypeName: string) =>
    `Acabo de descubrir mi Perfil Sabbi: ${archetypeName}. ¡Descubre el tuyo en sabbi.com!`,
  title: 'Perfil Sabbi',
} as const

export const emailTemplate = {
  subject: (archetypeName: string) => `Tu Perfil Sabbi: ${archetypeName}`,
  body: (params: {
    name?: string
    archetypeName: string
    tier?: string
    capacityLabel: string
    archetypeDescription: string
  }) =>
    'Hola' +
    (params.name ? ', ' + params.name : '') +
    ',\n\n' +
    'Estos son los resultados de tu Test Perfil Sabbi:\n\n' +
    '📊 Arquetipo: ' +
    params.archetypeName +
    (params.tier ? ' (' + params.tier + ')' : '') +
    '\n' +
    '📈 Capacidad: ' +
    params.capacityLabel +
    '\n\n' +
    params.archetypeDescription +
    '\n\n' +
    '— Sabbi · sabbi.com',
} as const
