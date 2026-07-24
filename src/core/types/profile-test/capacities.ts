export interface PortfolioSlice {
  assetClass: string
  range: string
  value: number
  color: string
}

export interface Capacity {
  id: string
  label: string
  range: string
  description: string
  portfolio: readonly PortfolioSlice[]
}
