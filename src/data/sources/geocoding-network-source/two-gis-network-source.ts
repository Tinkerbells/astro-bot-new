import type {
  GeocodeRequestParams,
  TwoGisGeocodeResponseDto,
} from './dto.js'

import { config } from '../../../shared/config.js'
import { twoGisHttpClient } from './two-gis-http-client.js'

const apiKey = config.twoGisApiKey || ''

export const twoGisNetworkSource = {
  /**
   * Прямое геокодирование - поиск по названию города/адресу
   */
  geocode: async (
    query: string,
    options?: Omit<GeocodeRequestParams, 'q' | 'lat' | 'lon' | 'key'>,
  ) => {
    const params: GeocodeRequestParams = {
      q: query,
      key: apiKey,
      type: options?.type || 'adm_div.city,adm_div.district',
      fields: options?.fields || 'items.point',
      ...options,
    }

    return twoGisHttpClient.get<TwoGisGeocodeResponseDto>('/items/geocode', {
      params,
    })
  },

  /**
   * Обратное геокодирование - поиск по координатам
   */
  reverseGeocode: async (
    lat: number,
    lon: number,
    options?: Omit<GeocodeRequestParams, 'q' | 'lat' | 'lon' | 'key'>,
  ) => {
    const params: GeocodeRequestParams = {
      lat,
      lon,
      key: apiKey,
      fields: options?.fields || 'items.point',
      ...options,
    }

    return twoGisHttpClient.get<TwoGisGeocodeResponseDto>('/items/geocode', {
      params,
    })
  },

  /**
   * Поиск городов с приоритизацией по локации пользователя
   */
  searchCitiesNearUser: async (
    query: string,
    userLocation?: [number, number],
  ) => {
    const locationParam = userLocation ? `${userLocation[0]},${userLocation[1]}` : undefined

    const params: GeocodeRequestParams = {
      q: query,
      key: apiKey,
      type: 'adm_div.city,adm_div.district',
      fields: 'items.point,items.region_id',
      location: locationParam,
      limit: 5,
    }

    return twoGisHttpClient.get<TwoGisGeocodeResponseDto>('/items/geocode', {
      params,
    })
  },
}

export type GeocodingNetworkSource = typeof twoGisNetworkSource
