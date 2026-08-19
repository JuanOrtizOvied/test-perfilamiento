/**
 * Capacity levels C1–C5. Labels and descriptions are verbatim from the original
 * HTML `CAP_DATA`; the portfolio slices are DERIVED from the context-document
 * benchmarks (`constants/portfolioBenchmarks.ts` via `utils/portfolio.ts`),
 * replacing the original hand-rounded bands that contradicted them (decision
 * 2026-07-22: benchmarks rule). `range` is the capacity score band and matches
 * the real `resolveCapacityTier` thresholds; per slice, `range` is the allowed
 * range rounded to whole percent, `value` (bar width) the rounded benchmark,
 * and `color` the original palette per asset class.
 */
import { getAllowedRanges } from '@/features/profile-test/utils/portfolio'
import type {
  AssetClassName,
  Capacity,
  CapacityId,
  PortfolioSlice,
} from '@/core'

/** Bar palette per asset class, preserved from the original HTML. */
const ASSET_CLASS_COLORS: Record<AssetClassName, string> = {
  'Inmobiliario Directo': '#79a82d',
  'Mercados Públicos - Fijo': '#334f1b',
  'Mercados Públicos - Variable': '#6b8f3e',
  'Mercados Privados': '#7562c6',
  'Club Deals': '#b5b3ff',
  'Cash y Otros': '#c3ed74',
}

/** Slices from the capacity's allowed ranges, largest benchmark first. */
function buildPortfolio(capacity: CapacityId): PortfolioSlice[] {
  return getAllowedRanges(capacity)
    .sort((rangeA, rangeB) => rangeB.benchmarkPct - rangeA.benchmarkPct)
    .map((allowedRange) => ({
      assetClass: allowedRange.assetClass,
      range: `${Math.round(allowedRange.minPct)}-${Math.round(allowedRange.maxPct)}%`,
      value: Math.round(allowedRange.benchmarkPct),
      color: ASSET_CLASS_COLORS[allowedRange.assetClass],
    }))
}

export const CAPACITIES: Record<string, Capacity> = {
  C1: {
    id: 'C1',
    label: 'Capacidad 1',
    level: 'Conservador',
    range: '< 3',
    description:
      'Insuficiente para asumir pérdidas. 100% preservación, liquidez alta, flujos seguros. Prohibido todo producto ilíquido.',
    portfolio: buildPortfolio('C1'),
  },
  C2: {
    id: 'C2',
    label: 'Capacidad 2',
    level: 'Conservador & Moderado',
    range: '3 a 9',
    description:
      'Limitada. Mayormente conservador con ventana de riesgo medio. Alternativos líquidos institucionales.',
    portfolio: buildPortfolio('C2'),
  },
  C3: {
    id: 'C3',
    label: 'Capacidad 3',
    level: 'Moderado',
    range: '10 a 14',
    description:
      'Media. Exposición moderada a alto riesgo. Alternativos líquidos más pequeña posición ilíquida.',
    portfolio: buildPortfolio('C3'),
  },
  C4: {
    id: 'C4',
    label: 'Capacidad 4',
    level: 'Moderado & Arriesgado',
    range: '15 a 20',
    description:
      'Alta. Crecimiento, alternativos líquidos e ilíquidos. Acceso amplio al catálogo.',
    portfolio: buildPortfolio('C4'),
  },
  C5: {
    id: 'C5',
    label: 'Capacidad 5',
    level: 'Arriesgado',
    range: '> 20',
    description:
      'Muy alta. Acceso completo incluyendo venture, deal flow exclusivo, PE ilíquido.',
    portfolio: buildPortfolio('C5'),
  },
} as const
