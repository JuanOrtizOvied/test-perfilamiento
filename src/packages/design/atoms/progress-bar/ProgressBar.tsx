import { cn } from '@/packages/lib/utils'

interface ProgressBarProps {
  /** Completion percentage, 0–100. */
  value: number
  className?: string
}

/** Thin progress track + fill. Single visual concept, no internal state. */
export function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn(
        'h-[3px] overflow-hidden rounded-full bg-[#d8d9ce]',
        className,
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-sabbi-verde transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
