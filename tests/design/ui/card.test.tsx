import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/packages/design/ui/card'

describe('Card (DS smoke)', () => {
  it('renders the default variant as a light bordered panel', () => {
    render(<Card data-testid="card">Contenido</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('data-slot', 'card')
    expect(card).toHaveAttribute('data-variant', 'default')
    expect(card.className).toContain('border-sabbi-border')
    expect(card.className).toContain('bg-white')
  })

  it('renders the inverse variant as a dark panel without border', () => {
    render(
      <Card data-testid="card" variant="inverse">
        Contenido
      </Card>,
    )
    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('data-variant', 'inverse')
    expect(card.className).toContain('bg-sabbi-verde-noche')
    expect(card.className).not.toContain('border-sabbi-border')
  })

  it('renders header, content and footer sections', () => {
    render(
      <Card>
        <CardHeader>Encabezado</CardHeader>
        <CardContent>Cuerpo</CardContent>
        <CardFooter>Pie</CardFooter>
      </Card>,
    )
    expect(screen.getByText('Encabezado')).toHaveAttribute(
      'data-slot',
      'card-header',
    )
    expect(screen.getByText('Cuerpo')).toHaveAttribute(
      'data-slot',
      'card-content',
    )
    expect(screen.getByText('Pie')).toHaveAttribute('data-slot', 'card-footer')
  })

  it('does not render CardTitle uppercase by default', () => {
    render(<CardTitle>Título</CardTitle>)
    const title = screen.getByText('Título')
    expect(title.className).not.toContain('uppercase')
    expect(title.className).toContain('font-semibold')
  })

  it('applies uppercase only with the eyebrow variant', () => {
    render(<CardTitle variant="eyebrow">Sección</CardTitle>)
    expect(screen.getByText('Sección').className).toContain('uppercase')
  })

  it('renders CardTitle as the child element when asChild is set', () => {
    render(
      <CardTitle asChild>
        <h4>Encabezado h4</h4>
      </CardTitle>,
    )
    const heading = screen.getByRole('heading', { level: 4 })
    expect(heading).toHaveAttribute('data-slot', 'card-title')
  })
})
