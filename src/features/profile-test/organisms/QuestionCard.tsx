import { Chip } from '@/packages/design/atoms/chip'
import { Input } from '@/packages/design/ui/input'
import { Select } from '@/packages/design/ui/select'
import { cn } from '@/packages/lib/utils'
import { OptionButton } from '@/features/profile-test/molecules/OptionButton'
import { QuestionNav } from '@/features/profile-test/molecules/QuestionNav'
import { multiSelectHint } from '@/features/profile-test/constants/copy'
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
} from '@/features/profile-test/constants/questions'
import type { Question, QuestionCardError } from '@/core'

interface QuestionCardProps {
  question: Question
  selectedIndex?: number
  selectedIndices?: readonly number[]
  value?: string
  error?: QuestionCardError
  onSelect?: (optionIndex: number) => void
  /** Text/phone change (dead routes, wired for fidelity). */
  onChange?: (value: string) => void
  onNext?: () => void
  onBack?: () => void
}

const inputClass =
  'h-auto rounded-[13px] border-[1.5px] border-sabbi-border bg-sabbi-hueso px-[17px] py-[13px] text-[15px] text-sabbi-verde-prof'
const errorClass = 'shake [outline:2px_solid_#e53935]'

/** Single/multi/text/phone question with block label, help and navigation. */
export function QuestionCard({
  question,
  selectedIndex,
  selectedIndices = [],
  value = '',
  error,
  onSelect,
  onChange,
  onNext,
  onBack,
}: QuestionCardProps) {
  const optsError = error?.scope === 'opts'
  const fieldError = error?.scope === 'field'

  return (
    <div>
      <Chip variant="block" className="mb-3.5">
        {question.bloque}
      </Chip>
      <div className="mb-1.5 text-[19px] font-semibold leading-[1.4] text-sabbi-verde-noche">
        {question.texto}
      </div>

      {question.ayuda ? (
        <div className="my-2 mb-[18px] rounded-[0_8px_8px_0] border-l-[3px] border-sabbi-verde bg-sabbi-verde/[0.06] px-3.5 py-2.5 text-[13px] leading-[1.5] text-[#6b7a5a]">
          {question.ayuda}
        </div>
      ) : null}

      {question.tipo === 'multi' ? (
        <div className="mb-2.5 text-[12px] font-semibold text-[#6b7a5a]">
          {multiSelectHint}
        </div>
      ) : null}

      {question.tipo === 'single' || question.tipo === 'multi' ? (
        <div
          key={optsError ? error.nonce : 'opts'}
          className={cn(
            'my-[18px] mb-6 flex flex-col gap-[9px]',
            optsError && 'shake',
          )}
        >
          {(question.opts ?? []).map((option, index) => (
            <OptionButton
              key={index}
              multi={question.tipo === 'multi'}
              selected={
                question.tipo === 'multi'
                  ? selectedIndices.includes(index)
                  : selectedIndex === index
              }
              onSelect={onSelect ? () => onSelect(index) : undefined}
            >
              {option.label}
            </OptionButton>
          ))}
        </div>
      ) : null}

      {question.tipo === 'text' ? (
        <Input
          key={fieldError ? error.nonce : 'text'}
          type={question.inputType ?? 'text'}
          placeholder={question.placeholder ?? ''}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn(
            'my-4 mb-6 w-full',
            inputClass,
            fieldError && errorClass,
          )}
        />
      ) : null}

      {question.tipo === 'phone' ? (
        <div className="my-4 mb-6 flex gap-2">
          <Select
            defaultValue={DEFAULT_COUNTRY_CODE}
            className={cn(inputClass, 'h-auto w-28 flex-none px-2.5')}
          >
            {COUNTRY_CODES.map((countryCode, index) => (
              <option
                key={`${countryCode.value}-${index}`}
                value={countryCode.value}
              >
                {countryCode.label}
              </option>
            ))}
          </Select>
          <Input
            key={fieldError ? error.nonce : 'phone'}
            type="tel"
            inputMode="numeric"
            placeholder="999 999 999"
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            className={cn('flex-1', inputClass, fieldError && errorClass)}
          />
        </div>
      ) : null}

      {error ? (
        <span className="mt-2 block min-h-[18px] text-center text-[13px] text-[#e53935]">
          {error.message}
        </span>
      ) : null}

      <QuestionNav
        showNext={
          question.tipo !== 'single' &&
          (question.tipo !== 'multi' || selectedIndices.length > 0)
        }
        nextEnabled={
          question.tipo === 'multi' ? selectedIndices.length > 0 : true
        }
        onNext={onNext}
        onBack={onBack}
      />
    </div>
  )
}
