import type { Archetype } from './archetypes'
import type { Capacity } from './capacities'

export interface UseResultActionsInput {
  archetype: Archetype | null
  capacity: Capacity | null
  firstName: string
}

export interface UseResultActions {
  message: string
  emailDialogOpen: boolean
  emailInvalid: boolean
  share: () => void
  openEmailDialog: () => void
  closeEmailDialog: () => void
  sendByEmail: (email: string) => void
  downloadResult: () => void
}
