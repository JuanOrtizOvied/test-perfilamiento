import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/packages/design/ui/button'

describe('Button (DS smoke)', () => {
  it('renders its children as a button', () => {
    render(<Button>Enviar</Button>)
    const btn = screen.getByRole('button', { name: /enviar/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('data-slot', 'button')
  })

  it('renders as the child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/x">Ir</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: /ir/i })).toBeInTheDocument()
  })

  it('renders the sabbi pill variants', () => {
    render(
      <>
        <Button variant="pill" size="pill">
          Continuar
        </Button>
        <Button variant="pill-accent" size="pill">
          Agendar
        </Button>
        <Button variant="pill-outline" size="pill-sm">
          Atrás
        </Button>
      </>,
    )
    const cta = screen.getByRole('button', { name: /continuar/i })
    expect(cta.className).toContain('rounded-[40px]')
    expect(cta.className).toContain('bg-sabbi-verde-noche')
    expect(
      screen.getByRole('button', { name: /agendar/i }).className,
    ).toContain('bg-sabbi-morado')
    expect(screen.getByRole('button', { name: /atrás/i }).className).toContain(
      'border-sabbi-border',
    )
  })
})
