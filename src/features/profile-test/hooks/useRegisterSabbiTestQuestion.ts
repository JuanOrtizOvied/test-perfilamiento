import { useCallback, useState } from 'react'
import type {
  RegisterSabbiTestQuestion,
  UseRegisterSabbiTestQuestion,
} from '@/core'
import registerSabbiTestQuestionApi from '@/features/profile-test/api/registerSabbiTestQuestionApi'

/**
 * Registra un snapshot de avance en el backend, exponiendo `loading` y
 * `errorMessage` a la página. Nunca lanza: un fallo de red deja el mensaje de
 * error y el test continúa, porque el registro es secundario al flujo del
 * usuario (el siguiente snapshot hace upsert y sana lo que se haya perdido).
 *
 * `useCallback` con deps vacías mantiene la identidad estable, para que el
 * efecto de la página que la dispara no se re-ejecute en cada render.
 */
const useRegisterSabbiTestQuestion: UseRegisterSabbiTestQuestion = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const registerSabbiTestQuestion: RegisterSabbiTestQuestion = useCallback(
    async ({ payload, successCallback }) => {
      setLoading(true)

      try {
        const response = await registerSabbiTestQuestionApi(payload)

        setLoading(false)

        if (response.ok) {
          setErrorMessage(null)
          if (successCallback) successCallback()
        } else {
          setErrorMessage('Error al registrar la respuesta del test.')
        }
      } catch {
        setLoading(false)
        setErrorMessage('Ocurrió un error')
      }
    },
    [],
  )

  return {
    loading,
    errorMessage,
    registerSabbiTestQuestion,
  }
}

export default useRegisterSabbiTestQuestion
