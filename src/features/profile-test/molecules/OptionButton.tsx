import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/packages/lib/utils'

interface OptionButtonProps {
  children: ReactNode
  selected?: boolean
  /** Multi-select: render a checkbox indicator so users know several apply. */
  multi?: boolean
  onSelect?: () => void
  className?: string
}

/** Single/multi answer option. Presentational; selection state comes from props. */
export function OptionButton({
  children,
  selected = false,
  multi = false,
  onSelect,
  className,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role={multi ? 'checkbox' : undefined}
      aria-checked={multi ? selected : undefined}
      aria-pressed={multi ? undefined : selected}
      className={cn(
        'w-full rounded-[13px] border-[1.5px] px-[17px] py-[13px] text-left text-[15px] leading-[1.4] transition-colors',
        multi ? 'flex items-center gap-3' : 'block',
        selected
          ? 'border-sabbi-verde bg-sabbi-verde/[0.08] font-semibold text-sabbi-verde-noche'
          : 'border-sabbi-border bg-sabbi-hueso font-normal text-sabbi-verde-prof hover:border-sabbi-verde hover:bg-[#f0f5e8]',
        className,
      )}
    >
      {multi ? (
        <span
          aria-hidden="true"
          className={cn(
            'flex h-5 w-5 flex-none items-center justify-center rounded-[6px] border-[1.5px] transition-colors',
            selected
              ? 'border-sabbi-verde bg-sabbi-verde text-white'
              : 'border-sabbi-border bg-white text-transparent',
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      ) : null}
      <span className={multi ? 'flex-1' : undefined}>{children}</span>
    </button>
  )
}
