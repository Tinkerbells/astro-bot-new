import type { InternalAxiosRequestConfig } from 'axios'

import { AxiosHeaders } from 'axios'

import type { HttpResponse } from '../types.js'
import type { HttpInterceptor } from '../interceptor.js'

import { logger } from '../../logger.js'

type RequestWithMetadata = InternalAxiosRequestConfig & {
  metadata?: {
    startTime?: number
  }
}

export class LoggingInterceptor implements HttpInterceptor {
  interceptRequest(request: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const requestWithMetadata = request as RequestWithMetadata
    // Add start time to metadata for duration calculation
    if (!requestWithMetadata.metadata) {
      requestWithMetadata.metadata = {}
    }
    requestWithMetadata.metadata.startTime = Date.now()

    logger.info({
      http: {
        type: 'request',
        method: requestWithMetadata.method?.toUpperCase(),
        url: requestWithMetadata.url,
        params: requestWithMetadata.params,
        headers: this.sanitizeHeaders(requestWithMetadata.headers),
      },
    }, 'HTTP Request')

    return requestWithMetadata
  }

  interceptResponse(response: HttpResponse): HttpResponse {
    logger.info({
      http: {
        type: 'response',
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        duration: this.calculateDuration(response),
      },
    }, 'HTTP Response')

    return response
  }

  interceptResponseError(error: any): Promise<any> {
    logger.error({
      http: {
        type: 'error',
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        code: error.code,
      },
    }, 'HTTP Error')

    return Promise.reject(error)
  }

  private sanitizeHeaders(headers: AxiosHeaders | Record<string, any> | undefined): Record<string, any> | undefined {
    if (!headers)
      return headers

    const headersObj = headers instanceof AxiosHeaders ? headers.toJSON() : headers
    const sanitized = { ...headersObj }
    // Remove or mask sensitive headers
    if (sanitized.Authorization) {
      sanitized.Authorization = '[REDACTED]'
    }
    return sanitized
  }

  private calculateDuration(response: HttpResponse): number | undefined {
    const config = response.config as RequestWithMetadata
    const requestTimestamp = config.metadata?.startTime
    if (!requestTimestamp) {
      return undefined
    }
    return Date.now() - requestTimestamp
  }
}
