import type * as TwoGisNetworkSourceDTO from './dto.js'
import type { GeocodingNetworkSource } from './two-gis-network-source.js'

import { twoGisNetworkSource } from './two-gis-network-source.js'

const fakeCities: TwoGisNetworkSourceDTO.TwoGisItemDto[] = [
  {
    id: 'fake_city_moscow',
    name: 'Москва',
    full_name: 'Россия, Москва',
    address_name: 'Москва',
    point: { lat: 55.7558, lon: 37.6173 },
    type: 'adm_div.city',
    region_id: 'ru_msk',
  },
  {
    id: 'fake_city_spb',
    name: 'Санкт-Петербург',
    full_name: 'Россия, Санкт-Петербург',
    address_name: 'Санкт-Петербург',
    point: { lat: 59.9343, lon: 30.3351 },
    type: 'adm_div.city',
    region_id: 'ru_spb',
  },
  {
    id: 'fake_city_novosibirsk',
    name: 'Новосибирск',
    full_name: 'Россия, Новосибирская область, Новосибирск',
    address_name: 'Новосибирск',
    point: { lat: 55.0084, lon: 82.9357 },
    type: 'adm_div.city',
    region_id: 'ru_nsk',
  },
  {
    id: 'fake_city_ekb',
    name: 'Екатеринбург',
    full_name: 'Россия, Свердловская область, Екатеринбург',
    address_name: 'Екатеринбург',
    point: { lat: 56.8389, lon: 60.6057 },
    type: 'adm_div.city',
    region_id: 'ru_ekb',
  },
  {
    id: 'fake_city_kazan',
    name: 'Казань',
    full_name: 'Россия, Республика Татарстан, Казань',
    address_name: 'Казань',
    point: { lat: 55.8304, lon: 49.0661 },
    type: 'adm_div.city',
    region_id: 'ru_kzn',
  },
]

const cityAliases: Record<string, string[]> = {
  fake_city_moscow: ['мск', 'moscow', 'moskva', 'москва'],
  fake_city_spb: ['спб', 'питер', 'petersburg', 'saint petersburg', 'санкт-петербург', 'петербург'],
  fake_city_novosibirsk: ['нск', 'novosibirsk', 'новосибирск'],
  fake_city_ekb: ['екб', 'ekb', 'екатеринбург', 'yekaterinburg'],
  fake_city_kazan: ['казань', 'kazan'],
}

const twoGisNetworkSourceFaker = {
  makeGeocodeResponse(
    query: string,
    data?: Partial<TwoGisNetworkSourceDTO.TwoGisGeocodeResponseDto>,
  ): TwoGisNetworkSourceDTO.TwoGisGeocodeResponseDto {
    const normalizedQuery = query.toLowerCase().trim()

    // Поиск по алиасам
    const matchedCities = fakeCities.filter((city) => {
      const aliases = cityAliases[city.id] || []
      return aliases.some(alias => alias.includes(normalizedQuery) || normalizedQuery.includes(alias))
    })

    // Если не найдено по алиасам, поиск по имени
    const results
      = matchedCities.length > 0
        ? matchedCities
        : fakeCities.filter(city => city.name.toLowerCase().includes(normalizedQuery))

    return {
      meta: {
        api_version: 'fake.0.0.1',
        code: 200,
        issue_date: new Date().toISOString().split('T')[0].replace(/-/g, ''),
      },
      result: {
        items: results.slice(0, 5),
        total: results.length,
      },
      ...data,
    }
  },

  makeReverseGeocodeResponse(
    lat: number,
    lon: number,
    data?: Partial<TwoGisNetworkSourceDTO.TwoGisGeocodeResponseDto>,
  ): TwoGisNetworkSourceDTO.TwoGisGeocodeResponseDto {
    const nearest = fakeCities[0]

    return {
      meta: {
        api_version: 'fake.0.0.1',
        code: 200,
        issue_date: new Date().toISOString().split('T')[0].replace(/-/g, ''),
      },
      result: {
        items: [
          {
            ...nearest,
            point: { lat, lon },
          },
        ],
        total: 1,
      },
      ...data,
    }
  },
}

function makeFakeSourceRes<T>(data: T) {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  })
}

export { twoGisNetworkSourceFaker }

export const fakeTwoGisNetworkSource: GeocodingNetworkSource = {
  ...twoGisNetworkSource,

  geocode: async (query: string) =>
    makeFakeSourceRes(twoGisNetworkSourceFaker.makeGeocodeResponse(query)),

  reverseGeocode: async (lat: number, lon: number) =>
    makeFakeSourceRes(twoGisNetworkSourceFaker.makeReverseGeocodeResponse(lat, lon)),

  searchCitiesNearUser: async (query: string) =>
    makeFakeSourceRes(twoGisNetworkSourceFaker.makeGeocodeResponse(query)),
}
