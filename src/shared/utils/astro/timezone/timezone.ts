import { find as findTimezone } from 'geo-tz'

/**
 * Определяет часовой пояс по географическим координатам
 *
 * Использует библиотеку geo-tz для точного определения timezone
 * по координатам широты и долготы. В случае ошибки или если timezone
 * не найден, возвращается 'UTC' как fallback значение.
 *
 * Необходим для астрологических расчетов, так как время рождения
 * должно быть привязано к конкретному часовому поясу места рождения.
 *
 * @param latitude - Широта (-90 до 90)
 * @param longitude - Долгота (-180 до 180)
 * @returns Идентификатор часового пояса (напр. 'Europe/Moscow') или 'UTC' если не найден
 *
 * @example
 * ```ts
 * getTimezoneByCoordinates(55.7558, 37.6173)    // 'Europe/Moscow'
 * getTimezoneByCoordinates(40.7128, -74.0060)   // 'America/New_York'
 * getTimezoneByCoordinates(-33.8688, 151.2093)  // 'Australia/Sydney'
 * getTimezoneByCoordinates(0, 0)                // 'Atlantic/St_Helena' или 'UTC'
 * getTimezoneByCoordinates(999, 999)            // 'UTC' (некорректные координаты)
 * ```
 */
export function getTimezoneByCoordinates(latitude: number, longitude: number): string {
  try {
    const timezones = findTimezone(latitude, longitude)
    return timezones[0] || 'UTC'
  }
  catch {
    return 'UTC'
  }
}

/**
 * Проверяет валидность идентификатора часового пояса
 *
 * Использует встроенный Intl.DateTimeFormat для проверки корректности
 * timezone идентификатора. Проверяет что строка не пустая и что
 * браузер/Node.js распознает этот timezone.
 *
 * Используется для валидации timezone перед сохранением астро-данных
 * и перед выполнением конвертации времени в UTC.
 *
 * @param timezone - Строка с идентификатором часового пояса для проверки
 * @returns true если timezone валиден, false если невалиден или пустой
 *
 * @example
 * ```ts
 * isValidTimezone('Europe/Moscow')        // true
 * isValidTimezone('America/New_York')     // true
 * isValidTimezone('UTC')                  // true
 * isValidTimezone('Asia/Tokyo')           // true
 * isValidTimezone('Invalid/Timezone')     // false
 * isValidTimezone('')                     // false
 * isValidTimezone('   ')                  // false
 * ```
 */
export function isValidTimezone(timezone: string): boolean {
  if (typeof timezone !== 'string' || timezone.trim().length === 0) {
    return false
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  }
  catch {
    return false
  }
}
