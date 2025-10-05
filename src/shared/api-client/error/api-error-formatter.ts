import type { HttpServiceError } from '#root/shared/http/index.js'

import {
  BAD_REQUEST_ERROR_INFO,
  INTERNAL_ERROR_INFO,
  NOT_FOUND_ERROR_INFO,
  UNAUTHORIZED_HTTP_INFO,
} from '#root/shared/http/index.js'

import type { ApiErrorInfo } from './api-data-error.js'

import { ApiDataError } from './api-data-error.js'

type BackendErrorResponse = {
  message?: string
  error?: string
  statusCode?: number | string
  errors?: Array<{
    message?: string
    additionalInfo?: Record<string, unknown>
  }>
}

export function getMainApiErrorRes(
  mainApiError: HttpServiceError<BackendErrorResponse, BackendErrorResponse>,
): BackendErrorResponse | null {
  return mainApiError.response?.data ?? null
}

export function formatApiError(
  mainApiError: HttpServiceError<BackendErrorResponse, BackendErrorResponse>,
): ApiDataError {
  const payload = getMainApiErrorRes(mainApiError)
  const statusCode = resolveStatusCode(mainApiError, payload)
  const errorCode = typeof payload?.error === 'string' ? payload.error : undefined
  const baseAdditionalInfo = buildBaseAdditionalInfo(statusCode, errorCode)

  const payloadErrors = normalizeErrorItems(payload?.errors, baseAdditionalInfo)
  if (payloadErrors.length > 0) {
    return new ApiDataError({ errors: payloadErrors })
  }

  const messageFromPayload = readMessage(payload?.message)
  if (messageFromPayload) {
    return new ApiDataError({
      errors: [
        {
          message: messageFromPayload,
          additionalInfo: { ...baseAdditionalInfo },
        },
      ],
    })
  }

  const fallbackMessage = fallbackMessageByStatus(statusCode)
    ?? mainApiError.message
    ?? INTERNAL_ERROR_INFO.message

  return new ApiDataError({
    errors: [
      {
        message: fallbackMessage,
        additionalInfo: { ...baseAdditionalInfo },
      },
    ],
  })
}

function normalizeErrorItems(
  items: BackendErrorResponse['errors'],
  baseAdditionalInfo: Record<string, unknown>,
): ApiErrorInfo[] {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  return items.reduce<ApiErrorInfo[]>((accumulator, item) => {
    if (!item) {
      return accumulator
    }

    const message = readMessage(item.message)
    const additionalInfo = {
      ...baseAdditionalInfo,
      ...(isRecord(item.additionalInfo) ? item.additionalInfo : {}),
    }

    if (message) {
      accumulator.push({
        message,
        additionalInfo,
      })
      return accumulator
    }

    accumulator.push({
      message: INTERNAL_ERROR_INFO.message,
      additionalInfo,
    })
    return accumulator
  }, [])
}

function buildBaseAdditionalInfo(
  statusCode: number | undefined,
  errorCode: string | undefined,
): Record<string, unknown> {
  const additionalInfo: Record<string, unknown> = {}

  if (typeof statusCode === 'number') {
    additionalInfo.statusCode = statusCode
  }

  if (errorCode) {
    additionalInfo.code = errorCode
  }

  return additionalInfo
}

function resolveStatusCode(
  error: HttpServiceError<BackendErrorResponse, BackendErrorResponse>,
  payload: BackendErrorResponse | null,
): number | undefined {
  if (typeof error.response?.status === 'number') {
    return error.response.status
  }

  if (payload?.statusCode !== undefined) {
    return readStatusCode(payload.statusCode)
  }

  return undefined
}

function readStatusCode(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return undefined
}

function fallbackMessageByStatus(statusCode: number | undefined): string | undefined {
  switch (statusCode) {
    case UNAUTHORIZED_HTTP_INFO.code:
      return UNAUTHORIZED_HTTP_INFO.message
    case BAD_REQUEST_ERROR_INFO.code:
      return BAD_REQUEST_ERROR_INFO.message
    case NOT_FOUND_ERROR_INFO.code:
      return NOT_FOUND_ERROR_INFO.message
    default:
      return undefined
  }
}

function readMessage(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
