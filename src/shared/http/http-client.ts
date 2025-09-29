import type {
  AxiosError,
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'

import axios from 'axios'
import qs from 'query-string'
import axiosRetry from 'axios-retry'

import type { HttpInterceptor } from './interceptor.js'

import { NetError } from './net-error.js'

type ErrorHandler = (error: HttpServiceError<unknown, unknown>) => unknown
type ErrorFormatter<
  CurrentDataError extends NetError<Record<string, unknown>>,
> = (error: HttpServiceError<any, any>) => CurrentDataError

export type HttpService = {
  init: (config: HttpServiceInitConfig) => HttpService
  subscribeOnError: (func: ErrorHandler) => void
  initErrorFormatter: <
    CurrentDataError extends NetError<Record<string, unknown>>,
  >(
    func: ErrorFormatter<CurrentDataError>,
  ) => void
  addInterceptor: (interceptor: HttpInterceptor) => void
  addInterceptors: (interceptors: HttpInterceptor[]) => void
} & AxiosInstance

export type HttpServiceError<T, D> = AxiosError<T, D>

export type HttpServiceResponse<T, D = T> = AxiosResponse<T, D>

export type HttpServicePromise<T> = AxiosPromise<T>

type HttpServiceConfig = AxiosRequestConfig

type HttpServiceInitConfig = Pick<HttpServiceConfig, 'baseURL'>

/**
 * Creates a new HTTP service with axios-retry, error handling, and interceptor support
 *
 * @example
 * ```typescript
 * import { createHttpService } from './http-client.js'
 * import { HmacInterceptor, LoggingInterceptor } from './interceptors/index.js'
 *
 * // Create HTTP service
 * const httpService = createHttpService({
 *   timeout: 5000,
 * })
 *
 * // Add interceptors
 * const hmacInterceptor = new HmacInterceptor({
 *   hmacSecret: 'your-secret',
 *   botId: 'your-bot-id',
 *   timeWindowSeconds: 300,
 * })
 *
 * httpService.addInterceptors([
 *   hmacInterceptor,
 *   new LoggingInterceptor(),
 * ])
 *
 * // Initialize with baseURL
 * const apiClient = httpService.init({
 *   baseURL: 'https://api.example.com',
 * })
 *
 * // Setup error handling
 * apiClient.subscribeOnError((error) => {
 *   console.error('HTTP Error:', error.message)
 * })
 *
 * // Use as regular axios
 * const response = await apiClient.get('/users')
 * ```
 */
export function createHttpService(config: HttpServiceConfig = {}): HttpService {
  const errorListeners: ErrorHandler[] = []
  let errorFormatter: ErrorFormatter<NetError<Record<string, unknown>>> = () =>
    new NetError({
      errors: [{ message: 'Unknown error', additionalInfo: {} }],
    })

  const httpService = axios.create({
    timeout: 3000,
    paramsSerializer: {
      serialize: (params) => {
        return qs.stringify(params)
      },
    },
    ...config,
  }) as HttpService

  axiosRetry(httpService, { retries: 3 })

  httpService.subscribeOnError = (func) => {
    errorListeners.push(func)
  }

  httpService.initErrorFormatter = (func) => {
    errorFormatter = func
  }

  httpService.interceptors.response.use(
    res => res,
    (error) => {
      errorListeners.forEach((func) => {
        func(error)
      })

      return Promise.reject(errorFormatter(error))
    },
  )

  httpService.addInterceptor = (interceptor: HttpInterceptor) => {
    // Register request interceptor
    if (interceptor.interceptRequest) {
      httpService.interceptors.request.use(
        interceptor.interceptRequest.bind(interceptor),
        interceptor.interceptRequestError?.bind(interceptor),
      )
    }

    // Register response interceptor
    if (interceptor.interceptResponse) {
      httpService.interceptors.response.use(
        interceptor.interceptResponse.bind(interceptor),
        interceptor.interceptResponseError?.bind(interceptor),
      )
    }
  }

  httpService.addInterceptors = (interceptors: HttpInterceptor[]) => {
    interceptors.forEach(interceptor => httpService.addInterceptor(interceptor))
  }

  httpService.init = (newConfig?: HttpServiceInitConfig) => {
    if (newConfig) {
      httpService.defaults.baseURL = newConfig.baseURL
    }

    return httpService
  }

  return httpService
}
