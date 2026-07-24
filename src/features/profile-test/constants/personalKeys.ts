/**
 * Correspondencia campo del formulario personal → clave en `resp`, con las
 * claves de estado del HTML original. El reducer de `useProfileTest` la lee para
 * escribir cada campo bajo su id de pregunta.
 */
import type { PersonalField } from '@/core'

export const PERSONAL_KEY: Record<PersonalField | 'countryCode', string> = {
  name: 'Q0',
  lastName: 'Q0_ap',
  email: 'Q01',
  phone: 'Q02_num',
  countryCode: 'Q02_cc',
}
