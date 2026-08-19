/**
 * Envío del resultado a los webhooks, fire-and-forget. El cuerpo es el MISMO
 * snapshot que consume el backend propio (`api/submitProgress`), en su estado
 * `completed`: secciones → preguntas → opciones + respuesta.
 *
 * Son dos destinos con el mismo cuerpo, porque del otro lado cada uno hace un
 * procedimiento distinto: `VITE_PROFILE_TEST_WEBHOOK_URL` (flujo del resultado)
 * y `VITE_PROFILE_TEST_EXCEL_WEBHOOK_URL` (vuelca las preguntas a un Excel). Por
 * eso son dos URLs y no un fan-out dentro del primero. Cada una guarda por su
 * cuenta: una URL vacía o con el placeholder `TU_URL` salta la petición,
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

function post(url: string, payload: ProgressPayload): void {
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
