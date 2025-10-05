/**
 * Парсит координаты из строки в формате "lat,lon" или "lat, lon"
 * Поддерживаемые форматы:
 * - 55.7558, 37.6173
 * - 55.7558,37.6173
 * - -12.0464, -77.0428
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
 * Проверяет является ли строка координатами
 */
export function isCoordinatesInput(input: string): boolean {
  return parseCoordinates(input) !== null
}
