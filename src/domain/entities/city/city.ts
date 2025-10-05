import { Expose } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

type CityData = {
  name: string
  fullName: string
  timezone: string
  lat: number
  lon: number
}

const POPULAR_RUSSIAN_CITIES: CityData[] = [
  {
    name: 'Москва',
    fullName: 'Москва',
    timezone: 'Europe/Moscow',
    lat: 55.7558,
    lon: 37.6176,
  },
  {
    name: 'Санкт-Петербург',
    fullName: 'Санкт-Петербург',
    timezone: 'Europe/Moscow',
    lat: 59.9311,
    lon: 30.3609,
  },
  {
    name: 'Новосибирск',
    fullName: 'Новосибирск',
    timezone: 'Asia/Novosibirsk',
    lat: 55.0084,
    lon: 82.9357,
  },
  {
    name: 'Екатеринбург',
    fullName: 'Екатеринбург',
    timezone: 'Asia/Yekaterinburg',
    lat: 56.8431,
    lon: 60.6454,
  },
  {
    name: 'Казань',
    fullName: 'Казань',
    timezone: 'Europe/Moscow',
    lat: 55.8304,
    lon: 49.0661,
  },
  {
    name: 'Нижний Новгород',
    fullName: 'Нижний Новгород',
    timezone: 'Europe/Moscow',
    lat: 56.2965,
    lon: 43.9361,
  },
  {
    name: 'Челябинск',
    fullName: 'Челябинск',
    timezone: 'Asia/Yekaterinburg',
    lat: 55.1644,
    lon: 61.4368,
  },
  {
    name: 'Самара',
    fullName: 'Самара',
    timezone: 'Europe/Samara',
    lat: 53.2001,
    lon: 50.1500,
  },
  {
    name: 'Омск',
    fullName: 'Омск',
    timezone: 'Asia/Omsk',
    lat: 54.9924,
    lon: 73.3686,
  },
  {
    name: 'Ростов-на-Дону',
    fullName: 'Ростов-на-Дону',
    timezone: 'Europe/Moscow',
    lat: 47.2357,
    lon: 39.7015,
  },
]

export class City {
  @Expose()
  @IsOptional()
  @IsString()
  id?: string

  @Expose()
  @IsString()
  name!: string

  @Expose()
  @IsOptional()
  @IsString()
  addressName?: string

  @Expose()
  @IsOptional()
  @IsString()
  fullName?: string

  @Expose()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  lat!: number

  @Expose()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  lon!: number

  @Expose()
  @IsOptional()
  @IsString()
  type?: string

  @Expose()
  @IsOptional()
  @IsString()
  purposeName?: string

  @Expose()
  @IsOptional()
  @IsString()
  countryCode?: string

  @Expose()
  @IsOptional()
  @IsString()
  timezone?: string

  static toDto(city: City) {
    return {
      id: city.id,
      name: city.name,
      fullName: city.fullName,
      lat: city.lat,
      lon: city.lon,
      timezone: city.timezone,
    }
  }

  static get popularRussianCities(): City[] {
    return POPULAR_RUSSIAN_CITIES.map((cityData) => {
      const city = new City()
      city.name = cityData.name
      city.fullName = cityData.fullName
      city.lat = cityData.lat
      city.lon = cityData.lon
      city.timezone = cityData.timezone
      return city
    })
  }

  static getPopularRussianCityByIndex(index: number): City | undefined {
    const cityData = POPULAR_RUSSIAN_CITIES[index]
    if (!cityData)
      return undefined

    const city = new City()
    city.name = cityData.name
    city.fullName = cityData.fullName
    city.lat = cityData.lat
    city.lon = cityData.lon
    city.timezone = cityData.timezone
    return city
  }

  hasCoordinates(): boolean {
    return Boolean(this.lat && this.lon)
  }

  getDisplayName(): string {
    return this.fullName || this.name
  }
}
