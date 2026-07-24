import type { ReactNode } from 'react'
import { cn } from '@/packages/lib/utils'

type ChipVariant = 'block' | 'tier' | 'recall'

interface ChipProps {
  children: ReactNode
  /**
   * - `block`: green uppercase label (question block / intermission badge).
   * - `tier`: lima uppercase label (result tier).
   * - `recall`: rounded pill echoing a previous answer.
   */
  variant?: ChipVariant
  className?: string
}

const variantClasses: Record<ChipVariant, string> = {
  block:
    'inline-block rounded-md bg-sabbi-verde/10 px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-[#3f5a1f]',
  tier: 'inline-block rounded-md bg-sabbi-lima px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-sabbi-verde-noche',
  recall:
    'inline-block rounded-[20px] border border-sabbi-verde/25 bg-sabbi-verde/10 px-2.5 py-0.5 text-[13px] font-semibold text-sabbi-verde-prof',
}

/** Small label / pill. One visual concept across block labels, tiers and recalls. */
export function Chip({ children, variant = 'block', className }: ChipProps) {
  return (
    <span className={cn(variantClasses[variant], className)}>{children}</span>
  )
}
