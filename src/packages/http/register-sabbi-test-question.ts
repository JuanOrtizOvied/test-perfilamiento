import http from '@/packages/config/http/client'
import type { HttpError, ProgressPayload, ServiceReturn } from '@/core'

type RegisterSabbiTestQuestionService = ({
  sessionId,
  status,
  milestone,
  updatedAt,
  progressPct,
  sections,
  result,
}: ProgressPayload) => Promise<ServiceReturn<void>>

const registerSabbiTestQuestion: RegisterSabbiTestQuestionService = async ({
  sessionId,
  status,
  milestone,
  updatedAt,
  progressPct,
  sections,
  result,
}) => {
  try {
    const response = await http({
      url: '/sabbi-test',
      method: 'POST',
      data: {
        sessionId,
        status,
        milestone,
        updatedAt,
        progressPct,
        sections,
        result,
      },
    })

    return {
      ok: true,
      status: response.status,
      data: response.data,
    }
  } catch (error) {
    const { response } = error as HttpError

    return {
      ok: false,
      // 0 = no hubo respuesta HTTP (fallo de red o timeout).
      status: response?.status ?? 0,
      data: undefined,
      raw: error,
    }
  }
}

export default registerSabbiTestQuestion
