export interface ProgressSection {
  key: string
  commitGate?: string
  questions: readonly { id: string; key: string }[]
}

export interface ProgressResult {
  archetype: { id: string; name: string; tier: string }
  capacity: { id: string; label: string }
}

export interface ProgressPayload {
  sessionId: string
  status: 'in_progress' | 'completed'
  milestone: string
  updatedAt: string
  progressPct: number
  sections: Record<string, Record<string, string>>
  result: ProgressResult
}
