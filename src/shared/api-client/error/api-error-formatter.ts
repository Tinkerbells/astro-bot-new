import type { HttpServiceError } from '#root/shared/http/index.js'

import {
  BAD_REQUEST_ERROR_INFO,
  INTERNAL_ERROR_INFO,
  NOT_FOUND_ERROR_INFO,
  UNAUTHORIZED_HTTP_INFO,
} from '#root/shared/http/index.js'

import { ApiDataError } from './api-data-error.js'

type BackendErrorResponse = {
  statusCode: number
  message?: string
  error?: string
  errorMessage?: string
  errors?: Array<{
    message: string
    additionalInfo: {
      errorCustomField?: string
    }
  }>
}

export function getMainApiErrorRes(error: HttpServiceError<BackendErrorResponse, BackendErrorResponse>): BackendErrorResponse {
  if (error?.response?.status === UNAUTHORIZED_HTTP_INFO.code) {
    return {
      statusCode: UNAUTHORIZED_HTTP_INFO.code,
      errors: [
        {
          message: UNAUTHORIZED_HTTP_INFO.message,
          additionalInfo: {},
        },
      ],
    }
  }

  return (
    error.response?.data || {
      statusCode: INTERNAL_ERROR_INFO.httpCode,
      errors: [
        {
          message: INTERNAL_ERROR_INFO.message,
          additionalInfo: {},
        },
      ],
    }
  )
}

export function formatApiError(mainApiError: HttpServiceError<BackendErrorResponse, BackendErrorResponse>): ApiDataError {
  const errorResponse: BackendErrorResponse = getMainApiErrorRes(mainApiError)

  const { statusCode } = errorResponse

  // Если есть массив ошибок в response, используем их
  if (errorResponse.errors && errorResponse.errors.length) {
    return new ApiDataError({
      errors: errorResponse.errors,
    })
  }

  // Если есть message в response от backend
  if (errorResponse.message) {
    return new ApiDataError({
      errors: [
        {
          message: errorResponse.message,
          additionalInfo: {
            errorCustomField: errorResponse.error, // Добавляем error код если есть
          },
        },
      ],
    })
  }

  // Обработка по statusCode
  switch (statusCode) {
    case BAD_REQUEST_ERROR_INFO.code:
      return new ApiDataError({
        errors: [
          {
            message: BAD_REQUEST_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      })

    case NOT_FOUND_ERROR_INFO.code:
      return new ApiDataError({
        errors: [
          {
            message: NOT_FOUND_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      })

    default:
      return new ApiDataError({
        errors: [
          {
            message: INTERNAL_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      })
  }
}
