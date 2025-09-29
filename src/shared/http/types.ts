import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

export type HttpClientConfig = AxiosRequestConfig

export type HttpRequest<T = any> = {
  data?: T
  metadata?: {
    startTime?: number
  }
} & InternalAxiosRequestConfig

export type HttpResponse<T = any> = {
  config: InternalAxiosRequestConfig & {
    metadata?: {
      startTime?: number
    }
  }
} & AxiosResponse<T>

export type BotSignatureData = {
  bot_id?: string
  app_id?: string
  request_id: string
  ts: number
  user_id?: string
  sign: string
}

export type HmacConfig = {
  hmacSecret: string
  botId: string
  timeWindowSeconds?: number
}
