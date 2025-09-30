import { find as findTimezone } from 'geo-tz'

/**
 * Find timezone by coordinates using geo-tz
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Timezone identifier (e.g., 'Europe/Moscow') or 'UTC' as fallback
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
 * Validate if a string is a valid timezone identifier
 * @param timezone - Timezone string to validate
 * @returns True if valid, false otherwise
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
