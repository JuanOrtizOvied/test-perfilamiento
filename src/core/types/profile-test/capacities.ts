export interface PortfolioSlice {
  assetClass: string
  range: string
  value: number
  color: string
}

export interface Capacity {
  id: string
  label: string
  /**
   * Nombre descriptivo del tramo ("Conservador", "Moderado"…). No se pinta en la
   * UI: es lo que `submitProgress` manda como `result.capacity.id`, para que los
   * consumidores lean el nivel sin reconstruir las bandas de `CAP_score`.
   */
  level: string
  range: string
  description: string
  portfolio: readonly PortfolioSlice[]
}
