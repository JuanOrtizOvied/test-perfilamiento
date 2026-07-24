export interface HttpErrorResponse<Data = unknown> {
  status: number
  data: Data
}

export interface HttpError<Data = unknown> {
  response?: HttpErrorResponse<Data>
}
