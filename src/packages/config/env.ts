import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_APP_ENV: z.enum(['local', 'staging', 'production']),
  VITE_GA_ID: z.string().default(''),
  VITE_PROFILE_TEST_WEBHOOK_URL: z.string().default(''),
  VITE_PROFILE_TEST_EXCEL_WEBHOOK_URL: z.string().default(''),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
  throw new Error(`Invalid environment variables:\n${details}`)
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  appEnv: parsed.data.VITE_APP_ENV,
  gaId: parsed.data.VITE_GA_ID,
  profileTestWebhookUrl: parsed.data.VITE_PROFILE_TEST_WEBHOOK_URL,
  profileTestExcelWebhookUrl: parsed.data.VITE_PROFILE_TEST_EXCEL_WEBHOOK_URL,
} as const
