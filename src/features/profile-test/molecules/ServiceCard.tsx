import type { ComponentType } from 'react'
import { DollarSign, Star, User, Users } from 'lucide-react'
import { cn } from '@/packages/lib/utils'
import type { Service } from '@/core'

/**
 * Presentational icon mapping (service id → lucide glyph). The original inline
 * SVGs were lucide glyphs, so this preserves the visual without storing JSX in
 * the data. A future custom brand icon can be supplied via `service.iconUrl`.
 */
const iconById: Record<string, ComponentType<{ className?: string }>> = {
  circulo: Users,
  foro: Star,
  asesoria: User,
  productos: DollarSign,
}

interface ServiceCardProps {
  service: Service
}

/** A recommended service: icon chip, name, tag, description and external CTA. */
export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconById[service.id]
  return (
    <div
      className={cn(
        'mb-3 rounded-2xl border-[1.5px] px-5 py-[18px]',
        service.highlight
          ? 'border-sabbi-verde bg-[#f7faef]'
          : 'border-sabbi-border bg-white',
      )}
    >
      <div className="mb-2 flex items-center gap-3">
        {service.iconUrl ? (
          <span
            className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: service.color }}
          >
            <img
              src={service.iconUrl}
              alt={service.iconAlt ?? ''}
              className="size-5"
            />
          </span>
        ) : Icon ? (
          <span
            className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: service.color }}
          >
            <Icon className="size-5 text-white" />
          </span>
        ) : null}
        <div>
          <div className="text-[15px] font-bold text-sabbi-verde-prof">
            {service.name}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-sabbi-verde">
            {service.tag}
          </div>
        </div>
      </div>
      <div className="text-[13px] leading-[1.6] text-sabbi-body">
        {service.description}
      </div>
      <a
        href={service.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2.5 inline-block rounded-lg bg-sabbi-verde-noche px-4 py-[7px] text-[12px] font-semibold text-white transition-colors hover:bg-sabbi-verde"
      >
        {service.cta}
      </a>
    </div>
  )
}
