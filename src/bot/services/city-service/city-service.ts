import type { City } from '#root/domain/entities/index.js'
import type { GeocodingRepository, GeocodingRepositoryDTO } from '#root/data/repositories/index.js'

export class CityService {
  constructor(private readonly geocodingRepository: GeocodingRepository) {}

  /**
   * Поиск городов по текстовому запросу
   */
  public async searchCities(query: string, userLocation?: { lat: number, lon: number }): Promise<City[]> {
    const params: GeocodingRepositoryDTO.SearchCityParams = {
      query,
      userLocation,
      limit: 5,
    }

    return this.geocodingRepository.searchCities(params)
  }

  /**
   * Получение города по координатам (обратное геокодирование)
   */
  public async getCityByCoordinates(lat: number, lon: number): Promise<City | null> {
    const params: GeocodingRepositoryDTO.ReverseGeocodeParams = {
      lat,
      lon,
    }

    return this.geocodingRepository.reverseGeocode(params)
  }

  /**
   * Получение координат по адресу (прямое геокодирование)
   */
  public async getCoordinatesByAddress(address: string): Promise<City | null> {
    return this.geocodingRepository.geocode(address)
  }
}
