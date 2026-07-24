import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** MSW server for Node (Vitest). Lifecycle is wired in `tests/setup.ts`. */
export const server = setupServer(...handlers)
