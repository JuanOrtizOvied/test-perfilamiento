export interface Service {
  id: string
  name: string
  tag: string
  description: string
  tiers: readonly string[]
  highlight: boolean
  color: string
  cta: string
  url: string
  iconUrl?: string
  iconAlt?: string
}
