export type PersonalField = 'name' | 'lastName' | 'email' | 'phone'

export interface PersonalValues {
  name: string
  lastName: string
  email: string
  phone: string
}

export interface FieldError {
  field: PersonalField
  message: string
}
