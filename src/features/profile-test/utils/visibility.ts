/**
 * Question-visibility helpers, ported from the original `isVis`/`nextIdx`/
 * `prevIdx`/`visTotal`/`visPos`. Pure functions over the static `QUESTIONS`
 * list plus the `skipQ2` flag; no component state.
 *
 * Visibility rules:
 *  - `hidden` questions (Q01 email, Q02 phone) are never shown standalone; they
 *    are captured inside the personal-data form. This makes the `text`/`phone`
 *    render branches dead routes (quirk 7).
 *  - When the "grow long-term" objective is chosen, Q2 (index 4) is skipped.
 */
import { QUESTIONS } from '@/features/profile-test/constants/questions'

/** Q2 lives at this index; skipped when `skipQ2` is set. */
const Q2_INDEX = 4

export function isVisible(index: number, skipQ2: boolean): boolean {
  if (QUESTIONS[index]?.hidden) return false
  return !(skipQ2 && index === Q2_INDEX)
}

/** Next visible index at or past `index + 1` (may return QUESTIONS.length). */
export function nextIndex(index: number, skipQ2: boolean): number {
  let next = index + 1
  while (next < QUESTIONS.length && !isVisible(next, skipQ2)) next++
  return next
}

/** Previous visible index at or before `index - 1` (may return < 0). */
export function prevIndex(index: number, skipQ2: boolean): number {
  let prev = index - 1
  while (prev >= 0 && !isVisible(prev, skipQ2)) prev--
  return prev
}

export function visibleTotal(skipQ2: boolean): number {
  let count = 0
  for (let index = 0; index < QUESTIONS.length; index++) {
    if (isVisible(index, skipQ2)) count++
  }
  return count
}

/** 1-based position of `index` among the visible questions. */
export function visiblePosition(index: number, skipQ2: boolean): number {
  let count = 0
  for (let cursor = 0; cursor <= index; cursor++) {
    if (isVisible(cursor, skipQ2)) count++
  }
  return count
}
