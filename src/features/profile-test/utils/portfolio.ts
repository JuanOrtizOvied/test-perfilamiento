/**
 * Rangos permitidos del portafolio: aplican la regla declarada en
 * `ASSET_CLASS_RANGE_RULES` sobre el benchmark de la capacidad. El mínimo se
 * acota a 0 (p. ej. Mercados Públicos - Fijo en C5 tiene benchmark 0%, así que
 * su rango queda 0–5%).
 */
import {
  ASSET_CLASS_RANGE_RULES,
  PORTFOLIO_BENCHMARKS,
  RANGE_DELTA_PP,
} from '@/features/profile-test/constants/portfolioBenchmarks'
import type { AllowedRange, AssetClassName, CapacityId } from '@/core'

export function getBenchmarkPct(
  assetClass: AssetClassName,
  capacity: CapacityId,
): number {
  return PORTFOLIO_BENCHMARKS[assetClass][capacity]
}

export function getAllowedRange(
  assetClass: AssetClassName,
  capacity: CapacityId,
): AllowedRange {
  const benchmarkPct = getBenchmarkPct(assetClass, capacity)
  const minPct =
    ASSET_CLASS_RANGE_RULES[assetClass] === 'cero-a-benchmark-mas-delta'
      ? 0
      : Math.max(0, benchmarkPct - RANGE_DELTA_PP)
  return {
    assetClass,
    benchmarkPct,
    minPct,
    maxPct: benchmarkPct + RANGE_DELTA_PP,
  }
}

export function getAllowedRanges(capacity: CapacityId): AllowedRange[] {
  return (Object.keys(PORTFOLIO_BENCHMARKS) as AssetClassName[]).map(
    (assetClass) => getAllowedRange(assetClass, capacity),
  )
}
