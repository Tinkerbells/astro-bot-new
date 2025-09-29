import type { InternalAxiosRequestConfig } from 'axios'

import type { HttpInterceptor } from '../interceptor.js'

export type LanguageConfig = {
  headerName: string
  locale: string
}

export class LanguageInterceptor implements HttpInterceptor {
  constructor(private readonly config: LanguageConfig) {}

  interceptRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (!config.headers) {
      config.headers = {} as any
    }

    config.headers[this.config.headerName] = this.config.locale

    return config
  }
}
