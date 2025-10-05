import { createHttpService } from '../../../shared/http/http-client.js'

const httpService = createHttpService()

export const twoGisHttpClient = httpService.init({
  baseURL: 'https://catalog.api.2gis.com/3.0',
})
