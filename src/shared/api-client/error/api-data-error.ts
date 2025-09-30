import { NetError } from '#root/shared/http/index.js'

export type ApiErrorInfo = {
  message: string
  additionalInfo: {
    errorCustomField?: string
  }
}

export class ApiDataError extends NetError<{
  errorCustomField?: string
}> {
  constructor({ errors }: { errors: ApiErrorInfo[] }) {
    super({ errors })
  }
}
