import type { CityData } from '../constants.js'

import { POPULAR_RUSSIAN_CITIES } from '../constants.js'

export function findCityByText(text: string): CityData | undefined {
  const searchText = text.toLowerCase().trim()
  return POPULAR_RUSSIAN_CITIES.find(city =>
    city.city.toLowerCase().includes(searchText)
    || searchText.includes(city.city.toLowerCase()),
  )
}

export function getCitiesKeyboard(): string[] {
  return POPULAR_RUSSIAN_CITIES.slice(0, 8).map(city => city.city)
}
