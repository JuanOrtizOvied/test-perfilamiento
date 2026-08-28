/**
 * Envío del resultado a los webhooks, fire-and-forget. El cuerpo es el MISMO
 * snapshot que consume el backend propio (`api/submitProgress`), en su estado
 * `completed`: secciones → preguntas → opciones + respuesta.
 *
 * Son tres destinos, porque del otro lado cada uno hace un procedimiento
 * distinto: `VITE_PROFILE_TEST_WEBHOOK_URL` (flujo del resultado) y
 * `VITE_PROFILE_TEST_EXCEL_WEBHOOK_URL` (vuelca las preguntas a un Excel)
 * reciben el snapshot completo; `VITE_PROFILE_TEST_ZAPIER_WEBHOOK_URL` recibe
 * una fila plana cuyas claves son las columnas de la tabla del Zap (`Nombre`,
 * `Correo`, `Arquetipo`, …), para que Zapier mapee campo → columna directo. Por
 * eso son URLs separadas y no un fan-out dentro de la primera. Cada una guarda
 * por su cuenta: una URL vacía o con el placeholder `TU_URL` salta la petición,
 * conservando la guarda original.
 *
 * Va como `application/json` real, no form-encoded: el cuerpo es anidado y no
 * cabe en un formulario. Eso implica una petición CORS de verdad — el receptor
 * (n8n) tiene que responder los headers `Access-Control-Allow-*` y atender el
 * preflight `OPTIONS`, porque el `Content-Type: application/json` está fuera de
 * la lista segura. Si el receptor no está configurado así, el navegador bloquea
 * el envío.
 */
import { env } from '@/packages/config/env'
import type { ProgressPayload } from '@/core'

function post(url: string, payload: unknown): void {
  if (!url || url.includes('TU_URL')) return
  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}

/** Webhook del resultado final. */
export function submitResult(
  payload: ProgressPayload,
  url: string = env.profileTestWebhookUrl,
): void {
  post(url, payload)
}

/** Mismo cuerpo, webhook aparte: el que vuelca las preguntas a un Excel. */
export function submitResultToExcel(
  payload: ProgressPayload,
  url: string = env.profileTestExcelWebhookUrl,
): void {
  post(url, payload)
}

/** Texto de un campo del formulario personal (`name`, `email`, …) del snapshot. */
function personalAnswer(payload: ProgressPayload, key: string): string {
  const field = payload.sections
    .find((section) => section.key === 'personal')
    ?.questions.find((question) => question.key === key)
  return field && typeof field.answer === 'string' ? field.answer : ''
}

/**
 * Fila plana para el Zap: cada clave es una columna de su tabla, tal cual (con
 * espacios y tildes), así Zapier mapea directo sin destripar el snapshot.
 * `Nombre` junta nombre y apellido del formulario personal.
 */
function buildZapierRow(payload: ProgressPayload): Record<string, string> {
  const { archetype, capacity } = payload.result
  return {
    Nombre: [
      personalAnswer(payload, 'name'),
      personalAnswer(payload, 'lastName'),
    ]
      .filter(Boolean)
      .join(' '),
    Correo: personalAnswer(payload, 'email'),
    Arquetipo: archetype.name,
    Tier: archetype.tier,
    Capacidad: capacity.id,
    'Descripción corta': archetype.description,
    'Fortaleza 1': archetype.strengths[0] ?? '',
    'Fortaleza 2': archetype.strengths[1] ?? '',
    'Punto ciego 1': archetype.blindSpots[0] ?? '',
    'Punto ciego 2': archetype.blindSpots[1] ?? '',
  }
}

/** Tercer destino, cuerpo propio: la fila plana que consume el Zap de Zapier. */
export function submitResultToZapier(
  payload: ProgressPayload,
  url: string = env.profileTestZapierWebhookUrl,
): void {
  post(url, buildZapierRow(payload))
}
