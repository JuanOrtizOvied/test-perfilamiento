import registerSabbiTestQuestion from '@/packages/http/register-sabbi-test-question'
import type { ProgressPayload, ServiceReturn } from '@/core'

/**
 * Capa api del feature: adapta el snapshot de avance al servicio HTTP. No
 * decide cuándo enviar (eso es del hook) ni cómo hablar con axios (eso es de
 * `packages/http`).
 */
const registerSabbiTestQuestionApi = async ({
  sessionId,
  status,
  milestone,
  updatedAt,
  progressPct,
  sections,
  result,
}: ProgressPayload): Promise<ServiceReturn<void>> => {
  const response = await registerSabbiTestQuestion({
    sessionId,
    status,
    milestone,
    updatedAt,
    progressPct,
    sections,
    result,
  })

  return response
}

export default registerSabbiTestQuestionApi
