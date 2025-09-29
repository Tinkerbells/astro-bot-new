import type { InternalAxiosRequestConfig } from 'axios'

import { Buffer } from 'node:buffer'
import { AxiosHeaders } from 'axios'
import { createHmac } from 'node:crypto'

import type { HttpInterceptor } from '../interceptor.js'
import type { BotSignatureData, HmacConfig } from '../types.js'

export class HmacInterceptor implements HttpInterceptor {
  private readonly hmacSecret: string
  private readonly botId: string
  private readonly timeWindowSeconds: number

  constructor(config: HmacConfig) {
    this.hmacSecret = config.hmacSecret
    this.botId = config.botId
    this.timeWindowSeconds = config.timeWindowSeconds ?? 300 // 5 minutes
  }

  interceptRequest(request: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Generate unique request ID
    const requestId = this.generateRequestId(request)

    // Create HMAC signature
    const bearerToken = this.createBotSignature({ requestId })

    // Add Authorization header
    if (!request.headers) {
      request.headers = new AxiosHeaders()
    }
    if (request.headers instanceof AxiosHeaders) {
      request.headers.set('Authorization', `Bearer ${bearerToken}`)
    }
    else {
      (request.headers as any).Authorization = `Bearer ${bearerToken}`
    }

    return request
  }

  interceptRequestError(error: any): Promise<any> {
    return Promise.reject(error)
  }

  interceptResponseError(error: any): Promise<any> {
    if (error.response?.status === 401) {
      console.error('Ошибка HMAC аутентификации:', error.response?.data)
    }
    return Promise.reject(error)
  }

  private generateRequestId(request: InternalAxiosRequestConfig): string {
    const method = request.method?.toUpperCase() ?? 'GET'
    const url = request.url ?? ''
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)

    return `${method}_${url.replace(/[^a-z0-9]/gi, '_')}_${timestamp}_${random}`
  }

  private createBotSignature({ requestId, userId }: { requestId: string, userId?: string }): string {
    const ts = Math.floor(Date.now() / 1000)

    // Create parameters for signature
    const hashParams: Record<string, string | number> = {
      bot_id: this.botId,
      request_id: requestId,
      ts,
    }

    if (userId) {
      hashParams.user_id = userId
    }

    // Sort by keys (alphabetical order)
    const sortedKeys = Object.keys(hashParams).sort()

    // Create query string
    const queryParts = sortedKeys.map(key => `${key}=${hashParams[key]}`)
    const queryString = queryParts.join('&')

    // Calculate HMAC signature
    const signature = createHmac('sha256', this.hmacSecret)
      .update(queryString)
      .digest('base64')

    // Apply VK-style encoding (Base64URL)
    const finalSignature = signature
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    // Create token data
    const tokenData: BotSignatureData = {
      bot_id: this.botId,
      request_id: requestId,
      ts,
      ...(userId && { user_id: userId }),
      sign: finalSignature,
    }

    // Encode to base64
    const bearerToken = Buffer.from(JSON.stringify(tokenData)).toString('base64')

    return bearerToken
  }

  // Public method to create signature for specific user
  createUserSignature(requestId: string, userId: string): string {
    return this.createBotSignature({ requestId, userId })
  }
}
