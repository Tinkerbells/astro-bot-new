import type { InternalAxiosRequestConfig } from 'axios'

import type { HttpResponse } from './types.js'

export type HttpInterceptor = {
  interceptRequest?: (request: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  interceptRequestError?: (error: any) => Promise<any>
  interceptResponse?: (
    response: HttpResponse,
  ) => HttpResponse | Promise<HttpResponse>
  interceptResponseError?: (error: any) => Promise<any>
}
