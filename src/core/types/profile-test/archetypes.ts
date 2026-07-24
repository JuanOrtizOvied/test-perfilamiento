export interface Archetype {
  id: string
  name: string
  tier: string
  description: string
  strengths: readonly string[]
  blindSpots: readonly string[]
  imageUrl: string
  imageAlt: string
}
