import { Chip } from '@/packages/design/atoms/chip'
import { Input } from '@/packages/design/ui/input'
import { Select } from '@/packages/design/ui/select'
import { cn } from '@/packages/lib/utils'
import { QuestionNav } from '@/features/profile-test/molecules/QuestionNav'
import { personalForm } from '@/features/profile-test/constants/copy'
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
} from '@/features/profile-test/constants/questions'
import type {
  PersonalField,
  PersonalFormError,
  PersonalFormValues,
} from '@/core'

interface PersonalDataFormProps {
  bloque: string
  texto: string
  values: PersonalFormValues
  error?: PersonalFormError
  onFieldChange: (field: PersonalField | 'countryCode', value: string) => void
  onNext?: () => void
  onBack?: () => void
}

const labelClass =
  'mb-1 block text-[12px] font-semibold uppercase tracking-[0.04em] text-sabbi-verde-prof'
const inputClass =
  'h-auto w-full rounded-[13px] border-[1.5px] border-sabbi-border bg-sabbi-hueso px-[17px] py-[13px] text-[15px] text-sabbi-verde-prof'
const errorClass = 'shake [outline:2px_solid_#e53935]'

/** The three free-text fields, in render order (phone is handled separately). */
const TEXT_FIELDS = {
  name: {
    id: 'p-nombre',
    type: 'text',
    label: personalForm.nameLabel,
    placeholder: personalForm.namePlaceholder,
  },
  lastName: {
    id: 'p-apellido',
    type: 'text',
    label: personalForm.lastNameLabel,
    placeholder: personalForm.lastNamePlaceholder,
  },
  email: {
    id: 'p-correo',
    type: 'email',
    label: personalForm.emailLabel,
    placeholder: personalForm.emailPlaceholder,
  },
} as const

/** Personal-data view: name, last name, email and phone (controlled inputs). */
export function PersonalDataForm({
  bloque,
  texto,
  values,
  error,
  onFieldChange,
  onNext,
  onBack,
}: PersonalDataFormProps) {
  /** A fresh React key (per error nonce) so the shake animation replays. */
  const fieldKey = (field: PersonalField) =>
    error?.field === field ? `${field}-${error.nonce}` : field
  /** Shake + red outline while `field` holds the current error. */
  const fieldClass = (field: PersonalField) =>
    cn(inputClass, error?.field === field && errorClass)

  /** Label + controlled Input for one of the `TEXT_FIELDS` entries. */
  const renderTextField = (field: keyof typeof TEXT_FIELDS) => {
    const { id, type, label, placeholder } = TEXT_FIELDS[field]
    return (
      <div>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <Input
          key={fieldKey(field)}
          id={id}
          type={type}
          placeholder={placeholder}
          value={values[field]}
          onChange={(event) => onFieldChange(field, event.target.value)}
          className={fieldClass(field)}
        />
      </div>
    )
  }

  return (
    <div>
      <Chip variant="block" className="mb-3.5">
        {bloque}
      </Chip>
      <div className="mb-1.5 text-[19px] font-semibold leading-[1.4] text-sabbi-verde-noche">
        {texto}
      </div>

      <div className="my-5 mb-2 flex flex-col gap-3.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {renderTextField('name')}
          {renderTextField('lastName')}
        </div>

        {renderTextField('email')}

        <div>
          <label className={labelClass}>{personalForm.phoneLabel}</label>
          <div className="flex gap-2">
            <Select
              value={values.countryCode || DEFAULT_COUNTRY_CODE}
              onChange={(event) =>
                onFieldChange('countryCode', event.target.value)
              }
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
              key={error?.field === 'phone' ? `phone-${error.nonce}` : 'phone'}
              type="tel"
              inputMode="numeric"
              placeholder={personalForm.phonePlaceholder}
              value={values.phone}
              onChange={(event) => onFieldChange('phone', event.target.value)}
              className={cn(
                'flex-1',
                inputClass,
                error?.field === 'phone' && errorClass,
              )}
            />
          </div>
        </div>
      </div>

      {error ? (
        <span className="mb-2 block min-h-[18px] text-[13px] text-[#e53935]">
          {error.message}
        </span>
      ) : null}

      <QuestionNav nextEnabled onNext={onNext} onBack={onBack} />
    </div>
  )
}
