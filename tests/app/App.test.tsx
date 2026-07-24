import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import { welcome } from '@/features/profile-test/constants/copy'

describe('App', () => {
  it('renders the profile test at the root route (lazy)', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: welcome.title }),
    ).toBeInTheDocument()
  })
})
