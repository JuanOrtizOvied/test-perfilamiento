import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/packages/lib/utils'

// Adaptado de shadcn: sin padding/gap por defecto (cada uso define el suyo) y
// con variantes de panel sobre los tokens sabbi en lugar de bg-card.
const cardVariants = cva('rounded-2xl', {
  variants: {
    variant: {
      default: 'border border-sabbi-border bg-white',
      inverse: 'bg-sabbi-verde-noche text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Card({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn(className)} {...props} />
}

// `eyebrow`: micro-encabezado uppercase (secciones del resultado). El color se
// pasa por className porque varía por sección.
const cardTitleVariants = cva('font-semibold', {
  variants: {
    variant: {
      default: '',
      eyebrow: 'text-[10px] font-bold uppercase tracking-[0.08em]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function CardTitle({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof cardTitleVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      data-slot="card-title"
      className={cn(cardTitleVariants({ variant, className }))}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn(className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn(className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter, cardVariants }
