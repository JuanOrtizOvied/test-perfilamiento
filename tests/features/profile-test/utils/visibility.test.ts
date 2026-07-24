import { describe, it, expect } from 'vitest'
import {
  isVisible,
  nextIndex,
  prevIndex,
  visibleTotal,
  visiblePosition,
} from '@/features/profile-test/utils/visibility'

describe('isVisible', () => {
  it('hides Q01/Q02 (hidden) and shows Q0/Q1', () => {
    expect(isVisible(0, false)).toBe(true) // Q0 personal
    expect(isVisible(1, false)).toBe(false) // Q01 email, hidden
    expect(isVisible(2, false)).toBe(false) // Q02 phone, hidden
    expect(isVisible(3, false)).toBe(true) // Q1
  })

  it('hides Q2 (index 4) only when skipQ2 is set', () => {
    expect(isVisible(4, false)).toBe(true)
    expect(isVisible(4, true)).toBe(false)
  })
})

describe('nextIndex', () => {
  it('skips the hidden Q01/Q02 after the personal form', () => {
    expect(nextIndex(0, false)).toBe(3)
  })

  it('lands on Q2 when not skipping, else jumps to Q3', () => {
    expect(nextIndex(3, false)).toBe(4)
    expect(nextIndex(3, true)).toBe(5)
  })
})

describe('prevIndex', () => {
  it('skips hidden questions going back', () => {
    expect(prevIndex(3, false)).toBe(0)
  })

  it('skips Q2 going back when skipQ2 is set', () => {
    expect(prevIndex(5, false)).toBe(4)
    expect(prevIndex(5, true)).toBe(3)
  })
})

describe('visibleTotal / visiblePosition', () => {
  it('counts 32 visible questions normally, 31 when skipping Q2', () => {
    expect(visibleTotal(false)).toBe(32)
    expect(visibleTotal(true)).toBe(31)
  })

  it('reports 1-based positions among visible questions', () => {
    expect(visiblePosition(0, false)).toBe(1)
    expect(visiblePosition(3, false)).toBe(2)
    expect(visiblePosition(33, false)).toBe(32)
    expect(visiblePosition(33, true)).toBe(31)
  })
})
