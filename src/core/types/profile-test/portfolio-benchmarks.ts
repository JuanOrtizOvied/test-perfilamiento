import type { CapacityId } from './scoring'

export type AssetClassName =
  | 'Inmobiliario Directo'
  | 'Mercados Públicos - Fijo'
  | 'Mercados Públicos - Variable'
  | 'Mercados Privados'
  | 'Club Deals'
  | 'Cash y Otros'

export type BenchmarkByCapacity = Readonly<Record<CapacityId, number>>

export type RangeRuleKind =
  'benchmark-mas-menos-delta' | 'cero-a-benchmark-mas-delta'

export interface AllowedRange {
  assetClass: AssetClassName
  benchmarkPct: number
  minPct: number
  maxPct: number
}
