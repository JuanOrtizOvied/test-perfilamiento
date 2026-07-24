import { describe, it, expect } from 'vitest'
import type { CapacityId } from '@/core'
import { CAPACITIES } from '@/features/profile-test/constants/capacities'
import {
  PORTFOLIO_BENCHMARKS,
  RANGE_DELTA_PP,
} from '@/features/profile-test/constants/portfolioBenchmarks'
import {
  getAllowedRange,
  getAllowedRanges,
  getBenchmarkPct,
} from '@/features/profile-test/utils/portfolio'

const CAPACITY_IDS: readonly CapacityId[] = ['C1', 'C2', 'C3', 'C4', 'C5']

describe('PORTFOLIO_BENCHMARKS', () => {
  it('los benchmarks suman 100% en cada capacidad', () => {
    for (const capacity of CAPACITY_IDS) {
      const total = Object.values(PORTFOLIO_BENCHMARKS).reduce(
        (sum, byCapacity) => sum + byCapacity[capacity],
        0,
      )
      expect(total).toBeCloseTo(100, 6)
    }
  })
})

describe('getAllowedRange', () => {
  it('aplica Benchmark ± 5 a las clases simétricas', () => {
    const range = getAllowedRange('Mercados Privados', 'C1')
    expect(range.benchmarkPct).toBe(19.65)
    expect(range.minPct).toBeCloseTo(14.65)
    expect(range.maxPct).toBeCloseTo(24.65)
  })

  it('aplica 0% a Benchmark + 5 en Inmobiliario Directo y Club Deals', () => {
    const inmobiliario = getAllowedRange('Inmobiliario Directo', 'C4')
    expect(inmobiliario.benchmarkPct).toBe(29.02)
    expect(inmobiliario.minPct).toBe(0)
    expect(inmobiliario.maxPct).toBeCloseTo(34.02)
    expect(getAllowedRange('Club Deals', 'C5').minPct).toBe(0)
  })

  it('acota el mínimo a 0 cuando Benchmark − 5 sería negativo', () => {
    const fijoC5 = getAllowedRange('Mercados Públicos - Fijo', 'C5')
    expect(fijoC5.benchmarkPct).toBe(0)
    expect(fijoC5.minPct).toBe(0)
    expect(fijoC5.maxPct).toBe(RANGE_DELTA_PP)
  })
})

describe('getAllowedRanges', () => {
  it('devuelve las 6 clases de activo de la capacidad pedida', () => {
    const ranges = getAllowedRanges('C3')
    expect(ranges).toHaveLength(6)
    expect(ranges.map((range) => range.assetClass)).toContain('Cash y Otros')
    expect(getBenchmarkPct('Mercados Públicos - Variable', 'C3')).toBe(16.42)
  })
})

describe('CAPACITIES.portfolio (derivado de los benchmarks)', () => {
  it('C1 muestra el rango permitido redondeado y el benchmark como valor', () => {
    const fijo = CAPACITIES.C1.portfolio.find(
      (slice) => slice.assetClass === 'Mercados Públicos - Fijo',
    )
    expect(fijo?.range).toBe('34-44%')
    expect(fijo?.value).toBe(39)
    const inmobiliario = CAPACITIES.C1.portfolio.find(
      (slice) => slice.assetClass === 'Inmobiliario Directo',
    )
    expect(inmobiliario?.range).toBe('0-19%')
    expect(inmobiliario?.value).toBe(14)
  })

  it('ordena las clases por benchmark descendente', () => {
    expect(CAPACITIES.C1.portfolio[0].assetClass).toBe(
      'Mercados Públicos - Fijo',
    )
    expect(CAPACITIES.C5.portfolio[0].assetClass).toBe('Mercados Privados')
  })

  it('cada capacidad tiene las 6 clases con color asignado', () => {
    for (const id of CAPACITY_IDS) {
      const portfolio = CAPACITIES[id].portfolio
      expect(portfolio).toHaveLength(6)
      for (const slice of portfolio) expect(slice.color).toMatch(/^#/)
    }
  })
})
