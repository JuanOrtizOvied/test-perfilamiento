import { http, HttpResponse } from 'msw'

// URL fija que los tests pasan explícitamente a `submitResult` para ejercer el
// POST real; el webhook de la app (`VITE_PROFILE_TEST_WEBHOOK_URL`) va vacío por
// defecto, así que el guard lo salta.
export const PROFILE_TEST_WEBHOOK_URL = 'https://webhook.test/profile-sabbi'

export const handlers = [
  http.post(
    PROFILE_TEST_WEBHOOK_URL,
    async () => new HttpResponse(null, { status: 200 }),
  ),
]
