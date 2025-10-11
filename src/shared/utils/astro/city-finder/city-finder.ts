import { City } from '#root/domain/entities/index.js'

/**
 * Ищет город в локальной базе популярных российских городов
 *
 * Поиск выполняется без учета регистра по вхождению подстроки
 * в названии города или названия города в поисковом запросе.
 *
 * Используется для быстрого локального поиска перед обращением
 * к Geocoding API. База популярных городов содержится в City.popularRussianCities.
 *
 * @param text - Название города или его часть
 * @returns Найденный город или undefined, если город не найден в локальной базе
 *
 * @example
 * ```ts
 * const city = findCityByText('Москва')
 * // { name: 'Москва', lat: 55.7558, lon: 37.6173, timezone: 'Europe/Moscow', ... }
 *
 * findCityByText('моск')     // Найдет 'Москва' по части названия
 * findCityByText('МОСКВА')   // Найдет 'Москва' (регистр не важен)
 * findCityByText('Питер')    // Найдет 'Санкт-Петербург' (если содержится в списке)
 * findCityByText('NewYork')  // undefined (не в списке популярных российских городов)
 * ```
 */
export function findCityByText(text: string): City | undefined {
  const searchText = text.toLowerCase().trim()
  return City.popularRussianCities.find(city =>
    city.name.toLowerCase().includes(searchText)
    || searchText.includes(city.name.toLowerCase()),
  )
}
