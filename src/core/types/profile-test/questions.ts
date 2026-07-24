export type QuestionType = 'personal' | 'text' | 'phone' | 'single' | 'multi'

export interface QuestionOption {
  label: string
  experiencePoints?: number
  involvementPoints?: number
  riskPoints?: number
  flowPreferencePoints?: number
  financialCapacityPoints?: number
  collaborationPoints?: number
  trustPoints?: number
  sophisticationPoints?: number
  age56PlusMarker?: number
  investableWealthLevel?: number
  monthlyIncomeNeedLevel?: number
  debtLevel?: number | null
  skipQ2?: boolean
  exclusive?: boolean
}

export interface Question {
  id: string
  bloque: string
  tipo: QuestionType
  texto: string
  placeholder?: string
  inputType?: string
  ayuda?: string
  hidden?: boolean
  condicional?: boolean
  opts?: readonly QuestionOption[]
}
