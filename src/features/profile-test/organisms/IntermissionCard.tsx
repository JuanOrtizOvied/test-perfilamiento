import type { ReactNode } from 'react'
import { Chip } from '@/packages/design/atoms/chip'
import { ProgressDots } from '@/packages/design/atoms/progress-dots'
import { Button } from '@/packages/design/ui/button'
import { intermissionDefaultCta } from '@/features/profile-test/constants/copy'
import type { Intermission, RichParagraph } from '@/core'

interface IntermissionCardProps {
  intermission: Intermission
  /**
   * Optional dynamic recall intro (built from previous answers), rendered above
   * the static body when provided.
   */
  recall?: ReactNode
  onContinue?: () => void
}

function Paragraph({ paragraph }: { paragraph: RichParagraph }) {
  return (
    <p className="mx-auto mb-0 max-w-[460px]">
      {paragraph.map((segment, index) => {
        if (segment.emphasis === 'strong')
          return <strong key={index}>{segment.text}</strong>
        if (segment.emphasis === 'em')
          return <em key={index}>{segment.text}</em>
        return <span key={index}>{segment.text}</span>
      })}
    </p>
  )
}

/** Between-blocks screen: badge, phase dots, title, static body and CTA. */
export function IntermissionCard({
  intermission,
  recall,
  onContinue,
}: IntermissionCardProps) {
  const hasCustomCta = Boolean(intermission.cta)
  return (
    <div className="py-1.5 text-center">
      <Chip variant="block" className="mb-4">
        {intermission.badge}
      </Chip>

      <ProgressDots
        total={5}
        value={intermission.phase}
        variant="steps"
        className="mb-[22px]"
      />

      <h2 className="mb-3 text-[23px] font-semibold leading-[1.35] text-sabbi-verde-noche">
        {intermission.title}
      </h2>

      <div className="mx-auto mb-[26px] flex max-w-[460px] flex-col gap-[1.4em] text-[14px] leading-[1.75] text-sabbi-body">
        {recall}
        {intermission.body.map((paragraph, index) => (
          <Paragraph key={index} paragraph={paragraph} />
        ))}
      </div>

      <Button
        type="button"
        variant={hasCustomCta ? 'pill-accent' : 'pill'}
        size="pill"
        onClick={onContinue}
        className="mx-auto block w-full max-w-[340px]"
      >
        {intermission.cta ?? intermissionDefaultCta}
      </Button>
    </div>
  )
}
