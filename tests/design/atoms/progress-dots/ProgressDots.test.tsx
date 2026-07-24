import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ProgressDots } from '@/packages/design/atoms/progress-dots'

describe('ProgressDots (DS smoke)', () => {
  it('renders the requested number of ramp dots with increasing opacity', () => {
    const { container } = render(<ProgressDots total={9} variant="ramp" />)
    const dots = container.querySelectorAll('span')
    expect(dots).toHaveLength(9)
    expect(dots[0]).toHaveStyle({ opacity: '0.2' })
    expect(dots[8]).toHaveStyle({ opacity: `${0.2 + 8 * 0.09}` })
    dots.forEach((dot) => expect(dot.className).toContain('bg-sabbi-verde'))
  })

  it('fills steps dots up to the given value', () => {
    const { container } = render(
      <ProgressDots total={5} value={3} variant="steps" />,
    )
    const dots = [...container.querySelectorAll('span')]
    expect(dots).toHaveLength(5)
    const filled = dots.filter((dot) =>
      dot.className.includes('bg-sabbi-morado'),
    )
    expect(filled).toHaveLength(3)
    expect(dots[3].className).toContain('bg-[#d0d5c8]')
  })
})
