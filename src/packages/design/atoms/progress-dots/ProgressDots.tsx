import { cn } from '@/packages/lib/utils'

type ProgressDotsVariant = 'ramp' | 'steps'

interface ProgressDotsProps {
  total: number
  /**
   * Number of filled dots (only for `steps`): dots with index < value render
   * as active.
   */
  value?: number
  /**
   * - `ramp`: decorative green dots with an increasing opacity ramp.
   * - `steps`: phase indicator, purple filled dots vs. muted empty ones.
   */
  variant?: ProgressDotsVariant
  className?: string
}

const dotClasses: Record<ProgressDotsVariant, string> = {
  ramp: 'inline-block size-1.5 rounded-full bg-sabbi-verde',
  steps: 'inline-block size-[7px] rounded-full transition-colors',
}

/** Row of centered dots: decorative ramp or phase progress. */
export function ProgressDots({
  total,
  value = 0,
  variant = 'ramp',
  className,
}: ProgressDotsProps) {
  return (
    <div className={cn('flex justify-center gap-1.5', className)}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            dotClasses[variant],
            variant === 'steps' &&
              (value > index ? 'bg-sabbi-morado' : 'bg-[#d0d5c8]'),
          )}
          style={
            variant === 'ramp' ? { opacity: 0.2 + index * 0.09 } : undefined
          }
        />
      ))}
    </div>
  )
}
