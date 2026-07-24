import type { PortfolioSlice } from '@/core'

interface PortfolioRowProps {
  slice: PortfolioSlice
}

/** One asset-class row of the recommended portfolio: label + colored bar + range. */
export function PortfolioRow({ slice }: PortfolioRowProps) {
  // Bar width mirrors the original: value * 1.8, capped at 100%.
  const width = Math.min(Math.round(slice.value * 1.8), 100)
  return (
    <div className="mb-2 flex items-center gap-2.5">
      <div className="min-w-0 flex-1 text-[12px] text-sabbi-verde-prof">
        {slice.assetClass}
      </div>
      <div className="h-[5px] flex-[0_0_100px] overflow-hidden rounded-full bg-[#eaeae2]">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, background: slice.color }}
        />
      </div>
      <div className="flex-[0_0_56px] text-right text-[11px] font-bold text-sabbi-verde-prof">
        {slice.range}
      </div>
    </div>
  )
}
