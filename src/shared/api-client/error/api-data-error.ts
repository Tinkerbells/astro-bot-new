import { NetError } from '#root/shared/http/index.js'

export type ApiErrorAdditionalInfo = {
  statusCode: number
  code: string
  [key: string]: unknown
}

export type ApiErrorInfo = {
  message: string
  additionalInfo: ApiErrorAdditionalInfo
}

export class ApiDataError extends NetError<ApiErrorAdditionalInfo> {
  constructor({ errors }: { errors: ApiErrorInfo[] }) {
    super({ errors })
  }
}
