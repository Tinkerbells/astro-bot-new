import { City } from '#root/domain/entities/index.js'

export function findCityByText(text: string): City | undefined {
  const searchText = text.toLowerCase().trim()
  return City.popularRussianCities.find(city =>
    city.name.toLowerCase().includes(searchText)
    || searchText.includes(city.name.toLowerCase()),
  )
}
