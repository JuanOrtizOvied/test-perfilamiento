export interface ServiceReturn<Data> {
  ok: boolean
  status: number
  data: Data
  raw?: unknown
}
