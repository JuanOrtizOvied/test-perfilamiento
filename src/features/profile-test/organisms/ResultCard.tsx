import { useState } from 'react'
import { Chip } from '@/packages/design/atoms/chip'
import { Card, CardContent, CardTitle } from '@/packages/design/ui/card'
import { cn } from '@/packages/lib/utils'
import {
  TestActionBar,
  type TestActionBarProps,
} from '@/features/profile-test/organisms/TestActionBar'
import {
  result,
  recommendations as recommendationsCopy,
} from '@/features/profile-test/constants/copy'
import type { Archetype, Capacity } from '@/core'

interface ResultCardProps {
  archetype: Archetype
  capacity: Capacity
  message?: string
  actions?: TestActionBarProps
  /** Opens the recommended-services panel (the original `.btn-recom`). */
  onShowRecommendations?: () => void
}

/** Hero image with fallback: hidden when the URL is empty or fails to load. */
function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null
  return (
    <div className="flex size-[150px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sabbi-lima">
      <img
        src={src}
        alt={alt}
        className="size-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

/** Titled card with a colored-bullet list, shared by strengths and blind spots. */
function BulletCard({
  heading,
  headingClassName,
  items,
  bulletClassName,
}: {
  heading: string
  headingClassName: string
  items: readonly string[]
  bulletClassName: string
}) {
  return (
    <Card className="p-[18px]">
      <CardTitle
        asChild
        variant="eyebrow"
        className={cn('mb-2.5', headingClassName)}
      >
        <h4>{heading}</h4>
      </CardTitle>
      <ul className="flex flex-col gap-[7px]">
        {items.map((item, index) => (
          <li
            key={index}
            className={cn(
              'relative pl-[13px] text-[12px] leading-[1.45] text-sabbi-body before:absolute before:left-0 before:top-1.5 before:size-[5px] before:rounded-full',
              bulletClassName,
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}

/** Result view: archetype hero, strengths/blind spots and capacity. */
export function ResultCard({
  archetype,
  capacity,
  message,
  actions,
  onShowRecommendations,
}: ResultCardProps) {
  return (
    <div>
      <Card
        variant="inverse"
        className="mb-3.5 flex flex-col items-center gap-5 rounded-[20px] px-[26px] py-6 text-center sm:flex-row sm:items-start sm:text-left"
      >
        <HeroImage src={archetype.imageUrl} alt={archetype.imageAlt} />
        <CardContent className="min-w-0 flex-1">
          <Chip variant="tier" className="mb-2.5">
            {archetype.tier}
          </Chip>
          <CardTitle className="mb-2 text-[26px] leading-[1.2] text-white">
            {archetype.name}
          </CardTitle>
          <div className="text-[13px] leading-[1.65] text-[#afc49a]">
            {archetype.description}
          </div>
        </CardContent>
      </Card>

      <div className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BulletCard
          heading={result.strengthsHeading}
          headingClassName="text-sabbi-verde"
          items={archetype.strengths}
          bulletClassName="before:bg-sabbi-verde"
        />
        <BulletCard
          heading={result.blindSpotsHeading}
          headingClassName="text-[#b06a20]"
          items={archetype.blindSpots}
          bulletClassName="before:bg-[#c07a2a]"
        />
      </div>

      <Card
        variant="inverse"
        className="mb-3.5 flex items-center gap-4 px-[22px] py-5"
      >
        <div className="flex size-[52px] shrink-0 items-center justify-center rounded-full border-2 border-white/50 text-[16px] font-bold text-white">
          {capacity.id}
        </div>
        <CardContent>
          <CardTitle asChild className="mb-1 text-[16px] text-white">
            <h3>{capacity.label}</h3>
          </CardTitle>
          <p className="text-[12px] leading-[1.5] text-[#afc49a]">
            {capacity.description}
          </p>
        </CardContent>
      </Card>

      {onShowRecommendations ? (
        <button
          type="button"
          onClick={onShowRecommendations}
          className="mt-[18px] block w-full cursor-pointer rounded-[13px] border-none bg-sabbi-verde p-3.5 text-[15px] font-semibold tracking-[0.01em] text-white transition-colors duration-150 hover:bg-sabbi-verde-prof"
        >
          {recommendationsCopy.cta}
        </button>
      ) : null}

      <TestActionBar {...actions} />

      {message ? (
        <div className="mt-2.5 text-center text-[12px] text-[#6b7a5a]">
          {message}
        </div>
      ) : null}
    </div>
  )
}
