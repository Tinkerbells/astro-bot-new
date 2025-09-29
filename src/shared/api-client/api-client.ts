import { config } from '../config.js'
import { createHttpService } from '../http/http-client.js'
import { HmacInterceptor, LoggingInterceptor } from '../http/index.js'

const httpService = createHttpService()

const hmacInterceptor = new HmacInterceptor({
  hmacSecret: config.hmacSecret,
  // TODO: поменять на что-то более реалистичное
  botId: 'botId',
  timeWindowSeconds: 300,
})

const loggingInterceptor = new LoggingInterceptor()

httpService.addInterceptors([
  hmacInterceptor,
  loggingInterceptor,
])

export const apiHttpClient = httpService.init({
  baseURL: config.backendUrl,
})
