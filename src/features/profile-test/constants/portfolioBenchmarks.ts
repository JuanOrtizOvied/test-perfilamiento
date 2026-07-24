/**
 * Benchmark de portafolio por clase de activo según capacidad (C1–C5) y regla
 * de rango permitido por clase, verbatim del documento de contexto
 * (`context-profile/sistema-perfil-sabbi.md`). `utils/portfolio.ts` solo itera
 * estas tablas; los rangos display de `constants/capacities.ts` no derivan de
 * aquí.
 */
import type { AssetClassName, BenchmarkByCapacity, RangeRuleKind } from '@/core'

/** Ancho en puntos porcentuales de todos los rangos permitidos. */
export const RANGE_DELTA_PP = 5

export const PORTFOLIO_BENCHMARKS: Readonly<
  Record<AssetClassName, BenchmarkByCapacity>
> = {
  'Inmobiliario Directo': {
    C1: 14.04,
    C2: 19.04,
    C3: 24.06,
    C4: 29.02,
    C5: 19.02,
  },
  'Mercados Públicos - Fijo': {
    C1: 38.98,
    C2: 28.98,
    C3: 18.98,
    C4: 8.98,
    C5: 0,
  },
  'Mercados Públicos - Variable': {
    C1: 3.02,
    C2: 12.52,
    C3: 16.42,
    C4: 21.62,
    C5: 26.88,
  },
  'Mercados Privados': {
    C1: 19.65,
    C2: 18.65,
    C3: 21.39,
    C4: 24.73,
    C5: 33.45,
  },
  'Club Deals': {
    C1: 7.83,
    C2: 7.83,
    C3: 9.13,
    C4: 9.13,
    C5: 9.13,
  },
  'Cash y Otros': {
    C1: 16.48,
    C2: 12.98,
    C3: 10.02,
    C4: 6.52,
    C5: 11.52,
  },
}

/** Regla de rango permitido por clase de activo. */
export const ASSET_CLASS_RANGE_RULES: Readonly<
  Record<AssetClassName, RangeRuleKind>
> = {
  'Inmobiliario Directo': 'cero-a-benchmark-mas-delta',
  'Mercados Públicos - Fijo': 'benchmark-mas-menos-delta',
  'Mercados Públicos - Variable': 'benchmark-mas-menos-delta',
  'Mercados Privados': 'benchmark-mas-menos-delta',
  'Club Deals': 'cero-a-benchmark-mas-delta',
  'Cash y Otros': 'benchmark-mas-menos-delta',
}
