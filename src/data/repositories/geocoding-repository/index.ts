import { config } from '../../../shared/config.js'
import { GeocodingRepository } from './geocoding-repository.js'
import {
  fakeTwoGisNetworkSource,
  twoGisNetworkSource,
} from '../../sources/geocoding-network-source/index.js'

const useFaker = !config.twoGisApiKey

export const geocodingRepository = new GeocodingRepository(
  useFaker ? fakeTwoGisNetworkSource : twoGisNetworkSource,
)

export * as GeocodingRepositoryDTO from './dto.js'
export { GeocodingRepository } from './geocoding-repository.js'
