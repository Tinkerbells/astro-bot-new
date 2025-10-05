import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'

import type * as GeocodingRepositoryDTO from './dto.js'
import type { GeocodingNetworkSource, TwoGisNetworkSourceDTO } from '../../sources/geocoding-network-source/index.js'

import { logger } from '../../../shared/logger.js'
import { City } from '../../../domain/entities/index.js'

export class GeocodingRepository {
  constructor(private readonly geocodingSource: GeocodingNetworkSource) { }

  /**
   * Поиск городов по текстовому запросу
   */
  public async searchCities(params: GeocodingRepositoryDTO.SearchCityParams): Promise<City[]> {
    try {
      const userLocation = params.userLocation
        ? [params.userLocation.lon, params.userLocation.lat] as [number, number]
        : undefined

      const response = await this.geocodingSource.searchCitiesNearUser(
        params.query,
        userLocation,
      )

      const cities = await this.mapDtoToDomain(response.data.result.items)

      return cities.slice(0, params.limit || 5)
    }
    catch (error) {
      logger.error({ error, params }, 'Failed to search cities')
      throw new Error('Ошибка поиска городов', { cause: error })
    }
  }

  /**
   * Обратное геокодирование - получение информации о месте по координатам
   */
  public async reverseGeocode(params: GeocodingRepositoryDTO.ReverseGeocodeParams): Promise<City | null> {
    try {
      const response = await this.geocodingSource.reverseGeocode(params.lat, params.lon)

      if (response.data.result.items.length === 0) {
        return null
      }

      const cities = await this.mapDtoToDomain(response.data.result.items)
      return cities[0] || null
    }
    catch (error) {
      logger.error({ error, params }, 'Failed to reverse geocode')
      throw new Error('Ошибка обратного геокодирования', { cause: error })
    }
  }

  /**
   * Прямое геокодирование - получение координат по адресу
   */
  public async geocode(address: string): Promise<City | null> {
    try {
      const response = await this.geocodingSource.geocode(address, {
        limit: 1,
      })

      if (response.data.result.items.length === 0) {
        return null
      }

      const cities = await this.mapDtoToDomain(response.data.result.items)
      return cities[0] || null
    }
    catch (error) {
      logger.error({ error, address }, 'Failed to geocode address')
      throw new Error('Ошибка геокодирования адреса', { cause: error })
    }
  }

  /**
   * Преобразование DTO из 2GIS API в доменную модель City
   */
  private async mapDtoToDomain(items: TwoGisNetworkSourceDTO.TwoGisItemDto[]): Promise<City[]> {
    const cities = items.map((item) => {
      return plainToInstance(
        City,
        {
          id: item.id,
          name: item.name,
          addressName: item.address_name,
          fullName: item.full_name || item.name,
          lat: item.point.lat,
          lon: item.point.lon,
          type: item.type,
          purposeName: item.purpose_name,
          // TODO: добавить определение timezone по координатам
          // можно использовать библиотеку geo-tz или API
          timezone: this.getTimezoneByRegion(item.region_id),
        },
        { excludeExtraneousValues: true },
      )
    })

    // Валидация доменных сущностей
    for (const city of cities) {
      const errors = await validate(city)
      if (errors.length > 0) {
        logger.warn({ errors, city }, 'City validation failed')
      }
    }

    return cities
  }

  /**
   * Получение timezone по region_id (упрощенная версия)
   * TODO: заменить на более точное определение через geo-tz или API
   */
  private getTimezoneByRegion(regionId?: string): string {
    if (!regionId)
      return 'Europe/Moscow'

    const timezoneMap: Record<string, string> = {
      ru_msk: 'Europe/Moscow',
      ru_spb: 'Europe/Moscow',
      ru_nsk: 'Asia/Novosibirsk',
      ru_ekb: 'Asia/Yekaterinburg',
      ru_kzn: 'Europe/Moscow',
    }

    return timezoneMap[regionId] || 'Europe/Moscow'
  }
}
