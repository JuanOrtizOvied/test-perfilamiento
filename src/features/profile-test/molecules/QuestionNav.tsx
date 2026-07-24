import { Button } from '@/packages/design/ui/button'
import { nav } from '@/features/profile-test/constants/copy'

interface QuestionNavProps {
  /** Whether the "Continuar" button is enabled (default disabled). */
  nextEnabled?: boolean
  /** Whether to render the "Continuar" button (hidden for auto-advance single). */
  showNext?: boolean
  backDisabled?: boolean
  onNext?: () => void
  onBack?: () => void
}

/** Shared Atrás/Continuar pair used by question and personal-data views. */
export function QuestionNav({
  nextEnabled = false,
  showNext = true,
  backDisabled = false,
  onNext,
  onBack,
}: QuestionNavProps) {
  return (
    <div className="flex gap-2.5">
      <Button
        type="button"
        variant="pill-outline"
        size="pill-sm"
        onClick={onBack}
        disabled={backDisabled}
        className="flex-none"
      >
        {nav.back}
      </Button>
      {showNext ? (
        <Button
          type="button"
          variant="pill"
          size="pill"
          onClick={onNext}
          disabled={!nextEnabled}
          className="flex-1 px-6 py-[13px]"
        >
          {nav.next}
        </Button>
      ) : null}
    </div>
  )
}
