export interface RichSegment {
  text: string
  emphasis?: 'strong' | 'em'
}

export type RichParagraph = readonly RichSegment[]

export interface Intermission {
  afterIndex: number
  badge: string
  phase: number
  title: string
  appendsName?: boolean
  body: readonly RichParagraph[]
  cta?: string
}
