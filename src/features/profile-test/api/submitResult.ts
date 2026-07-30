/**
 * Envío del resultado al webhook, fire-and-forget. El cuerpo es el MISMO
 * snapshot que consume el backend propio (`api/submitProgress`), en su estado
 * `completed`: secciones → preguntas → opciones + respuesta.
 *
 * El endpoint sale de `VITE_PROFILE_TEST_WEBHOOK_URL`. Una URL vacía o con el
 * placeholder `TU_URL` salta la petición, conservando la guarda original.
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

export function submitResult(
  payload: ProgressPayload,
  url: string = env.profileTestWebhookUrl,
): void {
  if (!url || url.includes('TU_URL')) return
  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}
