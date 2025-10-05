/**
 * 2GIS Geocoding API Response Types
 * @see https://docs.2gis.com/en/api/search/geocoder/reference
 */

export type TwoGisPointDto = {
  lat: number
  lon: number
}

export type TwoGisItemDto = {
  id: string
  name: string
  address_name?: string
  full_name?: string
  point: TwoGisPointDto
  type: 'building' | 'adm_div.city' | 'adm_div.district' | 'street' | 'attraction'
  purpose_name?: string
  building_name?: string
  region_id?: string
  segment_id?: string
}

export type TwoGisMetaDto = {
  api_version: string
  code: number
  issue_date: string
}

export type TwoGisResultDto = {
  items: TwoGisItemDto[]
  total: number
}

export type TwoGisGeocodeResponseDto = {
  meta: TwoGisMetaDto
  result: TwoGisResultDto
}

export type GeocodeRequestParams = {
  /** Текстовый запрос для прямого геокодирования */
  q?: string
  /** Широта для обратного геокодирования */
  lat?: number
  /** Долгота для обратного геокодирования */
  lon?: number
  /** Тип объекта для фильтрации (adm_div.city, building и т.д.) */
  type?: string
  /** Дополнительные поля для получения */
  fields?: string
  /** Локация для приоритизации результатов (lon,lat) */
  location?: string
  /** Ограничение количества результатов */
  limit?: number
  /** API ключ */
  key?: string
}
