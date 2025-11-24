export type NetErrorItem<AdditionalInfo extends Record<string, unknown>> = {
  message: string
  additionalInfo: AdditionalInfo
}

export class NetError<
  AdditionalInfo extends Record<string, unknown>,
> extends Error {
  errors: NetErrorItem<AdditionalInfo>[]

  constructor({ errors }: { errors: NetErrorItem<AdditionalInfo>[] }) {
    super(errors[0].message)
    this.errors = errors
  }
}

export const UNAUTHORIZED_HTTP_CODE = 401

export const FORBIDDEN_HTTP_CODE = 403

export const BAD_REQUEST_HTTP_CODE = 400

export const NOT_FOUND_HTTP_CODE = 404

export const INTERNAL_ERROR_HTTP_CODE = 500

export const INSUFFICIENT_FUNDS_CODE = 'insufficient_funds'
export const INSUFFICIENT_FUNDS_HTTP_CODE = 402

export function isInsufficientFundsErrorLike(error: unknown): boolean {
  const status = extractStatusCode(error)
  return status === INSUFFICIENT_FUNDS_HTTP_CODE
}

function extractStatusCode(error: unknown): number | undefined {
  const maybe: any = error

  if (Array.isArray(maybe?.errors)) {
    const statusFromErrors = maybe.errors
      .map((e: any) => e?.additionalInfo?.statusCode)
      .find((code: unknown) => typeof code === 'number')

    if (typeof statusFromErrors === 'number') {
      return statusFromErrors
    }
  }

  if (typeof maybe?.statusCode === 'number') {
    return maybe.statusCode
  }

  if (typeof maybe?.status === 'number') {
    return maybe.status
  }

  if (typeof maybe?.response?.status === 'number') {
    return maybe.response.status
  }

  return undefined
}

export const BAD_REQUEST_ERROR_INFO = {
  code: BAD_REQUEST_HTTP_CODE,
  message: 'Request error',
}

export const NOT_FOUND_ERROR_INFO = {
  code: NOT_FOUND_HTTP_CODE,
  message: 'Server not responding',
}

export const UNAUTHORIZED_HTTP_INFO = {
  code: UNAUTHORIZED_HTTP_CODE,
  message: 'User not authorized',
}

export const FORBIDDEN_ERROR_INFO = {
  code: FORBIDDEN_HTTP_CODE,
  message: 'Quota limit reached',
}

export const INTERNAL_ERROR_INFO = {
  code: INTERNAL_ERROR_HTTP_CODE,
  message: 'Unknown error',
}
