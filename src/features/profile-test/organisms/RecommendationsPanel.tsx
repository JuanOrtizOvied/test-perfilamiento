import { ServiceCard } from '@/features/profile-test/molecules/ServiceCard'
import { recommendations } from '@/features/profile-test/constants/copy'
import { sabbiEmail } from '@/features/profile-test/constants/links'
import type { Service } from '@/core'

interface RecommendationsPanelProps {
  tier: string
  archetypeName: string
  /**
   * Services to show. The caller (page) passes the already-tier-filtered list
   * (empty renders the "no services" message).
   */
  services: readonly Service[]
  onBack?: () => void
}

/** Recommended services for the user's tier (or a fallback message). */
export function RecommendationsPanel({
  tier,
  archetypeName,
  services,
  onBack,
}: RecommendationsPanelProps) {
  return (
    <div>
      <div className="mb-4 rounded-[20px] bg-sabbi-verde-noche px-[26px] py-6 text-center">
        <span className="mb-2.5 inline-block rounded-md bg-sabbi-lima px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-sabbi-verde-noche">
          {tier}
        </span>
        <div className="mb-1.5 text-[20px] font-semibold text-white">
          {recommendations.title}
        </div>
        <div className="text-[13px] leading-[1.5] text-[#afc49a]">
          Basado en tu perfil como{' '}
          <strong className="text-white">{archetypeName}</strong>, estos son los
          servicios Sabbi que mejor se alinean con tu etapa y objetivos.
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl bg-sabbi-hueso px-5 py-7 text-center">
          <p className="text-[14px] leading-[1.7] text-sabbi-body">
            {recommendations.noServices.lead}
            <br />
            <br />
            {recommendations.noServices.tail} <strong>{sabbiEmail}</strong>.
          </p>
        </div>
      ) : (
        services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))
      )}

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[10px] border-[1.5px] border-sabbi-border bg-transparent px-5 py-[9px] text-[13px] text-sabbi-verde-prof transition-colors hover:border-sabbi-verde"
        >
          {recommendations.back}
        </button>
      </div>
    </div>
  )
}
