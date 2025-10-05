import { NetError } from '#root/shared/http/index.js'

export type ApiErrorInfo = {
  message: string
  additionalInfo: Record<string, unknown>
}

export class ApiDataError extends NetError<Record<string, unknown>> {
  constructor({ errors }: { errors: ApiErrorInfo[] }) {
    super({ errors })
  }
}
