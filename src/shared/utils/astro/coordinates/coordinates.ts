/**
 * Парсит координаты из строки в формате "lat,lon" или "lat, lon"
 *
 * Поддерживаемые форматы:
 * - 55.7558, 37.6173 (с пробелом)
 * - 55.7558,37.6173 (без пробела)
 * - -12.0464, -77.0428 (отрицательные значения)
 *
 * Валидирует диапазоны: lat [-90, 90], lon [-180, 180]
 *
 * @param input - Строка с координатами в формате "широта, долгота"
 * @returns Объект с координатами { lat, lon } или null если формат неверный
 *
 * @example
 * ```ts
 * parseCoordinates('55.7558, 37.6173')   // { lat: 55.7558, lon: 37.6173 }
 * parseCoordinates('55.7558,37.6173')    // { lat: 55.7558, lon: 37.6173 }
 * parseCoordinates('-12.0464, -77.0428') // { lat: -12.0464, lon: -77.0428 }
 * parseCoordinates('invalid')            // null
 * parseCoordinates('91, 180')            // null (широта вне диапазона)
 * ```
 */
export function parseCoordinates(input: string): { lat: number, lon: number } | null {
  const trimmed = input.trim()

  // Проверяем наличие запятой
  if (!trimmed.includes(',')) {
    return null
  }

  const parts = trimmed.split(',').map(part => part.trim())

  if (parts.length !== 2) {
    return null
  }

  const lat = Number.parseFloat(parts[0])
  const lon = Number.parseFloat(parts[1])

  // Проверяем что это валидные числа
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null
  }

  // Проверяем диапазоны координат
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null
  }

  return { lat, lon }
}

/**
 * Проверяет является ли строка корректными координатами
 *
 * Валидация происходит через parseCoordinates - проверяется формат
 * и диапазоны значений широты и долготы.
 *
 * @param input - Строка для проверки
 * @returns true если строка содержит валидные координаты, false в противном случае
 *
 * @example
 * ```ts
 * isCoordinatesInput('55.7558, 37.6173')   // true
 * isCoordinatesInput('55.7558,37.6173')    // true
 * isCoordinatesInput('-12.0464, -77.0428') // true
 * isCoordinatesInput('Moscow')             // false
 * isCoordinatesInput('invalid')            // false
 * isCoordinatesInput('91, 180')            // false (широта вне диапазона)
 * ```
 */
export function isCoordinatesInput(input: string): boolean {
  return parseCoordinates(input) !== null
}
