import { formatApiError } from '#root/data/error/index.js'

import { config } from '../config.js'
import { createHttpService } from '../http/http-client.js'
import { HmacInterceptor, LanguageInterceptor, LoggingInterceptor } from '../http/index.js'

const httpService = createHttpService()

const hmacInterceptor = new HmacInterceptor({
  hmacSecret: config.hmacSecret,
  // TODO: поменять на что-то более реалистичное
  botId: 'botId',
  timeWindowSeconds: 300,
})

const loggingInterceptor = new LoggingInterceptor()

// Всегда добавляем языковой интерцептор с локалью 'ru'
const languageInterceptor = new LanguageInterceptor({
  headerName: config.appHeaderLanguage,
  locale: 'ru',
})

httpService.addInterceptors([
  hmacInterceptor,
  loggingInterceptor,
  languageInterceptor,
])

// Настраиваем formatter ошибок
httpService.initErrorFormatter(formatApiError)

export const apiHttpClient = httpService.init({
  baseURL: config.backendUrl,
})
