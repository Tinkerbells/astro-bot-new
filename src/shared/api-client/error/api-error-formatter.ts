import type { HttpServiceError } from '#root/shared/http/index.js'

import {
  BAD_REQUEST_ERROR_INFO,
  INTERNAL_ERROR_INFO,
  NOT_FOUND_ERROR_INFO,
  UNAUTHORIZED_HTTP_INFO,
} from '#root/shared/http/index.js'

import { ApiDataError } from './api-data-error.js'

type BackendErrorResponse = {
  message?: string
  error?: string
  statusCode?: number
}

/**
 * Преобразует Axios ошибку в унифицированный ApiDataError.
 * Работает устойчиво и безопасно:
 * - поддерживает структурированные ошибки;
 * - учитывает error-коды и статус-коды;
 * - не ломается на невалидных payload'ах.
 */
export function formatApiError(
  error: HttpServiceError<BackendErrorResponse, BackendErrorResponse>,
): ApiDataError {
  const payload = error.response?.data
  const status = error.response?.status ?? payload?.statusCode ?? 500
  const code = payload?.error ?? inferCodeByStatus(status)

  if (payload?.message) {
    return new ApiDataError({
      errors: [
        {
          message: payload.message,
          additionalInfo: { statusCode: status, code },
        },
      ],
    })
  }

  return new ApiDataError({
    errors: [
      {
        message: fallbackMessageByCode(code, status),
        additionalInfo: { statusCode: status, code },
      },
    ],
  })
}

// --- helpers --------------------------------------------------------

function inferCodeByStatus(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 500:
      return 'INTERNAL_ERROR'
    default:
      return 'UNKNOWN'
  }
}

function fallbackMessageByCode(code: string, status: number): string {
  const map: Record<string, string> = {
    UNAUTHORIZED: UNAUTHORIZED_HTTP_INFO.message,
    BAD_REQUEST: BAD_REQUEST_ERROR_INFO.message,
    NOT_FOUND: NOT_FOUND_ERROR_INFO.message,
    INTERNAL_ERROR: INTERNAL_ERROR_INFO.message,
  }

  return map[code] ?? map[inferCodeByStatus(status)] ?? INTERNAL_ERROR_INFO.message
}
