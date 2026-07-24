import { describe, expect, it } from 'vitest'
import { env } from '@/packages/config/env'

describe('env', () => {
  it('parses and exposes the injected test environment', () => {
    expect(env.apiUrl).toBe('http://localhost:3000')
    expect(env.appEnv).toBe('local')
  })
})
