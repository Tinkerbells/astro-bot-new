import { geocodingRepository } from '#root/data/repositories/index.js'

import { CityService } from './city-service.js'

export const cityService = new CityService(geocodingRepository)

export { CityService } from './city-service.js'
