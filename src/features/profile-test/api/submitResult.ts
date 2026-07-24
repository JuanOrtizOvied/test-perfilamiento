/**
 * Result submission, ported from the original `getResp` + `sendToSheets`.
 * `buildResultPayload` assembles the ~50-field payload with verbatim field names
 * (Spanish, matching the original spreadsheet columns). `submitResult` posts it
 * fire-and-forget with `mode: 'no-cors'`, exactly like the original `fetch`.
 *
 * The endpoint comes from `VITE_PROFILE_TEST_WEBHOOK_URL` (Phase 1 directive)
 * instead of the original hardcoded Zapier URL. An empty / placeholder URL skips
 * the request, preserving the original `TU_URL` guard behavior.
 */
import { env } from '@/packages/config/env'
import { ARCHETYPES } from '@/features/profile-test/constants/archetypes'
import { CAPACITIES } from '@/features/profile-test/constants/capacities'
import { answerText } from '@/features/profile-test/utils/answerText'
import { applyCapacityAdjustments } from '@/features/profile-test/utils/scoring'
import { ANSWER_COLUMN_QUESTIONS } from '@/features/profile-test/constants/resultColumns'
import type {
  AnswerColumns,
  Answers,
  BuildPayloadInput,
  ResultPayload,
} from '@/core'

export function buildAnswerColumns(answers: Answers): AnswerColumns {
  const columns = {} as AnswerColumns
  for (const column of Object.keys(
    ANSWER_COLUMN_QUESTIONS,
  ) as (keyof AnswerColumns)[]) {
    columns[column] = answerText(ANSWER_COLUMN_QUESTIONS[column], answers)
  }
  return columns
}

/** Build the submission payload with verbatim field names (port of `sendToSheets`). */
export function buildResultPayload({
  answers,
  scores,
  result,
}: BuildPayloadInput): ResultPayload {
  const archetypeId = result.archetype
  const capacityId = result.capacity
  const archetype = ARCHETYPES[archetypeId]
  const capacity = CAPACITIES[capacityId]

  return {
    timestamp: new Date().toISOString(),
    ...buildAnswerColumns(answers),
    arquetipo: archetypeId,
    arquetipo_nombre: archetype ? archetype.name : archetypeId,
    arquetipo_tier: archetype ? archetype.tier : '',
    arquetipo_desc: archetype ? archetype.description : '',
    fortaleza_1: archetype?.strengths[0] ?? '',
    fortaleza_2: archetype?.strengths[1] ?? '',
    punto_ciego_1: archetype?.blindSpots[0] ?? '',
    punto_ciego_2: archetype?.blindSpots[1] ?? '',
    portafolio_texto: capacity
      ? capacity.portfolio
          .map((slice) => `${slice.assetClass} ${slice.range}`)
          .join(' | ')
      : '',
    capacidad: capacityId,
    // Payload field names are kept verbatim for the external sheet/webhook; only
    // the internal source fields were renamed. CAP_score carries the ADJUSTED
    // capacity score (income-need + debt penalties applied), per the context
    // document where the adjustments modify CAP_score itself — the original HTML
    // sent the raw accumulator (decision 2026-07-22).
    E_score: scores.experienceScore,
    I_score: scores.involvementScore,
    R_score: scores.riskScore,
    F_score: scores.flowPreferenceScore,
    CAP_score: applyCapacityAdjustments(scores),
    COLAB: scores.collaborationMarker,
    CONF: scores.trustScore,
  }
}

/**
 * Post the result payload, fire-and-forget with `mode: 'no-cors'`. Skips when no
 * webhook URL is configured (or it still contains the `TU_URL` placeholder),
 * matching the original guard. `url` defaults to the configured env var; it is a
 * parameter so tests can exercise both the guard and the request.
 */
export function submitResult(
  payload: ResultPayload,
  url: string = env.profileTestWebhookUrl,
): void {
  if (!url || url.includes('TU_URL')) return
  void fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}
