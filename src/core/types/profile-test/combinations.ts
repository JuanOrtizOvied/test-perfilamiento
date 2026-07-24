import type { ArchetypeId, CapacityId, CombinationFit } from './scoring'

export type CombinationRow = Readonly<Record<CapacityId, CombinationFit>>

export type CombinationMatrix = Readonly<Record<ArchetypeId, CombinationRow>>

export interface CombinationFitInfo {
  symbol: string
  label: string
  description: string
}
