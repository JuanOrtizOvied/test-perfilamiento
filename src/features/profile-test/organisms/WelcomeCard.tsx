import { ProgressDots } from '@/packages/design/atoms/progress-dots'
import { Button } from '@/packages/design/ui/button'
import { welcome } from '@/features/profile-test/constants/copy'

interface WelcomeCardProps {
  /** Starts the test from scratch (discarding any saved run). */
  onStart?: () => void
  /** Offer to resume a saved run instead of the plain start CTA. */
  showResume?: boolean
  onResume?: () => void
}

/** Intro view: decorative dots, title, intro copy and the start CTA. */
export function WelcomeCard({
  onStart,
  showResume,
  onResume,
}: WelcomeCardProps) {
  return (
    <div className="py-2 text-center">
      <ProgressDots total={9} variant="ramp" className="mb-5" />
      <h1 className="mb-3.5 text-[26px] font-semibold leading-[1.3] text-sabbi-verde-noche">
        {welcome.title}
      </h1>
      <p className="mx-auto mb-7 max-w-[460px] text-[14px] leading-[1.7] text-sabbi-body">
        {welcome.paragraphs.map((text, index) => (
          <span key={index}>
            {index > 0 ? (
              <>
                <br />
                <br />
              </>
            ) : null}
            {text}
          </span>
        ))}
      </p>
      <Button
        type="button"
        variant="pill"
        size="pill"
        onClick={showResume ? onResume : onStart}
        className="mx-auto block w-full max-w-[340px]"
      >
        {showResume ? welcome.resumeCta : welcome.cta}
      </Button>
      {showResume ? (
        <Button
          type="button"
          variant="pill-outline"
          size="pill-sm"
          onClick={onStart}
          className="mx-auto mt-3 block w-full max-w-[340px]"
        >
          {welcome.startFreshCta}
        </Button>
      ) : null}
    </div>
  )
}
