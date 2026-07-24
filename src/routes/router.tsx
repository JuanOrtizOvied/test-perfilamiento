import { createBrowserRouter } from 'react-router'

/** Single-route data router: the whole app is the Test Perfil Sabbi. */
export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => ({
      Component: (await import('@/features/profile-test/pages/ProfileTestPage'))
        .ProfileTestPage,
    }),
  },
])
